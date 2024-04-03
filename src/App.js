import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MonthView from './views/MonthView';
import WeekView from './views/WeekView';
import DayView from './views/DayView';
import CommunityEvents from './views/CommunityEvents';
import Sidebar from './components/Navigation/Sidebar';
import { CalendarProvider } from './contexts/CalendarContext';

function App() {
  return (
    <CalendarProvider> 
      <Router>
        <div className="app">
          <Sidebar />
          <Routes>
            <Route path="/" element={<MonthView />} end />
            <Route path="/week" element={<WeekView />} />
            <Route path="/day" element={<DayView />} />
            <Route path="/community" element={<CommunityEvents />} />
          </Routes>
        </div>
      </Router>
    </CalendarProvider>
  );
}

export default App;



