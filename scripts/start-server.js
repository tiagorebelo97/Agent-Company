/**
 * Start Server with Port Check
 * 
 * Checks if port is already in use before starting server
 * Prevents EADDRINUSE errors
 */

import net from 'net';
import { spawn } from 'child_process';

const PORT = process.env.PORT || 3001;

function checkPort(port) {
    return new Promise((resolve) => {
        const server = net.createServer();

        server.once('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                resolve(false); // Port is in use
            } else {
                resolve(true);
            }
        });

        server.once('listening', () => {
            server.close();
            resolve(true); // Port is available
        });

        server.listen(port);
    });
}

async function startServer() {
    console.log(`🔍 Checking if port ${PORT} is available...`);

    const isAvailable = await checkPort(PORT);

    if (!isAvailable) {
        console.error(`❌ Port ${PORT} is already in use!`);
        console.log(`\n💡 To fix this:`);
        console.log(`   1. Find process: Get-NetTCPConnection -LocalPort ${PORT}`);
        console.log(`   2. Kill process: Stop-Process -Id <PID> -Force`);
        console.log(`   Or run: npm run kill-port\n`);
        process.exit(1);
    }

    console.log(`✅ Port ${PORT} is available`);
    console.log(`🚀 Starting server...\n`);

    // Start the actual server
    const server = spawn('node', ['src/server.js'], {
        stdio: 'inherit',
        env: process.env
    });

    server.on('error', (err) => {
        console.error('Failed to start server:', err);
        process.exit(1);
    });

    server.on('exit', (code) => {
        if (code !== 0) {
            console.error(`Server exited with code ${code}`);
        }
        process.exit(code);
    });
}

startServer();
