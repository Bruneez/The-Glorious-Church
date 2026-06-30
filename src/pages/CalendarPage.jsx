import { useState } from 'react';
import { PlusCircle, Calendar as CalendarIcon, Trash2, Edit2 } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import EventForm from '@/components/features/calendar/EventForm';
import CalendarView from '@/components/features/calendar/CalendarView';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useEvents, createEvent, updateEvent, deleteEvent } from '@/services/calendarService';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import RoleGate from '@/components/auth/RoleGate';
import { formatDate, formatTime } from '@/utils/formatters';

export default function CalendarPage() {
  const { data: events = [], loading } = useEvents();
  const { canPerformAction } = useRoleAccess();
  
  const [selectedDate, setSelectedDate] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const filteredEvents = selectedDate
    ? events.filter(e => e.date === selectedDate)
    : events.slice(0, 5);

  const handleAddEvent = () => {
    setEditingEvent(null);
    if (selectedDate) {
      setEditingEvent({ date: selectedDate });
    }
    setIsFormOpen(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingEvent?.id) {
        await updateEvent(editingEvent.id, formData);
      } else {
        await createEvent(formData);
      }
      setIsFormOpen(false);
      setEditingEvent(null);
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event. Please try again.');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await deleteEvent(eventId);
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    }
  };

  const canManageEvents = canPerformAction('MANAGE_EVENTS');

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Congregation Calendar Hub"
        badge="Upcoming Schedule"
        action={
          canManageEvents ? (
            <Button icon={PlusCircle} onClick={handleAddEvent}>
              Add Event
            </Button>
          ) : null
        }
      />

      <main className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <CalendarView
            events={events}
            onDateClick={setSelectedDate}
            selectedDate={selectedDate}
          />
        </div>

        <div className="space-y-4">
          <Card>
            <div className="p-4 border-b border-slate-700/70 bg-slate-800/40 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">
                {selectedDate ? formatDate(selectedDate) : 'Upcoming Events'}
              </h3>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-slate-500 text-xs">
                  {selectedDate ? 'No events on this date' : 'No upcoming events'}
                </p>
                {canManageEvents && (
                  <Button icon={PlusCircle} onClick={handleAddEvent} className="mt-4" size="sm">
                    Add Event
                  </Button>
                )}
              </div>
            ) : (
              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {filteredEvents.map(event => (
                  <div
                    key={event.id}
                    className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50 hover:border-indigo-500/30 transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-white truncate">{event.title}</h4>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                          <span>{formatDate(event.date)}</span>
                          {event.time && <span>• {formatTime(event.time)}</span>}
                        </div>
                        {event.location && (
                          <p className="text-[10px] text-slate-500 mt-0.5 truncate">{event.location}</p>
                        )}
                      </div>
                      {canManageEvents && (
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => handleEditEvent(event)}
                            className="text-indigo-400 hover:text-indigo-300 p-1 rounded hover:bg-indigo-500/10 transition"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-500/10 transition"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {selectedDate && (
            <Button
              variant="secondary"
              onClick={() => setSelectedDate(null)}
              className="w-full"
            >
              Show All Events
            </Button>
          )}
        </div>
      </main>

      {/* Mobile Add Button */}
      <div className="md:hidden fixed bottom-4 right-4 z-40">
        <RoleGate allowedAction="MANAGE_EVENTS">
          <button
            onClick={handleAddEvent}
            className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-full shadow-lg"
          >
            <PlusCircle className="w-6 h-6" />
          </button>
        </RoleGate>
      </div>

      <EventForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingEvent(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingEvent}
      />
    </div>
  );
}
