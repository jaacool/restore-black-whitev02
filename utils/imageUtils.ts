const MAX_DIMENSION = 1700;

export const preprocessImage = (file: File, useFullResolution = false): Promise<{ base64: string, mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Could not get canvas context'));
        }

        let { width, height } = img;

        // Resize the image if it's larger than the max dimension and full resolution is not requested
        if (!useFullResolution && (width > MAX_DIMENSION || height > MAX_DIMENSION)) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Apply grayscale filter to remove any color cast (like sepia)
        ctx.filter = 'grayscale(100%)';
        
        // Draw the image onto the canvas (this will scale it if needed)
        ctx.drawImage(img, 0, 0, width, height);

        // Export the canvas content as a PNG base64 string for better quality
        const outputMimeType = 'image/png';
        const base64 = canvas.toDataURL(outputMimeType);
        
        resolve({ base64, mimeType: outputMimeType });
      };
      img.onerror = (error) => reject(error);
      
      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      } else {
        reject(new Error('Failed to read file as a data URL.'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

export const splitImage = (base64: string, rows: number, cols: number, overlap: number): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const baseTileWidth = img.width / cols;
      const baseTileHeight = img.height / rows;
      const tiles: string[] = [];
      
      if (baseTileWidth <= 0 || baseTileHeight <= 0) {
        return reject(new Error('Image is too small to be split.'));
      }

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const sx = c * baseTileWidth;
          const sy = r * baseTileHeight;

          // Calculate the start coordinates of the slice, including left/top overlap
          const sliceX = Math.max(0, sx - overlap);
          const sliceY = Math.max(0, sy - overlap);
          
          // Calculate the end coordinates of the slice, including right/bottom overlap
          const sliceEndX = Math.min(img.width, sx + baseTileWidth + overlap);
          const sliceEndY = Math.min(img.height, sy + baseTileHeight + overlap);

          // Calculate the width and height of the slice
          const sliceWidth = sliceEndX - sliceX;
          const sliceHeight = sliceEndY - sliceY;
          
          const canvas = document.createElement('canvas');
          canvas.width = sliceWidth;
          canvas.height = sliceHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Could not get canvas context for tile.'));

          ctx.drawImage(img, sliceX, sliceY, sliceWidth, sliceHeight, 0, 0, sliceWidth, sliceHeight);
          tiles.push(canvas.toDataURL('image/png'));
        }
      }
      resolve(tiles);
    };
    img.onerror = (error) => reject(error);
    img.src = base64;
  });
};


const getLuma = (imageData: ImageData): Float32Array => {
    const luma = new Float32Array(imageData.width * imageData.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
        luma[i / 4] = 0.299 * imageData.data[i] + 0.587 * imageData.data[i + 1] + 0.114 * imageData.data[i + 2];
    }
    return luma;
};

const calculateNccAtPoint = (
    templateLuma: Float32Array,
    templateMean: number,
    templateStdDev: number,
    templateWidth: number,
    templateHeight: number,
    searchLuma: Float32Array,
    searchWidth: number,
    dx: number,
    dy: number
): number => {
    let searchSum = 0;
    let searchSumSq = 0;
    let crossCorrelationSum = 0;
    let count = 0;

    for (let y = 0; y < templateHeight; y++) {
        for (let x = 0; x < templateWidth; x++) {
            const searchX = x + dx;
            const searchY = y + dy;

            if (searchX >= 0 && searchX < searchWidth && searchY >= 0) {
                const searchIdx = searchY * searchWidth + searchX;
                if (searchIdx < searchLuma.length) {
                    const templateIdx = y * templateWidth + x;
                    const searchValue = searchLuma[searchIdx];

                    searchSum += searchValue;
                    searchSumSq += searchValue * searchValue;
                    crossCorrelationSum += templateLuma[templateIdx] * searchValue;
                    count++;
                }
            }
        }
    }

    if (count === 0) return -Infinity;

    const searchMean = searchSum / count;
    const searchStdDev = Math.sqrt(searchSumSq / count - searchMean * searchMean);

    if (searchStdDev < 1e-6) return -Infinity;

    return (crossCorrelationSum - count * templateMean * searchMean) / (count * templateStdDev * searchStdDev);
};


const findBestTranslation = (template: ImageData, searchArea: ImageData, searchRadius: number): { dx: number; dy: number, maxNcc: number } => {
    let maxNcc = -Infinity;
    let bestOffset = { dx: 0, dy: 0 };

    const templateLuma = getLuma(template);
    const searchLuma = getLuma(searchArea);

    let templateSum = 0;
    let templateSumSq = 0;
    for (let i = 0; i < templateLuma.length; i++) {
        templateSum += templateLuma[i];
        templateSumSq += templateLuma[i] * templateLuma[i];
    }
    const templateMean = templateSum / templateLuma.length;
    const templateStdDev = Math.sqrt(templateSumSq / templateLuma.length - templateMean * templateMean);

    if (templateStdDev < 1e-6) return { dx: 0, dy: 0, maxNcc: -1 }; // Avoid division by zero for flat templates

    for (let dy = -searchRadius; dy <= searchRadius; dy++) {
        for (let dx = -searchRadius; dx <= searchRadius; dx++) {
             const ncc = calculateNccAtPoint(templateLuma, templateMean, templateStdDev, template.width, template.height, searchLuma, searchArea.width, dx, dy);
            if (ncc > maxNcc) {
                maxNcc = ncc;
                bestOffset = { dx, dy };
            }
        }
    }

    return { ...bestOffset, maxNcc };
};

