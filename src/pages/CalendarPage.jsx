import { useState, useMemo } from 'react';
import { PlusCircle, Calendar as CalendarIcon, Trash2, Edit2 } from 'lucide-react';
import EventForm from '@/components/features/calendar/EventForm';
import CalendarView from '@/components/features/calendar/CalendarView';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import UserAvatar from '@/components/ui/UserAvatar';
import { useEvents, createEvent, updateEvent, deleteEvent } from '@/services/calendarService';
import { useMembers } from '@/services/membersService';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { formatDate, formatTime } from '@/utils/formatters';
import {
  getBirthdayEventsForDate,
  getUpcomingBirthdayEvents,
  mergeCalendarEvents,
} from '@/utils/birthdayEvents';

function EventTypeBadge({ type, isBirthday }) {
  if (isBirthday) {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-pink-950/60 text-pink-400 border border-pink-500/20">
        {type}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-indigo-950/60 text-indigo-400 border border-indigo-500/20">
      {type || 'Event'}
    </span>
  );
}

export default function CalendarPage() {
  const { data: events = [], loading: eventsLoading } = useEvents();
  const { data: members = [], loading: membersLoading } = useMembers();
  const { canPerformAction } = useRoleAccess();
  
  const [selectedDate, setSelectedDate] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const loading = eventsLoading || membersLoading;

  const filteredEvents = useMemo(() => {
    if (selectedDate) {
      const birthdayEvents = getBirthdayEventsForDate(members, selectedDate);
      return mergeCalendarEvents(
        events.filter((event) => event.date === selectedDate),
        birthdayEvents,
      );
    }

    const today = new Date().toISOString().split('T')[0];
    const upcomingEvents = events.filter((event) => event.date >= today);
    const upcomingBirthdays = getUpcomingBirthdayEvents(members, 10);

    return mergeCalendarEvents(upcomingEvents, upcomingBirthdays).slice(0, 5);
  }, [events, members, selectedDate]);

  const handleAddEvent = () => {
    setEditingEvent(null);
    if (selectedDate) {
      setEditingEvent({ date: selectedDate });
    }
    setIsFormOpen(true);
  };

  const handleEditEvent = (event) => {
    if (event?.isBirthday || event?.isReadOnly) return;
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
    if (String(eventId).startsWith('birthday-')) return;

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
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">Calendar</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage church events, birthdays and activities.
          </p>
        </div>
        {canManageEvents && (
          <Button icon={PlusCircle} onClick={handleAddEvent} className="shrink-0 w-full sm:w-auto">
            Add Event
          </Button>
        )}
      </div>

      <main className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <CalendarView
            events={events}
            members={members}
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
              </div>
            ) : (
              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {filteredEvents.map(event => (
                  <div
                    key={event.id}
                    className={`rounded-lg p-3 border transition ${
                      event.isBirthday
                        ? 'bg-pink-950/20 border-pink-500/20 hover:border-pink-500/40'
                        : 'bg-slate-900/50 border-slate-700/50 hover:border-indigo-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {event.isBirthday ? (
                            <UserAvatar
                              name={event.memberName || event.title}
                              photo={event.photo}
                              size="sm"
                            />
                          ) : null}
                          <h4 className="text-sm font-semibold text-white truncate">{event.title}</h4>
                          <EventTypeBadge type={event.type} isBirthday={event.isBirthday} />
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                          <span>{formatDate(event.date)}</span>
                          {event.time ? (
                            <span>• {formatTime(event.time)}</span>
                          ) : (
                            !event.isBirthday && <span>• All Day</span>
                          )}
                          {event.isBirthday && event.repeatsYearly ? (
                            <span>• Repeats yearly</span>
                          ) : null}
                        </div>
                        {event.isBirthday ? (
                          <div className="mt-2 space-y-0.5 text-[10px] text-slate-400">
                            {event.dateOfBirth ? (
                              <p>Date of Birth: {formatDate(event.dateOfBirth)}</p>
                            ) : null}
                            {event.ageTurning != null ? (
                              <p>Turning {event.ageTurning} this year</p>
                            ) : null}
                            {event.branch ? <p>Branch: {event.branch}</p> : null}
                            <p className="text-pink-400/80">Edit the member record to change this birthday.</p>
                          </div>
                        ) : null}
                        {event.location && (
                          <p className="text-[10px] text-slate-500 mt-0.5 truncate">{event.location}</p>
                        )}
                      </div>
                      {canManageEvents && !event.isBirthday && (
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
