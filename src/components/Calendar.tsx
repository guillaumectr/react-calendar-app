import React from 'react';
import { useCalendar } from '../context/CalendarContext';
import CalendarHeader from './CalendarHeader';
import CalendarDay from './CalendarDay';
import EventForm from './EventForm';
import EventList from './EventList';
import './Calendar.css';

const Calendar: React.FC = () => {
    const { currentMonth, selectedDate, selectedStartDate, selectedEndDate, events, setCurrentMonth, setSelectedDate, setSelectedStartDate, setSelectedEndDate, addEvent, updateEvent } = useCalendar();
    const [hoveredDate, setHoveredDate] = React.useState<Date | null>(null);
    const [editingEvent, setEditingEvent] = React.useState<any | null>(null);
    const [editingDateField, setEditingDateField] = React.useState<'start' | 'end' | null>(null);

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
        // If editing an event
        if (editingEvent) {
            const isSameDate = (d1: Date, d2: Date) => 
                d1.getDate() === d2.getDate() &&
                d1.getMonth() === d2.getMonth() &&
                d1.getFullYear() === d2.getFullYear();
            
            const isSingleDayEvent = selectedStartDate && selectedEndDate && 
                isSameDate(selectedStartDate, selectedEndDate);
            
            // Check if clicking on start or end date to toggle edit mode
            if (selectedStartDate && isSameDate(date, selectedStartDate)) {
                // If already editing this date, exit edit mode
                if (editingDateField === 'start') {
                    setEditingDateField(null);
                    return;
                }
                // For single-day events, enter a special mode that auto-determines which date to edit
                if (isSingleDayEvent) {
                    setEditingDateField('start'); // Use 'start' as a flag for single-day mode
                } else {
                    setEditingDateField('start');
                }
                return;
            }
            if (selectedEndDate && isSameDate(date, selectedEndDate) && !isSingleDayEvent) {
                // If already editing this date, exit edit mode
                if (editingDateField === 'end') {
                    setEditingDateField(null);
                    return;
                }
                setEditingDateField('end');
                return;
            }
            
            // If in edit mode for a specific date field
            if (editingDateField === 'start') {
                // For single-day events, auto-determine which date to change
                if (isSingleDayEvent) {
                    if (date < selectedStartDate!) {
                        // New date is before: change start date
                        setSelectedStartDate(date);
                    } else if (date > selectedStartDate!) {
                        // New date is after: change end date
                        setSelectedEndDate(date);
                    }
                    setEditingDateField(null);
                    return;
                }
                // For multi-day events, update start date normally
                if (!selectedEndDate || date <= selectedEndDate) {
                    setSelectedStartDate(date);
                    // If setting start date to same as end date, make it single-day
                    if (selectedEndDate && isSameDate(date, selectedEndDate)) {
                        setSelectedEndDate(date);
                    }
                    setEditingDateField(null);
                }
                return;
            }
            if (editingDateField === 'end') {
                // Update end date, must be after or equal to start date
                if (selectedStartDate && date >= selectedStartDate) {
                    setSelectedEndDate(date);
                    // If setting end date to same as start date, make it single-day
                    if (isSameDate(date, selectedStartDate)) {
                        setSelectedStartDate(date);
                    }
                    setEditingDateField(null);
                }
                return;
            }
            
            // Clicking any other date cancels editing
            setEditingEvent(null);
            setEditingDateField(null);
            setSelectedStartDate(null);
            setSelectedEndDate(null);
            setSelectedDate(null);
            return;
        }
        
        // Clear any editing state when clicking a date (only if not already editing)
        setEditingEvent(null);
        setEditingDateField(null);
        
        // Range selection logic:
        // 1. If no start date, set it as start
        // 2. If start date exists but no end date, automatically determine start/end based on order
        // 3. If both exist, reset and start new selection
        
        if (!selectedStartDate) {
            // First click: set start date
            setSelectedStartDate(date);
            setSelectedEndDate(null);
            setSelectedDate(date);
        } else if (!selectedEndDate) {
            // Second click: determine start and end based on date order
            if (date >= selectedStartDate) {
                // New date is after or equal: keep original as start
                setSelectedEndDate(date);
                setSelectedDate(null);
            } else {
                // New date is before: new date becomes start, original becomes end
                setSelectedEndDate(selectedStartDate);
                setSelectedStartDate(date);
                setSelectedDate(null);
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

    const handleAddEvent = async (eventData: {
        title: string;
        description: string;
        startDate: Date;
        endDate: Date;
        startTime: string;
        endTime: string;
        eventMode?: 'each-day' | 'all-day';
    }) => {
        try {
            if (eventData.eventMode === 'each-day' && eventData.endDate > eventData.startDate) {
                // Create separate events for each day in the range
                const currentDate = new Date(eventData.startDate);
                const endDate = new Date(eventData.endDate);
                
                while (currentDate <= endDate) {
                    await addEvent({
                        title: eventData.title,
                        description: eventData.description,
                        date: new Date(currentDate),
                        endDate: new Date(currentDate),
                        startTime: eventData.startTime,
                        endTime: eventData.endTime,
                    });
                    currentDate.setDate(currentDate.getDate() + 1);
                }
            } else {
                // Create a single event spanning the date range
                await addEvent({
                    title: eventData.title,
                    description: eventData.description,
                    date: eventData.startDate,
                    endDate: eventData.endDate,
                    startTime: eventData.startTime,
                    endTime: eventData.endTime,
                });
            }
            
            // Clear selection after adding event
            setSelectedStartDate(null);
            setSelectedEndDate(null);
            setSelectedDate(null);
        } catch (error) {
            console.error('Failed to add event:', error);
            alert('Failed to save event. Please try again.');
        }
    };

    const handleUpdateEvent = async (id: string, eventData: {
        title: string;
        description: string;
        startDate: Date;
        endDate: Date;
        startTime: string;
        endTime: string;
    }) => {
        try {
            await updateEvent(id, {
                title: eventData.title,
                description: eventData.description,
                date: eventData.startDate,
                endDate: eventData.endDate,
                startTime: eventData.startTime,
                endTime: eventData.endTime,
            });
            
            // Clear editing state and selection
            setEditingEvent(null);
            setEditingDateField(null);
            setSelectedStartDate(null);
            setSelectedEndDate(null);
            setSelectedDate(null);
        } catch (error) {
            console.error('Failed to update event:', error);
            alert('Failed to update event. Please try again.');
        }
    };

    const handleEventClick = (event: any) => {
        // Set editing event and populate form with its dates
        setEditingEvent(event);
        setEditingDateField(null);
        setSelectedStartDate(event.date);
        setSelectedEndDate(event.endDate || null);
        setSelectedDate(null);
    };

    const handleCloseForm = () => {
        setSelectedStartDate(null);
        setSelectedEndDate(null);
        setSelectedDate(null);
        setHoveredDate(null);
        setEditingEvent(null);
        setEditingDateField(null);
    };

    const handleCloseEventList = () => {
        setSelectedDate(null);
        setSelectedStartDate(null);
        setSelectedEndDate(null);
    };

    const getEventsForDate = (date: Date): any[] => {
        return events.filter(event => {
            const eventStart = new Date(event.date);
            const eventEnd = event.endDate ? new Date(event.endDate) : eventStart;
            
            // Normalize dates to compare only year, month, and day
            const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const startDate = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate());
            const endDate = new Date(eventEnd.getFullYear(), eventEnd.getMonth(), eventEnd.getDate());
            
            return checkDate >= startDate && checkDate <= endDate;
        });
    };

    const getEventsForDateRange = (startDate: Date, endDate: Date): any[] => {
        const rangeStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
        const rangeEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        
        return events.filter(event => {
            const eventStart = new Date(event.date);
            const eventEnd = event.endDate ? new Date(event.endDate) : eventStart;
            
            const eventStartNorm = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate());
            const eventEndNorm = new Date(eventEnd.getFullYear(), eventEnd.getMonth(), eventEnd.getDate());
            
            // Event overlaps with selected range
            return eventStartNorm <= rangeEnd && eventEndNorm >= rangeStart;
        });
    };

    // Get events for selected date or date range
    const getSelectedEvents = () => {
        if (selectedStartDate && selectedEndDate) {
            return getEventsForDateRange(selectedStartDate, selectedEndDate);
        } else if (selectedDate) {
            return getEventsForDate(selectedDate);
        } else if (selectedStartDate) {
            return getEventsForDate(selectedStartDate);
        }
        return [];
    };

    const selectedDateEvents = getSelectedEvents();
    const displayDate = selectedStartDate && selectedEndDate ? null : (selectedDate || selectedStartDate);

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
        // Show preview when editing start or end date
        if (editingEvent && editingDateField && hoveredDate) {
            // Normalize dates to midnight for comparison
            const normalizeDate = (d: Date) => {
                const normalized = new Date(d);
                normalized.setHours(0, 0, 0, 0);
                return normalized.getTime();
            };
            
            const dateTime = normalizeDate(date);
            const hoverTime = normalizeDate(hoveredDate);
            
            if (editingDateField === 'start') {
                // For single-day events or when editing start of multi-day
                if (selectedStartDate && selectedEndDate) {
                    const startTime = normalizeDate(selectedStartDate);
                    const endTime = normalizeDate(selectedEndDate);
                    
                    // Check if single-day event
                    const isSingleDay = startTime === endTime;
                    
                    if (isSingleDay) {
                        // For single-day events, show preview based on hover position
                        if (hoverTime < startTime) {
                            // Hovering before: preview from hover to current date
                            return dateTime >= hoverTime && dateTime <= endTime;
                        } else if (hoverTime > startTime) {
                            // Hovering after: preview from current date to hover
                            return dateTime >= startTime && dateTime <= hoverTime;
                        }
                    } else {
                        // For multi-day events, preview new start to current end
                        if (hoverTime <= endTime) {
                            return dateTime >= hoverTime && dateTime <= endTime;
                        }
                    }
                }
            } else if (editingDateField === 'end' && selectedStartDate) {
                // Preview current start to new end
                const startTime = normalizeDate(selectedStartDate);
                if (hoverTime >= startTime) {
                    return dateTime >= startTime && dateTime <= hoverTime;
                }
            }
            return false;
        }
        
        // Show preview only when start date is selected but no end date yet
        if (!selectedStartDate || selectedEndDate || !hoveredDate) return false;
        
        const dateTime = date.getTime();
        const startTime = selectedStartDate.getTime();
        const hoverTime = hoveredDate.getTime();
        
        // Preview range - handle both directions
        if (hoverTime > startTime) {
            return dateTime >= startTime && dateTime <= hoverTime;
        } else if (hoverTime < startTime) {
            return dateTime >= hoverTime && dateTime <= startTime;
        }
        return false;
    };

    const handleDayHover = (date: Date | null) => {
        // Enable hover when editing a specific date field
        if (editingEvent && editingDateField) {
            setHoveredDate(date);
            return;
        }
        
        // Only set hover state when start is selected but not end
        if (selectedStartDate && !selectedEndDate) {
            setHoveredDate(date);
        } else {
            setHoveredDate(null);
        }
    };

    const hasEventsOnDay = (date: Date): boolean => {
        return getEventsForDate(date).length > 0;
    };

    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfWeek = getFirstDayOfMonth(currentMonth);
    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="calendar-container">
            {selectedDateEvents.length > 0 && (
                <EventList
                    events={selectedDateEvents}
                    selectedDate={displayDate}
                    selectedStartDate={selectedStartDate}
                    selectedEndDate={selectedEndDate}
                    onClose={handleCloseEventList}
                    onEventClick={handleEventClick}
                />
            )}
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
                            hasEvents={hasEventsOnDay(day)}
                        />
                    ))}
                </div>
            </div>
            {(selectedStartDate || selectedEndDate || editingEvent) && (
                <EventForm 
                    selectedStartDate={selectedStartDate}
                    selectedEndDate={selectedEndDate}
                    editingEvent={editingEvent}
                    onAddEvent={handleAddEvent}
                    onUpdateEvent={handleUpdateEvent}
                    onClose={handleCloseForm}
                />
            )}
        </div>
    );
};

export default Calendar;