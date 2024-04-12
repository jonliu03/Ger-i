import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MonthView from './views/MonthView';
import WeekView from './views/WeekView';
import DayView from './views/DayView';
import CommunityEvents from './views/CommunityEvents';
import Sidebar from './components/Navigation/Sidebar';
import { CalendarProvider } from './contexts/CalendarContext';
import { ViewProvider } from './contexts/ViewContext';
import { SocketProvider } from './components/Navigation/socket';

function App() {
  return (
    <SocketProvider>
      <ViewProvider>
        <CalendarProvider>
          <Router>
            <div className="app">
              <Sidebar />
              <Routes>
                <Route path="/" element={<DayView />} end />
                <Route path="/week" element={<WeekView />} />
                <Route path="/month" element={<MonthView />} />
                <Route path="/community" element={<CommunityEvents />} />
              </Routes>
            </div>
          </Router>
        </CalendarProvider>
      </ViewProvider>
    </SocketProvider>
  );
}

export default App;



