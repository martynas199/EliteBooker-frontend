/**
 * Cloudinary Image Optimization Utilities
 *
 * Provides helpers for generating optimized Cloudinary URLs with:
 * - Automatic format detection (WebP with fallback)
 * - Responsive image sizing
 * - Quality optimization
 * - Lazy loading blur placeholders
 */

/**
 * Extract Cloudinary public ID from a URL
 * @param {string} url - Full Cloudinary URL
 * @returns {string|null} - Public ID or null if not a Cloudinary URL
 */
export function extractCloudinaryPublicId(url) {
  if (!url || typeof url !== "string") return null;

  // Match Cloudinary URL pattern: .../upload/.../filename.ext
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
  return match ? match[1] : null;
}

/**
 * Check if URL is a Cloudinary URL
 * @param {string} url
 * @returns {boolean}
 */
export function isCloudinaryUrl(url) {
  if (!url || typeof url !== "string") return false;
  return url.includes("cloudinary.com") && url.includes("/upload/");
}

/**
 * Generate optimized Cloudinary URL with transformations
 * @param {string} url - Original image URL (Cloudinary or external)
 * @param {object} options - Transformation options
 * @param {number} options.width - Target width in pixels
 * @param {number} options.height - Target height in pixels
 * @param {string} options.crop - Crop mode: 'fill', 'fit', 'scale', 'thumb', 'crop'
 * @param {string} options.gravity - Gravity for cropping: 'auto', 'face', 'center', etc.
 * @param {number} options.quality - Quality (1-100), defaults to 'auto'
 * @param {string} options.format - Force format: 'webp', 'jpg', 'png', 'auto'
 * @param {number} options.blur - Blur amount for placeholder (1-2000)
 * @param {number} options.dpr - Device pixel ratio (1, 2, 3)
 * @returns {string} - Optimized Cloudinary URL or original URL
 */
export function getOptimizedImageUrl(url, options = {}) {
  if (!url) return "";

  // If not a Cloudinary URL, return original
  if (!isCloudinaryUrl(url)) {
    return url;
  }

  const {
    width,
    height,
    crop = "fill",
    gravity = "auto",
    quality = "auto",
    format = "auto",
    blur,
    dpr = 1,
  } = options;

  // Build transformation string
  const transformations = [];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  if (gravity && crop !== "scale") transformations.push(`g_${gravity}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);
  if (blur) transformations.push(`e_blur:${blur}`);
  if (dpr > 1) transformations.push(`dpr_${dpr}`);

  const transformString = transformations.join(",");

  // Insert transformations into URL after '/upload/'
  return url.replace("/upload/", `/upload/${transformString}/`);
}

/**
 * Generate a low-quality blur placeholder URL
 * @param {string} url - Original image URL
 * @param {number} size - Placeholder size (default 40px)
 * @returns {string} - Blur placeholder URL
 */
export function getBlurPlaceholder(url, size = 40) {
  return getOptimizedImageUrl(url, {
    width: size,
    quality: 30,
    blur: 1000,
    format: "jpg", // JPG compresses better for blurred images
  });
}

/**
 * Generate srcset for responsive images
 * @param {string} url - Original image URL
 * @param {object} options - Base options
 * @param {number[]} widths - Array of widths to generate (default: [320, 640, 768, 1024, 1280, 1920])
 * @returns {string} - srcset string
 */
export function generateSrcSet(
  url,
  options = {},
  widths = [320, 640, 768, 1024, 1280, 1920]
) {
  if (!url || !isCloudinaryUrl(url)) {
    return "";
  }

  return widths
    .map((width) => {
      const optimizedUrl = getOptimizedImageUrl(url, { ...options, width });
      return `${optimizedUrl} ${width}w`;
    })
    .join(", ");
}

/**
 * Generate sizes attribute for responsive images
 * @param {object} breakpoints - Object mapping breakpoints to sizes
 * @returns {string} - sizes string
 *
 * @example
 * generateSizes({
 *   '(max-width: 640px)': '100vw',
 *   '(max-width: 1024px)': '50vw',
 *   default: '33vw'
 * })
 */
export function generateSizes(breakpoints = {}) {
  const entries = Object.entries(breakpoints);
  const defaultSize = breakpoints.default || "100vw";

  const sizeStrings = entries
    .filter(([key]) => key !== "default")
    .map(([breakpoint, size]) => `${breakpoint} ${size}`);

  sizeStrings.push(defaultSize);

  return sizeStrings.join(", ");
}

/**
 * Preset configurations for common use cases
 */
export const CLOUDINARY_PRESETS = {
  // Product images
  productThumbnail: {
    width: 400,
    height: 400,
    crop: "fill",
    gravity: "auto",
    quality: "auto",
    format: "auto",
  },
  productCard: {
    width: 600,
    height: 600,
    crop: "fill",
    gravity: "auto",
    quality: "auto",
    format: "auto",
  },
  productDetail: {
    width: 1200,
    height: 1200,
    crop: "fit",
    gravity: "center",
    quality: "auto",
    format: "auto",
  },

  // Service images
  serviceCard: {
    width: 640,
    height: 480,
    crop: "fill",
    gravity: "auto",
    quality: "auto",
    format: "auto",
  },

  // Hero/Banner images
  heroMobile: {
    width: 768,
    height: 600,
    crop: "fill",
    gravity: "auto",
    quality: "auto",
    format: "auto",
  },
  heroDesktop: {
    width: 1920,
    height: 800,
    crop: "fill",
    gravity: "auto",
    quality: "auto",
    format: "auto",
  },

  // Profile/Avatar images
  avatar: {
    width: 200,
    height: 200,
    crop: "thumb",
    gravity: "face",
    quality: "auto",
    format: "auto",
  },

  // Gallery images
  galleryThumbnail: {
    width: 400,
    height: 300,
    crop: "fill",
    gravity: "auto",
    quality: "auto",
    format: "auto",
  },
  galleryFull: {
    width: 1600,
    height: 1200,
    crop: "fit",
    gravity: "center",
    quality: "auto",
    format: "auto",
  },
};

/**
 * Get preset configuration by name
 * @param {string} presetName - Name of the preset
 * @param {object} overrides - Override specific options
 * @returns {object} - Merged configuration
 */
export function getPreset(presetName, overrides = {}) {
  const preset = CLOUDINARY_PRESETS[presetName] || {};
  return { ...preset, ...overrides };
}
