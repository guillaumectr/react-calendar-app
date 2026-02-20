import React from 'react';
import { CalendarEvent } from '../types';
import './EventList.css';

interface EventListProps {
    events: CalendarEvent[];
    selectedDate: Date | null;
    selectedStartDate: Date | null;
    selectedEndDate: Date | null;
    onClose: () => void;
    onEventClick: (event: CalendarEvent) => void;
}

const EventList: React.FC<EventListProps> = ({ events, selectedDate, selectedStartDate, selectedEndDate, onClose, onEventClick }) => {
    if (events.length === 0) {
        return null;
    }

    const formatDate = (date: Date): string => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDateShort = (date: Date): string => {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getDateRangeDisplay = (): string => {
        if (selectedStartDate && selectedEndDate) {
            return `${formatDateShort(selectedStartDate)} - ${formatDateShort(selectedEndDate)}`;
        } else if (selectedDate) {
            return formatDate(selectedDate);
        } else if (selectedStartDate) {
            return formatDate(selectedStartDate);
        }
        return '';
    };

    const formatTime = (time?: string): string => {
        if (!time) return '';
        return time;
    };

    return (
        <div className="event-list-container">
            <div className="event-list">
                <div className="event-list-header">
                    <h3>Events</h3>
                    <button type="button" className="close-button" onClick={onClose} title="Close">
                        ✕
                    </button>
                </div>

                <div className="event-list-date">
                    {getDateRangeDisplay()}
                </div>

                <div className="events-scroll">
                    {events.map((event) => (
                        <div 
                            key={event.id} 
                            className="event-item"
                            onClick={() => onEventClick(event)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="event-time">
                                {formatTime(event.startTime)}
                                {event.endTime && event.endTime !== event.startTime && (
                                    <> - {formatTime(event.endTime)}</>
                                )}
                            </div>
                            <div className="event-details">
                                <h4 className="event-title">{event.title}</h4>
                                {event.description && (
                                    <p className="event-description">{event.description}</p>
                                )}
                                {event.endDate && event.endDate.getTime() !== event.date.getTime() && (
                                    <div className="event-multiday">
                                        <span className="multiday-badge">Multi-day event</span>
                                        <span className="multiday-range">
                                            Until {event.endDate.toLocaleDateString('en-US', { 
                                                month: 'short', 
                                                day: 'numeric' 
                                            })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="event-count">
                    {events.length} {events.length === 1 ? 'event' : 'events'}
                </div>
            </div>
        </div>
    );
};

export default EventList;
