import { getDepartmentLogo } from '@/config/creativeArtsOptions';

export default function DepartmentAvatar({ department, size = 'sm' }) {
  const name = department?.name || '';
  const initial = name.charAt(0).toUpperCase() || '?';
  const logo = getDepartmentLogo(department);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-20 h-20 text-2xl',
  };

  return (
    <div
      className={`${sizeClasses[size] || sizeClasses.sm} rounded-full bg-indigo-600 border border-indigo-400/30 overflow-hidden flex items-center justify-center font-bold uppercase text-white shrink-0`}
    >
      {logo ? (
        <img src={logo} alt={name} className="w-full h-full object-cover" />
      ) : (
        initial
      )}
    </div>
  );
}
