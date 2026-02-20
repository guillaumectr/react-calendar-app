import React, { useState, useEffect } from 'react';
import { CalendarEvent } from '../types';
import './EventForm.css';

interface EventFormProps {
    selectedStartDate: Date | null;
    selectedEndDate: Date | null;
    editingEvent: CalendarEvent | null;
    onAddEvent: (eventData: {
        title: string;
        description: string;
        startDate: Date;
        endDate: Date;
        startTime: string;
        endTime: string;
    }) => void;
    onUpdateEvent: (id: string, eventData: {
        title: string;
        description: string;
        startDate: Date;
        endDate: Date;
        startTime: string;
        endTime: string;
    }) => void;
    onClose: () => void;
}

const EventForm: React.FC<EventFormProps> = ({ selectedStartDate, selectedEndDate, editingEvent, onAddEvent, onUpdateEvent, onClose }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');

    useEffect(() => {
        if (editingEvent) {
            // Populate form with editing event data
            setTitle(editingEvent.title);
            setDescription(editingEvent.description || '');
            setStartTime(editingEvent.startTime || '09:00');
            setEndTime(editingEvent.endTime || '10:00');
        } else {
            // Reset form when date selection changes
            setTitle('');
            setDescription('');
            setStartTime('09:00');
            setEndTime('10:00');
        }
    }, [selectedStartDate, selectedEndDate, editingEvent]);

    const addOneHour = (time: string): string => {
        const [hours, minutes] = time.split(':').map(Number);
        const newHours = (hours + 1) % 24;
        return `${String(newHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    };

    const handleStartTimeChange = (newStartTime: string) => {
        setStartTime(newStartTime);
        // If end time is before or equal to start time, move it forward
        if (endTime <= newStartTime) {
            setEndTime(addOneHour(newStartTime));
        }
    };

    const handleEndTimeChange = (newEndTime: string) => {
        // Only allow end time to be set if it's after start time
        if (newEndTime > startTime) {
            setEndTime(newEndTime);
        }
    };

    const formatDate = (date: Date): string => {
        return date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStartDate || !title.trim()) return;

        const effectiveEndDate = selectedEndDate || selectedStartDate;

        const eventData = {
            title: title.trim(),
            description: description.trim(),
            startDate: selectedStartDate,
            endDate: effectiveEndDate,
            startTime,
            endTime,
        };

        if (editingEvent) {
            onUpdateEvent(editingEvent.id, eventData);
        } else {
            onAddEvent(eventData);
        }

        // Reset form
        setTitle('');
        setDescription('');
        setStartTime('09:00');
        setEndTime('10:00');
    };

    if (!selectedStartDate) {
        return null;
    }

    const isRange = selectedEndDate !== null;
    const displayEndDate = selectedEndDate || selectedStartDate;

    return (
        <div className="event-form-container">
            <div className="event-form">
                <div className="event-form-header">
                    <h3>{editingEvent ? 'Edit Event' : 'Create Event'}</h3>
                    <button type="button" className="close-button" onClick={onClose} title="Close">
                        ✕
                    </button>
                </div>
                
                <div className="date-display">
                    <label>Date{isRange ? ' Range' : ''}</label>
                    <div className="date-range">
                        <span>{formatDate(selectedStartDate)}</span>
                        {isRange && (
                            <>
                                <span className="range-separator">→</span>
                                <span>{formatDate(displayEndDate)}</span>
                            </>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="event-title">Event Name *</label>
                        <input
                            id="event-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter event name"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="event-description">Description</label>
                        <textarea
                            id="event-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter event description (optional)"
                            rows={3}
                        />
                    </div>

                    <div className="time-inputs">
                        <div className="form-group">
                            <label htmlFor="start-time">Start Time</label>
                            <input
                                id="start-time"
                                type="time"
                                value={startTime}
                                onChange={(e) => handleStartTimeChange(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="end-time">End Time</label>
                            <input
                                id="end-time"
                                type="time"
                                value={endTime}
                                onChange={(e) => handleEndTimeChange(e.target.value)}
                                min={startTime}
                            />
                        </div>
                    </div>

                    <button type="submit" className="submit-button">
                        {editingEvent ? 'Update Event' : 'Add Event'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EventForm;
