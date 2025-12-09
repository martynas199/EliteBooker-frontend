/**
 * Input component with elegant focus animation
 * @param {object} props
 * @param {string} [props.className]
 */
export function Input({ className = "", ...props }) {
  return (
    <input
      className={[
        "bg-white border border-gray-300 rounded-xl px-4 py-3 w-full text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-250 hover:border-gray-400",
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
        "bg-white border border-gray-300 rounded-xl px-4 py-3 w-full text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-250 hover:border-gray-400 resize-vertical min-h-[100px]",
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
