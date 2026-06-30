import { useState } from 'react';
import { User, Phone, MessageCircle, ArrowLeft, Edit2, Trash2 } from 'lucide-react';
import { formatWhatsAppLink, getInitials, formatDate } from '@/utils/formatters';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { uploadMemberPhoto } from '@/services/storageService';

export default function MemberCard({ member, isOpen, onClose, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: member.name,
    phone: member.phone,
    address: member.address,
    dob: member.dob
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSave = async () => {
    setIsUploading(true);
    
    let photoUrl = member.photo;
    
    if (photoFile) {
      try {
        photoUrl = await uploadMemberPhoto(photoFile);
      } catch (error) {
        console.error('Error uploading photo:', error);
        setIsUploading(false);
        return;
      }
    }

    await onUpdate(member.id, {
      ...editData,
      photo: photoUrl
    });
    
    setIsUploading(false);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      await onDelete(member.id);
      onClose();
    }
  };

  const whatsappLink = formatWhatsAppLink(member.phone);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large">
      <button
        type="button"
        onClick={onClose}
        className="text-slate-400 hover:text-white cursor-pointer flex items-center gap-2 text-xs font-medium bg-transparent border-0 p-0 mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Members
      </button>

      <div className="bg-slate-800/40 border border-slate-800/80 rounded-2xl p-5 flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="relative group w-40 h-40 shrink-0">
          <div className="w-40 h-40 rounded-xl bg-slate-700 border border-slate-600/50 overflow-hidden flex items-center justify-center text-4xl font-bold uppercase text-white shadow-md">
            {member.photo ? (
              <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
            ) : (
              getInitials(member.name)
            )}
          </div>
          {isEditing && (
            <label className="absolute inset-0 bg-black/60 rounded-xl items-center justify-center text-[10px] font-bold text-slate-200 cursor-pointer opacity-0 group-hover:opacity-100 transition flex">
              Change Photo
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files[0])}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </label>
          )}
        </div>

        <div className="flex-1 space-y-3 text-center sm:text-left w-full">
          <div>
            {isEditing ? (
              <Input
                name="name"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="max-w-xs mt-1"
              />
            ) : (
              <>
                <h3 className="text-2xl font-bold text-white tracking-wide">{member.name}</h3>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                  <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">
                    Active
                  </span>
                  {member.creativeArts && (
                    <span className="bg-blue-950/60 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">
                      {member.creativeArts}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-semibold pt-1">
            <div className="flex items-center gap-1.5 text-sky-400 w-full sm:w-auto justify-center sm:justify-start">
              <Phone className="w-3.5 h-3.5" />
              {isEditing ? (
                <Input
                  name="phone"
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  className="max-w-[150px]"
                />
              ) : (
                <span>{member.phone}</span>
              )}
            </div>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp
            </a>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 text-left space-y-1.5 w-full">
            <p className="text-[11px] text-slate-400 font-medium">Attendance</p>
            <p className="text-xs font-medium text-slate-200">Active member</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/40 border border-slate-800/80 rounded-2xl p-5 space-y-4">
        <div className="text-slate-300 font-bold text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
          <User className="w-4 h-4 text-orange-400" />
          Personal Info
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gender</p>
            <p className="text-white font-bold text-sm mt-0.5">MALE</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Date of Birth</p>
            {isEditing ? (
              <Input
                name="dob"
                type="date"
                value={editData.dob}
                onChange={(e) => setEditData({ ...editData, dob: e.target.value })}
                className="max-w-[180px] mt-1"
              />
            ) : (
              <p className="text-white font-bold text-sm mt-0.5">{formatDate(member.dob)}</p>
            )}
          </div>
          <div className="sm:col-span-2">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Home Address</p>
            {isEditing ? (
              <Input
                name="address"
                value={editData.address}
                onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                className="mt-1"
              />
            ) : (
              <p className="text-slate-200 font-medium mt-0.5">{member.address}</p>
            )}
          </div>
          <div className="sm:col-span-2 bg-slate-900/40 p-3 rounded-xl border border-slate-800/60">
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Occupation & Affiliation</p>
            <p className="text-slate-100 font-medium mt-1 text-sm">
              {member.occupation}
              {member.school && ` • ${member.school}`}
              {member.institution && ` • ${member.institution}`}
            </p>
          </div>
        </div>
      </div>

      <div className="pt-2 flex justify-between items-center gap-2">
        <Button
          type="button"
          variant="danger"
          icon={Trash2}
          onClick={handleDelete}
        >
          Delete
        </Button>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                isLoading={isUploading}
              >
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
              >
                Close Profile
              </Button>
              <Button
                type="button"
                icon={Edit2}
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
