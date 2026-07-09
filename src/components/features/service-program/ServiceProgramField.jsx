export function ProgramFieldValue({ value, readOnly = true }) {
  if (readOnly) {
    return (
      <span className="block whitespace-normal break-words leading-relaxed">
        {value?.trim() ? value : '—'}
      </span>
    );
  }

  return null;
}

export function ProgramFieldInput({ value, placeholder, onChange }) {
  return (
    <input
      type="text"
      value={value || ''}
      onChange={(event) => onChange?.(event.target.value)}
      placeholder={placeholder}
      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-indigo-500"
    />
  );
}

export function ProgramFieldBlock({ field, row, canManage, onRowChange }) {
  return (
    <div className={field.wide ? 'sm:col-span-2' : ''}>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
        {field.label}
      </p>
      {canManage ? (
        <ProgramFieldInput
          value={row[field.key]}
          placeholder={field.placeholder}
          onChange={(value) => onRowChange?.(row.id, field.key, value)}
        />
      ) : (
        <ProgramFieldValue value={row[field.key]} />
      )}
    </div>
  );
}
