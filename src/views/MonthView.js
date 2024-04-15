import React, { useState, useEffect } from 'react';
import { format, isBefore, isAfter, startOfWeek, endOfWeek, addDays, startOfMonth, endOfMonth, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useCalendar, eventDateToOffsetString } from '../contexts/CalendarContext';
import { useView } from '../contexts/ViewContext';
import DayCell from '../components/CalendarComponents/DayCell';
import AddEventPopup from '../components/AddEventPopup';
import { useKeyboardNavigation } from '../components/Navigation/useKeyboardNavigation';
import { useSocketNavigation } from '../components/Navigation/useSocketNavigation';
import './CalendarViews.css';

const MonthView = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { selectedDay, setSelectedDay, events} = useCalendar();
  const navigate = useNavigate();
  const [editingEvent, setEditingEvent] = useState(null);

  const { isPopupOpen, setIsPopupOpen } = useView();

  const handleEventClick = (event) => {
    setEditingEvent(event); // Set the event to be edited
    setIsPopupOpen(true); // Show the popup
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setEditingEvent(null) // Reset editing event
  };

  useKeyboardNavigation(() => {
    setIsPopupOpen(true);
  });

  useSocketNavigation(() => {
    setIsPopupOpen(true);
  });

  const nextMonth = () => {
    const newMonth = addMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
    if (!isSameMonth(selectedDay, newMonth)) {
      setSelectedDay(startOfMonth(newMonth));
    }
  };

  const prevMonth = () => {
    const newMonth = subMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
    if (!isSameMonth(selectedDay, newMonth)) {
      setSelectedDay(startOfMonth(newMonth));
    }
  };

  useEffect(() => {
    if (!isSameMonth(selectedDay, currentMonth)) {
      setCurrentMonth(startOfMonth(selectedDay));
    }
  }, [selectedDay, currentMonth]);

  const renderDaysOfWeek = () => {
    const dateFormat = "E";
    const days = [];
    let startDate = startOfWeek(new Date());

    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="column col-center" key={i}>
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }

    return <div className="days row">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    let rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const dayEvents = events.filter(event => isSameDay(day, event.date));
        days.push(
          <DayCell
            key={day.toString()}
            day={day}
            dayEvents={dayEvents}
            isSelected={isSameDay(day, selectedDay)}
            isCurrentMonth={isSameMonth(day, currentMonth)}
            onEventClick={handleEventClick}
          />
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="row" key={day.toString()}>{days}</div>
      );
      days = [];
    }

    return <div className="body">{rows}</div>;
  };

  return (
    <div className="calendar-view">
      <div className="header row flex-middle">
        <div className="col col-start">
          <div className="icon" onClick={prevMonth}>Prev</div>
        </div>
        <div className="col col-center title">
          <span>{format(currentMonth, 'MMMM yyyy')}</span>
        </div>
        <div className="col col-end" onClick={nextMonth}>
          <div className="icon">Next</div>
        </div>
      </div>
      <div className="days-of-week">
        {renderDaysOfWeek()}
      </div>
      {renderCells()}
      {isPopupOpen && <AddEventPopup closePopup={closePopup} editingEvent={editingEvent} />}
    </div>
  );
};

export default MonthView;
