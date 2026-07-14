export default function Input({ 
  label, 
  type = 'text', 
  placeholder = '', 
  value, 
  onChange, 
  onKeyDown,
  required = false,
  disabled = false,
  error = '',
  className = '',
  inputClassName = '',
  trailingIcon = null,
  inputRef = null,
  name,
  id,
  ...rest
}) {
  const inputId = id || name || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="block text-slate-400 mb-1 font-medium text-xs">
          {label}
          {required && <span className="text-rose-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type={type}
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500 text-xs ${error ? 'border-rose-500' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${inputClassName}`}
          {...rest}
        />
        {trailingIcon ? (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            {trailingIcon}
          </div>
        ) : null}
      </div>
      {error && <p className="text-rose-400 text-[10px] mt-1">{error}</p>}
    </div>
  );
}
