import { useState, useMemo } from 'react';
import EventForm from '@/components/features/calendar/EventForm';
import CalendarView from '@/components/features/calendar/CalendarView';
import UpcomingEventsPanel from '@/components/features/calendar/UpcomingEventsPanel';
import { useEvents, createEvent, updateEvent, deleteEvent } from '@/services/calendarService';
import { useMembers } from '@/services/membersService';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/utils/formatters';
import {
  canCreateCalendarEvent,
  canManageCalendarEvent,
} from '@/config/permissions';
import {
  getBirthdayEventsForDate,
  getUpcomingBirthdayEvents,
  mergeCalendarEvents,
} from '@/utils/birthdayEvents';
import {
  eventOccursOnDate,
  normalizeEventSpan,
  sortCalendarEventsChronologically,
} from '@/utils/calendarEventLayout';

const UPCOMING_EVENT_LIMIT = 9;

export default function CalendarPage() {
  const { data: events = [], loading: eventsLoading } = useEvents();
  const { data: members = [], loading: membersLoading } = useMembers();
  const { canPerformAction, role } = useRoleAccess();
  const { staffDocId, staffProfile, firebaseUser } = useAuth();

  const [selectedDate, setSelectedDate] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const loading = eventsLoading || membersLoading;

  const currentUserId = staffDocId || firebaseUser?.uid || '';
  const currentUserName =
    staffProfile?.fullName ||
    staffProfile?.name ||
    firebaseUser?.displayName ||
    firebaseUser?.email ||
    'Staff Member';

  const canCreateEvents = canCreateCalendarEvent(role);
  const canManageEvent = (event) => canManageCalendarEvent(role, event, currentUserId);

  const scheduleEvents = useMemo(() => {
    if (selectedDate) {
      const birthdayEvents = getBirthdayEventsForDate(members, selectedDate);
      return sortCalendarEventsChronologically(
        mergeCalendarEvents(
          events.filter((event) => eventOccursOnDate(event, selectedDate)),
          birthdayEvents,
        ),
      );
    }

    const today = new Date().toISOString().split('T')[0];
    const upcomingEvents = events.filter((event) => normalizeEventSpan(event).endDate >= today);
    const upcomingBirthdays = getUpcomingBirthdayEvents(members, UPCOMING_EVENT_LIMIT);

    return sortCalendarEventsChronologically(
      mergeCalendarEvents(upcomingEvents, upcomingBirthdays),
    ).slice(0, UPCOMING_EVENT_LIMIT);
  }, [events, members, selectedDate]);

  const scheduleTitle = selectedDate ? formatDate(selectedDate) : 'Upcoming Events';

  const handleAddEvent = () => {
    if (!canCreateEvents) return;

    setEditingEvent(null);
    if (selectedDate) {
      setEditingEvent({ date: selectedDate });
    }
    setIsFormOpen(true);
  };

  const handleEditEvent = (event) => {
    if (event?.isBirthday || event?.isReadOnly) return;
    if (!canManageEvent(event)) return;

    setEditingEvent(event);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingEvent?.id) {
        await updateEvent(editingEvent.id, formData, { role, userId: currentUserId });
      } else {
        await createEvent(formData, {
          createdBy: currentUserId,
          createdByName: currentUserName,
        });
      }
      setIsFormOpen(false);
      setEditingEvent(null);
    } catch (error) {
      console.error('Error saving event:', error);
      alert(error.message || 'Failed to save event. Please try again.');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (String(eventId).startsWith('birthday-')) return;

    const event = events.find((item) => item.id === eventId);
    if (!canManageEvent(event)) return;

    try {
      await deleteEvent(eventId, { role, userId: currentUserId });
    } catch (error) {
      console.error('Error deleting event:', error);
      alert(error.message || 'Failed to delete event. Please try again.');
    }
  };

  const canManageAllEvents = canPerformAction('MANAGE_EVENTS');

  return (
    <div className="page-root">
      <div>
        <h1 className="text-xl font-bold text-white tracking-wide">Calendar</h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage church events, birthdays and activities.
        </p>
      </div>

      <CalendarView
        events={events}
        members={members}
        onDateClick={setSelectedDate}
        selectedDate={selectedDate}
        onAddEvent={canCreateEvents ? handleAddEvent : undefined}
        canAddEvent={canCreateEvents}
      />

      <UpcomingEventsPanel
          events={scheduleEvents}
          loading={loading}
          title={scheduleTitle}
          selectedDate={selectedDate}
          canManageEvent={canManageAllEvents ? () => true : canManageEvent}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
          onClearSelection={() => setSelectedDate(null)}
      />

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
