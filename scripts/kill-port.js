/**
 * Kill Process on Port
 * 
 * Utility to kill any process using a specific port
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const PORT = process.env.PORT || 3001;

async function killPort(port) {
    console.log(`🔍 Looking for processes on port ${port}...`);

    try {
        // Windows command to find and kill process
        const findCmd = `Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess`;
        const { stdout } = await execAsync(findCmd, { shell: 'powershell.exe' });

        if (!stdout.trim()) {
            console.log(`✅ No process found on port ${port}`);
            return;
        }

        const pids = stdout.trim().split('\n').map(pid => pid.trim()).filter(Boolean);

        console.log(`📋 Found ${pids.length} process(es): ${pids.join(', ')}`);

        for (const pid of pids) {
            try {
                await execAsync(`Stop-Process -Id ${pid} -Force`, { shell: 'powershell.exe' });
                console.log(`✅ Killed process ${pid}`);
            } catch (err) {
                console.warn(`⚠️  Could not kill process ${pid}:`, err.message);
            }
        }

        console.log(`\n✅ Port ${port} is now free!`);
    } catch (error) {
        console.error(`❌ Error:`, error.message);
        process.exit(1);
    }
}

killPort(PORT);
