import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, startOfWeek, endOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { useCalendar } from '../CalendarContext'; // Ensure the import path is correct
import DayCell from '../components/CalendarComponents/DayCell';
import './CalendarViews.css'; // Ensure the path to your CSS is correct
import { render } from '@testing-library/react';

const WeekView = () => {
    const { selectedDay, setSelectedDay } = useCalendar(); // Use the selectedDay from global state
    const navigate = useNavigate();

    const startWeek = startOfWeek(selectedDay, { weekStartsOn: 0 }); // Week starts on Sunday
    const endWeek = endOfWeek(selectedDay, { weekStartsOn: 0 });
    const daysOfWeek = eachDayOfInterval({ start: startWeek, end: endWeek });
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
                case 'Enter':
                    navigate(`/day`);
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
            <div className="days row">
                {daysOfWeek.map(day => (
                    <DayCell
                        key={day.toString()}
                        day={day}
                        isSelected={isSameDay(day, selectedDay)}
                        isCurrentMonth={day.getMonth() === selectedDay.getMonth()}
                    />
                ))}
            </div>
        </div>
    );
};

export default WeekView;
