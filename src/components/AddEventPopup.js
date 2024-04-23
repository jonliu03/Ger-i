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
  const { selectedDay, setSelectedDay, events} = useCalendar();
  const { addEvent, editEvent } = useCalendar();
  const { isPopupOpen, setIsPopupOpen } = useView();
  const socket = useSocket();

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

  const handleRecording = useCallback((action) => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        console.log("Recording...");
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();
        let audioChunks = [];

        mediaRecorder.addEventListener("dataavailable", event => {
          audioChunks.push(event.data);
        });

        mediaRecorder.addEventListener("stop", () => {
          const audioBlob = new Blob(audioChunks);
          const formData = new FormData();
          formData.append("audio", audioBlob);
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            const base64data = reader.result;
            speechSocket.send(JSON.stringify({ action: action, data: base64data }));
          };
        });

        if (action === 'stop') {

          console.log("Recording stopped.");
          mediaRecorder.stop();
          stream.getTracks().forEach(track => track.stop());
        }
      });
  }, [speechSocket]);

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
