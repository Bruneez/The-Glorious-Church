import { useState } from 'react';
import { CalendarPlus, X } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

const EVENT_TYPE_OPTIONS = [
  { value: 'Service', label: 'Service' },
  { value: 'Meeting', label: 'Meeting' },
  { value: 'Event', label: 'Event' },
  { value: 'Conference', label: 'Conference' },
  { value: 'Outreach', label: 'Outreach' }
];

export default function EventForm({ isOpen, onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    date: initialData?.date || '',
    time: initialData?.time || '',
    type: initialData?.type || 'Event',
    location: initialData?.location || '',
    description: initialData?.description || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      time: formData.time?.trim() || '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Event' : 'Add Event'} icon={CalendarPlus}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          label="Event Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. Sunday Service"
          required
        />

        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
          <Input
            label="Time"
            name="time"
            type="time"
            value={formData.time}
            onChange={handleChange}
          />
        </div>

        <Select
          label="Event Type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          options={EVENT_TYPE_OPTIONS}
        />

        <Input
          label="Location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="e.g. Main Sanctuary"
        />

        <div>
          <label className="block text-slate-400 mb-1 text-xs">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="Event details..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500 resize-none text-xs"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-700">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Save Event
          </Button>
        </div>
      </form>
    </Modal>
  );
}
