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
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-gray-600 mt-1">{hint}</p>}
      {error && (
        <p className="text-red-500 text-sm mt-1 font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default FormField;