const findBestTransform = (template: ImageData, searchArea: ImageData, searchRadius: number): { dx: number; dy: number; angle: number; scale: number; } => {
    // Step 1: Find best translation with no rotation/scale
    const initialResult = findBestTranslation(template, searchArea, searchRadius);
    let best = { ...initialResult, angle: 0, scale: 1.0 };
    
    const templateCanvas = document.createElement('canvas');
    templateCanvas.width = template.width;
    templateCanvas.height = template.height;
    const templateCtx = templateCanvas.getContext('2d');
    if (!templateCtx) throw new Error("Could not get context for template canvas");
    templateCtx.putImageData(template, 0, 0);

    const anglesToTest = [-1.5, -1.0, -0.5, 0.5, 1.0, 1.5]; // in degrees
    const scalesToTest = [0.99, 1.01];

    const searchLuma = getLuma(searchArea);

    const checkTransform = (angle: number, scale: number) => {
        const transformedCanvas = document.createElement('canvas');
        const transformedCtx = transformedCanvas.getContext('2d');
        if (!transformedCtx) return;

        const rad = Math.abs(angle * Math.PI / 180);
        const newWidth = Math.ceil(template.width * scale * Math.cos(rad) + template.height * scale * Math.sin(rad));
        const newHeight = Math.ceil(template.width * scale * Math.sin(rad) + template.height * scale * Math.cos(rad));
        transformedCanvas.width = newWidth;
        transformedCanvas.height = newHeight;
        
        transformedCtx.translate(newWidth / 2, newHeight / 2);
        transformedCtx.rotate(angle * Math.PI / 180);
        transformedCtx.scale(scale, scale);
        transformedCtx.drawImage(templateCanvas, -template.width / 2, -template.height / 2);
        
        const transformedTemplateData = transformedCtx.getImageData(0, 0, newWidth, newHeight);
        const transformedLuma = getLuma(transformedTemplateData);

        let templateSum = 0, templateSumSq = 0;
        for (const l of transformedLuma) { templateSum += l; templateSumSq += l * l; }
        const templateMean = templateSum / transformedLuma.length;
        const templateStdDev = Math.sqrt(templateSumSq / transformedLuma.length - templateMean * templateMean);
        
        if (templateStdDev < 1e-6) return;
        
        // Adjust dx, dy for the new dimensions
        const dx = initialResult.dx - Math.round((newWidth - template.width) / 2);
        const dy = initialResult.dy - Math.round((newHeight - template.height) / 2);

        const currentNcc = calculateNccAtPoint(transformedLuma, templateMean, templateStdDev, newWidth, newHeight, searchLuma, searchArea.width, dx, dy);

        if (currentNcc > best.maxNcc) {
            best = { maxNcc: currentNcc, dx: initialResult.dx, dy: initialResult.dy, angle, scale };
        }
    }

    // Check scales first, then angles
    for (const scale of scalesToTest) checkTransform(0, scale);
    for (const angle of anglesToTest) checkTransform(angle, best.scale);

    return { dx: best.dx, dy: best.dy, angle: best.angle, scale: best.scale };
};

const getRegionData = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): ImageData => {
    return ctx.getImageData(x, y, width, height);
};

