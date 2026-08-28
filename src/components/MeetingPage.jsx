import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Heading, Text } from '@chakra-ui/react';
import DyteMeetingApp from './DyteMeetingApp';

const MeetingPage = () => {
    const { meetingId } = useParams();
    const navigate = useNavigate();

    const handleMeetingCreated = (newMeetingId) => {
        // Update URL without reloading
        navigate(`/meet/${newMeetingId}`, { replace: true });
    };

    return (
        <Box h="100vh" bg="gray.100" pt={4} pb={4}>
            <Container maxW="container.xl" h="full" display="flex" flexDirection="column">
                <Box flexShrink={0}>
                    <Heading size="lg" mb={2} color="gray.800">
                        {meetingId ? 'Join Video Meeting' : 'Create Video Meeting'}
                    </Heading>
                    <Text mb={4} color="gray.600">
                        {meetingId
                            ? "You've been invited to join a meeting. Enter your name to continue."
                            : "Creating a new meeting room..."}
                    </Text>
                </Box>
                <Box flex={1} overflow="hidden">
                    <DyteMeetingApp
                        autoJoinMeetingId={meetingId}
                        autoCreate={!meetingId}
                        onMeetingCreated={handleMeetingCreated}
                        onClose={() => navigate('/')}
                    />
                </Box>
            </Container>
        </Box>
    );
};

export default MeetingPage;
