import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { useNavigate } from 'react-router-dom'; 
import { useCalendar } from '../CalendarContext';
import DayCell from '../components/CalendarComponents/DayCell';
import './CalendarViews.css';

const MonthView = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { selectedDay, setSelectedDay } = useCalendar();
  const navigate = useNavigate();

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
          navigate(`/week`);
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
  }, [selectedDay, navigate]);

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const renderDaysOfWeek = () => {
    const dateFormat = "EEEE";
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
        const cloneDay = day;
        days.push(
          <DayCell 
            key={day.toString()} 
            day={day} 
            isSelected={isSameDay(day, selectedDay)}
            isCurrentMonth={day.getMonth() === currentMonth.getMonth()}
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
      <div className = "days-of-week">
        {renderDaysOfWeek()}
      </div>
      {renderCells()}
    </div>
  );
};

export default MonthView;
