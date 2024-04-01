import React, { useState } from 'react';

function AddEventModal({ isOpen, onClose }) {
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Add Event</h2>
        <input
          type="text"
          placeholder="Event Name"
          value={eventName}
          onChange={e => setEventName(e.target.value)}
        />
        <input
          type="date"
          value={eventDate}
          onChange={e => setEventDate(e.target.value)}
        />
        <button onClick={() => {/* Add event logic here */}}>Add Event</button>
      </div>
    </div>
  );
}

export default AddEventModal;