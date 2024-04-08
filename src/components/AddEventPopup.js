import React, { useState, useEffect, useCallback } from 'react';
import './AddEventPopup.css';
import { useCalendar, eventDateToOffsetString } from '../contexts/CalendarContext';
import { useView } from '../contexts/ViewContext';
import * as chrono from 'chrono-node';
import { useSocket } from '../components/Navigation/socket';

let recognition;
let isCapturing = false;

const AddEventPopup = ({ closePopup, editingEvent = null }) => {
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const { addEvent, editEvent } = useCalendar();
  const { isPopupOpen, setIsPopupOpen } = useView();
  const socket = useSocket();

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
      addEvent({ ...event });
    }
    closePopup();
  }, [eventName, eventDate, isPopupOpen, editingEvent, addEvent, editEvent, closePopup]);

  const handleSubmitClick = (e) => {
    e.preventDefault();
    handleSubmit();
  }

  useEffect(() => {
    // Listening to "Confirm" and "Delete" buttonId events
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


  useEffect(() => {
    const startVoiceCapture = (callback, isDate = false) => {
      if (isCapturing) return; // If already capturing, don't start again
      console.log("Starting voice capture...");
      isCapturing = true;

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.continuous = false; // Adjust based on desired behavior
      recognition.lang = 'en-US';
      recognition.start();

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        console.log("Recognized speech:", transcript); // Logging the recognized speech

        if (isDate) {
          const parsedDate = chrono.parseDate(transcript);
          if (parsedDate) {
            const year = parsedDate.getFullYear();
            const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0'); // JS months are 0-indexed
            const day = parsedDate.getDate().toString().padStart(2, '0');

            // Format time based on the local time of the parsed date
            const hours = parsedDate.getHours().toString().padStart(2, '0');
            const minutes = parsedDate.getMinutes().toString().padStart(2, '0');

            // Formatted date string in 'YYYY-MM-DDTHH:MM' format using local time components
            const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;

            callback(formattedDate);
            console.log("Parsed and formatted date (local):", formattedDate);
          }
        } else {
          callback(transcript);
        }
      };

      recognition.onend = () => {
        isCapturing = false; // Reset capturing flag when recognition ends

        console.log("Stopping voice capture.");
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        isCapturing = false; // Ensure to reset flag on error as well
      };
    };

    const handleKeyDown = (event) => {
      if (event.key === 'F1' || event.key === 'F2') {
        event.preventDefault(); // Prevent default function key actions
        const isDate = event.key === 'F2';
        startVoiceCapture(isDate ? setEventDate : setEventName, isDate);
      }
    };

    const handleKeyUp = (event) => {
      if (event.key === 'F1' || event.key === 'F2') {
        if (recognition && isCapturing) {
          recognition.stop();
          isCapturing = false; // Ensure flag is reset when key is released
        }
      }
    };

    // Attach event listeners
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

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
