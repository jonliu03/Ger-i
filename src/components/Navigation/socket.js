import { useEffect, useContext } from 'react';
import io from 'socket.io-client';
import { useCalendar } from '../../contexts/CalendarContext';
import { addDays, isSameDay } from 'date-fns';

// It's a good practice to initialize the socket connection outside of the hook or component
// to avoid creating multiple connections on each render or re-initialization of the hook
const socket = io('http://localhost:3000');

export const useSocket = (onEnter) => {
    const { selectedDay, setSelectedDay } = useCalendar();

    useEffect(() => {
        // Define the event listener as a separate function
        const handleButtonPress = (buttonId) => {
            let newSelectedDay = selectedDay; // Initialize with the current selectedDay

            switch (buttonId) {
                case 'rightKnob':
                    newSelectedDay = addDays(selectedDay, 1);
                    break;
                case 'leftKnob':
                    newSelectedDay = addDays(selectedDay, -1);
                    break;
                case 'Confirm':
                    if (onEnter) onEnter();
                    return;
                case 'SElect':
                    if (onEnter) onEnter();
                    return;
            }

            // Check if the day has changed, to prevent unnecessary state updates
            if (!isSameDay(newSelectedDay, selectedDay)) {
                setSelectedDay(newSelectedDay);
            }
        };

        // Register the event listener
        socket.on('buttonPress', handleButtonPress);

        // Clean up the event listener on component unmount or when dependencies change
        return () => socket.off('buttonPress', handleButtonPress);
    }, [selectedDay, setSelectedDay, onEnter]); // Include all dependencies used inside the effect

};
