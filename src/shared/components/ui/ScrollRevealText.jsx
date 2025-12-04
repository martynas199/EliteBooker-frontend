import { motion } from "framer-motion";
import { useMemo } from "react";
import wrap from "word-wrap";

/**
 * ScrollRevealText - Letter-by-letter reveal animation
 * Each character fades in, slides up, and becomes bold
 */
export default function ScrollRevealText({
  text,
  caption,
  className = "",
  revealColor = "#d4a710", // Brand gold color
  captionColor = "text-gray-600",
}) {
  // Smart word wrapping based on viewport width
  const lines = useMemo(() => {
    // Determine wrap width based on screen size
    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
    const wrapWidth = isMobile ? 30 : 50; // Characters per line

    // Remove existing newlines and wrap the text
    const cleanText = text.replace(/\n/g, " ").replace(/"/g, "");
    const wrappedText = wrap(cleanText, { width: wrapWidth, indent: "" });

    // Add quotes back to first and last line
    const wrappedLines = wrappedText.split("\n").filter((line) => line.trim());
    if (wrappedLines.length > 0) {
      wrappedLines[0] = '"' + wrappedLines[0];
      wrappedLines[wrappedLines.length - 1] =
        wrappedLines[wrappedLines.length - 1] + '"';
    }

    return wrappedLines;
  }, [text]);

  // Animation variants for container
  const container = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.025, // Faster stagger for elegance
        delayChildren: 0.1,
      },
    },
  };

  // Animation variants for each letter
  const child = {
    hidden: {
      opacity: 0,
      y: "0.25em", // Slide from below
      color: "#9ca3af", // Gray starting color
    },
    visible: {
      opacity: 1,
      y: 0,
      color: revealColor, // Animate to gold
      transition: {
        duration: 0.65,
        ease: [0.25, 0.46, 0.45, 0.94], // Custom easing curve
      },
    },
  };

  return (
    <article className={`py-16 md:py-24 ${className}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6">
          {/* Text with letter-by-letter reveal */}
          <div className="space-y-2">
            {lines.map((line, lineIndex) => {
              const letters = line.split("");
              return (
                <motion.p
                  key={lineIndex}
                  style={{
                    display: "inline-block",
                    overflow: "hidden",
                    width: "100%",
                  }}
                  className="text-2xl md:text-2xl lg:text-3xl font-serif italic leading-tight md:leading-tight lg:leading-tight"
                  variants={container}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: false, amount: 0.3 }}
                >
                  {letters.map((letter, letterIndex) => (
                    <motion.span
                      key={`${lineIndex}-${letterIndex}`}
                      style={{ display: "inline-block" }}
                      variants={child}
                    >
                      {letter === " " ? "\u00A0" : letter}
                    </motion.span>
                  ))}
                </motion.p>
              );
            })}
          </div>

          {/* Caption */}
          {caption && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="pt-4"
            >
              <span
                className={`text-sm md:text-base font-light tracking-wide ${captionColor}`}
              >
                {caption}
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </article>
  );
}
