import { useContext, useEffect } from 'react';
import { useSocket } from './socket'; // Adjust the path as necessary
import { useCalendar } from '../../contexts/CalendarContext';
import { useView } from '../../contexts/ViewContext';
import { addDays, isSameDay } from 'date-fns';

export const useSocketNavigation = (onEnter) => {
    const socket = useSocket();
    const { selectedDay, setSelectedDay } = useCalendar();
    const { currentView, setCurrentView, isPopupOpen } = useView();

    useEffect(() => {
        // Check if socket is connected
        if (!socket) return;

        const handleButtonPress = (buttonId) => {
            if (currentView == 'monthView') {
                let newSelectedDay = selectedDay;
                switch (buttonId) {
                    case 'rightKnob':
                        newSelectedDay = addDays(selectedDay, 1);
                        break;
                    case 'leftKnob':
                        newSelectedDay = addDays(selectedDay, -1);
                        break;
                    case 'SElect':
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
                    case 'rightKnob':
                        newSelectedDay = addDays(selectedDay, 1);
                        break;
                    case 'leftKnob':
                        newSelectedDay = addDays(selectedDay, -1);
                        break;
                    case 'SElect':
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

        // Register the event listener for button presses
        socket.on('buttonPress', handleButtonPress);

        // Cleanup the event listener
        return () => {
            socket.off('buttonPress', handleButtonPress);
        };
    }, [socket, selectedDay, setSelectedDay, isPopupOpen]);
};
