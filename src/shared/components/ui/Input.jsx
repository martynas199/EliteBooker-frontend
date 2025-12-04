/**
 * Input component with elegant focus animation
 * @param {object} props
 * @param {string} [props.className]
 */
export function Input({ className = "", ...props }) {
  return (
    <input
      className={[
        "bg-white/10 border border-white/20 rounded-xl px-4 py-3 w-full text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-250 hover:border-white/30 hover:bg-white/15",
        className,
      ]
        .join(" ")
        .trim()}
      {...props}
    />
  );
}

/**
 * Textarea component with elegant focus animation
 * @param {object} props
 * @param {string} [props.className]
 */
export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={[
        "bg-white/10 border border-white/20 rounded-xl px-4 py-3 w-full text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-250 hover:border-white/30 hover:bg-white/15 resize-vertical min-h-[100px]",
        className,
      ]
        .join(" ")
        .trim()}
      {...props}
    />
  );
}

// Default export for backward compatibility
export default Input;
