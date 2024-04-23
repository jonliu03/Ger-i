import React, { useState, useEffect, useCallback, useRef } from 'react';
import './AddEventPopup.css';
import { useCalendar, eventDateToOffsetString } from '../contexts/CalendarContext';
import { useView } from '../contexts/ViewContext';
import { useSocket } from '../components/Navigation/socket';

const AddEventPopup = ({ closePopup, editingEvent = null }) => {
  const [eventName, setEventName] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [lastPressed, setLastPressed] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [speechSocket, setSpeechSocket] = useState(new WebSocket('ws://localhost:3003'));
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

  const formatTimeForInput = (timeStr) => {
    // Regular expression to match the time format "HH:MM AM/PM"
    const trimmedTime = timeStr.trim();
    
    // Extract the time and period (AM/PM)
    const [timePart, period] = trimmedTime.split(' ');
    
    // Split the time into hours and minutes
    let [hours, minutes] = timePart.split(':');
    hours = parseInt(hours, 10);
    minutes = parseInt(minutes, 10);
    
    // Convert to 24-hour format
    if (period.toLowerCase() === 'p.m.' && hours !== 12) {
      hours += 12;
    } else if (period.toLowerCase() === 'a.m.' && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    speechSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Recognition time result:', data.text);
      if (lastPressed === 'time') {
        if (!data.isFinal) {
          return;
        }
        const parsedTime = formatTimeForInput(data.text);
        console.log("Parsed Time: ", parsedTime);
        setEventTime(parsedTime);
      }
      else if (lastPressed === 'title') {
        console.log("Recognition title result:", data.text);
        setEventName(capitalizeWords(data.text));
      }
    };
  }, [speechSocket, lastPressed]);

  const stopRecording = useCallback(() => {

    console.log("Stopping recording.");
    speechSocket.send('stop');
  }, [speechSocket]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'F1' && !isCapturing) {
        setLastPressed('title');
        setIsCapturing(true);
        event.preventDefault();
        startRecording();
      }
      if (event.key === 'F2' && !isCapturing) {
        setLastPressed('time');
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
      if (event.key === 'F2' && isCapturing) {
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
  }, [startRecording, setLastPressed, isCapturing, stopRecording]);


  const capitalizeWords = (text) => text.replace(/\b(\w)/g, s => s.toUpperCase());

  
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

  useEffect(() => {
    const handleButtonPress = (buttonId) => {
      console.log("Button received: " + buttonId, isCapturing);
      switch (buttonId) {
        case "Confirm":
          handleSubmit();
          break;
        case "DELete":
          closePopup();
          break;
        case "TimeAudioStart" && !isCapturing:
          setLastPressed('time');
          setIsCapturing(true);
          startRecording();
          break;
        case "TitleAudioStart" && !isCapturing:
          setLastPressed('title');
          setIsCapturing(true);
          startRecording();
          break;
        case "TimeAudio" && isCapturing:
          setIsCapturing(false);
          stopRecording();
          break;
        case "TitleAudio" && isCapturing:
          setIsCapturing(false);
          stopRecording();
          break;
        default:
          break;
      }
    };

    if (socket) {
      socket.on('buttonPress', handleButtonPress);
    }

    return () => {
      if (socket) {
        socket.off('buttonPress', handleButtonPress);
      }
    };
  }, [socket, handleSubmit, closePopup, setLastPressed, startRecording, isCapturing, stopRecording]);

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
