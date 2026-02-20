import React from 'react';
import { useCalendar } from '../context/CalendarContext';
import CalendarHeader from './CalendarHeader';
import CalendarDay from './CalendarDay';
import EventForm from './EventForm';
import './Calendar.css';

const Calendar: React.FC = () => {
    const { currentMonth, selectedDate, selectedStartDate, selectedEndDate, setCurrentMonth, setSelectedDate, setSelectedStartDate, setSelectedEndDate, addEvent } = useCalendar();
    const [hoveredDate, setHoveredDate] = React.useState<Date | null>(null);

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
        // Range selection logic:
        // 1. If no start date, set it as start
        // 2. If start date exists but no end date, set as end (if after start) or restart (if before start)
        // 3. If both exist, reset and start new selection
        
        if (!selectedStartDate) {
            // First click: set start date
            setSelectedStartDate(date);
            setSelectedEndDate(null);
            setSelectedDate(date);
        } else if (!selectedEndDate) {
            // Second click: set end date or restart
            if (date >= selectedStartDate) {
                setSelectedEndDate(date);
                setSelectedDate(null);
            } else {
                // If clicked date is before start, treat as new first click
                setSelectedStartDate(date);
                setSelectedEndDate(null);
                setSelectedDate(date);
            }
        } else {
            // Third click: reset and start new selection
            setSelectedStartDate(date);
            setSelectedEndDate(null);
            setSelectedDate(date);
        }
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

    const handleToday = () => {
        setCurrentMonth(new Date());
    };

    const handleAddEvent = (eventData: {
        title: string;
        description: string;
        startDate: Date;
        endDate: Date;
        startTime: string;
        endTime: string;
    }) => {
        const newEvent = {
            id: Date.now().toString(),
            title: eventData.title,
            description: eventData.description,
            date: eventData.startDate,
            endDate: eventData.endDate,
            startTime: eventData.startTime,
            endTime: eventData.endTime,
        };
        addEvent(newEvent);
        
        // Clear selection after adding event
        setSelectedStartDate(null);
        setSelectedEndDate(null);
        setSelectedDate(null);
    };

    const handleCloseForm = () => {
        setSelectedStartDate(null);
        setSelectedEndDate(null);
        setSelectedDate(null);
        setHoveredDate(null);
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

    const isInRange = (date: Date): boolean => {
        if (!selectedStartDate || !selectedEndDate) return false;
        const time = date.getTime();
        return time >= selectedStartDate.getTime() && time <= selectedEndDate.getTime();
    };

    const isRangeStart = (date: Date): boolean => {
        if (!selectedStartDate) return false;
        return date.getDate() === selectedStartDate.getDate() &&
               date.getMonth() === selectedStartDate.getMonth() &&
               date.getFullYear() === selectedStartDate.getFullYear();
    };

    const isRangeEnd = (date: Date): boolean => {
        if (!selectedEndDate) return false;
        return date.getDate() === selectedEndDate.getDate() &&
               date.getMonth() === selectedEndDate.getMonth() &&
               date.getFullYear() === selectedEndDate.getFullYear();
    };

    const isInPreviewRange = (date: Date): boolean => {
        // Show preview only when start date is selected but no end date yet
        if (!selectedStartDate || selectedEndDate || !hoveredDate) return false;
        
        const dateTime = date.getTime();
        const startTime = selectedStartDate.getTime();
        const hoverTime = hoveredDate.getTime();
        
        // Preview range from start to hovered date
        if (hoverTime > startTime) {
            return dateTime >= startTime && dateTime <= hoverTime;
        }
        return false;
    };

    const handleDayHover = (date: Date | null) => {
        // Only set hover state when start is selected but not end
        if (selectedStartDate && !selectedEndDate) {
            setHoveredDate(date);
        } else {
            setHoveredDate(null);
        }
    };

    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfWeek = getFirstDayOfMonth(currentMonth);
    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="calendar-container">
            <div className="calendar">
                <CalendarHeader month={monthName} onPrevMonth={handlePrevMonth} onNextMonth={handleNextMonth} onToday={handleToday} />
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
                            onHover={handleDayHover}
                            isToday={isToday(day)}
                            isSelected={isSelected(day)}
                            isInRange={isInRange(day)}
                            isRangeStart={isRangeStart(day)}
                            isRangeEnd={isRangeEnd(day)}
                            isInPreviewRange={isInPreviewRange(day)}
                        />
                    ))}
                </div>
            </div>
            {(selectedStartDate || selectedEndDate) && (
                <EventForm 
                    selectedStartDate={selectedStartDate}
                    selectedEndDate={selectedEndDate}
                    onAddEvent={handleAddEvent}
                    onClose={handleCloseForm}
                />
            )}
        </div>
    );
};

export default Calendar;