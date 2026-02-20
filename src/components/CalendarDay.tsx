import React from 'react';
import './CalendarDay.css';

interface CalendarDayProps {
    date: Date;
    onClick: (date: Date) => void;
    isToday?: boolean;
    isSelected?: boolean;
}

const CalendarDay: React.FC<CalendarDayProps> = ({ date, onClick, isToday = false, isSelected = false }) => {
    const handleClick = () => {
        onClick(date);
    };

    const classNames = [
        'calendar-day',
        isToday && 'today',
        isSelected && 'selected'
    ].filter(Boolean).join(' ');

    return (
        <div className={classNames} onClick={handleClick}>
            {date.getDate()}
        </div>
    );
};

export default CalendarDay;