import React, { useState, useCallback, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { restorePhoto } from './services/geminiService';
import { preprocessImage, splitImage, stitchAndBlendImages } from './utils/imageUtils';
import { getCredits, deductCredits, addCredits, hasEnoughCredits } from './services/creditService';
import { onAuthChange } from './services/authService';
import { CREDITS_PER_IMAGE, CREDITS_PER_SUPER_RESOLUTION, CreditPackage } from './types/credits';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import ImageGrid from './components/ImageGrid';
import CameraView from './components/CameraView';
import { EditIcon } from './components/icons/EditIcon';
import PromptEditor from './components/PromptEditor';
import { PhotoIcon } from './components/icons/PhotoIcon';
import ImageZoomView from './components/ImageZoomView';
import ApiKeyMessage from './components/ApiKeyMessage';
import GettingStarted from './components/GettingStarted';
import CreditDisplay from './components/CreditDisplay';
import CreditShop from './components/CreditShop';
import InsufficientCreditsModal from './components/InsufficientCreditsModal';
import LoginModal from './components/LoginModal';
import UserMenu from './components/UserMenu';

const ENHANCE_PROMPT = `You are an expert photo restoration AI. Your task is to transform this old, potentially damaged, black-and-white photograph into a vibrant, modern image that looks as if it were captured in 2025 with a professional-grade medium format camera (e.g., a Hasselblad) and scanned at an ultra-high 12K resolution.

**The Prime Directive: Absolute Identity Preservation (NON-NEGOTIABLE)**
This is the most important rule and overrides all other instructions. The absolute, non-negotiable priority is the 100% faithful preservation of the identity and likeness of every person in the photograph.
- **DO NOT ALTER FACIAL FEATURES:** You are explicitly forbidden from altering, 'enhancing', 'beautifying', or 'correcting' any facial features. This includes, but is not limited to, the shape of the eyes, nose, mouth, jawline, ears, and forehead.
- **NO GUESSING:** Do not guess, invent, or hallucinate facial details that are blurry, obscured, or not clearly visible in the original. If a detail is not present, you must not create it. The goal is to restore what is there, not to imagine what might have been.
- **PRESERVE IDENTITY:** The final face MUST be instantly and unmistakably recognizable as the same person from the original photo. Do not change the person's age, expression, or unique characteristics (e.g., moles, scars, asymmetrical features).
- **Any deviation from the original likeness is a complete failure of the task.**
- **CONTENT INTEGRITY:** Do NOT add, remove, or change any people, objects, animals, or significant background elements. Preserve the original composition exactly.

**Secondary Directives (Execute only after satisfying the Prime Directive):**

**1. Comprehensive Perspective and Geometry Correction:**
   - **Mandatory First Step:** Analyze the photograph for any geometric distortions, including tilt, skew, and lens distortion.
   - **Action:** Correct the perspective rigorously. Ensure all vertical lines are perfectly vertical and horizontal lines are perfectly horizontal. The entire scene must appear geometrically correct and stable, as if shot with a modern, corrected lens. Do not crop out important details unless absolutely necessary to fix the geometry.

**2. Pre-Colorization Analysis & Reasoning (Internal Thought Process):**
   - **Crucial Step:** Before applying any color, perform an extensive internal analysis. Deconstruct the image into its constituent parts: main subject(s), background, foreground, small objects, clothing, furniture, environment (sky, trees, buildings, etc.).
   - **Logical Color Deduction:** For each identified element, reason about its most probable and realistic color. Consider the historical context, the material of the object (e.g., wood, fabric, metal, skin), and the inferred lighting conditions.
   - **Develop a Cohesive Palette:** Based on this analysis, formulate a complete and harmonious color palette for the entire scene. This palette must ensure that all colors work together under a single, consistent light source. This "thinking" phase is critical to avoid inconsistent or unrealistic color choices.

**3. High Dynamic Range (HDR) Colorization and Restoration:**
   - **Holistic Application:** Execute the colorization based on the palette developed in the previous step. You must colorize the **entire image** with the decided ultra-realistic, natural colors. This includes every detail from the deep background to the immediate foreground.
   - **Modern HDR Look & Large Format Quality:** The final image must possess the characteristics of a modern High Dynamic Range (HDR) photograph, exhibiting rich, deep contrast. Bright areas should be detailed without being blown out, and dark areas should be rich with information, not crushed into black. The goal is to achieve the quality of a 12K large-format scan, resulting in super clear and sharp details across the entire image. The overall image should have incredible depth and clarity.
   - **Expansive Color Gamut & Bit Depth:** The goal is to produce an image with an exceptionally wide and nuanced color palette, as if captured with a sensor capable of deep color (e.g., 14-bit or 15-bit). This means rendering millions of distinct shades, resulting in incredibly smooth gradients and subtle color variations, especially in skin tones, skies, and fabrics. Avoid color banding. The colors must 'pop' realistically, avoiding a washed-out or faded appearance.
   - **Background Color Parity:** This is a non-negotiable directive. The background and environment MUST be colorized with the same richness, vibrancy, and realism as the main subjects. A common failure to avoid is a vibrant subject against a muted, grayish, or sepia-toned background. You must actively prevent this. The entire frame, from the most distant object to the closest, must share the same modern, vivid color palette.
   - **Detail Enhancement & Texture Fidelity:** Restore and enhance fine details and textures across the entire photograph. A critical aspect of this is the realistic rendering of skin. **Avoid an overly smooth, 'airbrushed', 'plastic', or 'waxy' appearance.** Instead, meticulously recreate or preserve natural skin textures, including pores, fine lines, and subtle imperfections appropriate for the subject's age. The goal is lifelike skin, not digitally perfected skin. Skin tones must be rendered with natural, subtle variations. **For faces, this directive is subordinate to the Prime Directive.** Enhance texture only if it does not compromise the original likeness. For small or distant faces, allocate a disproportionate amount of processing focus to ensure they are restored with clarity and accuracy, not just blurred color.

**4. Removal of Non-Photographic Elements:**
   - **Clean Up:** After colorization, remove any elements that are not part of the original photographic scene. This includes handwritten text, timestamps, borders, dust, scratches, and stains. The final output must be a clean photograph, free of any superimposed artifacts.

Final Goal: The resulting image must be indistinguishable from a high-quality photograph taken in 2025, with the absolute preservation of the original subjects' identities.`;

const COLORIZE_ONLY_PROMPT = `You are an expert photo colorization AI. Your task is to add ultra-realistic, vibrant, and modern color to this black-and-white photograph, making it look as if it were captured with a high-end modern smartphone camera like an iPhone.

**The Prime Directive: Absolute Preservation of Original Details (NON-NEGOTIABLE)**
This is the most important rule. You are strictly forbidden from altering the original photograph in any way other than adding color.
- **DO NOT ALTER LUMINANCE:** You must preserve the original luminance, brightness, contrast, and shadow information of the source image perfectly. The colorized image, when converted back to grayscale, must be identical to the original.
- **DO NOT ALTER DETAILS OR TEXTURES:** You must not change, enhance, sharpen, or smooth any details or textures. The original grain, focus, and texture of the photograph must be perfectly preserved. Do not remove scratches, dust, or damage.
- **NO GEOMETRIC CORRECTIONS:** Do not deskew, rotate, crop, or alter the perspective of the image in any way.
- **NO CONTENT CHANGES:** Do not add, remove, or change any objects, people, or background elements.

**Secondary Directives:**

**1. Modern, High Dynamic Range Color Application:**
   - **Expansive Color Gamut:** Apply 100% authentic, lively, and lifelike colors to the entire scene. The goal is to achieve the color science of a modern digital photo, characterized by its vibrancy, realism, and an exceptionally wide color gamut. The color palette should be deep and nuanced, as if captured with a sensor capable of deep color (e.g., 14-bit or 15-bit), resulting in millions of distinct shades and smooth gradients.
   - **Vibrancy and Pop:** While considering the historical context for color deduction (e.g., clothing, objects), the final color output must be rich, vivid, and feel contemporary. Avoid muted, washed-out, or overly "vintage" color palettes. The colors must 'pop' realistically.
   - **Cohesive Lighting:** Ensure the color palette is cohesive and consistent with a single, natural light source.

**2. Full Scene Colorization:**
   - Colorize the **entire image**, including the background and foreground, with the same level of vibrancy and realism. Avoid the "hand-tinted" look where subjects are colored but the background remains monochrome.

Final Goal: The resulting image must be the original black-and-white photograph with a layer of modern, vibrant, and realistic color added on top. The underlying structure, detail, and character of the original photo must remain completely untouched, but the colors should make it feel like it was taken today.`;

const SUPER_RESOLUTION_PROMPT = `You are an expert photo restoration AI, specializing in high-fidelity detail enhancement and colorization. You are processing a tile from a larger image that has been split into several pieces. Your task is to process this individual tile perfectly.

**The Prime Directive: Absolute Preservation of Original Structure (NON-NEGOTIABLE)**
This is the most important rule. You are strictly forbidden from altering the original photograph's structure.
- **NO GEOMETRIC CORRECTIONS:** Do not deskew, rotate, crop, or alter the perspective of the image tile in any way. The geometry must remain untouched.
- **DO NOT ALTER LUMINANCE:** Preserve the original luminance, brightness, contrast, and shadow information of the source image perfectly.
- **CONTENT INTEGRITY:** Do not add, remove, or change any objects, people, or background elements.
- **CONSISTENT EDGES:** Process the entire tile uniformly. It is critical to avoid creating hard edges, artifacts, or unnatural gradients at the boundaries of the tile, as it will be stitched back with other tiles. The processing must be seamless.

**Secondary Directives:**

**1. Detail and Texture Super Resolution:**
   - **Enhance, Don't Invent:** Meticulously enhance and sharpen the existing details and textures within the tile. The goal is to bring out the clarity and fidelity of what is already there, as if viewed through a sharper lens.
   - **Natural Textures:** For skin, fabric, wood, and other surfaces, enhance the natural texture. Avoid an overly smooth, 'airbrushed', or 'plastic' appearance.
   - **Preserve Grain:** Maintain the original photographic grain structure where appropriate, enhancing it rather than removing it, to preserve the photo's character.

**2. Modern, High Dynamic Range Color Application:**
   - **Expansive Color Gamut:** Apply 100% authentic, lively, and lifelike colors to the entire tile. The goal is to achieve the color science of a modern digital photo, characterized by its vibrancy, realism, and an exceptionally wide color gamut.
   - **Vibrancy and Pop:** The final color output must be rich, vivid, and feel contemporary. Avoid muted, washed-out, or overly "vintage" color palettes.
   - **Cohesive Lighting:** Ensure the color palette is cohesive and consistent with a single, natural light source.

**Final Goal:** The resulting tile must be a super-resolved version of the original, with breathtaking detail and modern, vibrant color, ready to be seamlessly stitched back into the complete photograph. The underlying structure and composition must remain completely untouched.`;


export type ProcessMode = 'enhance' | 'colorize' | 'super-resolution';

export interface ImageJob {
  id: number;
  file: File;
  originalSrc?: string;
  originalMimeType?: string;
  restoredSrc?: string;
  status: 'queued' | 'preprocessing' | 'tiling' | 'restoring' | 'stitching' | 'completed' | 'error';
  error?: string;
  mode: ProcessMode;
  progress?: {
    processed: number;
    total: number;
  };
}

// The API key is exposed via process.env.API_KEY in this environment.
const isApiConfigured = !!process.env.API_KEY;

export default function App() {
  const [jobs, setJobs] = useState<ImageJob[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [customEnhancePrompt, setCustomEnhancePrompt] = useState<string>(ENHANCE_PROMPT);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState<boolean>(false);
  const [mode, setMode] = useState<ProcessMode>('enhance');
  const [useFullResolution, setUseFullResolution] = useState(false);
  const [zoomedJobId, setZoomedJobId] = useState<number | null>(null);
  const [credits, setCredits] = useState<number>(0);
  const [isCreditShopOpen, setIsCreditShopOpen] = useState(false);
  const [showInsufficientCredits, setShowInsufficientCredits] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [requiredCredits, setRequiredCredits] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthChange(async (authUser) => {
      setUser(authUser);
      setIsLoadingAuth(false);
      
      if (authUser) {
        // Load credits when user signs in
        const userCredits = await getCredits();
        setCredits(userCredits);
      } else {
        setCredits(0);
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  // Refresh credits periodically when user is logged in
  useEffect(() => {
    if (!user) return;
    
    const refreshCredits = async () => {
      const userCredits = await getCredits();
      setCredits(userCredits);
    };
    
    refreshCredits();
    const interval = setInterval(refreshCredits, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [user]);
  
  const addFilesToQueue = useCallback(async (files: FileList) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    const filesArray = Array.from(files);
    const creditsNeeded = filesArray.length * (mode === 'super-resolution' ? CREDITS_PER_SUPER_RESOLUTION : CREDITS_PER_IMAGE);
    
    const hasCredits = await hasEnoughCredits(creditsNeeded);
    if (!hasCredits) {
      setRequiredCredits(creditsNeeded);
      setShowInsufficientCredits(true);
      return;
    }
    
    const newJobs: ImageJob[] = filesArray.map(file => ({
      id: Date.now() + Math.random(),
      file,
      status: 'queued',
      mode,
    }));
    setJobs(prevJobs => [...prevJobs, ...newJobs]);
  }, [mode, user]);

  const addSingleFileToQueue = useCallback(async (file: File) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    const creditsNeeded = mode === 'super-resolution' ? CREDITS_PER_SUPER_RESOLUTION : CREDITS_PER_IMAGE;
    
    const hasCredits = await hasEnoughCredits(creditsNeeded);
    if (!hasCredits) {
      setRequiredCredits(creditsNeeded);
      setShowInsufficientCredits(true);
      return;
    }
    
    const newJob: ImageJob = {
      id: Date.now() + Math.random(),
      file,
      status: 'queued',
      mode,
    };
    setJobs(prevJobs => [...prevJobs, newJob]);
  }, [mode, user]);

  useEffect(() => {
    if (!isApiConfigured) return;

    const processJob = async (job: ImageJob) => {
      try {
        // Deduct credits at the start of processing
        const creditsNeeded = job.mode === 'super-resolution' ? CREDITS_PER_SUPER_RESOLUTION : CREDITS_PER_IMAGE;
        const deducted = await deductCredits(creditsNeeded);
        if (!deducted) {
          setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'error', error: 'Nicht genug Credits' } : j));
          return;
        }
        const newCredits = await getCredits();
        setCredits(newCredits);
        
        const { base64, mimeType } = await preprocessImage(job.file, useFullResolution);
        
        setJobs(prev => prev.map(j => {
          if (j.id !== job.id) return j;
          return { ...j, originalSrc: base64, originalMimeType: mimeType };
        }));

        const pureBase64 = base64.split(',')[1];
        
        if (job.mode === 'super-resolution') {
            const OVERLAP_PIXELS = 32;
            const TILE_ROWS = 1;
            const TILE_COLS = 2;

            setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'tiling' } : j));
            
            const tiles = await splitImage(base64, TILE_ROWS, TILE_COLS, OVERLAP_PIXELS);
            const totalTiles = tiles.length;

            setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'restoring', progress: { processed: 0, total: totalTiles } } : j));
            
            const restoredTilesPromises = tiles.map((tileB64) => {
                const pureTileB64 = tileB64.split(',')[1];
                return restorePhoto(pureTileB64, 'image/png', SUPER_RESOLUTION_PROMPT)
                    .then(restoredTile => {
                        setJobs(prev => prev.map(j => {
                            if (j.id !== job.id) return j;
                            const newProcessed = (j.progress?.processed ?? 0) + 1;
                            return { ...j, progress: { processed: newProcessed, total: totalTiles } };
                        }));
                        return restoredTile;
                    });
            });

            const restoredTiles = await Promise.all(restoredTilesPromises);

            setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'stitching' } : j));
            
            const restoredTilesWithMime = restoredTiles.map(t => `data:image/png;base64,${t}`);
            
            const stitchedImage = await stitchAndBlendImages(restoredTilesWithMime, TILE_ROWS, TILE_COLS, OVERLAP_PIXELS);

            setJobs(prev => prev.map(j => j.id === job.id ? { ...j, restoredSrc: stitchedImage, status: 'completed' } : j));

        } else {
            setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'restoring' } : j));
            const promptToUse = job.mode === 'enhance' ? customEnhancePrompt : COLORIZE_ONLY_PROMPT;
            const restoredBase64 = await restorePhoto(pureBase64, mimeType, promptToUse);
            setJobs(prev => prev.map(j => j.id === job.id ? { ...j, restoredSrc: `data:image/png;base64,${restoredBase64}`, status: 'completed' } : j));
        }

      } catch (err) {
        console.error(`Failed to process job ${job.id}:`, err);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'error', error: errorMessage } : j));
        // Refund credits on error
        const creditsNeeded = job.mode === 'super-resolution' ? CREDITS_PER_SUPER_RESOLUTION : CREDITS_PER_IMAGE;
        await addCredits(creditsNeeded);
        const newCredits = await getCredits();
        setCredits(newCredits);
      }
    };

    const jobsToProcess = jobs.filter(job => job.status === 'queued');

    if (jobsToProcess.length > 0) {
      setJobs(prevJobs =>
        prevJobs.map(job =>
          job.status === 'queued' ? { ...job, status: 'preprocessing' } : job
        )
      );
      jobsToProcess.forEach(job => processJob(job));
    }

  }, [jobs, customEnhancePrompt, useFullResolution]);

  const handleRetryJob = async (jobId: number) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    
    const creditsNeeded = job.mode === 'super-resolution' ? CREDITS_PER_SUPER_RESOLUTION : CREDITS_PER_IMAGE;
    const hasCredits = await hasEnoughCredits(creditsNeeded);
    if (!hasCredits) {
      setRequiredCredits(creditsNeeded);
      setShowInsufficientCredits(true);
      return;
    }
    
    setJobs(prev => prev.map(j => 
      j.id === jobId 
        ? { ...j, status: 'queued', restoredSrc: undefined, error: undefined, mode: mode, progress: undefined } 
        : j
    ));
  };

  const handleRemoveJob = (jobId: number) => {
    setJobs(prev => prev.filter(j => j.id !== jobId));
  };
  
  const handleClearAll = () => {
    setJobs([]);
  };

  const handleDrag = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isApiConfigured) return;
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isApiConfigured) return;
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFilesToQueue(e.dataTransfer.files);
    }
  }, [addFilesToQueue]);

  const handleCapture = (file: File) => {
    setIsCameraOpen(false);
    addSingleFileToQueue(file);
  };
  
  const handleSavePrompt = (newPrompt: string) => {
    setCustomEnhancePrompt(newPrompt);
    setIsPromptModalOpen(false);
  };
  
  const handleZoomJob = (jobId: number) => {
    const job = jobs.find(j => j.id === jobId);
    if (job && job.status === 'completed') {
      setZoomedJobId(jobId);
    }
  };
  
  const handlePurchase = (pkg: CreditPackage) => {
    // TODO: PayPal integration
    console.log('Purchase package:', pkg);
    alert(`PayPal-Integration folgt! Paket: ${pkg.name} - ${pkg.credits} Credits für €${pkg.price}`);
    // For now, just add credits for testing
    // addCredits(pkg.credits);
    // setCredits(getCredits());
    // setIsCreditShopOpen(false);
  };
  
  const zoomedJob = jobs.find(job => job.id === zoomedJobId);

  return (
    <div 
      className="min-h-screen bg-gray-900 text-white flex flex-col items-center antialiased"
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      <Header />
      
      {/* User Menu & Credit Display - Fixed Top Right */}
      {isApiConfigured && !isLoadingAuth && (
        <div className="fixed top-4 right-4 z-40 flex items-center gap-3">
          {user ? (
            <>
              <CreditDisplay credits={credits} onClick={() => setIsCreditShopOpen(true)} />
              <UserMenu user={user} onSignOut={() => setUser(null)} />
            </>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Anmelden
            </button>
          )}
        </div>
      )}
      
      <main className="flex-grow container mx-auto px-4 py-8 w-full flex flex-col items-center">
        {!isApiConfigured ? (
          <ApiKeyMessage />
        ) : (
          <>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              multiple
              onChange={(e) => {
                if (e.target.files) addFilesToQueue(e.target.files);
                e.target.value = ''; // Reset input to allow re-uploading the same file
              }}
            />

            <div className="w-full max-w-lg self-center flex flex-col items-center gap-4 mb-6">
              <div className="w-full p-1 bg-gray-700 rounded-lg flex">
                <button
                  onClick={() => setMode('enhance')}
                  className={`w-1/3 rounded-md py-2 px-2 text-sm md:text-base font-semibold transition-all duration-300 ${
                    mode === 'enhance' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-600/50 text-gray-300'
                  }`}
                  aria-pressed={mode === 'enhance'}
                >
                  Verbessern
                </button>
                <button
                  onClick={() => setMode('super-resolution')}
                  className={`w-1/3 rounded-md py-2 px-2 text-sm md:text-base font-semibold transition-all duration-300 ${
                    mode === 'super-resolution' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-600/50 text-gray-300'
                  }`}
                  aria-pressed={mode === 'super-resolution'}
                  title="Teilt das Bild für maximale Details. Am besten für große Fotos."
                >
                  Super-Auflösung
                </button>
                <button
                  onClick={() => setMode('colorize')}
                  className={`w-1/3 rounded-md py-2 px-2 text-sm md:text-base font-semibold transition-all duration-300 ${
                    mode === 'colorize' ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-600/50 text-gray-300'
                  }`}
                  aria-pressed={mode === 'colorize'}
                >
                  Nur Kolorieren
                </button>
              </div>
              <label htmlFor="resolution-toggle" className="flex items-center cursor-pointer select-none group" title="Originalfoto ohne Größenänderung hochladen. Hinweis: Dies kann die Verarbeitung verlangsamen.">
                <span className={`text-sm font-medium transition-colors ${!useFullResolution ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'}`}>Komprimiert</span>
                <div className="relative mx-4">
                    <input
                        type="checkbox"
                        id="resolution-toggle"
                        className="sr-only peer"
                        checked={useFullResolution}
                        onChange={(e) => setUseFullResolution(e.target.checked)}
                    />
                    <div className="block bg-gray-600 w-14 h-8 rounded-full peer-checked:bg-blue-600 transition"></div>
                    <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ease-in-out peer-checked:translate-x-6"></div>
                </div>
                <span className={`text-sm font-medium transition-colors ${useFullResolution ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'}`}>Volle Auflösung</span>
              </label>
            </div>


            {jobs.length === 0 && !isCameraOpen && (
              <div className="w-full max-w-3xl flex flex-col items-center gap-10">
                <GettingStarted />
                <ImageUploader 
                  onImageUpload={(files) => addFilesToQueue(files)} 
                  onTakePhoto={() => setIsCameraOpen(true)}
                  isDragging={isDragging} 
                />
              </div>
            )}

            {isCameraOpen && <CameraView onCapture={handleCapture} onClose={() => setIsCameraOpen(false)} />}
            
            {jobs.length > 0 && (
              <div className="w-full max-w-7xl flex flex-col items-center gap-8">
                <div className="w-full flex flex-wrap gap-4 justify-center">
                   <button
                      onClick={() => setIsPromptModalOpen(true)}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 flex items-center gap-2"
                      title="Prompt für den Modus 'Verbessern' anpassen"
                    >
                      <EditIcon className="h-5 w-5" />
                      Prompt anpassen
                    </button>
                     <button
                        onClick={handleClearAll}
                        className="bg-red-700 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
                      >
                        Alle löschen
                      </button>
                </div>

                <ImageGrid 
                  jobs={jobs}
                  onRetry={handleRetryJob}
                  onRemove={handleRemoveJob}
                  onZoom={handleZoomJob}
                />
              </div>
            )}
          </>
        )}
      </main>
      {isPromptModalOpen && (
        <PromptEditor
          initialPrompt={customEnhancePrompt}
          defaultPrompt={ENHANCE_PROMPT}
          onClose={() => setIsPromptModalOpen(false)}
          onSave={handleSavePrompt}
        />
      )}
      {zoomedJob && zoomedJob.originalSrc && zoomedJob.restoredSrc && (
        <ImageZoomView
          originalSrc={zoomedJob.originalSrc}
          restoredSrc={zoomedJob.restoredSrc}
          onClose={() => setZoomedJobId(null)}
        />
      )}
      {isDragging && isApiConfigured && (
        <div className="fixed inset-0 bg-black/70 z-50 flex flex-col items-center justify-center pointer-events-none">
          <PhotoIcon className="h-24 w-24 text-blue-400 animate-pulse" />
          <p className="mt-4 text-2xl font-bold text-white">Fotos hierher ziehen, um sie hinzuzufügen</p>
        </div>
      )}
      
      {/* Credit Shop Modal */}
      {isCreditShopOpen && (
        <CreditShop
          onClose={() => setIsCreditShopOpen(false)}
          onPurchase={handlePurchase}
          currentCredits={credits}
        />
      )}
      
      {/* Insufficient Credits Modal */}
      {showInsufficientCredits && (
        <InsufficientCreditsModal
          required={requiredCredits}
          current={credits}
          onClose={() => setShowInsufficientCredits(false)}
          onBuyCredits={() => {
            setShowInsufficientCredits(false);
            setIsCreditShopOpen(true);
          }}
        />
      )}
      
      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSuccess={async () => {
            const userCredits = await getCredits();
            setCredits(userCredits);
          }}
        />
      )}
      
      <footer className="w-full text-center p-4 text-gray-500 text-sm">
        <p>Unterstützt von Gemini. Bilder werden verarbeitet und nicht gespeichert.</p>
      </footer>
    </div>
  );
}