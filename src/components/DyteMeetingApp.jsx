// import React, { useState } from 'react';
import { API } from '@/config';
// import { DyteMeeting } from '@dytesdk/react-ui-kit';
// import { DyteProvider, useDyteClient } from '@dytesdk/react-web-core';
// import { Box, Button, Input, Select, VStack, HStack, Heading } from '@chakra-ui/react';

// // Configure your Dyte backend URL here
// const DYTE_BACKEND_URL = `${API.MAIN}/api/v1`;

// const DyteMeetingApp = ({ onClose }) => {
//     const [meeting, setMeeting] = useState(null);
//     const [meetingId, setMeetingId] = useState('');
//     const [userName, setUserName] = useState('');
//     const [userRole, setUserRole] = useState('host');
//     const [baseURL] = useState(DYTE_BACKEND_URL);

//     const initMeeting = async ({ authToken }) => {
//         // This should use useDyteClient hook or implementation as per your requirements
//         const dyteClient = await useDyteClient({ authToken });
//         setMeeting(dyteClient);
//     };

//     const createMeeting = async () => {
//         try {
//             const resp = await fetch(`${baseURL}/create-meeting`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//             });
//             const data = await resp.json();
//             if (data.success) {
//                 setMeetingId(data.data.id);
//             } else {
//                 alert('Failed to create meeting: ' + (data.error?.message || 'Unknown error'));
//             }
//         } catch (error) {
//             alert('Error creating meeting: ' + error.message);
//         }
//     };

//     const joinMeeting = async () => {
//         try {
//             if (!meetingId) {
//                 alert('Please enter a meeting ID');
//                 return;
//             }
//             if (!userName) {
//                 alert('Please enter your name');
//                 return;
//             }

//             const client_specific_id = 'client_' + Math.random().toString(36).substr(2, 9);
//             const preset_name = userRole === 'host' ? 'group_call_host' : 'group_call_participant';

//             const resp = await fetch(`${baseURL}/meetings/${meetingId}/participants`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     name: userName,
//                     preset_name,
//                     client_specific_id,
//                 }),
//             });

//             const data = await resp.json();
//             if (data.success) {
//                 await initMeeting({ authToken: data.data.token });
//             } else {
//                 alert('Failed to join meeting: ' + (data.error?.message || 'Unknown error'));
//             }
//         } catch (error) {
//             alert('Error joining meeting: ' + error.message);
//         }
//     };

//     return (
//         <Box p={5} bg="white" borderRadius="md" minH="400px">
//             <Heading size="md" mb={4}>Dyte Video Call</Heading>
//             {!meeting ? (
//                 <VStack spacing={4} align="stretch">
//                     <HStack>
//                         <Button colorScheme="teal" onClick={createMeeting}>
//                             Create Meeting
//                         </Button>
//                     </HStack>
//                     <Input
//                         placeholder="Enter Meeting ID"
//                         value={meetingId}
//                         onChange={(e) => setMeetingId(e.target.value)}
//                     />
//                     <Input
//                         placeholder="Enter Your Name"
//                         value={userName}
//                         onChange={(e) => setUserName(e.target.value)}
//                     />
//                     <Select
//                         value={userRole}
//                         onChange={(e) => setUserRole(e.target.value)}
//                     >
//                         <option value="host">Host</option>
//                         <option value="participant">Participant</option>
//                     </Select>
//                     <HStack>
//                         <Button colorScheme="blue" onClick={joinMeeting} flex={1}>
//                             Join Meeting
//                         </Button>
//                         {onClose && (
//                             <Button variant="outline" onClick={onClose}>
//                                 Close
//                             </Button>
//                         )}
//                     </HStack>
//                 </VStack>
//             ) : (
//                 <Box>
//                     <DyteProvider value={meeting}>
//                         <DyteMeeting meeting={meeting} />
//                     </DyteProvider>
//                 </Box>
//             )}
//         </Box>
//     );
// };

// export default DyteMeetingApp;


