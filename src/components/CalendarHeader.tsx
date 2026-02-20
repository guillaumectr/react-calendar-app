import React from 'react';
import './CalendarHeader.css';

const CalendarHeader: React.FC<{ month: string; onPrevMonth: () => void; onNextMonth: () => void; }> = ({ month, onPrevMonth, onNextMonth }) => {
    return (
        <div className="calendar-header">
            <button onClick={onPrevMonth}>Previous</button>
            <h2>{month}</h2>
            <button onClick={onNextMonth}>Next</button>
        </div>
    );
};

export default CalendarHeader;