import React, { createContext, useState, useContext } from 'react';

// Create a context for the calendar data
const CalendarContext = createContext();

// Custom hook for using calendar context in other components
export const useCalendar = () => useContext(CalendarContext);

// Provider component that will wrap the app and provide state
export const CalendarProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [selectedDay, setSelectedDay] = useState(new Date());

  // Function to add a new event
  const addEvent = (newEvent) => {
    setEvents((currentEvents) => [...currentEvents, newEvent]);
  };

  // Function to remove an event
  const removeEvent = (eventId) => {
    setEvents((currentEvents) => currentEvents.filter(event => event.id !== eventId));
  };

  // The value provided to the consuming components
  const value = {
    events,
    addEvent,
    removeEvent
  };

  return (
    <CalendarContext.Provider value={{ events, setEvents, selectedDay, setSelectedDay }}>
      {children}
    </CalendarContext.Provider>
  );
};
