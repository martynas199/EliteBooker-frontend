import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { compressIfNeeded, formatFileSize } from "../utils/imageCompression";

/**
 * Placeholder hook for image uploads to Cloudflare R2 (or any object storage)
 *
 * USAGE INSTRUCTIONS:
 * ===================
 * Replace this placeholder with your actual Cloudflare R2 upload implementation.
 *
 * Expected interface:
 * -------------------
 * const { uploadImage, isUploading, progress, error } = useImageUpload();
 *
 * const result = await uploadImage(file, {
 *   folder: 'services',  // Optional: organize images by folder
 *   alt: 'Service image'  // Optional: alt text for accessibility
 * });
 *
 * // result should be:
 * // {
 * //   provider: 'cloudflare-r2',
 * //   id: 'unique-file-id',
 * //   url: 'https://your-bucket.r2.cloudflarestorage.com/path/to/image.jpg',
 * //   alt: 'Service image',
 * //   width: 1920,
 * //   height: 1080
 * // }
 *
 * CLOUDFLARE R2 IMPLEMENTATION EXAMPLE:
 * ======================================
 *
 * 1. Set up R2 bucket and get credentials from Cloudflare dashboard
 * 2. Create presigned URL endpoint on your backend:
 *
 *    // Backend: /api/upload/presigned-url
 *    app.post('/api/upload/presigned-url', async (req, res) => {
 *      const { fileName, contentType } = req.body;
 *      const key = `${Date.now()}-${fileName}`;
 *      const presignedUrl = await generateR2PresignedUrl(key, contentType);
 *      res.json({ presignedUrl, key });
 *    });
 *
 * 3. Replace this hook with:
 *
 *    export function useImageUpload() {
 *      const [isUploading, setIsUploading] = useState(false);
 *      const [progress, setProgress] = useState(0);
 *      const [error, setError] = useState(null);
 *
 *      const uploadImage = useCallback(async (file, options = {}) => {
 *        setIsUploading(true);
 *        setError(null);
 *        setProgress(0);
 *
 *        try {
 *          // 1. Get presigned URL from your backend
 *          const { presignedUrl, key } = await fetch('/api/upload/presigned-url', {
 *            method: 'POST',
 *            headers: { 'Content-Type': 'application/json' },
 *            body: JSON.stringify({
 *              fileName: file.name,
 *              contentType: file.type,
 *            }),
 *          }).then(r => r.json());
 *
 *          // 2. Upload directly to R2 using presigned URL
 *          await fetch(presignedUrl, {
 *            method: 'PUT',
 *            body: file,
 *            headers: {
 *              'Content-Type': file.type,
 *            },
 *          });
 *
 *          setProgress(100);
 *
 *          // 3. Get image dimensions (optional)
 *          const dimensions = await getImageDimensions(file);
 *
 *          // 4. Return image metadata
 *          return {
 *            provider: 'cloudflare-r2',
 *            id: key,
 *            url: `https://your-bucket.r2.cloudflarestorage.com/${key}`,
 *            alt: options.alt || file.name,
 *            width: dimensions.width,
 *            height: dimensions.height,
 *          };
 *        } catch (err) {
 *          setError(err.message);
 *          throw err;
 *        } finally {
 *          setIsUploading(false);
 *        }
 *      }, []);
 *
 *      return { uploadImage, isUploading, progress, error };
 *    }
 *
 * ALTERNATIVE: Direct backend upload
 * ===================================
 * If you prefer to upload through your backend (multipart/form-data):
 *
 *    const uploadImage = useCallback(async (file, options = {}) => {
 *      setIsUploading(true);
 *      const formData = new FormData();
 *      formData.append('file', file);
 *      formData.append('folder', options.folder || 'general');
 *
 *      const response = await fetch('/api/upload', {
 *        method: 'POST',
 *        body: formData,
 *      });
 *
 *      const result = await response.json();
 *      setIsUploading(false);
 *      return result;
 *    }, []);
 */

/**
 * Helper function to get image dimensions from a File object
 * @param {File} file
 * @returns {Promise<{width: number, height: number}>}
 */
function getImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Image upload hook - Uploads to Cloudinary via backend API
 *
 * This hook handles uploading images through the backend multipart/form-data endpoint
 * which then uploads to Cloudinary and returns the cloud URL.
 */
export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const uploadImage = useCallback(async (file, options = {}) => {
    setIsUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        const errorMsg = "Please select an image file";
        setError(errorMsg);
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast(`Image is ${formatFileSize(file.size)}. Compressing to 5MB...`, {
          icon: "🔄",
          duration: 2000,
        });

        // Automatically compress the image
        const result = await compressIfNeeded(file, 5);

        if (result.compressed) {
          toast.success(
            `Compressed from ${formatFileSize(
              result.originalSize
            )} to ${formatFileSize(result.newSize)}`
          );
          file = result.file; // Use compressed file
        }
      }

      // Get actual image dimensions for preview
      const dimensions = await getImageDimensions(file);

      // Progress simulation (since we can't get real progress from fetch)
      setProgress(30);

      // For now, return local preview data
      // The actual upload will happen when the service is saved
      const previewUrl = URL.createObjectURL(file);

      // Simulate upload progress
      await new Promise((resolve) => {
        let currentProgress = 30;
        const interval = setInterval(() => {
          currentProgress += 20;
          setProgress(Math.min(currentProgress, 100));
          if (currentProgress >= 100) {
            clearInterval(interval);
            resolve();
          }
        }, 100);
      });

      toast.success("Image preview loaded successfully");

      return {
        provider: "local-preview",
        file: file, // Store the file object for later upload
        id: `preview-${Date.now()}-${file.name}`,
        url: previewUrl,
        alt: options.alt || file.name,
        width: dimensions.width,
        height: dimensions.height,
      };
    } catch (err) {
      const errorMsg = err.message || "Failed to load image";
      setError(errorMsg);
      if (!err.message) {
        toast.error(errorMsg);
      }
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  return {
    uploadImage,
    isUploading,
    progress,
    error,
    reset,
  };
}

export default useImageUpload;
