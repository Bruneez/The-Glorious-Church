import { useEffect } from 'react';
import {
  X,
  Edit2,
  Trash2,
  Phone,
  User,
  Briefcase,
  GraduationCap,
  Calendar,
  Heart,
  MapPin,
  BookOpen,
} from 'lucide-react';
import UserAvatar from '@/components/ui/UserAvatar';
import { formatDate } from '@/utils/formatters';
import { getMemberFullName, MEMBER_STATUS } from '@/config/memberOptions';

function displayValue(value) {
  if (value === null || value === undefined) return 'Not provided';
  const text = String(value).trim();
  return text || 'Not provided';
}

function StatusBadge({ status }) {
  const isActive = status === MEMBER_STATUS.ACTIVE;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${
        isActive
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-rose-50 text-rose-700 border border-rose-200'
      }`}
    >
      {status}
    </span>
  );
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="flex gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
      <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-indigo-600" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-800 mt-0.5 break-words">{displayValue(value)}</p>
      </div>
    </div>
  );
}

function getOccupationFields(member) {
  const occupation = member?.occupation || '';

  if (occupation === 'Primary School') {
    return [
      { icon: GraduationCap, label: 'Primary School', value: member.school },
      { icon: BookOpen, label: 'Grade', value: member.grade },
    ];
  }

  if (occupation === 'High School') {
    return [
      { icon: GraduationCap, label: 'High School', value: member.school },
      { icon: BookOpen, label: 'Grade', value: member.grade },
    ];
  }

  if (occupation === 'University') {
    return [
      { icon: GraduationCap, label: 'University', value: member.institution },
      { icon: BookOpen, label: 'Course', value: member.course },
    ];
  }

  if (occupation === 'College') {
    return [
      { icon: GraduationCap, label: 'College', value: member.institution },
      { icon: BookOpen, label: 'Course', value: member.course },
    ];
  }

  if (occupation === 'University / College') {
    return [
      { icon: GraduationCap, label: 'University / College', value: member.institution },
      { icon: BookOpen, label: 'Course', value: member.course },
    ];
  }

  return [];
}

export default function MemberCard({
  member,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  canManage = false,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !member) return null;

  const fullName = getMemberFullName(member);
  const status = member.status || MEMBER_STATUS.ACTIVE;
  const occupationFields = getOccupationFields(member);

  const handleDelete = async () => {
    if (!window.confirm(`Delete ${fullName}? This cannot be undone.`)) {
      return;
    }

    await onDelete(member);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="member-profile-title"
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-white">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600">
              Member Profile
            </p>
            <h2 id="member-profile-title" className="text-sm font-bold text-slate-800 mt-0.5">
              Glorious Church Directory
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300 flex items-center justify-center transition cursor-pointer shadow-sm"
            aria-label="Close profile"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {/* Profile hero */}
          <div className="px-5 pt-6 pb-5 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <UserAvatar name={fullName} photo={member.photo} size="3xl" className="mx-auto sm:mx-0 border-4 border-white shadow-lg" />
              <div className="text-center sm:text-left flex-1 min-w-0">
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  {member.name || 'Not provided'}
                </h3>
                <p className="text-lg text-slate-600 font-medium mt-0.5">
                  {member.surname || 'Not provided'}
                </p>
                <div className="mt-3 flex justify-center sm:justify-start">
                  <StatusBadge status={status} />
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="px-5 py-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-indigo-500" />
              Member Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <DetailItem icon={Phone} label="Phone Number" value={member.phone} />
              <DetailItem icon={User} label="Gender" value={member.gender} />
              <DetailItem icon={Briefcase} label="Occupation" value={member.occupation} />

              {occupationFields.map((field) => (
                <DetailItem
                  key={field.label}
                  icon={field.icon}
                  label={field.label}
                  value={field.value}
                />
              ))}

              <DetailItem
                icon={Calendar}
                label="Date of Birth"
                value={member.dob ? formatDate(member.dob) : ''}
              />
              <DetailItem
                icon={Heart}
                label="Date of Salvation"
                value={member.dateOfSalvation ? formatDate(member.dateOfSalvation) : ''}
              />
              <div className="sm:col-span-2">
                <DetailItem icon={MapPin} label="Address" value={member.address} />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/80 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
          {canManage && onDelete ? (
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          ) : (
            <span className="hidden sm:block" />
          )}

          <div className="flex flex-col sm:flex-row gap-2 sm:ml-auto w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition cursor-pointer shadow-sm"
            >
              Close
            </button>
            {canManage && onEdit && (
              <button
                type="button"
                onClick={() => {
                  onEdit(member);
                  onClose();
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition cursor-pointer shadow-md shadow-indigo-200"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
