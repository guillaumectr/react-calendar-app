import React from 'react';
import './CalendarHeader.css';

const CalendarHeader: React.FC<{ month: string; onPrevMonth: () => void; onNextMonth: () => void; onToday: () => void; }> = ({ month, onPrevMonth, onNextMonth, onToday }) => {
    return (
        <div className="calendar-header">
            <button className="nav-button" onClick={onPrevMonth}>Previous</button>
            <div className="header-center">
                <h2>{month}</h2>
                <button className="today-button" onClick={onToday}>Today</button>
            </div>
            <button className="nav-button" onClick={onNextMonth}>Next</button>
        </div>
    );
};

export default CalendarHeader;