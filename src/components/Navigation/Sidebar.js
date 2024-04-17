import React, { useState, useEffect, useContext } from 'react';
import '../../App.css';
import AddEventPopup from '../AddEventPopup';
import { useNavigate, useLocation } from 'react-router-dom';
import { useView } from '../../contexts/ViewContext';
import { useSocket } from './socket';
import logo from '../../calLogo.png';

const Sidebar = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const { isPopupOpen, setIsPopupOpen, setCurrentView } = useView();
  const socket = useSocket();
  const location = useLocation();

  const navigate = useNavigate();
  const menuItems = [
    { name: "Day View", path: "/" },
    { name: "Week View", path: "/week" },
    { name: "Month View", path: "/month" },
    { name: "Join Events", path: "/community" },
  ];
  const findFocusedIndex = () => menuItems.findIndex(item => item.path === location.pathname);

  useEffect(() => {
    const currentFocusedIndex = findFocusedIndex();
    if (currentFocusedIndex !== focusedIndex) {
      setFocusedIndex(currentFocusedIndex);
    }
  }, [location.pathname]);

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  const handleNavigate = (path, index) => {
    setFocusedIndex(index);
    navigate(path);
    setCurrentView(path);
  };

  useEffect(() => {

    if (isPopupOpen) {
      return
    }
    const handleButtonPress = (buttonId) => {
      console.log("Button received: " + buttonId);
      if (buttonId === 'DayWeekMonth') {
        setFocusedIndex((prevIndex) => (prevIndex + 1) % (menuItems.length));
        handleNavigate(menuItems[(focusedIndex + 1) % menuItems.length].path, (focusedIndex + 1) % menuItems.length);
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
  }, [focusedIndex, menuItems, showPopup]);

  
  useEffect(() => {
    if (isPopupOpen) {
      return
    }
    const handleKeyPress = (e) => {
      if (e.key === 's') {
        setFocusedIndex((prevIndex) => (prevIndex + 1) % (menuItems.length));
        handleNavigate(menuItems[(focusedIndex + 1) % menuItems.length].path, (focusedIndex + 1) % menuItems.length);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [focusedIndex, menuItems, showPopup]);


  return (
    <div className={`sidebar`}>
      <div className="sidebar-logo">
        <img src={logo} />
      </div>
      <h3>Bridge</h3>
      <nav className="nav">
        <ul>
          {menuItems.map((item, index) => (
            <li key={index}
              className={index === focusedIndex ? 'selected' : ''}
              onClick={() => handleNavigate(item.path, index)}>
              {item.name}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
