import React, { useState, useEffect, useCallback } from 'react';
import './AddEventPopup.css';
import { useCalendar } from '../contexts/CalendarContext';

import { useSocket } from '../components/Navigation/socket';

const AddEventPopup = ({ closePopup, editingEvent = null }) => {
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const { addEvent, editEvent } = useCalendar();

  useEffect(() => {
    // Pre-populate form if editing an event
    if (editingEvent) {
      // Use editingEvent's date and time directly for datetime-local input
      // Assuming editingEvent.date and editingEvent.time are properly formatted
      const localDateTime = `${editingEvent.date}T${editingEvent.time}`;
      setEventName(editingEvent.name);
      setEventDate(localDateTime); // This sets both date and time in the input
    }
  }, [editingEvent]);

  const handleSubmit = useCallback(() => {
    
    // Since we're using datetime-local, eventDate includes both date and time
    // No need to split date and time for this use case

    // Prepare event object for adding or editing
    const event = {
      ...editingEvent, // Spread existing event properties to retain id (if editing)
      name: eventName,
      date: eventDate.split('T')[0], // Extract just the date part
      time: eventDate.split('T')[1], // Extract just the time part
    };

    // Determine whether to add a new event or edit an existing one
    if (editingEvent) {
      editEvent(event);
    } else {
      // For new events, don't include an id
      addEvent({ ...event}); 
    }
    closePopup();
  }, [eventName, eventDate, editingEvent, addEvent, editEvent, closePopup]);

  const handleSubmitClick = (e) => {
    e.preventDefault();
    handleSubmit();
  }

  useSocket(() => handleSubmit());

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>{editingEvent ? 'Edit Event' : 'Add New Event'}</h2>
        <form onSubmit={handleSubmitClick}>
          <input 
            type="text"
            placeholder="Event Name"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            required
          />
          <input 
            type="datetime-local"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
          />
          <div className="buttons">
            <button type="submit">{editingEvent ? 'Update Event' : 'Save Event'}</button>
            <button type="button" onClick={closePopup}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEventPopup;
