export default function Select({ 
  label, 
  options = [], 
  value, 
  onChange, 
  required = false,
  disabled = false,
  error = '',
  className = '',
  name,
  id,
  placeholder = 'Select an option'
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
      <select
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500 text-xs ${error ? 'border-rose-500' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options
          .filter((option) => option.value !== '')
          .map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-rose-400 text-[10px] mt-1">{error}</p>}
    </div>
  );
}
