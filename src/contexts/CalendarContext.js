import React, { createContext, useState, useContext, useEffect } from 'react';

const CalendarContext = createContext({
  events: [],
  addEvent: () => {},
  editEvent: () => {},
  selectedDay: new Date(),
  setSelectedDay: () => {},
});

export const useCalendar = () => useContext(CalendarContext);

const getRandomColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16);

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
  const [isPopupOpen, setIsPopupOpen] = useState(false); // Control the visibility of the AddEventPopup

  useEffect(() => {
    const eventsWithColors = events.map(event => ({
      ...event,
      color: event.color || getRandomColor() // Assign a color if it doesn't have one
    }));
    setEvents(eventsWithColors);
  }, [events]);

  // Function to add a new event
  const addEvent = (newEvent) => {
    setEvents((prevEvents) => [...prevEvents, { ...newEvent, id: Date.now() }]);
  };

  // Function to edit an existing event
  const editEvent = (updatedEvent) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) => (event.id === updatedEvent.id ? { ...event, ...updatedEvent } : event))
    );
  };

  return (
    <CalendarContext.Provider
      value={{
        events,
        addEvent,
        editEvent,
        selectedDay,
        setSelectedDay,
        editingEvent,
        setEditingEvent,
        isPopupOpen,
        setIsPopupOpen,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};
