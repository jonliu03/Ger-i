import React from 'react';
import './CalendarViews.css';
import { useCalendar } from '../contexts/CalendarContext';

function formatDateTime(dateTimeString) {
  const dateTime = new Date(dateTimeString);
  const options = { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true };
  return dateTime.toLocaleString('en-US', options);
}

function CommunityEvents() {
  const { events } = useCalendar();

  // Sort events by date and time in ascending order
  const sortedEvents = events.sort((a, b) => {
    const dateTimeA = new Date(a.date + 'T' + a.time);
    const dateTimeB = new Date(b.date + 'T' + b.time);
    return dateTimeA - dateTimeB;
  });

  return (
    <div className="calendar-view">
      <div className="header">
        <div className="title">Community Events</div>
      </div>
      <div className="body">
        <div className="event-list">
          {sortedEvents.length ? (
            sortedEvents.map(event => (
              <div key={event.id} className="event-item">
                <div className="event-time">{formatDateTime(event.date + 'T' + event.time)}</div>
                <div className="event-details">
                  <div className="event-name">{event.name}</div>
                  <div className="event-description">{event.description}</div>
                  {/* Add more details as needed */}
                </div>
              </div>
            ))
          ) : (
            <div className="no-events-message">No events scheduled</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CommunityEvents;
