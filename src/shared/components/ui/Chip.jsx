/**
 * Chip component for category/filter selection.
 * @param {object} props
 * @param {boolean} [props.active]
 * @param {string} [props.className]
 */
export default function Chip({ active = false, className = "", ...props }) {
  const base =
    "inline-flex items-center rounded-full border px-3 py-1.5 text-sm";
  const st = active
    ? "bg-black text-white border-black"
    : "bg-white hover:bg-gray-50";
  return (
    <button className={[base, st, className].join(" ").trim()} {...props} />
  );
}
