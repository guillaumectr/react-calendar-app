import React from 'react';
import './CalendarDay.css';

interface CalendarDayProps {
    date: Date;
    onClick: (date: Date) => void;
    onHover?: (date: Date | null) => void;
    isToday?: boolean;
    isSelected?: boolean;
    isInRange?: boolean;
    isRangeStart?: boolean;
    isRangeEnd?: boolean;
    isInPreviewRange?: boolean;
    hasEvents?: boolean;
}

const CalendarDay: React.FC<CalendarDayProps> = ({ date, onClick, onHover, isToday = false, isSelected = false, isInRange = false, isRangeStart = false, isRangeEnd = false, isInPreviewRange = false, hasEvents = false }) => {
    const handleClick = () => {
        onClick(date);
    };

    const handleMouseEnter = () => {
        if (onHover) onHover(date);
    };

    const handleMouseLeave = () => {
        if (onHover) onHover(null);
    };

    const classNames = [
        'calendar-day',
        isToday && 'today',
        isSelected && 'selected',
        isInRange && 'in-range',
        isRangeStart && 'range-start',
        isRangeEnd && 'range-end',
        isInPreviewRange && 'preview-range'
    ].filter(Boolean).join(' ');

    return (
        <div 
            className={classNames} 
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {date.getDate()}
            {hasEvents && <div className="event-indicator"></div>}
        </div>
    );
};

export default CalendarDay;