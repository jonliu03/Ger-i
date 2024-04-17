import React, { createContext, useState, useContext, useEffect } from 'react';

const CalendarContext = createContext({
  events: [],
  addEvent: () => {},
  editEvent: () => {},
  removeEvent: () => {},
  selectedDay: new Date(),
  setSelectedDay: () => {},
});

export const useCalendar = () => useContext(CalendarContext);

const generateBrightColor = (minLightness = 60, maxLightness = 70) => {
  const hue = Math.floor(Math.random() * 360);
  const saturation = Math.floor(Math.random() * (100 - 50 + 1)) + 50; // Between 50% and 100%
  const lightness = Math.floor(Math.random() * (maxLightness - minLightness + 1)) + minLightness; // Ensures it's above the minLightness threshold
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

// Used to handle time-zone bugs
export const eventDateToOffsetString = (eventDate) => {
  const offsetInMinutes = new Date().getTimezoneOffset();

  // Convert the offset to the format ±hh:mm
  const offsetHours = Math.abs(Math.floor(offsetInMinutes / 60));
  const offsetMinutes = Math.abs(offsetInMinutes % 60);
  const offsetSign = offsetInMinutes >= 0 ? '-' : '+';
  const offsetString = `${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`;

  // Incorporate the offset into the date string
  return `${eventDate + "T00:00:00"}${offsetString}`;
}

export const CalendarProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [editingEvent, setEditingEvent] = useState(null); // Track the event being edited

  useEffect(() => {
    const eventsWithColors = events.map(event => ({
      ...event,
      color: event.color || `hsl(0, 100%, 75%)`// generateBrightColor() - deprecated
    }));
    const needsUpdate = events.some((event, index) => !event.color);
    if (needsUpdate) {
      setEvents(eventsWithColors);
    }
  }, [events]);

  // Function to add a new event
  const addEvent = (newEvent) => {
    setEvents((prevEvents) => [...prevEvents, { ...newEvent}].sort(
      (a, b) => {
        const timeA = a.time.split(':').map(Number);
        const timeB = b.time.split(':').map(Number);
  
        if (timeA[0] < timeB[0]) return -1;
        if (timeA[0] > timeB[0]) return 1;
        if (timeA[1] < timeB[1]) return -1;
        if (timeA[1] > timeB[1]) return 1;
        return 0;
      }
    ));
  };

  // Function to edit an existing event
  const editEvent = (updatedEvent) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) => (event.id === updatedEvent.id ? { ...event, ...updatedEvent } : event))
    );
  };

  const removeEvent = (eventId) => {
    setEvents((prevEvents) => prevEvents.filter(event => event.id !== eventId));
  };

  return (
    <CalendarContext.Provider
      value={{
        events,
        addEvent,
        editEvent,
        removeEvent,
        selectedDay,
        setSelectedDay,
        editingEvent,
        setEditingEvent,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};
