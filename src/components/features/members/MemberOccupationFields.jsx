import { Plus, Trash2 } from 'lucide-react';
import Input from '@/components/ui/Input';
import AddressInput from '@/components/ui/AddressInput';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import {
  ACCEPTED_REPORT_CARD_ACCEPT,
  MEMBER_GRADE_OPTIONS,
  QUALIFICATION_OPTIONS,
  STUDY_YEAR_OPTIONS,
  YEARS_AT_COMPANY_OPTIONS,
  WORKING_HIGHEST_EDUCATION_OPTIONS,
  UNEMPLOYED_EDUCATION_LEVEL_OPTIONS,
  MAX_MEMBER_SUBJECTS,
  isSeniorSchoolGrade,
  toSchoolSelectOptions,
} from '@/config/memberOptions';

function SectionHeading({ title }) {
  return (
    <div className="pt-1">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</h3>
    </div>
  );
}

function ReportCardUpload({ reportCardUrl, onChange }) {
  return (
    <div>
      <label className="block text-slate-400 mb-1 font-medium text-xs">Latest Report Card</label>
      <div className="rounded-lg border border-slate-700 bg-slate-900 p-3 space-y-2">
        {reportCardUrl ? (
          <p className="text-[11px] text-emerald-400">Report card uploaded</p>
        ) : (
          <p className="text-[11px] text-slate-500">No report card uploaded yet</p>
        )}
        <input
          type="file"
          accept={ACCEPTED_REPORT_CARD_ACCEPT}
          onChange={onChange}
          className="text-[11px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[11px] file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 file:cursor-pointer"
        />
        <p className="text-[10px] text-slate-500">JPG, PNG, WEBP, or PDF</p>
      </div>
    </div>
  );
}

