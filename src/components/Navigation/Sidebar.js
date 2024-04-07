import React, { useState, useEffect } from 'react';
import '../../App.css';
import AddEventPopup from '../AddEventPopup';
import { useNavigate, useLocation } from 'react-router-dom';
import { useView } from '../../contexts/ViewContext';

import io from 'socket.io-client';

const socket = io('http://localhost:3000');

const Sidebar = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [minimized, setMinimized] = useState(true);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const { isSidebarMinimized, setIsSidebarMinimized, isPopupOpen, setIsPopupOpen } = useView();

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

  useEffect(() => {
    if (showPopup) {
      return;
    }

    const handleButtonPress = (buttonId) => {
      switch (buttonId) {
        case 'DWM':
          setMinimized(!minimized);
          break;
        case 'select':
          if (focusedIndex < menuItems.length) {
            handleNavigate(menuItems[focusedIndex].path);
            setMinimized(!minimized);
          } else {
            setFocusedIndex((prevIndex) => (prevIndex + 1) % (menuItems.length + 1));
            togglePopup(); // Toggle popup if "Add Event" button is focused
          }
          break;
        case 'knobLeft':
          setFocusedIndex((prevIndex) => prevIndex > 0 ? prevIndex - 1 : menuItems.length);
          break;
        case 'knobRight':
          setFocusedIndex((prevIndex) => (prevIndex + 1) % (menuItems.length + 1));
          break;
        default:
          break;
      }
    };

    // Register the event listener for button presses
    socket.on('buttonPress', handleButtonPress);

    // Clean up the event listener on component unmount or when dependencies change
    return () => socket.off('buttonPress', handleButtonPress);
  }, [minimized, focusedIndex, menuItems, showPopup]);



  return (
    <div className={`sidebar ${minimized ? 'minimized' : ''}`}>
      <div className="sidebar-header">
        <h2>Ger-i</h2>
      </div>
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
