import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

// Create a Context for the socket
const SocketContext = createContext();

// Custom hook to use the socket context
export const useSocket = () => useContext(SocketContext);

// SocketProvider component
export const SocketProvider = ({ children }) => {
    // State to store the initialized socket
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Initialize socket connection
        const newSocket = io('http://localhost:3000');
        setSocket(newSocket);

        // Clean up on component unmount
        return () => newSocket.disconnect();
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
