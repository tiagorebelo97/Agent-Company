const io = require('socket.io-client');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function triggerProjectUpdate() {
    try {
        // Get the updated project
        const project = await prisma.project.findUnique({
            where: { id: '879e8a61-14af-471b-9783-ce444e390163' }
        });

        console.log('Project found:', project.name);
        console.log('BusinessModel length:', project.businessModel?.length);

        // Connect to WebSocket
        const socket = io('http://localhost:3001');

        socket.on('connect', () => {
            console.log('✅ Connected to WebSocket');

            // Emit project:updated event
            socket.emit('project:updated', project);
            console.log('📡 Emitted project:updated event');

            setTimeout(() => {
                socket.disconnect();
                console.log('\n🎉 Done! Refresh your browser now.');
                process.exit(0);
            }, 1000);
        });

        socket.on('connect_error', (error) => {
            console.error('❌ WebSocket connection error:', error.message);
            process.exit(1);
        });

    } catch (error) {
        console.error('❌ ERROR:', error.message);
        process.exit(1);
    }
}

triggerProjectUpdate();
