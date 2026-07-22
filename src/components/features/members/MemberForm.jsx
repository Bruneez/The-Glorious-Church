import { useEffect, useMemo, useState } from 'react';
import { UserPlus } from 'lucide-react';
import Input from '@/components/ui/Input';
import AddressInput from '@/components/ui/AddressInput';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import MemberOccupationFields from '@/components/features/members/MemberOccupationFields';
import {
  GENDER_OPTIONS,
  LANGUAGE_OPTIONS,
  COUNTRY_OPTIONS,
  ETHNICITY_OPTIONS,
  BRANCH_OPTIONS,
  CHURCH_OPTIONS,
  MEMBERSHIP_NA,
  MEMBER_FORM_OCCUPATION_OPTIONS,
  MEMBER_FORM_STATUS_OPTIONS,
  buildCreativeArtsSelectOptions,
  buildMinistrySelectOptions,
  createEmptyMemberSubjects,
  getOccupationFieldReset,
  isCapeTownChurch,
  isSeniorSchoolGrade,
  mapMemberToFormData,
  MAX_MEMBER_SUBJECTS,
  ACCEPTED_MEMBER_PHOTO_ACCEPT,
  validateMemberPhotoFile,
  validateMemberFormData,
  resolveCreativeArtsFormSelection,
  resolveMinistryFormSelection,
} from '@/config/memberOptions';
import { SCHOOL_TYPE, LEGACY_SCHOOL_TYPE, SCHOOL_STATUS } from '@/config/schoolsOptions';
import { useSchoolsByType } from '@/services/schoolsService';
import { useCreativeArts } from '@/services/creativeArtsService';
import { useMinistries } from '@/services/ministriesService';
import { uploadMemberPhoto, uploadMemberReportCard, deleteMemberPhoto, deleteMemberReportCard } from '@/services/storageService';
import { geocodeAddress } from '@/services/mapService';
import { getStorageErrorMessage } from '@/utils/storageErrors';
import { getGeocodingErrorMessage } from '@/utils/geocodingErrors';
import { normalizeMemberCoordinate } from '@/utils/memberLocations';
import {
  resolveMemberPhotoStoragePath,
  resolveMemberReportCardStoragePath,
} from '@/utils/storagePathUtils';
import ImageUploadField from '@/components/common/ImageUploadField';

function CoreSectionHeading({ title }) {
  return (
    <div className="pt-1">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</h3>
    </div>
  );
}

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

function getSchoolsForOccupation(occupation, schoolLists) {
  if (occupation === 'Primary School') return schoolLists.primarySchools;
  if (occupation === 'High School') return schoolLists.highSchools;
  if (occupation === 'University') return schoolLists.universitySchools;
  if (occupation === 'College') return schoolLists.collegeSchools;
  if (occupation === 'University / College') return schoolLists.legacyHigherEducationSchools;
  return [];
}

function filterActiveSchools(schools = []) {
  return schools.filter(
    (school) => (school.status || SCHOOL_STATUS.ACTIVE) === SCHOOL_STATUS.ACTIVE,
  );
}

