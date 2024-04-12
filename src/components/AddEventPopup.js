import React, { useState, useEffect, useCallback, useRef } from 'react';
import './AddEventPopup.css';
import { useCalendar, eventDateToOffsetString } from '../contexts/CalendarContext';
import { useView } from '../contexts/ViewContext';

const AddEventPopup = ({ closePopup, editingEvent = null }) => {
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [speechSocket, setSpeechSocket] = useState(new WebSocket('ws://localhost:3000/speech'));
  const { addEvent, editEvent } = useCalendar();
  const { isPopupOpen, setIsPopupOpen } = useView();

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

  const startRecording = useCallback(() => {
    console.log("Starting recording...");
    speechSocket.send('start');
    
  }, [speechSocket]);

  useEffect(() => {
    speechSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Recognition Result:', data.text);
      setEventName(capitalizeWords(data.text));
    };
  }, [speechSocket]);

  const stopRecording = useCallback(() => {

    console.log("Stopping recording.");
    speechSocket.send('stop');
  }, [speechSocket]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'F1' && !isCapturing) {
        setIsCapturing(true);
        event.preventDefault();
        startRecording();
      }
    };

    const handleKeyUp = (event) => {
      if (event.key === 'F1' && isCapturing) {
        setIsCapturing(false);
        event.preventDefault();
        stopRecording();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [startRecording, isCapturing, stopRecording]);


  const capitalizeWords = (text) => text.replace(/\b(\w)/g, s => s.toUpperCase());



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
      addEvent({ ...event });
    }
    closePopup();
  }, [eventName, eventDate, isPopupOpen, editingEvent, addEvent, editEvent, closePopup]);

  const handleSubmitClick = (e) => {
    e.preventDefault();
    handleSubmit();
  }

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
