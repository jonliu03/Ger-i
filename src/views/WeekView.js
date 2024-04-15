import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, startOfWeek, endOfWeek, addDays, isSameDay, eachDayOfInterval } from 'date-fns';
import { useCalendar, eventDateToOffsetString } from '../contexts/CalendarContext';
import { useView } from '../contexts/ViewContext';
import DayCell from '../components/CalendarComponents/DayCell';
import AddEventPopup from '../components/AddEventPopup';
import './CalendarViews.css'; // Adjust import path as necessary
import { useKeyboardNavigation } from '../components/Navigation/useKeyboardNavigation';
import { useSocketNavigation } from '../components/Navigation/useSocketNavigation';
  
const WeekView = () => {
    const { events, selectedDay, setEditingEvent, editingEvent } = useCalendar();
    const { isPopupOpen, setIsPopupOpen } = useView();
    const navigate = useNavigate();

    const startWeek = startOfWeek(selectedDay, { weekStartsOn: 0 }); // Adjust weekStartsOn if necessary
    const endWeek = endOfWeek(selectedDay, { weekStartsOn: 0 });
    const daysOfWeek = eachDayOfInterval({ start: startWeek, end: endWeek });

    useKeyboardNavigation(() => {
        setIsPopupOpen(true);
    });

    useSocketNavigation(() => {
        setIsPopupOpen(true);
    });

    const handleEventClick = (event) => {
        setEditingEvent(event);
        setIsPopupOpen(true);
    };

    // Function to render days of the week names
    const renderDaysOfWeek = () => {
        const dateFormat = "E";
        return (
            <div className="days row">
                {daysOfWeek.map((day, i) => (
                    <div className="column col-center" key={i}>
                        {format(day, dateFormat)}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="calendar-view week-view">
            <div className="header row flex-middle">
                <div className="col col-center title">
                    <span>{`${format(startWeek, 'MMMM d')} - ${format(endWeek, 'MMMM d, yyyy')}`}</span>
                </div>
            </div>
            <div className="days-of-week">
                {renderDaysOfWeek()}
            </div>
            <div className="weekView days row">
                {daysOfWeek.map(day => {
                    // Filter events for the current day
                    const dayEvents = events.filter(event => isSameDay(day, event.date));

                    return (
                        <DayCell
                            key={day.toISOString()} // Using toISOString for a unique key
                            day={day}
                            dayEvents={dayEvents} // Pass filtered events to each DayCell
                            onEventClick={handleEventClick} // Pass the function to handle event clicks
                            isSelected={isSameDay(day, selectedDay)}
                            isCurrentMonth={day.getMonth() === selectedDay.getMonth()}
                        />
                    );
                })}
            </div>
            {isPopupOpen && <AddEventPopup closePopup={() => setIsPopupOpen(false)} editingEvent={editingEvent} />}
        </div>
    );
};

export default WeekView;