export default function MemberForm({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  lockCreativeArtsDepartmentName = '',
}) {
  const { data: primarySchools = [] } = useSchoolsByType(SCHOOL_TYPE.PRIMARY);
  const { data: highSchools = [] } = useSchoolsByType(SCHOOL_TYPE.HIGH);
  const { data: universitySchools = [] } = useSchoolsByType(SCHOOL_TYPE.UNIVERSITY);
  const { data: collegeSchools = [] } = useSchoolsByType(SCHOOL_TYPE.COLLEGE);
  const { data: legacyHigherEducationSchools = [] } = useSchoolsByType(LEGACY_SCHOOL_TYPE.SLUG_HIGHER_ED);
  const { data: creativeArtsTeams = [] } = useCreativeArts();
  const { data: ministries = [] } = useMinistries();

  const [formData, setFormData] = useState(mapMemberToFormData(null));
  const [photoFile, setPhotoFile] = useState(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [reportCardFile, setReportCardFile] = useState(null);
  const [error, setError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const schoolLists = useMemo(
    () => ({
      primarySchools: filterActiveSchools(primarySchools),
      highSchools: filterActiveSchools(highSchools),
      universitySchools: filterActiveSchools(universitySchools),
      collegeSchools: filterActiveSchools(collegeSchools),
      legacyHigherEducationSchools: filterActiveSchools(legacyHigherEducationSchools),
    }),
    [primarySchools, highSchools, universitySchools, collegeSchools, legacyHigherEducationSchools],
  );

  const activeCreativeArtsTeams = useMemo(
    () => creativeArtsTeams.filter((team) => (team.status || 'Active') === 'Active'),
    [creativeArtsTeams],
  );

  const activeMinistries = useMemo(
    () => ministries.filter((ministry) => (ministry.status || 'Active') === 'Active'),
    [ministries],
  );

  const creativeArtsOptions = useMemo(
    () => buildCreativeArtsSelectOptions(creativeArtsTeams),
    [creativeArtsTeams],
  );

  const ministryOptions = useMemo(
    () => buildMinistrySelectOptions(ministries),
    [ministries],
  );

  const lockedCreativeArtsTeam = useMemo(() => {
    if (!lockCreativeArtsDepartmentName) return null;
    return activeCreativeArtsTeams.find((team) => team.name === lockCreativeArtsDepartmentName) || null;
  }, [activeCreativeArtsTeams, lockCreativeArtsDepartmentName]);

  const showCapeTownFields = isCapeTownChurch(formData.church);

  const activeSchoolOptions = useMemo(
    () => getSchoolsForOccupation(formData.occupation, schoolLists),
    [formData.occupation, schoolLists],
  );

  const occupationOptions = useMemo(() => {
    if (formData.occupation === 'University / College') {
      return [
        ...MEMBER_FORM_OCCUPATION_OPTIONS,
        { value: 'University / College', label: 'University / College (Legacy)' },
      ];
    }

    return MEMBER_FORM_OCCUPATION_OPTIONS;
  }, [formData.occupation]);

  useEffect(() => {
    if (!isOpen) return;

    const mapped = mapMemberToFormData(initialData);
    setFormData(mapped);
    setPhotoFile(null);
    setRemovePhoto(false);
    setPhotoError('');
    setReportCardFile(null);
    setError('');
    setAddressError('');
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

  useEffect(() => {
    if (!isOpen || !initialData) return;

    setFormData((prev) => ({
      ...prev,
      creativeArtsId: resolveCreativeArtsFormSelection(initialData, creativeArtsTeams),
      creativeArtsName:
        activeCreativeArtsTeams.find(
          (team) => team.id === resolveCreativeArtsFormSelection(initialData, creativeArtsTeams),
        )?.name
        || initialData.department
        || '',
      ministryId: resolveMinistryFormSelection(initialData, ministries),
      ministryName:
        activeMinistries.find(
          (ministry) => ministry.id === resolveMinistryFormSelection(initialData, ministries),
        )?.ministryName
        || initialData.ministryName
        || '',
    }));
  }, [activeCreativeArtsTeams, activeMinistries, creativeArtsTeams, initialData, isOpen, ministries]);

  useEffect(() => {
    if (!isOpen || !lockCreativeArtsDepartmentName || !lockedCreativeArtsTeam) return;

    setFormData((prev) => ({
      ...prev,
      creativeArtsId: lockedCreativeArtsTeam.id,
      creativeArtsName: lockedCreativeArtsTeam.name,
    }));
  }, [isOpen, lockCreativeArtsDepartmentName, lockedCreativeArtsTeam]);

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

  const handleSchoolSelect = (event) => {
    applySchoolSelection(event.target.value, activeSchoolOptions);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === 'church') {
      setFormData((prev) => {
        const next = { ...prev, church: value };

        if (!isCapeTownChurch(value)) {
          next.branch = '';
          next.zoneSupervisor = '';
        }

        return next;
      });
      return;
    }

    if (name === 'creativeArtsId') {
      const selectedTeam = activeCreativeArtsTeams.find((team) => team.id === value);
      setFormData((prev) => ({
        ...prev,
        creativeArtsId: value,
        creativeArtsName: selectedTeam?.name || '',
      }));
      return;
    }

    if (name === 'ministryId') {
      const selectedMinistry = activeMinistries.find((ministry) => ministry.id === value);
      setFormData((prev) => ({
        ...prev,
        ministryId: value,
        ministryName: selectedMinistry?.ministryName || '',
      }));
      return;
    }

    if (name === 'occupation') {
      setFormData((prev) => ({
        ...prev,
        occupation: value,
        ...getOccupationFieldReset(),
      }));
      setReportCardFile(null);
      return;
    }

    if (name === 'address') {
      setAddressError('');
      setFormData((prev) => ({
        ...prev,
        address: value,
        fullAddress: value,
        latitude: null,
        longitude: null,
      }));
      return;
    }

    if (name === 'workAddress') {
      setFormData((prev) => ({
        ...prev,
        workAddress: value,
        workLatitude: null,
        workLongitude: null,
      }));
      return;
    }

    if (name === 'grade') {
      setFormData((prev) => {
        const next = { ...prev, grade: value };

        if (isSeniorSchoolGrade(value)) {
          if (!next.subjects?.length) {
            next.subjects = createEmptyMemberSubjects(1);
          }
        } else {
          next.subjects = [];
        }

        return next;
      });
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubjectChange = (index, value) => {
    setFormData((prev) => {
      const subjects = [...(prev.subjects || [])];
      subjects[index] = value;
      return { ...prev, subjects };
    });
  };

  const handleAddSubject = () => {
    setFormData((prev) => {
      if ((prev.subjects?.length || 0) >= MAX_MEMBER_SUBJECTS) return prev;
      return { ...prev, subjects: [...(prev.subjects || []), ''] };
    });
  };

  const handleRemoveSubject = (index) => {
    setFormData((prev) => ({
      ...prev,
      subjects: (prev.subjects || []).filter((_, subjectIndex) => subjectIndex !== index),
    }));
  };

  const handleReportCardChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setReportCardFile(file);
  };

  const handlePhotoSelect = (file) => {
    const validationMessage = validateMemberPhotoFile(file);
    if (validationMessage) {
      setPhotoError(validationMessage);
      setPhotoFile(null);
      return;
    }

    setPhotoError('');
    setPhotoFile(file);
    setRemovePhoto(false);
  };

  const handlePhotoRemove = () => {
    setPhotoFile(null);
    setRemovePhoto(true);
    setPhotoError('');
  };

  const rollbackUploadedMemberFiles = async (uploadedPaths = []) => {
    await Promise.all(
      uploadedPaths.map(async ({ type, path }) => {
        if (!path) return;

        try {
          if (type === 'photo') {
            await deleteMemberPhoto(path);
          } else if (type === 'reportCard') {
            await deleteMemberReportCard(path);
          }
        } catch (rollbackError) {
          console.warn('Failed to roll back uploaded member file:', rollbackError);
        }
      }),
    );
  };

  const handleHomeAddressSelect = ({ address, latitude, longitude }) => {
    setAddressError('');
    setFormData((prev) => ({
      ...prev,
      address,
      fullAddress: address,
      latitude,
      longitude,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('First name is required.');
      return;
    }

    if (!formData.surname.trim()) {
      setError('Last name is required.');
      return;
    }

    if (!formData.gender) {
      setError('Gender is required.');
      return;
    }

    if (!formData.dob) {
      setError('Date of birth is required.');
      return;
    }

    const validationMessage = validateMemberFormData(formData, {
      activeCreativeArtsTeams,
      activeMinistries,
      activeSchools: activeSchoolOptions,
    });

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setIsSubmitting(true);

    const uploadedPaths = [];

    try {
      const previousProfileImagePath =
        formData.profileImagePath
        || initialData?.profileImagePath
        || resolveMemberPhotoStoragePath(formData)
        || resolveMemberPhotoStoragePath(initialData)
        || '';
      const previousReportCardPath =
        formData.reportCardPath
        || initialData?.reportCardPath
        || resolveMemberReportCardStoragePath(formData)
        || resolveMemberReportCardStoragePath(initialData)
        || '';
      let photoUrl = formData.photo;
      let profileImagePath = formData.profileImagePath;
      let reportCardUrl = formData.reportCardUrl;
      let reportCardPath = formData.reportCardPath;

      if (removePhoto) {
        photoUrl = '';
        profileImagePath = '';
      } else if (photoFile) {
        const validationMessage = validateMemberPhotoFile(photoFile);
        if (validationMessage) {
          setPhotoError(validationMessage);
          return;
        }

        const uploadedPhoto = await uploadMemberPhoto(photoFile);
        photoUrl = uploadedPhoto.profileImageUrl;
        profileImagePath = uploadedPhoto.profileImagePath;
        uploadedPaths.push({ type: 'photo', path: profileImagePath });
      }

      if (reportCardFile) {
        const uploadedReportCard = await uploadMemberReportCard(reportCardFile);
        reportCardUrl = uploadedReportCard.reportCardUrl;
        reportCardPath = uploadedReportCard.reportCardPath;
        uploadedPaths.push({ type: 'reportCard', path: reportCardPath });
      }

      let submitData = {
        ...formData,
        photo: photoUrl,
        profileImagePath,
        reportCardUrl,
        reportCardPath,
        previousProfileImagePath:
          removePhoto || photoFile ? previousProfileImagePath : '',
        previousReportCardPath: reportCardFile ? previousReportCardPath : '',
      };

      const homeAddress = (
        submitData.address
        || submitData.fullAddress
        || ''
      ).trim();
      let latitude = normalizeMemberCoordinate(submitData.latitude);
      let longitude = normalizeMemberCoordinate(submitData.longitude);

      if (homeAddress && (latitude == null || longitude == null)) {
        try {
          const geocoded = await geocodeAddress(homeAddress);

          if (geocoded) {
            submitData = {
              ...submitData,
              address: geocoded.formattedAddress,
              fullAddress: geocoded.formattedAddress,
              latitude: geocoded.latitude,
              longitude: geocoded.longitude,
            };
          }
        } catch (geocodeError) {
          const message = getGeocodingErrorMessage(geocodeError)
            || 'Could not locate this address on the map. Choose a suggestion or refine the address.';
          setAddressError(message);
          setError(message);
          await rollbackUploadedMemberFiles(uploadedPaths);
          return;
        }
      }

      await onSubmit(submitData);
    } catch (submitError) {
      await rollbackUploadedMemberFiles(uploadedPaths);
      console.error('Error saving member:', submitError);
      setError(
        getStorageErrorMessage(submitError)
          || submitError?.message
          || 'Failed to save member. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const memberPreviewName = `${formData.name} ${formData.surname}`.trim() || 'Member';
  const existingPhotoUrl = !removePhoto && !photoFile ? formData.photo : '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Member' : 'Add Member'}
      icon={UserPlus}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <ImageUploadField
          label="Profile Picture"
          existingImageUrl={existingPhotoUrl}
          selectedFile={photoFile}
          onFileSelect={handlePhotoSelect}
          onRemove={handlePhotoRemove}
          accept={ACCEPTED_MEMBER_PHOTO_ACCEPT}
          maxSizeMB={5}
          disabled={isSubmitting}
          loading={isSubmitting}
          previewShape="circle"
          previewName={memberPreviewName}
          helperText="JPG, PNG, or WEBP up to 5 MB."
          error={photoError}
        />

        <div className="rounded-xl border border-slate-700/70 bg-slate-900/40 p-4 space-y-3">
          <CoreSectionHeading title="Core Information" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="First Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. John"
              required
            />
            <Input
              label="Last Name"
              name="surname"
              value={formData.surname}
              onChange={handleChange}
              placeholder="e.g. Doe"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              options={GENDER_OPTIONS}
              placeholder="Select Gender"
              required
            />
            <Input
              label="Date of Birth"
              name="dob"
              type="date"
              value={formData.dob}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="012 345 6789"
            />
            <Select
              label="Language"
              name="language"
              value={formData.language}
              onChange={handleChange}
              options={LANGUAGE_OPTIONS}
              placeholder="Select Language"
            />
          </div>

          <AddressInput
            label="Home Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            onAddressSelect={handleHomeAddressSelect}
            fieldError={addressError}
            showUnverifiedMessage={Boolean(formData.address?.trim())}
            latitude={formData.latitude}
            longitude={formData.longitude}
            placeholder="Street, city, province"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Country of Origin"
              name="countryOfOrigin"
              value={formData.countryOfOrigin}
              onChange={handleChange}
              options={COUNTRY_OPTIONS}
              placeholder="Select Country"
            />
            <Select
              label="Ethnicity"
              name="ethnicity"
              value={formData.ethnicity}
              onChange={handleChange}
              options={ETHNICITY_OPTIONS}
              placeholder="Select Ethnicity"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Date of Salvation"
              name="dateOfSalvation"
              type="date"
              value={formData.dateOfSalvation}
              onChange={handleChange}
            />
            <Select
              label="Church"
              name="church"
              value={formData.church}
              onChange={handleChange}
              options={CHURCH_OPTIONS}
              placeholder="Select Church"
              required
            />
          </div>

          {showCapeTownFields ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Branch"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                options={BRANCH_OPTIONS}
                placeholder="Select Branch"
              />
              <Input
                label="Zone Supervisor"
                name="zoneSupervisor"
                value={formData.zoneSupervisor}
                onChange={handleChange}
                placeholder="Zone supervisor name"
              />
            </div>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Cell Leader"
              name="cellLeader"
              value={formData.cellLeader}
              onChange={handleChange}
              placeholder="Cell leader name"
            />
            {!lockCreativeArtsDepartmentName ? (
              <Select
                label="Creative Arts"
                name="creativeArtsId"
                value={formData.creativeArtsId || MEMBERSHIP_NA}
                onChange={handleChange}
                options={creativeArtsOptions}
                placeholder="Select Creative Arts Group"
                required
              />
            ) : (
              <Input
                label="Creative Arts"
                name="creativeArtsName"
                value={formData.creativeArtsName || lockCreativeArtsDepartmentName}
                readOnly
                disabled
              />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Ministry"
              name="ministryId"
              value={formData.ministryId || MEMBERSHIP_NA}
              onChange={handleChange}
              options={ministryOptions}
              placeholder="Select Ministry"
              required
            />
            <Select
              label="Occupation"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              options={occupationOptions}
              placeholder="Select Occupation"
            />
          </div>
        </div>

        <MemberOccupationFields
          occupation={formData.occupation}
          formData={formData}
          primarySchools={schoolLists.primarySchools}
          highSchools={schoolLists.highSchools}
          universitySchools={schoolLists.universitySchools}
          collegeSchools={schoolLists.collegeSchools}
          legacyHigherEducationSchools={schoolLists.legacyHigherEducationSchools}
          onFieldChange={handleChange}
          onSchoolSelect={handleSchoolSelect}
          onSubjectChange={handleSubjectChange}
          onAddSubject={handleAddSubject}
          onRemoveSubject={handleRemoveSubject}
          onReportCardChange={handleReportCardChange}
        />

        <div className="rounded-xl border border-slate-700/70 bg-slate-900/40 p-4">
          <CoreSectionHeading title="Membership Status" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={MEMBER_FORM_STATUS_OPTIONS}
              placeholder="Select Status"
            />
          </div>
        </div>

        {error && <p className="text-rose-400 text-[11px]">{error}</p>}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
            {initialData ? 'Save Changes' : 'Add Member'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
