import React from 'react';
import { CalendarProvider } from './context/CalendarContext';
import Calendar from './components/Calendar';

const App: React.FC = () => {
  return (
    <CalendarProvider>
      <Calendar />
    </CalendarProvider>
  );
};

export default App;