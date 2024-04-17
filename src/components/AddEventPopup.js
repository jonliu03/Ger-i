import React, { useState, useEffect, useCallback, useRef } from 'react';
import './AddEventPopup.css';
import { useCalendar, eventDateToOffsetString } from '../contexts/CalendarContext';
import { useView } from '../contexts/ViewContext';
import { useSocket } from '../components/Navigation/socket';

const AddEventPopup = ({ closePopup, editingEvent = null }) => {
  const [eventName, setEventName] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [speechSocket, setSpeechSocket] = useState(new WebSocket('ws://localhost:3000/speech'));
  const { selectedDay, setSelectedDay, events} = useCalendar();
  const { addEvent, editEvent } = useCalendar();
  const { isPopupOpen, setIsPopupOpen } = useView();
  const socket = useSocket();

  useEffect(() => {
    // Pre-populate form if editing an event
    if (editingEvent) {
      // Use editingEvent's date and time directly for datetime-local input
      // Assuming editingEvent.date and editingEvent.time are properly formatted
      setEventName(editingEvent.name);
      setEventTime(editingEvent.time); // This sets both date and time in the input
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

  useEffect(() => {
    const handleConfirmDelete = (buttonId) => {
      switch (buttonId) {
        case "Confirm":
          handleSubmit();
          break;
        case "DElete":
          closePopup();
          break;
        default:
          break;
      }
    };

    if (socket) {
      socket.on('buttonPress', handleConfirmDelete);
    }

    return () => {
      if (socket) {
        socket.off('buttonPress', handleConfirmDelete);
      }
    };
  }, [socket, handleSubmit, closePopup]);

  
  const handleSubmit = useCallback(() => {
    const event = {
      ...editingEvent,
      name: eventName,
      date: selectedDay, // Using selectedDay for the date
      time: eventTime, // Use state time
    };
    if (editingEvent) {
      editEvent(event);
    } else {
      addEvent(event);
    }
    closePopup();
  }, [eventName, eventTime, selectedDay, editingEvent, addEvent, editEvent, closePopup]);

  const handleSubmitClick = (e) => {
    console.log(selectedDay)
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
            type="time"
            value={eventTime}
            onChange={(e) => setEventTime(e.target.value)}
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
