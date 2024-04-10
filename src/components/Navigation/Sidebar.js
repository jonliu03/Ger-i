import React, { useState, useEffect, useContext } from 'react';
import '../../App.css';
import AddEventPopup from '../AddEventPopup';
import { useNavigate, useLocation } from 'react-router-dom';
import { useView } from '../../contexts/ViewContext';
import { useSocket } from './socket';
import logo from '../../calLogo.png';

const Sidebar = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [minimized, setMinimized] = useState(true);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const { isSidebarMinimized, setIsSidebarMinimized, isPopupOpen, setIsPopupOpen } = useView();
  const socket = useSocket();

  const navigate = useNavigate();
  const menuItems = [
    { name: "Month View", path: "/" },
    { name: "Week View", path: "/week" },
    { name: "Day View", path: "/day" },
    { name: "Join Events", path: "/community" },
  ];

  const location = useLocation();

  useEffect(() => {
    if (minimized) {
      const currentIndex = menuItems.findIndex(item => item.path === location.pathname);
      if (currentIndex !== -1) {
        setFocusedIndex(currentIndex);
      }
    }
  }, [minimized, location, menuItems]);

  const togglePopup = () => {
    setMinimized(true);
    setShowPopup(!showPopup);
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  useEffect(() => {
    setIsSidebarMinimized(minimized);
  }, [minimized, setIsSidebarMinimized]);

  useEffect(() => {
    const handleButtonPress = (buttonId) => {
      console.log("Button received: " + buttonId);
      // Listen for 'DayWeekMonth' buttonId event to toggle minimized state
      if (buttonId === 'DayWeekMonth') {
        setMinimized(!minimized);
      } else if (buttonId === 'SElect' && !minimized) {
        console.log("Here:" + focusedIndex);
        if (focusedIndex < menuItems.length) {
          handleNavigate(menuItems[focusedIndex].path);
          setMinimized(!minimized);
        } else {
          setFocusedIndex((prevIndex) => (prevIndex + 1) % (menuItems.length + 1));
          togglePopup();
        }
      } else if (buttonId === 'leftKnob' && !minimized) {
        setFocusedIndex((prevIndex) => prevIndex > 0 ? prevIndex - 1 : menuItems.length);
      } else if (buttonId === 'rightKnob' && !minimized) {
        setFocusedIndex((prevIndex) => (prevIndex + 1) % (menuItems.length + 1));
      }
    };

    // Subscribe to socket event when the component mounts
    if (socket) {
      socket.on('buttonPress', handleButtonPress);
    }

    // Cleanup - Unsubscribe from socket event when the component unmounts
    return () => {
      if (socket) {
        socket.off('buttonPress', handleButtonPress);
      }
    };
  }, [minimized, focusedIndex, menuItems, showPopup]);

  useEffect(() => {
    if (showPopup) {
      return
    }
    const handleKeyPress = (e) => {
      if (e.key === 's') {
        setMinimized(!minimized);
      } else if (e.key === 'Enter' && !minimized) {
        if (focusedIndex < menuItems.length) {
          handleNavigate(menuItems[focusedIndex].path);
          setMinimized(!minimized);
        } else {
          setFocusedIndex((prevIndex) => (prevIndex + 1) % (menuItems.length + 1));
          togglePopup(); // Toggle popup if "Add Event" button is focused
        }
      } else if (e.key === 'ArrowUp' && !minimized) {
        setFocusedIndex((prevIndex) => prevIndex > 0 ? prevIndex - 1 : menuItems.length);
      } else if (e.key === 'ArrowDown' && !minimized) {
        setFocusedIndex((prevIndex) => (prevIndex + 1) % (menuItems.length + 1));
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [minimized, focusedIndex, menuItems, showPopup]);


  return (
    <div className={`sidebar ${minimized ? 'minimized' : ''}`}>
      <div className="sidebar-logo">
        <img src={logo}/>
      </div>
      <h3>Bridge</h3>
      <nav className="nav">
        <ul>
          {menuItems.map((item, index) => (
            <li key={index}
              className={index === focusedIndex ? (minimized ? 'selected' : 'focused') : ''} // Apply focused class to the currently focused item
              onClick={() => handleNavigate(item.path)}>
              {item.name}
            </li>
          ))}
        </ul>
      </nav>
      <button
        className={`add-event-btn ${focusedIndex === menuItems.length ? 'focused' : ''}`}
        onClick={togglePopup}>
        Add Event
      </button>
      {showPopup && <AddEventPopup closePopup={togglePopup} />}
    </div>
  );
};

export default Sidebar;
