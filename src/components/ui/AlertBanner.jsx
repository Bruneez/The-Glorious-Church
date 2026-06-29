import { AlertCircle } from 'lucide-react';

export default function AlertBanner({ message }) {
  if (!message) return null;

  return (
    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-2.5 rounded-lg font-medium flex items-center gap-2">
      <AlertCircle className="w-4 h-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
