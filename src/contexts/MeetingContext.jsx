import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import DyteMeetingApp from '../components/DyteMeetingApp';

const MeetingContext = createContext(null);

export const useMeeting = () => {
    const context = useContext(MeetingContext);
    if (!context) {
        throw new Error('useMeeting must be used within a MeetingProvider');
    }
    return context;
};

export const MeetingProvider = ({ children }) => {
    const [isMeetingOpen, setIsMeetingOpen] = useState(false);
    const [meetingMounted, setMeetingMounted] = useState(false);

    const openMeeting = useCallback(() => {
        setMeetingMounted(true);
        setIsMeetingOpen(true);
    }, []);

    const minimizeMeeting = useCallback(() => {
        setIsMeetingOpen(false);
        // Note: We keep meetingMounted true so the call stays connected
    }, []);

    const closeMeeting = useCallback(() => {
        setIsMeetingOpen(false);
        // Optional: setMeetingMounted(false) if you want to fully kill it, 
        // but usually "Close" in a persistent app might just mean hide or disconnect.
        // For now, let's keep it mounted or provide a specific "End Call" handler if needed.
        // If the user clicks "Close" inside the app, it usually means "Hide" or "Disconnect".
        // Let's assume Close = Hide for the modal, but if they leave the meeting, Dyte handles that.
    }, []);

    const toggleMeeting = useCallback(() => {
        if (!meetingMounted) {
            openMeeting();
        } else {
            setIsMeetingOpen(prev => !prev);
        }
    }, [meetingMounted, openMeeting]);

    const value = {
        isMeetingOpen,
        meetingMounted,
        openMeeting,
        minimizeMeeting,
        closeMeeting,
        toggleMeeting
    };

    return (
        <MeetingContext.Provider value={value}>
            {children}
            {meetingMounted && createPortal(
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        zIndex: 9999,
                        backgroundColor: 'white',
                        display: isMeetingOpen ? 'flex' : 'none',
                        flexDirection: 'column'
                    }}
                >
                    <div style={{ flex: 1, position: 'relative' }}>
                        <DyteMeetingApp
                            onMinimize={minimizeMeeting}
                            onClose={minimizeMeeting}
                        />
                    </div>
                </div>,
                document.body
            )}
        </MeetingContext.Provider>
    );
};
