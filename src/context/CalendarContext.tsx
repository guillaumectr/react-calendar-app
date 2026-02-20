import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CalendarEvent } from '../types';

interface CalendarContextType {
  currentMonth: Date;
  selectedDate: Date | null;
  events: CalendarEvent[];
  setCurrentMonth: (month: Date) => void;
  setSelectedDate: (date: Date | null) => void;
  addEvent: (event: CalendarEvent) => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export { CalendarContext };

export const CalendarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const addEvent = (event: CalendarEvent) => {
    setEvents((prevEvents) => [...prevEvents, event]);
  };

  return (
    <CalendarContext.Provider
      value={{
        currentMonth,
        selectedDate,
        events,
        setCurrentMonth,
        setSelectedDate,
        addEvent,
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