export default function MemberOccupationFields({
  occupation,
  formData,
  primarySchools = [],
  highSchools = [],
  universitySchools = [],
  collegeSchools = [],
  legacyHigherEducationSchools = [],
  onFieldChange,
  onSchoolSelect,
  onSubjectChange,
  onAddSubject,
  onRemoveSubject,
  onReportCardChange,
}) {
  const isPrimarySchool = occupation === 'Primary School';
  const isHighSchool = occupation === 'High School';
  const isUniversity = occupation === 'University';
  const isCollege = occupation === 'College';
  const isLegacyHigherEducation = occupation === 'University / College';
  const isWorking = occupation === 'Working';
  const isUnemployed = occupation === 'Unemployed';
  const isSchoolOccupation = isPrimarySchool || isHighSchool;
  const showSeniorSubjects = isSchoolOccupation && isSeniorSchoolGrade(formData.grade);

  if (
    !isSchoolOccupation
    && !isUniversity
    && !isCollege
    && !isLegacyHigherEducation
    && !isWorking
    && !isUnemployed
  ) {
    return null;
  }

  const schoolOptions = isPrimarySchool
    ? toSchoolSelectOptions(primarySchools)
    : isHighSchool
      ? toSchoolSelectOptions(highSchools)
      : isUniversity
        ? toSchoolSelectOptions(universitySchools)
        : isCollege
          ? toSchoolSelectOptions(collegeSchools)
          : toSchoolSelectOptions(legacyHigherEducationSchools);

  return (
    <div className="rounded-xl border border-slate-700/70 bg-slate-900/40 p-4 space-y-3">
      <SectionHeading title="Occupation Details" />

      {isSchoolOccupation ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="School Name"
              name="schoolId"
              value={formData.schoolId}
              onChange={onSchoolSelect}
              options={schoolOptions}
              placeholder="Select School"
            />
            <Select
              label="Grade"
              name="grade"
              value={formData.grade}
              onChange={onFieldChange}
              options={MEMBER_GRADE_OPTIONS}
              placeholder="Select Grade"
            />
          </div>

          <Input
            label="Class"
            name="schoolClass"
            value={formData.schoolClass}
            onChange={onFieldChange}
            placeholder="e.g. 10A"
          />

          <ReportCardUpload reportCardUrl={formData.reportCardUrl} onChange={onReportCardChange} />

          {showSeniorSubjects ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-medium text-slate-300">Subjects</p>
                {(formData.subjects?.length || 0) < MAX_MEMBER_SUBJECTS ? (
                  <Button type="button" variant="secondary" icon={Plus} onClick={onAddSubject}>
                    Add Subject
                  </Button>
                ) : null}
              </div>

              <div className="space-y-2">
                {(formData.subjects || []).map((subject, index) => (
                  <div key={`subject-${index}`} className="flex items-end gap-2">
                    <Input
                      label={`Subject ${index + 1}`}
                      name={`subject-${index}`}
                      value={subject}
                      onChange={(event) => onSubjectChange(index, event.target.value)}
                      placeholder="e.g. Mathematics"
                      className="flex-1"
                    />
                    {(formData.subjects?.length || 0) > 1 ? (
                      <button
                        type="button"
                        onClick={() => onRemoveSubject(index)}
                        className="mb-0.5 inline-flex items-center justify-center w-9 h-9 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                        title="Remove subject"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      {isUniversity ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="University"
              name="schoolId"
              value={formData.schoolId}
              onChange={onSchoolSelect}
              options={schoolOptions}
              placeholder="Select University"
            />
            <Input
              label="Degree"
              name="degree"
              value={formData.degree}
              onChange={onFieldChange}
              placeholder="e.g. Bachelor of Commerce"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Qualification"
              name="qualification"
              value={formData.qualification}
              onChange={onFieldChange}
              options={QUALIFICATION_OPTIONS}
              placeholder="Select Qualification"
            />
            <Select
              label="Year"
              name="studyYear"
              value={formData.studyYear}
              onChange={onFieldChange}
              options={STUDY_YEAR_OPTIONS}
              placeholder="Select Year"
            />
          </div>
        </>
      ) : null}

      {isCollege ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="College"
              name="schoolId"
              value={formData.schoolId}
              onChange={onSchoolSelect}
              options={schoolOptions}
              placeholder="Select College"
            />
            <Input
              label="Course"
              name="course"
              value={formData.course}
              onChange={onFieldChange}
              placeholder="e.g. N6 Business Management"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Campus"
              name="campus"
              value={formData.campus}
              onChange={onFieldChange}
              placeholder="Campus name"
            />
            <Select
              label="Year"
              name="studyYear"
              value={formData.studyYear}
              onChange={onFieldChange}
              options={STUDY_YEAR_OPTIONS}
              placeholder="Select Year"
            />
          </div>
        </>
      ) : null}

      {isLegacyHigherEducation ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="University / College (Legacy)"
              name="schoolId"
              value={formData.schoolId}
              onChange={onSchoolSelect}
              options={schoolOptions}
              placeholder="Select Institution"
            />
            <Input
              label="Course"
              name="course"
              value={formData.course}
              onChange={onFieldChange}
              placeholder="e.g. BCom Accounting"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Degree"
              name="degree"
              value={formData.degree}
              onChange={onFieldChange}
              placeholder="Degree or qualification"
            />
            <Select
              label="Year"
              name="studyYear"
              value={formData.studyYear}
              onChange={onFieldChange}
              options={STUDY_YEAR_OPTIONS}
              placeholder="Select Year"
            />
          </div>
        </>
      ) : null}

      {isWorking ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Company Name"
              name="companyName"
              value={formData.companyName}
              onChange={onFieldChange}
              placeholder="Company name"
            />
            <Input
              label="Position"
              name="position"
              value={formData.position}
              onChange={onFieldChange}
              placeholder="Job title or role"
            />
          </div>

          <AddressInput
            label="Work Address"
            name="workAddress"
            value={formData.workAddress}
            onChange={onFieldChange}
            latitude={formData.workLatitude}
            longitude={formData.workLongitude}
            placeholder="Street, city, province"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Years at Company"
              name="yearsAtCompany"
              value={formData.yearsAtCompany}
              onChange={onFieldChange}
              options={YEARS_AT_COMPANY_OPTIONS}
              placeholder="Select Years"
            />
            <Select
              label="Highest Education Level"
              name="highestEducationLevel"
              value={formData.highestEducationLevel}
              onChange={onFieldChange}
              options={WORKING_HIGHEST_EDUCATION_OPTIONS}
              placeholder="Select Education Level"
            />
          </div>
        </>
      ) : null}

      {isUnemployed ? (
        <Select
          label="Education Level"
          name="educationLevel"
          value={formData.educationLevel}
          onChange={onFieldChange}
          options={UNEMPLOYED_EDUCATION_LEVEL_OPTIONS}
          placeholder="Select Education Level"
        />
      ) : null}
    </div>
  );
}
