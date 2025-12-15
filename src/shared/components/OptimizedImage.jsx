import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import {
  isCloudinaryUrl,
  getOptimizedImageUrl,
  getBlurPlaceholder,
  generateSrcSet,
  generateSizes,
  getPreset,
} from "../utils/cloudinary";

/**
 * OptimizedImage - Intelligent image component with:
 * - Automatic WebP format with fallback
 * - Cloudinary transformations for optimization
 * - Lazy loading with Intersection Observer
 * - Blur-up placeholder effect
 * - Responsive srcset generation
 * - Fallback to original URL for non-Cloudinary images
 *
 * @example
 * // Basic usage
 * <OptimizedImage src={imageUrl} alt="Product" width={600} height={400} />
 *
 * // With preset
 * <OptimizedImage src={imageUrl} alt="Product" preset="productCard" />
 *
 * // With responsive sizes
 * <OptimizedImage
 *   src={imageUrl}
 *   alt="Hero"
 *   responsive
 *   sizes={{
 *     '(max-width: 640px)': '100vw',
 *     '(max-width: 1024px)': '50vw',
 *     default: '33vw'
 *   }}
 * />
 */
export default function OptimizedImage({
  src,
  alt = "",
  width,
  height,
  preset,
  quality = "auto",
  crop = "fill",
  gravity = "auto",
  format = "auto",
  className = "",
  style = {},
  loading = "lazy",
  blur = true,
  responsive = false,
  sizes,
  widths = [320, 640, 768, 1024, 1280, 1920],
  dpr,
  onClick,
  onLoad,
  onError,
  ...restProps
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(loading !== "lazy");
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Reset loading state when src changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  // Build transformation options
  const options = preset
    ? getPreset(preset, { width, height, quality, crop, gravity, format, dpr })
    : { width, height, quality, crop, gravity, format, dpr };

  // Generate optimized URLs
  const isCloudinary = isCloudinaryUrl(src);
  const optimizedUrl = isCloudinary ? getOptimizedImageUrl(src, options) : src;

  // console.log("OptimizedImage render:", { src, optimizedUrl, isCloudinary });

  const placeholderUrl =
    isCloudinary && blur ? getBlurPlaceholder(src, 40) : null;

  // Generate srcset for responsive images
  const srcSet =
    responsive && isCloudinary ? generateSrcSet(src, options, widths) : null;

  const sizesAttr = responsive && sizes ? generateSizes(sizes) : null;

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (loading !== "lazy" || !imgRef.current) {
      setIsInView(true);
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        });
      },
      {
        rootMargin: "50px", // Start loading 50px before image enters viewport
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [loading]);

  // Handle image load
  const handleLoad = (e) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  // Handle image error
  const handleError = (e) => {
    setHasError(true);
    setIsLoaded(true); // Stop showing placeholder
    onError?.(e);
  };

  // Determine which image to show
  const currentSrc = isInView ? optimizedUrl : placeholderUrl || optimizedUrl;
  const currentSrcSet = isInView && srcSet ? srcSet : null;

  return (
    <img
      ref={imgRef}
      src={currentSrc}
      srcSet={currentSrcSet}
      sizes={sizesAttr}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      onClick={onClick}
      onLoad={handleLoad}
      onError={handleError}
      className={`${className} ${
        blur && !isLoaded && placeholderUrl
          ? "blur-sm scale-105"
          : "blur-0 scale-100"
      } transition-all duration-500 ease-out`}
      style={{
        ...style,
        opacity: isLoaded || !blur ? 1 : 0.8,
      }}
      {...restProps}
    />
  );
}

OptimizedImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
  preset: PropTypes.oneOf([
    "productThumbnail",
    "productCard",
    "productDetail",
    "serviceCard",
    "heroMobile",
    "heroDesktop",
    "avatar",
    "galleryThumbnail",
    "galleryFull",
  ]),
  quality: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  crop: PropTypes.oneOf(["fill", "fit", "scale", "thumb", "crop"]),
  gravity: PropTypes.oneOf([
    "auto",
    "face",
    "center",
    "north",
    "south",
    "east",
    "west",
  ]),
  format: PropTypes.oneOf(["auto", "webp", "jpg", "png"]),
  className: PropTypes.string,
  style: PropTypes.object,
  loading: PropTypes.oneOf(["lazy", "eager"]),
  blur: PropTypes.bool,
  responsive: PropTypes.bool,
  sizes: PropTypes.object,
  widths: PropTypes.arrayOf(PropTypes.number),
  dpr: PropTypes.oneOf([1, 2, 3]),
  onClick: PropTypes.func,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
};
