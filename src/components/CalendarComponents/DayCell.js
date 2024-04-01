import React from 'react';
import { useCalendar } from '../../CalendarContext';
import './DayCell.css'; 

// Ensure isSelected is passed as a prop to DayCell
const DayCell = ({ day, isCurrentMonth, isSelected }) => {
  const { events } = useCalendar();
  const dayEvents = events.filter(event => event.date === day.toISOString().split('T')[0]);
  
  // Updated className to incorporate isSelected and isCurrentMonth
  const dayClassName = `day-cell ${isSelected ? 'selected' : ''} ${!isCurrentMonth ? 'not-current-month' : ''}`;

  return (
    <div className={dayClassName}>
      <span className="day-number">
        {day.getDate()}
      </span>
      <div className="events">
        {dayEvents.map((event, index) => (
          <div key={index} className="event">
            {event.title} {/* Displaying event title, ensure other event details are handled as needed */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DayCell;
