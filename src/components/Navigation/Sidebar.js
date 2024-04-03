import React, { useState } from 'react';
import '../../App.css'; 
import AddEventPopup from '../AddEventPopup';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook

const Sidebar = () => {
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate(); // Initialize the navigate function

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  // Function to handle navigation
  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Ger-i Calendar</h2>
      </div>
      <nav className="nav">
        <ul>
          <li onClick={() => handleNavigate('/')}>Month View</li>
          <li onClick={() => handleNavigate('/week')}>Week View</li>
          <li onClick={() => handleNavigate('/day')}>Day View</li>
          <li onClick={() => handleNavigate('/community')}>Community Events</li>
        </ul>
      </nav>
      <button className="add-event-btn" onClick={togglePopup}>Add Event</button>
      {showPopup && <AddEventPopup closePopup={togglePopup} />}
    </div>
  );
};

export default Sidebar;
