import React, { useEffect, useState } from 'react';
import { isToday } from 'date-fns';
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


  const dayNumberStyle = isToday(day) ? { color: 'red' } : {};

  return (
    <div className={dayClassName}>
      <span className="day-number" style={dayNumberStyle}>{day.getDate()}</span>
      <div className="events">
        {dayEvents.map((event, index) => (
          <span key={index} className="event-indicator" style={{ backgroundColor: event.color }}
                onClick={() => onEventClick(event)}></span>
        ))}
      </div>
    </div>
  );
};

export default DayCell;