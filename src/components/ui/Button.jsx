export default function Button({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary',
  disabled = false,
  className = '',
  icon: Icon,
  isLoading = false
}) {
  const baseClasses = 'font-semibold py-2.5 px-4 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer shadow text-xs';
  
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-white',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    outline: 'border border-slate-600 hover:bg-slate-700 text-slate-300',
    ghost: 'hover:bg-slate-700 text-slate-300'
  };

  const disabledClasses = disabled || isLoading ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variants[variant]} ${disabledClasses} ${className}`}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </>
      ) : (
        <>
          {Icon && <Icon className="w-3.5 h-3.5" />}
          {children}
        </>
      )}
    </button>
  );
}
