import React from 'react';
import { useCalendar, eventDateToOffsetString } from '../contexts/CalendarContext';
import AddEventPopup from '../components/AddEventPopup';

const DayView = () => {
  const { selectedDay, events, setEditingEvent, setIsPopupOpen, isPopupOpen, editingEvent } = useCalendar();
  const dayEvents = events.filter((event) => new Date(eventDateToOffsetString(event.date)).toDateString() === selectedDay.toDateString());

  const handleEventClick = (event) => {
    setEditingEvent(event);
    setIsPopupOpen(true);
  };

  return (
    <div className="calendar-view">
      <div className="header">
        <div className="title">Events for {selectedDay.toLocaleDateString()}</div>
      </div>
      {dayEvents.length > 0 ? (
        dayEvents.map((event) => (
          <div key={event.id} onClick={() => handleEventClick(event)} className="event-item">
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
