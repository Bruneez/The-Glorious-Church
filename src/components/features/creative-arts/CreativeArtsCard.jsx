import { useState } from 'react';
import { Palette, Users, Edit2, Trash2, X } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

export default function CreativeArtsCard({ group, onEdit, onDelete, onViewMembers }) {
  const [isViewOpen, setIsViewOpen] = useState(false);

  const memberCount = group.members?.length || 0;

  return (
    <>
      <Card className="hover:border-indigo-500/50 transition cursor-pointer" onClick={() => setIsViewOpen(true)}>
        <div className="flex items-start gap-3">
          <div className="w-16 h-16 rounded-lg bg-indigo-500/10 border-2 border-indigo-500/30 overflow-hidden flex items-center justify-center shrink-0">
            {group.photo ? (
              <img src={group.photo} alt={group.name} className="w-full h-full object-cover" />
            ) : (
              <Palette className="w-8 h-8 text-indigo-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white uppercase tracking-wide truncate">{group.name}</h3>
            <p className="text-[10px] text-indigo-400 font-bold tracking-wider uppercase mt-0.5">{group.leader}</p>
            {group.subtitle && (
              <p className="text-[10px] text-slate-400 mt-1 truncate">{group.subtitle}</p>
            )}
            <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-500">
              <Users className="w-3 h-3" />
              <span>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50">
          <Button
            variant="ghost"
            size="sm"
            icon={Edit2}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(group);
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
              if (window.confirm('Are you sure you want to delete this group?')) {
                onDelete(group.id);
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
            {group.photo ? (
              <img src={group.photo} alt={group.name} className="w-full h-full object-cover" />
            ) : (
              <Palette className="w-12 h-12 text-indigo-400" />
            )}
          </div>

          <h3 className="text-base font-black text-white tracking-wide uppercase">{group.name}</h3>
          <p className="text-[11px] text-indigo-400 font-bold tracking-wider uppercase mt-1">{group.leader}</p>
          {group.scripture && (
            <p className="text-[10px] text-amber-400/90 font-mono mt-1 italic">{group.scripture}</p>
          )}
        </div>

        <div className="space-y-3 mt-4">
          {group.subtitle && (
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Slogan</p>
              <p className="text-slate-200 font-medium mt-0.5">{group.subtitle}</p>
            </div>
          )}

          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Vision</p>
            <p className="text-slate-200 text-xs mt-0.5 leading-relaxed">{group.description}</p>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Team Members</span>
              <span className="text-xs font-bold text-white">{memberCount}</span>
            </div>
          </div>
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
