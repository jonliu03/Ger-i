import React, { createContext, useContext, useState } from 'react';

const ViewContext = createContext();

export const ViewProvider = ({ children }) => {
    const [currentView, setCurrentView] = useState('monthView'); // Default view
    const [isSidebarMinimized, setIsSidebarMinimized] = useState(true);
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    return (
        <ViewContext.Provider value={{ currentView, setCurrentView, isSidebarMinimized, setIsSidebarMinimized, isPopupOpen, setIsPopupOpen }}>
          {children}
        </ViewContext.Provider>
      );
};

export const useView = () => useContext(ViewContext);
