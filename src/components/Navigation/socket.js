import { useEffect } from 'react';
import { useCalendar } from '../../contexts/CalendarContext'; // Adjust the import path as necessary
import { addDays, isSameDay } from 'date-fns';
import { useView } from '../../contexts/ViewContext';
import io from 'socket.io-client';

// It's a good practice to initialize the socket connection outside of the hook or component
// to avoid creating multiple connections on each render or re-initialization of the hook
const socket = io('http://localhost:3000');

export const useSocket = (onEnter) => {
    const { selectedDay, setSelectedDay } = useCalendar();
    const { currentView, setCurrentView, isSidebarMinimized, setIsSidebarMinimized, isPopupOpen } = useView();
    useEffect(() => {
        // Define the event listener as a separate function
        const handleButtonPress = (buttonId) => {
            if (!isSidebarMinimized || isPopupOpen) {
                return;
            }
            else if (currentView == 'monthView') {
                let newSelectedDay = selectedDay;
                switch (buttonId) {
                    case 'knobRight':
                        newSelectedDay = addDays(selectedDay, 1);
                        break;
                    case 'knobLeft':
                        newSelectedDay = addDays(selectedDay, -1);
                        break;
                    case 'select':
                        if (onEnter) onEnter();
                        break;
                    default:
                        break;
                }
                if (!isSameDay(newSelectedDay, selectedDay)) {
                    setSelectedDay(newSelectedDay);
                }
            } else if (currentView == 'weekView') {
                let newSelectedDay = selectedDay;
                switch (buttonId) {
                    case 'knobRight':
                        newSelectedDay = addDays(selectedDay, 1);
                        break;
                    case 'knobLeft':
                        newSelectedDay = addDays(selectedDay, -1);
                        break;
                    case 'select':
                        if (onEnter) onEnter();
                        break;
                    default:
                        break;
                }
                if (!isSameDay(newSelectedDay, selectedDay)) {
                    setSelectedDay(newSelectedDay);
                }
            }
        };

        // Register the event listener
        socket.on('buttonPress', handleButtonPress);

        // Clean up the event listener on component unmount or when dependencies change
        return () => socket.off('buttonPress', handleButtonPress);
    }, [selectedDay, setSelectedDay, onEnter]); // Include all dependencies used inside the effect

};
