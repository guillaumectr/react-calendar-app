import React from 'react';
import { useCalendar } from '../context/CalendarContext';
import CalendarHeader from './CalendarHeader';
import CalendarDay from './CalendarDay';
import './Calendar.css';

const Calendar: React.FC = () => {
    const { currentMonth, selectedDate, setCurrentMonth, setSelectedDate } = useCalendar();

    const getDaysInMonth = (date: Date): Date[] => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days: Date[] = [];
        
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }
        
        return days;
    };

    const getFirstDayOfMonth = (date: Date): number => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month, 1).getDay();
    };

    const handleDayClick = (date: Date) => {
        setSelectedDate(date);
    };

    const handlePrevMonth = () => {
        const prevMonth = new Date(currentMonth);
        prevMonth.setMonth(currentMonth.getMonth() - 1);
        setCurrentMonth(prevMonth);
    };

    const handleNextMonth = () => {
        const nextMonth = new Date(currentMonth);
        nextMonth.setMonth(currentMonth.getMonth() + 1);
        setCurrentMonth(nextMonth);
    };

    const isToday = (date: Date): boolean => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    };

    const isSelected = (date: Date): boolean => {
        if (!selectedDate) return false;
        return date.getDate() === selectedDate.getDate() &&
               date.getMonth() === selectedDate.getMonth() &&
               date.getFullYear() === selectedDate.getFullYear();
    };

    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfWeek = getFirstDayOfMonth(currentMonth);
    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="calendar">
            <CalendarHeader month={monthName} onPrevMonth={handlePrevMonth} onNextMonth={handleNextMonth} />
            <div className="weekday-headers">
                {weekDays.map(day => (
                    <div key={day} className="weekday-header">{day}</div>
                ))}
            </div>
            <div className="calendar-grid">
                {Array.from({ length: firstDayOfWeek }).map((_, index) => (
                    <div key={`empty-${index}`} className="empty-day"></div>
                ))}
                {daysInMonth.map((day) => (
                    <CalendarDay 
                        key={day.toString()} 
                        date={day} 
                        onClick={handleDayClick}
                        isToday={isToday(day)}
                        isSelected={isSelected(day)}
                    />
                ))}
            </div>
        </div>
    );
};

export default Calendar;