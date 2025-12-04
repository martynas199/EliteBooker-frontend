/**
 * Card component with elegant hover effects
 * @param {object} props
 * @param {string} [props.className]
 * @param {boolean} [props.hoverable] - Enable hover lift effect
 * @param {boolean} [props.clickable] - Add cursor pointer
 */
export default function Card({
  className = "",
  hoverable = false,
  clickable = false,
  ...props
}) {
  const hoverClass = hoverable
    ? "transition-all duration-250 hover:shadow-lg hover:-translate-y-1"
    : "";
  const cursorClass = clickable ? "cursor-pointer" : "";

  return (
    <div
      className={[
        "rounded-2xl border bg-white w-full",
        hoverClass,
        cursorClass,
        className,
      ]
        .join(" ")
        .trim()}
      {...props}
    />
  );
}
