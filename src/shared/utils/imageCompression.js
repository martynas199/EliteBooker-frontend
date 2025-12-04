/**
 * Compress an image file to a target size
 * @param {File} file - The image file to compress
 * @param {number} maxSizeMB - Maximum file size in MB (default: 5)
 * @param {number} maxWidth - Maximum width in pixels (default: 1920)
 * @param {number} maxHeight - Maximum height in pixels (default: 1920)
 * @returns {Promise<File>} Compressed image file
 */
export async function compressImage(
  file,
  maxSizeMB = 5,
  maxWidth = 1920,
  maxHeight = 1920
) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;

          if (width > height) {
            width = maxWidth;
            height = width / aspectRatio;
          } else {
            height = maxHeight;
            width = height * aspectRatio;
          }
        }

        // Create canvas and draw resized image
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Start with high quality and reduce if needed
        let quality = 0.9;
        const maxSizeBytes = maxSizeMB * 1024 * 1024;

        const tryCompress = (currentQuality) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Failed to compress image"));
                return;
              }

              // If still too large and quality can be reduced, try again
              if (blob.size > maxSizeBytes && currentQuality > 0.1) {
                tryCompress(currentQuality - 0.1);
                return;
              }

              // Create a new File object from the blob
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });

              resolve(compressedFile);
            },
            "image/jpeg",
            currentQuality
          );
        };

        tryCompress(quality);
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = e.target.result;
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Compress image if it exceeds the size limit
 * @param {File} file - The image file to check and compress
 * @param {number} maxSizeMB - Maximum file size in MB (default: 5)
 * @returns {Promise<{file: File, compressed: boolean, originalSize: number, newSize: number}>}
 */
export async function compressIfNeeded(file, maxSizeMB = 5) {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  const originalSize = file.size;

  // If file is already under the limit, return as is
  if (originalSize <= maxSizeBytes) {
    return {
      file,
      compressed: false,
      originalSize,
      newSize: originalSize,
    };
  }

  // Compress the image
  const compressedFile = await compressImage(file, maxSizeMB);

  return {
    file: compressedFile,
    compressed: true,
    originalSize,
    newSize: compressedFile.size,
  };
}

/**
 * Format bytes to human-readable string
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
