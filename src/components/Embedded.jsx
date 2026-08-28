import React, { useCallback, useState } from 'react';
import { API } from '@/config';
import { useColorMode, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, RadioGroup, Stack, Radio } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
// import Footer from './Footer';
import OutputStatus from './OutputStatus'; // Assuming OutputStatus is a component you have
import EditorNavbar from './EditorNavbar';
import DefineProductButton from './shared/DefineProductButton';

const Embedded = () => {
    const [code, setCode] = useState('');
    const [response, setResponse] = useState('');
    const [isFlashing, setIsFlashing] = useState(false); // New state for flashing status
    const { colorMode } = useColorMode(); // Get current color mode
    const navigate = useNavigate();
    const handleTabChange = useCallback((tab) => {
        const routes = {
            Embedded: '/embedded',
            Simulation: '/simulation',
            Flowchart: '/FlowchartTest',
            'Block Diagram': '/BlockDiagram',
            'Code Editor': '/editor',
        };
        const next = routes[tab];
        if (next) {
            navigate(next);
        }
    }, [navigate]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsFlashing(true); // Disable the button

        try {
            // Step 1: Post code to admin server
            const res = await fetch(`${API.ADMIN}/submit-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });

            const result = await res.json();
            setResponse(`Code posted to admin: ${result.message || 'Success'}\nInitiating hardware flash process...`);

            // Step 2: Trigger hardware flashing via Electron API
            if (window.electronAPI?.flash?.runPipeline) {
                let ports = [];
                if (window.electronAPI?.flash?.detectPorts) {
                    ports = await window.electronAPI.flash.detectPorts();
                }
                const selectedPort = (ports && ports.length > 0) ? ports[0].path : 'COM7';

                setResponse((prev) => `${prev}\nDetected Port: ${selectedPort}. Flashing ESP32 device...`);

                let unsubscribe = null;
                if (window.electronAPI?.flash?.onEvent) {
                    unsubscribe = window.electronAPI.flash.onEvent((eventData) => {
                        if (eventData.log) {
                            setResponse((prev) => `${prev}\n${eventData.log}`);
                        } else if (eventData.status === 'flash_success') {
                            setResponse((prev) => `${prev}\n✅ Firmware successfully written & running on board [device]!`);
                        } else if (eventData.status === 'error') {
                            setResponse((prev) => `${prev}\n❌ Flash error: ${eventData.message || 'Flashing failed'}`);
                        }
                    });
                }

                await window.electronAPI.flash.runPipeline({
                    port: selectedPort,
                    target: 'esp32s3',
                    apiUrl: `${API.ADMIN}/check-code`
                });

                if (unsubscribe) {
                    setTimeout(unsubscribe, 30000);
                }
            } else {
                setResponse((prev) => `${prev}\n(Web Mode: Code stored in admin. Connect via Desktop Electron app to flash hardware device.)`);
            }
        } catch (error) {
            console.error('Error:', error);
            setResponse(`Error flashing code to the device: ${error.message}`);
        } finally {
            setIsFlashing(false); // Re-enable the button after flashing completes
        }
    };

    const containerStyle = {
        padding: '20px',
        backgroundColor: colorMode === 'dark' ? '#2D3748' : '#F7FAFC',
        color: colorMode === 'dark' ? '#E2E8F0' : '#2D3748',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    };

    const headingStyle = {
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '20px',
    };

    const textareaStyle = {
        width: '100%',
        height: '300px',
        padding: '10px',
        fontSize: '16px',
        borderRadius: '5px',
        border: `1px solid ${colorMode === 'dark' ? '#4A5568' : '#CBD5E0'}`,
        backgroundColor: colorMode === 'dark' ? '#1A202C' : '#F7FAFC',
        color: colorMode === 'dark' ? '#E2E8F0' : '#2D3748',
        resize: 'none',
    };

    const buttonStyle = {
        padding: '10px 20px',
        fontSize: '16px',
        color: 'white',
        backgroundColor: colorMode === 'dark' ? '#4A90E2' : '#3182CE',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        marginTop: '10px',
        opacity: isFlashing ? 0.6 : 1,
    };

    const responseStyle = {
        marginTop: '20px',
        padding: '10px',
        backgroundColor: colorMode === 'dark' ? '#2D3748' : '#F7FAFC',
        color: colorMode === 'dark' ? '#E2E8F0' : '#2D3748',
        borderRadius: '5px',
        border: `1px solid ${colorMode === 'dark' ? '#4A5568' : '#CBD5E0'}`,
    };

    return (
        <>
            <EditorNavbar
                tabs={['Embedded', 'Simulation', 'Flowchart', 'Block Diagram', 'Code Editor']}
                activeTab="Embedded"
                onTabChange={handleTabChange}
            />
            <DefineProductButton position="fixed-top-right" />
            <div style={containerStyle}>
                <h1 style={headingStyle}>Let's Flash it Out!</h1>
                <form onSubmit={handleSubmit}>
                    <textarea
                        style={textareaStyle}
                        placeholder="Enter your code here..."
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                    />
                    <br />
                    <button
                        type="submit"
                        style={buttonStyle}
                        disabled={isFlashing || code.trim().length === 0} // Disable if flashing or no code
                    >
                        {isFlashing ? 'Flashing Code...' : 'Flash Code'}
                    </button>
                    &nbsp;&nbsp;&nbsp;

                    <Button size="sm" colorScheme="blue" variant="outline" onClick={() => console.log('Problem Output clicked')}>
                        Build
                    </Button>
                    <Button size="sm" colorScheme="blue" variant="outline" onClick={() => console.log('Serial Console clicked')} ml={2}>
                        Serial Console
                    </Button>
                    <Button size="sm" colorScheme="blue" variant="outline" onClick={() => console.log('Terminal clicked')} ml={2}>
                        Terminal
                    </Button>
                </form>

                <pre style={responseStyle}>{response}</pre>

                <OutputStatus errorLine={{ line: 11, row: 2 }} />
            </div>

            {/* 
            <Footer /> */}
        </>
    );
};

export default Embedded;