import React, { useState, useEffect } from 'react';
import { DyteMeeting } from '@dytesdk/react-ui-kit';
import { DyteProvider, useDyteClient } from '@dytesdk/react-web-core';
import { Box, Button, Input, Select, VStack, HStack, Heading, Text, Spinner, Center } from '@chakra-ui/react';

// Configure your Dyte backend URL here
const DYTE_BACKEND_URL = `${API.MAIN}/api/v1`;

const DyteMeetingApp = ({ onClose, onMinimize, autoJoinMeetingId = null, autoCreate = false, onMeetingCreated }) => {
    const [meetingId, setMeetingId] = useState('');
    const [userName, setUserName] = useState('');
    const [userRole, setUserRole] = useState('host');
    const [meeting, setMeeting] = useState(null);
    const [baseURL] = useState(DYTE_BACKEND_URL);
    const [inviteLink, setInviteLink] = useState('');
    const [linkCopied, setLinkCopied] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Initialize Dyte Client hook at the top level
    const [dyteMeeting, initMeeting] = useDyteClient();

    // Auto-join functionality when autoJoinMeetingId is provided
    useEffect(() => {
        if (autoJoinMeetingId && autoJoinMeetingId !== 'undefined') {
            setMeetingId(autoJoinMeetingId);
            // Optionally auto-populate user name from localStorage if available
            const storedIdentity = window.localStorage.getItem('currentUserIdentity') ||
                window.sessionStorage.getItem('currentUserIdentity');
            if (storedIdentity) {
                try {
                    const identity = JSON.parse(storedIdentity);
                    const name = identity.name || identity.fullName || identity.username || '';
                    if (name) setUserName(name);
                } catch (e) {
                    console.log('Could not parse user identity');
                }
            }
        }
    }, [autoJoinMeetingId]);

    useEffect(() => {
        if (autoCreate && !meetingId && !isCreating) {
            createMeeting();
        }
    }, [autoCreate]);

    const createMeeting = async () => {
        setIsCreating(true);
        try {
            const resp = await fetch(`${baseURL}/create-meeting`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await resp.json();
            if (data.success) {
                // Handle different response structures based on backend version
                const newMeetingId = data.meetingId || (data.data && data.data.data && data.data.data.id) || (data.data && data.data.id);

                if (newMeetingId) {
                    setMeetingId(newMeetingId);
                    // Generate shareable invite link
                    const link = `${window.location.origin}/meet/${newMeetingId}`;
                    setInviteLink(link);
                    if (onMeetingCreated) {
                        onMeetingCreated(newMeetingId);
                    }
                } else {
                    alert('Failed to retrieve meeting ID from response');
                }
            } else {
                alert('Failed to create meeting: ' + (data.error?.message || 'Unknown error or missing ID'));
            }
        } catch (error) {
            alert('Error creating meeting: ' + error.message);
        } finally {
            setIsCreating(false);
        }
    };

    const copyInviteLink = async () => {
        try {
            await navigator.clipboard.writeText(inviteLink);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy link:', error);
            alert('Failed to copy link to clipboard');
        }
    };

    const joinMeeting = async () => {
        try {
            if (!meetingId) {
                alert('Please enter a meeting ID');
                return;
            }
            if (!userName) {
                alert('Please enter your name');
                return;
            }

            // ... (inside joinMeeting function)
            const client_specific_id = 'client_' + Math.random().toString(36).substr(2, 9);
            const preset_name = userRole === 'host' ? 'group_call_host' : 'group_call_participant';

            // Ensure invite link exists for the UI
            if (!inviteLink && meetingId && meetingId !== 'undefined') {
                const link = `${window.location.origin}/meet/${meetingId}`;
                setInviteLink(link);
            }

            const resp = await fetch(`${baseURL}/meetings/${meetingId}/participants`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: userName,
                    preset_name,
                    client_specific_id,
                }),
            });

            const data = await resp.json();
            if (data.success) {
                await initMeeting({ authToken: data.data.token });
                setMeeting(dyteMeeting);
            } else {
                alert('Failed to join meeting: ' + (data.error?.message || 'Unknown error'));
            }
        } catch (error) {
            alert('Error joining meeting: ' + error.message);
        }
    };

    const cardStyle = {
        background: 'linear-gradient(135deg, #0f1117 0%, #1a1d2e 100%)',
        borderRadius: '14px',
        border: '1px solid rgba(99,102,241,0.25)',
        boxShadow: '0 6px 24px rgba(0,0,0,0.5)',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
    };

    const headerStyle = {
        background: 'linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)',
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    };

    const labelStyle = {
        display: 'block',
        fontSize: '10px',
        fontWeight: '600',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: '#a5b4fc',
        marginBottom: '4px',
    };

    const inputStyle = {
        width: '100%',
        padding: '8px 12px',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(99,102,241,0.3)',
        borderRadius: '7px',
        color: '#e2e8f0',
        fontSize: '13px',
        outline: 'none',
        transition: 'border-color 0.2s',
        boxSizing: 'border-box',
    };

    const selectStyle = {
        ...inputStyle,
        cursor: 'pointer',
        appearance: 'none',
        WebkitAppearance: 'none',
    };

    const createBtnStyle = {
        width: '100%',
        padding: '9px',
        background: 'linear-gradient(90deg, #14b8a6 0%, #0ea5e9 100%)',
        border: 'none',
        borderRadius: '7px',
        color: 'white',
        fontWeight: '700',
        fontSize: '13px',
        cursor: 'pointer',
        letterSpacing: '0.04em',
        transition: 'opacity 0.2s',
    };

    const joinBtnStyle = {
        flex: 1,
        padding: '9px',
        background: (!meetingId || !userName) ? 'rgba(99,102,241,0.3)' : 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
        border: 'none',
        borderRadius: '7px',
        color: (!meetingId || !userName) ? 'rgba(255,255,255,0.4)' : 'white',
        fontWeight: '700',
        fontSize: '13px',
        cursor: (!meetingId || !userName) ? 'not-allowed' : 'pointer',
        letterSpacing: '0.04em',
        transition: 'opacity 0.2s',
    };

    const closeBtnStyle = {
        padding: '9px 16px',
        background: 'transparent',
        border: '1px solid rgba(148,163,184,0.35)',
        borderRadius: '7px',
        color: '#94a3b8',
        fontWeight: '600',
        fontSize: '13px',
        cursor: 'pointer',
        transition: 'border-color 0.2s, color 0.2s',
    };

    return (
        <Box p={0} bg="transparent" borderRadius="md" h="100%" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
            {!meeting ? (
                <div style={cardStyle}>
                    {/* Header */}
                    <div style={headerStyle}>
                        <span style={{ fontSize: '20px' }}>📹</span>
                        <span style={{ color: 'white', fontWeight: '700', fontSize: '16px', letterSpacing: '0.02em' }}>
                            IDE Video Call
                        </span>
                    </div>

                    {/* Body */}
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {isCreating ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '14px', color: '#a5b4fc' }}>
                                <div style={{
                                    width: '44px', height: '44px', border: '4px solid rgba(99,102,241,0.3)',
                                    borderTopColor: '#818cf8', borderRadius: '50%',
                                    animation: 'spin 0.8s linear infinite'
                                }} />
                                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>Creating meeting…</span>
                            </div>
                        ) : (
                            <>
                                {/* Create Meeting Button */}
                                {!meetingId && !autoJoinMeetingId && (
                                    <button style={createBtnStyle} onClick={createMeeting}>
                                        ＋ &nbsp;Create New Meeting
                                    </button>
                                )}

                                {/* Invite Link */}
                                {inviteLink && (
                                    <div style={{
                                        background: 'rgba(99,102,241,0.1)',
                                        border: '1px solid rgba(99,102,241,0.25)',
                                        borderRadius: '10px',
                                        padding: '12px 14px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '8px',
                                    }}>
                                        <span style={{ fontSize: '11px', fontWeight: '600', color: '#a5b4fc', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                            Invite Link
                                        </span>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <input value={inviteLink} readOnly style={{ ...inputStyle, fontSize: '12px', flex: 1 }} />
                                            <button
                                                onClick={copyInviteLink}
                                                style={{
                                                    padding: '8px 14px',
                                                    background: linkCopied ? 'rgba(16,185,129,0.2)' : 'rgba(99,102,241,0.25)',
                                                    border: `1px solid ${linkCopied ? 'rgba(16,185,129,0.5)' : 'rgba(99,102,241,0.4)'}`,
                                                    borderRadius: '7px',
                                                    color: linkCopied ? '#6ee7b7' : '#a5b4fc',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {linkCopied ? '✓ Copied' : 'Copy'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Meeting ID */}
                                <div>
                                    <label style={labelStyle}>Meeting ID</label>
                                    <input
                                        style={inputStyle}
                                        placeholder="Enter Meeting ID"
                                        value={meetingId}
                                        onChange={(e) => setMeetingId(e.target.value)}
                                        readOnly={!!autoJoinMeetingId}
                                        onFocus={e => e.target.style.borderColor = '#818cf8'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.3)'}
                                    />
                                </div>

                                {/* Your Name */}
                                <div>
                                    <label style={labelStyle}>Your Name</label>
                                    <input
                                        style={inputStyle}
                                        placeholder="Enter Your Name"
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                        onFocus={e => e.target.style.borderColor = '#818cf8'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.3)'}
                                    />
                                </div>

                                {/* Role */}
                                <div>
                                    <label style={labelStyle}>Role</label>
                                    <select
                                        style={selectStyle}
                                        value={userRole}
                                        onChange={(e) => setUserRole(e.target.value)}
                                        onFocus={e => e.target.style.borderColor = '#818cf8'}
                                        onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.3)'}
                                    >
                                        <option value="host" style={{ background: '#1a1d2e' }}>Host</option>
                                        <option value="participant" style={{ background: '#1a1d2e' }}>Participant</option>
                                    </select>
                                </div>

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
                                    <button
                                        style={joinBtnStyle}
                                        onClick={joinMeeting}
                                        disabled={!meetingId || !userName}
                                    >
                                        🎬 &nbsp;Join Meeting
                                    </button>
                                    {onClose && (
                                        <button
                                            style={closeBtnStyle}
                                            onClick={onClose}
                                            onMouseEnter={e => { e.target.style.borderColor = '#94a3b8'; e.target.style.color = '#e2e8f0'; }}
                                            onMouseLeave={e => { e.target.style.borderColor = 'rgba(148,163,184,0.35)'; e.target.style.color = '#94a3b8'; }}
                                        >
                                            Close
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            ) : (
                <Box position="relative" w="100%" h="100%" display="flex" flexDirection="column">
                    <Box p={2} bg="gray.50" borderBottomWidth="1px" display="flex" justifyContent="space-between" alignItems="center" flexShrink={0}>
                        <HStack>
                            <Text fontWeight="bold" fontSize="sm">Meeting ID: {meetingId}</Text>
                        </HStack>
                        <HStack>
                            <Button size="xs" onClick={copyInviteLink} colorScheme={linkCopied ? "green" : "gray"}>
                                {linkCopied ? "Copied!" : "Copy Invite Link"}
                            </Button>
                            {onMinimize && <Button size="xs" colorScheme="orange" variant="ghost" onClick={onMinimize}>Minimize</Button>}
                            {onClose && !onMinimize && <Button size="xs" colorScheme="red" variant="ghost" onClick={onClose}>Close</Button>}
                        </HStack>
                    </Box>
                    <Box flex={1} position="relative" overflow="hidden">
                        <DyteProvider value={dyteMeeting}>
                            <DyteMeeting meeting={dyteMeeting} mode="fill" style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />
                        </DyteProvider>
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default DyteMeetingApp;
