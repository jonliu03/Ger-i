import React, { useEffect, useState } from 'react';
import './DayCell.css';

const darkenColor = (color) => {
  // Extract the H, S, and L values
  const [h, s, l] = color.match(/\d+/g).map(Number);
  // Decrease lightness by 20% to darken, ensuring it doesn't go below 0
  const newL = Math.max(l - 20, 0);
  // Reconstruct the HSL color string with the new lightness value
  return `hsl(${h}, ${s}%, ${newL}%)`;
};

const formatTimeToAmPm = (time24) => {
  const [hours, minutes] = time24.split(':');
  const hoursInt = parseInt(hours, 10);
  const suffix = hoursInt >= 12 ? "PM" : "AM";
  const hours12 = ((hoursInt + 11) % 12 + 1); // Convert to 12-hour time
  return `${hours12}:${minutes} ${suffix}`;
};

const DayCell = ({ day, dayEvents, isCurrentMonth, isSelected, onEventClick }) => {
  const dayClassName = `day-cell ${isSelected ? 'selected' : ''} ${!isCurrentMonth ? 'not-current-month' : ''}`;
  const [hoveredEvent, setHoveredEvent] = useState(null);

  return (
    <div className={dayClassName}>
      <span className="day-number">{day.getDate()}</span>
      <div className="events">
        {dayEvents.map((event, index) => (
          <div key={index} className="event"
            style={{ backgroundColor: hoveredEvent === index ? darkenColor(event.color) : event.color, color: '#ffffff' }}
            onMouseEnter={() => setHoveredEvent(index)}
            onMouseLeave={() => setHoveredEvent(null)}
            onClick={() => onEventClick(event)}>
            <span className="event-time">{formatTimeToAmPm(event.time)}</span> <span className="event-name">{event.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DayCell;