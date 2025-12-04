/**
 * FormField - Reusable form field wrapper with label, error, and hint
 *
 * @example
 * <FormField label="Email" error={errors.email} required hint="We'll never share your email">
 *   <input type="email" value={email} onChange={handleChange} />
 * </FormField>
 */
export function FormField({
  label,
  error,
  required = false,
  hint,
  htmlFor,
  children,
  className = "",
}) {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-sm font-semibold text-white mb-2"
        >
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-white/50 mt-1">{hint}</p>}
      {error && (
        <p className="text-red-400 text-sm mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default FormField;
