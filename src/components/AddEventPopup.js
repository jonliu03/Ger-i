import React, { useState, useEffect, useCallback, useRef } from 'react';
import './AddEventPopup.css';
import { useCalendar, eventDateToOffsetString } from '../contexts/CalendarContext';
import { useView } from '../contexts/ViewContext';
import { useSocket } from '../components/Navigation/socket';

const AddEventPopup = ({ closePopup, editingEvent = null }) => {
  const [eventName, setEventName] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [speechSocket, setSpeechSocket] = useState(new WebSocket('ws://192.168.0.105:3000'));
  const { selectedDay, setSelectedDay, events } = useCalendar();
  const { addEvent, editEvent } = useCalendar();
  const { isPopupOpen, setIsPopupOpen } = useView();
  const socket = useSocket();
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);

  useEffect(() => {
    if (editingEvent) {
      setEventName(editingEvent.name);
      setEventTime(editingEvent.time);
    }
  }, [editingEvent]);

  useEffect(() => {
    speechSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'text') {
        setEventName(data.text);
      }
    };
  }, [speechSocket]);

  useEffect(() => {
    // Setup WebSocket event handlers
    speechSocket.onopen = () => console.log("WebSocket connected");
    speechSocket.onmessage = (message) => {
      const data = JSON.parse(message.data);
      if (data.type === 'transcription') {
        setTitle(data.transcript);
        setIsCapturing(false);
      }
    };
    speechSocket.onclose = () => console.log("WebSocket disconnected");

    // Cleanup on component unmount
    return () => {
      speechSocket.close();
    };
  }, [speechSocket]);

  useEffect(() => {
    const initMedia = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
    };
    initMedia();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'F1' && !isCapturing) {
        setIsCapturing(true);
        handleRecording('start');
      }
    };

    const handleKeyUp = (event) => {
      if (event.key === 'F1' && isCapturing) {
        setIsCapturing(false);
        handleRecording('stop');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleRecording, isCapturing]);

  const handleRecording = (action) => {
    if (action === 'start') {
      if (mediaRecorder && mediaRecorder.state === 'inactive') {
        setAudioChunks([]);
        mediaRecorder.start();
        mediaRecorder.ondataavailable = event => {
          setAudioChunks(prev => [...prev, event.data]);
        };
      }
    } else if (action === 'stop') {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks);
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            const base64data = reader.result;
            speechSocket.send(JSON.stringify({ audio: base64data }));
          };
        };
      }
    }
  };

  const capitalizeWords = (text) => text.replace(/\b(\w)/g, s => s.toUpperCase());

  const handleSubmit = useCallback(() => {
    const event = {
      ...editingEvent,
      name: eventName,
      date: selectedDay,
      time: eventTime,
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

  /*

    if (socket) {
      socket.on('buttonPress', handleButtonPress);
    }

    return () => {
      if (socket) {
        socket.off('buttonPress', handleButtonPress);
      }
    };
  }, [socket, handleSubmit, closePopup, setIsCapturing, startRecording, isCapturing, stopRecording]); */

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
