import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CalendarEvent } from '../types';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

interface CalendarContextType {
  currentMonth: Date;
  selectedDate: Date | null;
  selectedStartDate: Date | null;
  selectedEndDate: Date | null;
  events: CalendarEvent[];
  setCurrentMonth: (month: Date) => void;
  setSelectedDate: (date: Date | null) => void;
  setSelectedStartDate: (date: Date | null) => void;
  setSelectedEndDate: (date: Date | null) => void;
  addEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<void>;
  updateEvent: (id: string, event: Omit<CalendarEvent, 'id'>) => Promise<void>;
  loading: boolean;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export { CalendarContext };

export const CalendarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Helper function to combine date and time into ISO string with timezone
  const combineDateTimeToISO = (date: Date, time: string): string => {
    const [hours, minutes] = time.split(':');
    const combined = new Date(date);
    combined.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return combined.toISOString();
  };

  // Load events from Supabase when user logs in
  useEffect(() => {
    if (user) {
      loadEvents();
    } else {
      setEvents([]);
    }
  }, [user]);

  const loadEvents = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: true });

      if (error) throw error;

      if (data) {
        const formattedEvents: CalendarEvent[] = data.map((event) => ({
          id: event.id,
          title: event.title,
          description: event.description || '',
          date: new Date(event.start_date),
          endDate: event.end_date ? new Date(event.end_date) : undefined,
          startTime: new Date(event.start_date).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: false 
          }),
          endTime: event.end_date ? new Date(event.end_date).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: false 
          }) : undefined,
        }));
        setEvents(formattedEvents);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async (event: Omit<CalendarEvent, 'id'>) => {
    if (!user) return;

    try {
      const startDateTime = combineDateTimeToISO(event.date, event.startTime || '00:00');
      const endDateTime = event.endDate && event.endTime 
        ? combineDateTimeToISO(event.endDate, event.endTime)
        : combineDateTimeToISO(event.date, event.endTime || '23:59');

      const { data, error } = await supabase
        .from('events')
        .insert([
          {
            user_id: user.id,
            title: event.title,
            description: event.description || null,
            start_date: startDateTime,
            end_date: endDateTime,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newEvent: CalendarEvent = {
          id: data.id,
          title: data.title,
          description: data.description || '',
          date: new Date(data.start_date),
          endDate: new Date(data.end_date),
          startTime: event.startTime,
          endTime: event.endTime,
        };
        setEvents((prevEvents) => [...prevEvents, newEvent]);
      }
    } catch (error) {
      console.error('Error adding event:', error);
      throw error;
    }
  };

  const updateEvent = async (id: string, event: Omit<CalendarEvent, 'id'>) => {
    if (!user) return;

    try {
      const startDateTime = combineDateTimeToISO(event.date, event.startTime || '00:00');
      const endDateTime = event.endDate && event.endTime 
        ? combineDateTimeToISO(event.endDate, event.endTime)
        : combineDateTimeToISO(event.date, event.endTime || '23:59');

      const { data, error } = await supabase
        .from('events')
        .update({
          title: event.title,
          description: event.description || null,
          start_date: startDateTime,
          end_date: endDateTime,
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const updatedEvent: CalendarEvent = {
          id: data.id,
          title: data.title,
          description: data.description || '',
          date: new Date(data.start_date),
          endDate: new Date(data.end_date),
          startTime: event.startTime,
          endTime: event.endTime,
        };
        setEvents((prevEvents) => 
          prevEvents.map((evt) => evt.id === id ? updatedEvent : evt)
        );
      }
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  };

  return (
    <CalendarContext.Provider
      value={{
        currentMonth,
        selectedDate,
        selectedStartDate,
        selectedEndDate,
        events,
        setCurrentMonth,
        setSelectedDate,
        setSelectedStartDate,
        setSelectedEndDate,
        addEvent,
        updateEvent,
        loading,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = (): CalendarContextType => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};