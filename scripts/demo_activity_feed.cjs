/**
 * Demo script to generate activity for the Live Activity Feed
 * This simulates agent interactions to populate the feed with events
 */

const { io } = require('socket.io-client');

const socket = io('http://localhost:3001');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runDemo() {
    console.log('🚀 Starting Activity Feed Demo...\n');

    await delay(2000);

    // Simulate agent status changes
    console.log('📊 Simulating agent status changes...');
    socket.emit('agent:status', {
        agentId: 'pm',
        agentName: 'Project Manager',
        status: 'working'
    });

    await delay(1500);

    socket.emit('agent:status', {
        agentId: 'architect',
        agentName: 'Technical Architect',
        status: 'working'
    });

    await delay(2000);

    // Simulate agent messages
    console.log('💬 Simulating agent communications...');
    socket.emit('agent:message', {
        from: 'pm',
        fromName: 'Project Manager',
        to: 'architect',
        content: 'Can you review the system architecture for the new feature?'
    });

    await delay(2000);

    socket.emit('agent:message', {
        from: 'architect',
        fromName: 'Technical Architect',
        to: 'pm',
        content: 'Sure! I\'ll analyze the requirements and propose a solution.'
    });

    await delay(1500);

    // Simulate task assignments
    console.log('✅ Simulating task assignments...');
    socket.emit('task:assigned', {
        agentId: 'frontend',
        agentName: 'Frontend Engineer',
        taskName: 'Implement Activity Feed UI'
    });

    await delay(1500);

    socket.emit('task:assigned', {
        agentId: 'backend',
        agentName: 'Backend Engineer',
        taskName: 'Create WebSocket event handlers'
    });

    await delay(2000);

    // Simulate system notifications
    console.log('🔔 Simulating system notifications...');
    socket.emit('system:notification', {
        message: 'Database backup completed successfully'
    });

    await delay(1500);

    socket.emit('system:notification', {
        message: 'Redis cache cleared - performance optimized'
    });

    await delay(2000);

    // More status changes
    socket.emit('agent:status', {
        agentId: 'frontend',
        agentName: 'Frontend Engineer',
        status: 'working'
    });

    await delay(1000);

    socket.emit('agent:status', {
        agentId: 'pm',
        agentName: 'Project Manager',
        status: 'idle'
    });

    await delay(1500);

    // More messages
    socket.emit('agent:message', {
        from: 'frontend',
        fromName: 'Frontend Engineer',
        to: 'design',
        content: 'Need design specs for the activity feed component'
    });

    await delay(1500);

    socket.emit('agent:message', {
        from: 'design',
        fromName: 'Design Agent',
        to: 'frontend',
        content: 'I\'ll prepare the design tokens and component specs'
    });

    console.log('\n✨ Demo completed! Check the Activity Feed in the dashboard.');
    console.log('📍 Dashboard: http://localhost:3000/\n');

    // Keep connection alive for a bit
    await delay(5000);
    socket.disconnect();
    process.exit(0);
}

socket.on('connect', () => {
    console.log('✅ Connected to server\n');
    runDemo().catch(console.error);
});

socket.on('connect_error', (error) => {
    console.error('❌ Connection error:', error.message);
    process.exit(1);
});
