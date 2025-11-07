
export const preprocessImage = (file: File): Promise<{ base64: string, mimeType: string }> => {
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

        canvas.width = img.width;
        canvas.height = img.height;

        // Apply grayscale filter to remove any color cast (like sepia)
        ctx.filter = 'grayscale(100%)';
        
        // Draw the image onto the canvas
        ctx.drawImage(img, 0, 0);

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
