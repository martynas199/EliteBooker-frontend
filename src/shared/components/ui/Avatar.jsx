/**
 * Avatar component for displaying user initials.
 * @param {object} props
 * @param {string} [props.name]
 * @param {string} [props.className]
 */
export default function Avatar({ name = "", className = "" }) {
  const initials = (name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className={[
        "w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center font-semibold",
        className,
      ]
        .join(" ")
        .trim()}
    >
      {initials}
    </div>
  );
}
