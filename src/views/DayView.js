import React from 'react';
import { useCalendar, eventDateToOffsetString } from '../contexts/CalendarContext';
import { format, isBefore, isAfter, startOfWeek, endOfWeek, addDays, startOfMonth, endOfMonth, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import AddEventPopup from '../components/AddEventPopup';
import { useView } from '../contexts/ViewContext';
import { useKeyboardNavigation } from '../components/Navigation/useKeyboardNavigation';

const DayView = () => {
  const { selectedDay, setSelectedDay, events, setEditingEvent, editingEvent } = useCalendar();
  const { isPopupOpen, setIsPopupOpen } = useView();

  const dayEvents = events.filter((event) => new Date(eventDateToOffsetString(event.date)).toDateString() === selectedDay.toDateString());
  const isSelected = (event) => selectedDay.toDateString() === new Date(event.date).toDateString();

  const handleEventClick = (event) => {
    setEditingEvent(event);
    setIsPopupOpen(true);
  };

  useKeyboardNavigation(() => {
    const dayEvent = events.find(event => isSameDay(new Date(event.date), selectedDay));
    if (dayEvent) {
      setEditingEvent(dayEvent);
    } else {
      setEditingEvent({ date: selectedDay, name: '', time: '' }); // Adjust as needed
    }
    setIsPopupOpen(true);
  });

  return (
    <div className="calendar-view">
      <div className="header">
        <div className="title">Events for {selectedDay.toLocaleDateString()}</div>
      </div>
      {dayEvents.length > 0 ? (
        dayEvents.map((event) => (
          <div key={event.id} onClick={() => handleEventClick(event)} className={`event-item ${isSelected(event) ? 'selected-day' : ''}`}>
            <span className="event-time">{event.time}</span> <span className="event-name">{event.name}</span>
          </div>
        ))
      ) : (
        <p>No events for today!</p>
      )}
      {isPopupOpen && <AddEventPopup closePopup={() => setIsPopupOpen(false)} editingEvent={editingEvent} />}
    </div>
  );
};

export default DayView;
