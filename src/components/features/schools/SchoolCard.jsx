import { useState } from 'react';
import { School, MapPin, Phone, Edit2, Trash2, X } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

export default function SchoolCard({ school, onEdit, onDelete }) {
  const [isViewOpen, setIsViewOpen] = useState(false);

  return (
    <>
      <Card className="hover:border-indigo-500/50 transition cursor-pointer" onClick={() => setIsViewOpen(true)}>
        <div className="flex items-start gap-3">
          <div className="w-16 h-16 rounded-lg bg-indigo-500/10 border-2 border-indigo-500/30 overflow-hidden flex items-center justify-center shrink-0">
            {school.logo ? (
              <img src={school.logo} alt={school.name} className="w-full h-full object-cover" />
            ) : (
              <School className="w-8 h-8 text-indigo-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white uppercase tracking-wide truncate">{school.name}</h3>
            {school.address && (
              <p className="text-[10px] text-slate-400 mt-1 truncate flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {school.address}
              </p>
            )}
            {school.contact && (
              <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {school.contact}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50">
          <Button
            variant="ghost"
            size="sm"
            icon={Edit2}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(school);
            }}
            className="flex-1"
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('Are you sure you want to delete this school?')) {
                onDelete(school.id);
              }
            }}
            className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
          >
            Delete
          </Button>
        </div>
      </Card>

      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} size="medium">
        <button
          onClick={() => setIsViewOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer bg-slate-900/40 p-1.5 rounded-lg border border-slate-700/50 z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center border-b border-slate-700/60 pb-4 text-center">
          <div className="w-24 h-24 rounded-full bg-indigo-500/10 border-2 border-indigo-500/30 overflow-hidden flex items-center justify-center mb-3 shadow-lg">
            {school.logo ? (
              <img src={school.logo} alt={school.name} className="w-full h-full object-cover" />
            ) : (
              <School className="w-12 h-12 text-indigo-400" />
            )}
          </div>

          <h3 className="text-base font-black text-white tracking-wide uppercase">{school.name}</h3>
          {school.type && (
            <p className="text-[11px] text-indigo-400 font-bold tracking-wider uppercase mt-1">
              {school.type === 'primary' ? 'Primary School' : school.type === 'high' ? 'High School' : 'University/College'}
            </p>
          )}
        </div>

        <div className="space-y-3 mt-4">
          {school.address && (
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Address</p>
              <p className="text-slate-200 font-medium mt-0.5 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                {school.address}
              </p>
            </div>
          )}

          {school.contact && (
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Contact</p>
              <p className="text-slate-200 font-medium mt-0.5 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                {school.contact}
              </p>
            </div>
          )}

          {school.principal && (
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Principal</p>
              <p className="text-slate-200 font-medium mt-0.5">{school.principal}</p>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-700/60 mt-4">
          <Button variant="secondary" onClick={() => setIsViewOpen(false)} className="w-full">
            Close
          </Button>
        </div>
      </Modal>
    </>
  );
}
