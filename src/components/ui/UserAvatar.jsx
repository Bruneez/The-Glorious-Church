import { getInitials } from '@/utils/formatters';

const SIZE_CLASSES = {
  xs: 'w-7 h-7 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-xs',
  lg: 'w-12 h-12 text-sm',
  xl: 'w-16 h-16 text-base',
  '2xl': 'w-20 h-20 text-2xl',
  '3xl': 'w-24 h-24 text-2xl',
};

export default function UserAvatar({
  name = '',
  photo = '',
  size = 'sm',
  className = '',
  alt,
}) {
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.sm;
  const displayName = name || 'User';

  return (
    <div
      className={`${sizeClass} rounded-full bg-indigo-600 border border-indigo-400/30 overflow-hidden flex items-center justify-center font-bold uppercase text-white shrink-0 ${className}`}
    >
      {photo ? (
        <img
          src={photo}
          alt={alt || displayName}
          className="w-full h-full object-cover"
        />
      ) : (
        getInitials(displayName) || displayName.charAt(0).toUpperCase()
      )}
    </div>
  );
}
