import Input from '@/components/ui/Input';

/**
 * Address field prepared for future autocomplete/geocoding integration.
 * Currently behaves as a plain text input and persists coordinates when present.
 */
export default function AddressInput({
  label,
  name,
  value,
  onChange,
  latitude = null,
  longitude = null,
  placeholder = 'Street, city, province',
  helperText = '',
}) {
  const hasCoords = latitude != null && longitude != null && latitude !== '' && longitude !== '';

  return (
    <div className="space-y-1">
      <Input
        label={label}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete="street-address"
      />
      {hasCoords ? (
        <p className="text-[10px] text-emerald-400">Location coordinates saved</p>
      ) : (
        <p className="text-[10px] text-slate-500">
          {helperText || 'Address autocomplete and geocoding are not connected yet. Coordinates can be added later.'}
        </p>
      )}
    </div>
  );
}
