import { Search } from 'lucide-react';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import {
  buildAssigneeFilterOptions,
  DUE_DATE_FILTER_OPTIONS,
  PRIORITY_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
} from '@/config/tasksOptions';

export default function TaskFilters({
  searchTerm,
  onSearchChange,
  assignedUserId,
  onAssignedUserChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  dueDate,
  onDueDateChange,
  staff = [],
  showAssigneeFilter = true,
}) {
  const assigneeOptions = buildAssigneeFilterOptions(staff);
  const isExactDueDate = /^\d{4}-\d{2}-\d{2}$/.test(dueDate);
  const dueDateSelectValue = isExactDueDate ? 'all' : dueDate;

  const handleDueDateSelectChange = (event) => {
    onDueDateChange(event.target.value);
  };

  const handleExactDueDateChange = (event) => {
    onDueDateChange(event.target.value || 'all');
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700/70 p-4">
      <div className="flex flex-col gap-3">
        <div className="w-full">
          <label htmlFor="tasks-search" className="block text-slate-400 mb-1 font-medium text-xs">
            Search
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              id="tasks-search"
              type="text"
              placeholder="Search by task title or user name..."
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 pl-10 pr-3 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-2 ${showAssigneeFilter ? 'xl:grid-cols-4' : 'xl:grid-cols-3'} gap-3`}>
          {showAssigneeFilter ? (
            <Select
              label="Assigned User"
              name="assignedUserFilter"
              value={assignedUserId}
              onChange={(event) => onAssignedUserChange(event.target.value)}
              options={assigneeOptions}
              className="mb-0"
            />
          ) : null}

          <Select
            label="Status"
            name="statusFilter"
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
            options={STATUS_FILTER_OPTIONS}
            className="mb-0"
          />

          <Select
            label="Priority"
            name="priorityFilter"
            value={priority}
            onChange={(event) => onPriorityChange(event.target.value)}
            options={PRIORITY_FILTER_OPTIONS}
            className="mb-0"
          />

          <Select
            label="Due Date"
            name="dueDateFilter"
            value={dueDateSelectValue}
            onChange={handleDueDateSelectChange}
            options={DUE_DATE_FILTER_OPTIONS}
            className="mb-0"
          />
        </div>

        <div className="w-full sm:max-w-xs">
          <Input
            label="Exact Due Date"
            name="exactDueDate"
            type="date"
            value={isExactDueDate ? dueDate : ''}
            onChange={handleExactDueDateChange}
            className="mb-0"
          />
        </div>
      </div>
    </div>
  );
}
