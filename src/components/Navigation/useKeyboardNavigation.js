import { useEffect } from 'react';
import { useCalendar } from '../../contexts/CalendarContext'; // Adjust the import path as necessary
import { addDays, startOfMonth, endOfMonth, isBefore, isAfter, isSameDay } from 'date-fns';

export const useKeyboardNavigation = (onEnter) => {
  const { selectedDay, setSelectedDay } = useCalendar();

  useEffect(() => {
    const handleKeyDown = (e) => {
      let newSelectedDay = selectedDay;
      switch (e.key) {
        case 'ArrowRight':
          newSelectedDay = addDays(selectedDay, 1);
          break;
        case 'ArrowLeft':
          newSelectedDay = addDays(selectedDay, -1);
          break;
        case 'ArrowUp':
          newSelectedDay = addDays(selectedDay, -7);
          break;
        case 'ArrowDown':
          newSelectedDay = addDays(selectedDay, 7);
          break;
        case 'Enter':
          if (onEnter) onEnter(); // Call the onEnter function if defined
          break;
        default:
          break;
      }

      if (!isSameDay(newSelectedDay, selectedDay)) {
        setSelectedDay(newSelectedDay);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDay, setSelectedDay]); // Include onEnter in the dependency array
};
