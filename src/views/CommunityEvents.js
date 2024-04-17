import React, { useState, useEffect } from 'react';
import { useCalendar } from '../contexts/CalendarContext'; // Adjust path as needed
import './CommunityEvents.css'; // Assume you have appropriate CSS for styling
import { useSocket } from '../components/Navigation/socket';

const eventsData = [
  {
    id: 1,
    name: 'Poker Night',
    description: 'Gather with fellow card enthusiasts for a fun-filled night of poker. Whether you are a seasoned player or a newbie, you will find excitement and friendly competition.',
    background: 'url(/images/poker-night.png)',
    joined: false,
    date: new Date(2024, 3, 19)
  },
  {
    id: 2,
    name: 'Chess Tournament',
    description: 'Test your strategic skills in our intense chess tournament. Open to players of all levels, this tournament promises to challenge your mind and pit you against the best in the area.',
    background: 'url(/images/chess-tournament.jpg)',
    joined: false,
    date: new Date(2024, 3, 23)
  },
  {
    id: 3,
    name: 'Book Club',
    description: 'Join our book club to discuss our latest read, explore diverse themes and enjoy engaging conversations with fellow literature lovers.',
    background: 'url(/images/book-club.jpeg)',
    joined: false,
    date: new Date(2024, 3, 27)
  },
  {
    id: 4,
    name: 'Coding Hackathon',
    description: 'Participate in our hackathon to innovate, create, and code your way through challenges. Collaborate with peers and compete for prizes in a creative and supportive environment.',
    background: 'url(/images/coding-hackathon.jpeg)',
    joined: false,
    date: new Date(2024, 4, 1)
  },
  {
    id: 5,
    name: 'Photography Walk',
    description: 'Explore scenic routes on our photography walk as you capture stunning landscapes and learn photography tips from the pros.',
    background: 'url(/images/photography-walk.jpeg)',
    joined: false,
    date: new Date(2024, 4, 18)
  }
];


const CommunityEvents = () => {
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const { events, addEvent, removeEvent } = useCalendar();
  const socket = useSocket();

  const handleToggleJoin = (event) => {
    // Check if the event is currently joined by looking it up in the global events array
    const isJoined = events.some(e => e.id === event.id);

    if (isJoined) {
      // Remove the event from the global calendar
      removeEvent(event.id);
      console.log(`Unjoining ${event.name}`);
    } else {
      // Add the event to the global calendar with the date from eventsData
      addEvent({ ...event, date: event.date, time: '18:00' }); // Use the event's specified date
      console.log(`Joining ${event.name}`);
    }

    // For immediate visual update (consider handling this differently in a production environment)
    event.joined = !event.joined;
    setCurrentEventIndex(currentEventIndex); // Force re-render, consider more robust state management
  };

  const handleToggleEvent = (direction) => {
    setCurrentEventIndex(prev => {
      let newIndex = prev + direction;
      if (newIndex < 0) newIndex = eventsData.length - 1;
      else if (newIndex >= eventsData.length) newIndex = 0;
      return newIndex;
    });
  };

  const currentEvent = eventsData[currentEventIndex];

  //Socket for knob navigation
  useEffect(() => {
    const handleButtonPress = (buttonId) => {
      if (buttonId === 'rightKnob') {
        handleToggleEvent(1);
      }
      if (buttonId === 'leftKnob') {
        handleToggleEvent(-1);
      }
      if (buttonId === 'SElect') {
        handleToggleJoin(currentEvent);
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
  }, [currentEvent]);

  return (
    <div className="community-events">
      <div className="event-display" style={{ backgroundImage: currentEvent.background }}>
        <div className="text-content">
          <h2>{`${currentEvent.name} on ${currentEvent.date.toLocaleDateString()}`}</h2>
          <p>{currentEvent.description}</p>
          <div>{currentEvent.joined && <span>✔ Joined</span>}</div>
          <button onClick={() => handleToggleJoin(currentEvent)}>
            {currentEvent.joined ? 'Unjoin Event' : 'Join Event'}
          </button>
        </div>
      </div>
      <button className="toggle-button left" onClick={() => handleToggleEvent(-1)}>&lt;</button>
      <button className="toggle-button right" onClick={() => handleToggleEvent(1)}>&gt;</button>
    </div>
  );
};

export default CommunityEvents;