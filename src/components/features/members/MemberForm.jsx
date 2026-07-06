import { useEffect, useMemo, useState } from 'react';
import { UserPlus } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import {
  GENDER_OPTIONS,
  OCCUPATION_OPTIONS,
  PRIMARY_GRADE_OPTIONS,
  HIGH_GRADE_OPTIONS,
  MEMBER_FORM_STATUS_OPTIONS,
  mapMemberToFormData,
  toSchoolSelectOptions,
} from '@/config/memberOptions';
import { SCHOOL_TYPE } from '@/config/schoolsOptions';
import { useSchoolsByType } from '@/services/schoolsService';
import { uploadMemberPhoto } from '@/services/storageService';
import UserAvatar from '@/components/ui/UserAvatar';

function resolveSchoolSelection(member, schools) {
  if (!member) return null;

  if (member.schoolId) {
    return schools.find((school) => school.id === member.schoolId) || null;
  }

  const schoolName = (member.schoolName || member.school || member.institution || '')
    .trim()
    .toLowerCase();

  if (!schoolName) return null;

  return schools.find(
    (school) => school.schoolName?.trim().toLowerCase() === schoolName,
  ) || null;
}

export default function MemberForm({ isOpen, onClose, onSubmit, initialData = null }) {
  const { data: primarySchools = [] } = useSchoolsByType(SCHOOL_TYPE.PRIMARY);
  const { data: highSchools = [] } = useSchoolsByType(SCHOOL_TYPE.HIGH);
  const { data: universitySchools = [] } = useSchoolsByType(SCHOOL_TYPE.HIGHER_EDUCATION);

  const [formData, setFormData] = useState(mapMemberToFormData(null));
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeSchoolOptions = useMemo(() => {
    if (formData.occupation === 'Primary School') return primarySchools;
    if (formData.occupation === 'High School') return highSchools;
    if (formData.occupation === 'University / College') return universitySchools;
    return [];
  }, [formData.occupation, primarySchools, highSchools, universitySchools]);

  useEffect(() => {
    if (!isOpen) return;

    const mapped = mapMemberToFormData(initialData);
    setFormData(mapped);
    setPhotoFile(null);
    setPhotoPreview(initialData?.photo || '');
    setError('');
    setIsSubmitting(false);
  }, [initialData, isOpen]);

  useEffect(() => {
    if (!isOpen || !initialData || formData.schoolId || !activeSchoolOptions.length) return;

    const matchedSchool = resolveSchoolSelection(initialData, activeSchoolOptions);
    if (!matchedSchool) return;

    setFormData((prev) => ({
      ...prev,
      schoolId: matchedSchool.id,
      schoolName: matchedSchool.schoolName || '',
      schoolType: matchedSchool.schoolType || '',
      school: matchedSchool.schoolName || '',
      institution: matchedSchool.schoolName || '',
    }));
  }, [activeSchoolOptions, formData.schoolId, initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Full name is required.');
      return;
    }

    if (!formData.surname.trim()) {
      setError('Surname is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      let photoUrl = formData.photo;

      if (photoFile) {
        photoUrl = await uploadMemberPhoto(photoFile);
      }

      await onSubmit({
        ...formData,
        photo: photoUrl,
      });
    } catch (submitError) {
      setError(submitError?.message || 'Failed to save member. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const applySchoolSelection = (schoolId, schools) => {
    const selectedSchool = schools.find((school) => school.id === schoolId);

    setFormData((prev) => ({
      ...prev,
      schoolId: schoolId || '',
      schoolName: selectedSchool?.schoolName || '',
      schoolType: selectedSchool?.schoolType || '',
      school: selectedSchool?.schoolName || '',
      institution: selectedSchool?.schoolName || '',
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'occupation') {
      setFormData((prev) => ({
        ...prev,
        occupation: value,
        schoolId: '',
        schoolName: '',
        schoolType: '',
        school: '',
        grade: '',
        institution: '',
        course: '',
      }));
      return;
    }

    if (name === 'schoolId') {
      applySchoolSelection(value, activeSchoolOptions);
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isPrimarySchool = formData.occupation === 'Primary School';
  const isHighSchool = formData.occupation === 'High School';
  const isUniversity = formData.occupation === 'University / College';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Member' : 'Add Member'}
      icon={UserPlus}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-slate-400 mb-0.5 text-xs">Profile Picture</label>
          <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-lg border border-slate-700">
            <UserAvatar
              name={`${formData.name} ${formData.surname}`.trim()}
              photo={photoPreview}
              size="md"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="text-[11px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[11px] file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 file:cursor-pointer"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. John"
            required
          />
          <Input
            label="Surname"
            name="surname"
            value={formData.surname}
            onChange={handleChange}
            placeholder="e.g. Doe"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="012 345 6789"
          />
          <Select
            label="Gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            options={GENDER_OPTIONS}
            placeholder="Select Gender"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Select
            label="Occupation"
            name="occupation"
            value={formData.occupation}
            onChange={handleChange}
            options={OCCUPATION_OPTIONS}
            placeholder="Select Occupation"
          />
          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={MEMBER_FORM_STATUS_OPTIONS}
            placeholder="Select Status"
          />
        </div>

        {isPrimarySchool && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Select
              label="Primary School"
              name="schoolId"
              value={formData.schoolId}
              onChange={handleChange}
              options={toSchoolSelectOptions(primarySchools)}
              placeholder="Select School"
            />
            <Select
              label="Grade"
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              options={PRIMARY_GRADE_OPTIONS}
              placeholder="Select Grade"
            />
          </div>
        )}

        {isHighSchool && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Select
              label="High School"
              name="schoolId"
              value={formData.schoolId}
              onChange={handleChange}
              options={toSchoolSelectOptions(highSchools)}
              placeholder="Select School"
            />
            <Select
              label="Grade"
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              options={HIGH_GRADE_OPTIONS}
              placeholder="Select Grade"
            />
          </div>
        )}

        {isUniversity && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Select
              label="University / College"
              name="schoolId"
              value={formData.schoolId}
              onChange={handleChange}
              options={toSchoolSelectOptions(universitySchools)}
              placeholder="Select School"
            />
            <Input
              label="Course"
              name="course"
              value={formData.course}
              onChange={handleChange}
              placeholder="e.g. BCom Accounting"
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Input
            label="Date of Birth"
            name="dob"
            type="date"
            value={formData.dob}
            onChange={handleChange}
          />
          <Input
            label="Date of Salvation"
            name="dateOfSalvation"
            type="date"
            value={formData.dateOfSalvation}
            onChange={handleChange}
          />
        </div>

        <Input
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Street, city, province"
        />

        {error && <p className="text-rose-400 text-[11px]">{error}</p>}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {initialData ? 'Save Changes' : 'Add Member'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
