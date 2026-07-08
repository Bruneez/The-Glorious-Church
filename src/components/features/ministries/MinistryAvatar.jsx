import { getMinistryAvatar } from '@/config/ministriesOptions';

export default function MinistryAvatar({ ministry, size = 'md' }) {
  const name = ministry?.ministryName || '';
  const initial = name.charAt(0).toUpperCase() || '?';
  const avatar = getMinistryAvatar(ministry);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-20 h-20 text-2xl',
  };

  return (
    <div
      className={`${sizeClasses[size] || sizeClasses.md} rounded-full bg-indigo-600 border border-indigo-400/30 overflow-hidden flex items-center justify-center font-bold uppercase text-white shrink-0`}
    >
      {avatar ? (
        <img src={avatar} alt={name} className="w-full h-full object-cover" />
      ) : (
        initial
      )}
    </div>
  );
}