export const stitchAndBlendImages = async (tiles: string[], rows: number, cols: number, overlap: number): Promise<string> => {
    if (tiles.length === 0) throw new Error('No tiles provided to stitch.');

    const loadedImages = await Promise.all(tiles.map(tileSrc => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = (err) => reject(err);
            img.src = tileSrc;
        });
    }));

    const positions = new Array(rows * cols).fill(null).map(() => ({ x: 0, y: 0 }));
    const corrections = new Array(rows * cols).fill(null).map(() => ({ angle: 0, scale: 1.0 }));
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
    if (!tempCtx) throw new Error('Could not get temp canvas context');

    const SEARCH_RADIUS = 8; // Search up to 8px offset

    // Progressively align tiles
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const i = r * cols + c;
            if (r === 0 && c === 0) continue;

            const transformFromTop = r > 0 ? (() => {
                const topImg = loadedImages[i - cols];
                const currentImg = loadedImages[i];
                
                tempCanvas.width = topImg.width; tempCanvas.height = topImg.height;
                tempCtx.drawImage(topImg, 0, 0);
                const template = getRegionData(tempCtx, 0, topImg.height - overlap, topImg.width, overlap);
                
                tempCanvas.width = currentImg.width; tempCanvas.height = currentImg.height;
                tempCtx.drawImage(currentImg, 0, 0);
                const searchArea = getRegionData(tempCtx, 0, 0, currentImg.width, overlap * 2 + SEARCH_RADIUS * 2);

                const transform = findBestTransform(template, searchArea, SEARCH_RADIUS);
                
                return {
                    pos: { x: positions[i - cols].x + transform.dx, y: positions[i - cols].y + topImg.height - overlap + transform.dy },
                    correction: { angle: transform.angle, scale: transform.scale }
                };
            })() : null;
            
            const transformFromLeft = c > 0 ? (() => {
                const leftImg = loadedImages[i - 1];
                const currentImg = loadedImages[i];
                
                tempCanvas.width = leftImg.width; tempCanvas.height = leftImg.height;
                tempCtx.drawImage(leftImg, 0, 0);
                const template = getRegionData(tempCtx, leftImg.width - overlap, 0, overlap, leftImg.height);
                
                tempCanvas.width = currentImg.width; tempCanvas.height = currentImg.height;
                tempCtx.drawImage(currentImg, 0, 0);
                const searchArea = getRegionData(tempCtx, 0, 0, overlap * 2 + SEARCH_RADIUS * 2, currentImg.height);
                
                const transform = findBestTransform(template, searchArea, SEARCH_RADIUS);

                return {
                    pos: { x: positions[i - 1].x + leftImg.width - overlap + transform.dx, y: positions[i - 1].y + transform.dy },
                    correction: { angle: transform.angle, scale: transform.scale }
                };
            })() : null;

            if (transformFromTop && transformFromLeft) {
                positions[i] = { x: (transformFromTop.pos.x + transformFromLeft.pos.x) / 2, y: (transformFromTop.pos.y + transformFromLeft.pos.y) / 2 };
                corrections[i] = { angle: (transformFromTop.correction.angle + transformFromLeft.correction.angle) / 2, scale: (transformFromTop.correction.scale + transformFromLeft.correction.scale) / 2 };
            } else if (transformFromTop) {
                positions[i] = transformFromTop.pos;
                corrections[i] = transformFromTop.correction;
            } else if (transformFromLeft) {
                positions[i] = transformFromLeft.pos;
                corrections[i] = transformFromLeft.correction;
            }
        }
    }

    // Calculate final canvas dimensions from aligned positions
    let minX = 0, minY = 0, maxX = 0, maxY = 0;
    positions.forEach((pos, i) => {
        const img = loadedImages[i];
        minX = Math.min(minX, pos.x);
        minY = Math.min(minY, pos.y);
        maxX = Math.max(maxX, pos.x + img.width);
        maxY = Math.max(maxY, pos.y + img.height);
    });
    const finalWidth = Math.round(maxX - minX);
    const finalHeight = Math.round(maxY - minY);

    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = finalWidth;
    finalCanvas.height = finalHeight;
    const finalCtx = finalCanvas.getContext('2d');
    if (!finalCtx) throw new Error('Could not get final canvas context');

    // Draw blended tiles at their aligned positions
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const i = r * cols + c;
            const tileImg = loadedImages[i];
            const correction = corrections[i];
            
            tempCanvas.width = tileImg.width;
            tempCanvas.height = tileImg.height;

            // Create alpha mask
            tempCtx.fillStyle = 'white';
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            
            if (c > 0) {
                const hGrad = tempCtx.createLinearGradient(0, 0, overlap, 0);
                hGrad.addColorStop(0, 'rgba(255,255,255,0)');
                hGrad.addColorStop(1, 'rgba(255,255,255,1)');
                tempCtx.fillStyle = hGrad;
                tempCtx.fillRect(0, 0, overlap, tempCanvas.height);
            }
            if (r > 0) {
                const vGrad = tempCtx.createLinearGradient(0, 0, 0, overlap);
                vGrad.addColorStop(0, 'rgba(255,255,255,0)');
                vGrad.addColorStop(1, 'rgba(255,255,255,1)');
                tempCtx.fillStyle = vGrad;
                tempCtx.fillRect(0, 0, tempCanvas.width, overlap);
            }
            
            tempCtx.globalCompositeOperation = 'source-in';
            tempCtx.drawImage(tileImg, 0, 0);
            tempCtx.globalCompositeOperation = 'source-over'; 

            finalCtx.save();
            const drawX = Math.round(positions[i].x - minX);
            const drawY = Math.round(positions[i].y - minY);
            
            finalCtx.translate(drawX + tileImg.width / 2, drawY + tileImg.height / 2);
            finalCtx.rotate(correction.angle * Math.PI / 180);
            finalCtx.scale(correction.scale, correction.scale);
            
            finalCtx.drawImage(tempCanvas, -tileImg.width / 2, -tileImg.height / 2);
            finalCtx.restore();
        }
    }

    return finalCanvas.toDataURL('image/png');
};