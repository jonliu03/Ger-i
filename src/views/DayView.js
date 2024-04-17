import React, { useEffect, useState } from 'react';
import { useCalendar, eventDateToOffsetString } from '../contexts/CalendarContext';
import { format, isBefore, isAfter, startOfWeek, endOfWeek, addDays, startOfMonth, endOfMonth, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import AddEventPopup from '../components/AddEventPopup';
import { useView } from '../contexts/ViewContext';
import { useKeyboardNavigation } from '../components/Navigation/useKeyboardNavigation';

const DayView = () => {
  const { selectedDay, setSelectedDay, events, setEditingEvent, editingEvent } = useCalendar();
  const { isPopupOpen, setIsPopupOpen } = useView();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const dayEvents = events.filter((event) => isSameDay(event.date, selectedDay));

  const isSelected = (event) => isSameDay(event.date, selectedDay);

  const convertTo12HourFormat = (timeString) => {
    // Extract hours and minutes from the time string
    const [hours, minutes] = timeString.split(':').map(Number);

    // Determine the AM/PM suffix
    const period = hours >= 12 ? 'PM' : 'AM';

    // Convert hour from 24-hour to 12-hour format
    const twelveHour = hours % 12 || 12;  // Converts '0' hours to '12'

    // Format the hour and minute to ensure two digits
    const formattedHour = twelveHour.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');

    // Combine into a final formatted string
    return `${formattedHour}:${formattedMinutes} ${period}`;
  };


  const handleEventClick = (event, index) => {
    setEditingEvent(event);
    setIsPopupOpen(true);
    setSelectedIndex(index);
  };

  useEffect(() => {
    console.log(selectedDay);

    const handleKeyDown = (event) => {
      switch (event.key) {
        case "ArrowUp":
          if (selectedIndex > 0) {
            setSelectedIndex(selectedIndex - 1);
          }
          break;
        case "ArrowDown":
          if (selectedIndex < dayEvents.length - 1) {
            setSelectedIndex(selectedIndex + 1);
          }
          break;
        case "Enter":
          if (selectedIndex !== -1) {
            setEditingEvent(dayEvents[selectedIndex]);
            setIsPopupOpen(true);
          }
          break;
        default:
          break;
      }
      console.log(selectedIndex);
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Remove event listener on cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedIndex, setSelectedIndex, dayEvents, setEditingEvent, setIsPopupOpen]);

  return (
    <div className="calendar-view">
      <div className="header">
        <div className="title">Events for {selectedDay.toLocaleDateString()}</div>
      </div>
      {dayEvents.length > 0 ? (
        dayEvents.map((event, index) => (
          <div key={event.id} onClick={() => handleEventClick(event, index)}
            className={`event-item ${index === selectedIndex ? 'selected' : ''}`}>
            <span className="event-time">{convertTo12HourFormat(event.time)}</span> <span className="event-name">{event.name}</span>
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
