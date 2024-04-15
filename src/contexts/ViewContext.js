import React, { createContext, useContext, useState } from 'react';

const ViewContext = createContext();

export const ViewProvider = ({ children }) => {
    const [currentView, setCurrentView] = useState('/month'); // Default view
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    return (
        <ViewContext.Provider value={{ currentView, setCurrentView, isPopupOpen, setIsPopupOpen }}>
          {children}
        </ViewContext.Provider>
      );
};

export const useView = () => useContext(ViewContext);
