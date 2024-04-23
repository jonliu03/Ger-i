import React, { useState, useEffect, useCallback, useRef } from 'react';
import './AddEventPopup.css';
import { useCalendar, eventDateToOffsetString } from '../contexts/CalendarContext';
import { useView } from '../contexts/ViewContext';
import { useSocket } from '../components/Navigation/socket';

const AddEventPopup = ({ closePopup, editingEvent = null }) => {
  const [eventName, setEventName] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [speechSocket, setSpeechSocket] = useState(null);
  const { selectedDay, setSelectedDay, events } = useCalendar();
  const { addEvent, editEvent } = useCalendar();
  const { isPopupOpen, setIsPopupOpen } = useView();
  const socket = useSocket();
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);

  useEffect(() => {
    const socket = new WebSocket('ws://192.168.0.105:3000');
    setSpeechSocket(socket);
  
    return () => {
      socket.close();  // Clean up the socket when the component unmounts
    };
  }, []);

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
    console.log("Starting recording.");

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);
        setAudioChunks([]);

        recorder.ondataavailable = event => {
          setAudioChunks(prev => [...prev, event.data]);
        };

        recorder.start(); // Start recording after everything is set up
      })
      .catch(error => console.error("Error accessing the microphone: ", error));
  }, [setAudioChunks, setMediaRecorder]);

  useEffect(() => {
    if (!speechSocket) {
      console.log("WebSocket is not initialized.");
      return;
    }
    speechSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Recognition Result:', data.text);
      setEventName(capitalizeWords(data.text));
    };
  }, [speechSocket, setEventName]);

  const stopRecording = useCallback(() => {

    console.log("Stopping recording.");
    mediaRecorder.stop();
    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks);
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = () => {
        const base64data = reader.result;
        if (speechSocket) {
          speechSocket.send(JSON.stringify({ audio: base64data }));
        } else {
          console.error("WebSocket is not initialized.");
        }
      };
    };
  }, [speechSocket, mediaRecorder, audioChunks]);

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
        case "TimeAudioStart":
          setIsCapturing(true);
          startRecording();
          break;
        case "TitleAudioStart":
          setIsCapturing(true);
          startRecording();
          break;
        case "TimeAudio":
          setIsCapturing(false);
          stopRecording();
          break;
        case "TitleAudio":
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
  }, [socket, handleSubmit, closePopup, setIsCapturing, startRecording, isCapturing, stopRecording]);

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
