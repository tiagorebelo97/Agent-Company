/**
 * Test Agent Execution via BaseAgent
 * 
 * This tests the complete flow:
 * Node.js (BaseAgent) → Python Agent → File System Bridge → AgentFileSystem
 */

import BaseAgent from '../src/agents/core/BaseAgent.js';
import agentFileSystem from '../src/agents/utils/AgentFileSystem.js';
import logger from '../src/utils/logger.js';

async function testAgentExecution() {
    console.log('🧪 Testing Frontend Engineer Agent via BaseAgent\n');

    // Create Frontend Engineer agent
    const agent = new BaseAgent('frontend', 'Frontend Engineer', {
        role: 'Frontend Engineer',
        emoji: '⚛️',
        color: '#61dafb',
        category: 'development',
        skills: ['React', 'JavaScript', 'UI/UX'],
        folderName: 'FrontendEngineer'
    });

    console.log('📦 Starting Python agent process...');
    await agent.startPythonAgent();
    console.log('✅ Python agent started\n');

    // Create test task
    const task = {
        id: 'test-task-manual',
        type: 'feature_implementation',
        description: 'Add Task Statistics Widget to Dashboard',
        requirements: {
            title: 'Add Task Statistics Widget to Dashboard',
            description: 'Create a new component that displays task statistics: total tasks, tasks by status (todo, in_progress, review, done), and tasks by priority.',
            priority: 'medium',
            tags: ['frontend', 'dashboard', 'statistics']
        }
    };

    console.log('📋 Task Details:');
    console.log(`   Title: ${task.requirements.title}`);
    console.log(`   Description: ${task.requirements.description.substring(0, 80)}...`);
    console.log('');

    console.log('🚀 Executing task via BaseAgent...\n');

    try {
        const result = await agent.executeTask(task);

        console.log('\n✅ Task Execution Complete!\n');
        console.log('📊 Result:');
        console.log(`   Success: ${result.success}`);
        console.log(`   Message: ${result.message || 'No message'}`);

        if (result.files_modified && result.files_modified.length > 0) {
            console.log(`   Files Modified: ${result.files_modified.join(', ')}`);

            // Check if files actually exist
            console.log('\n📁 Verifying files:');
            for (const file of result.files_modified) {
                const fs = await import('fs/promises');
                try {
                    await fs.access(file);
                    const stats = await fs.stat(file);
                    console.log(`   ✅ ${file} (${stats.size} bytes)`);
                } catch (e) {
                    console.log(`   ❌ ${file} (not found)`);
                }
            }
        }

        // Check file system change log
        console.log('\n📝 AgentFileSystem Change Log:');
        const changes = agentFileSystem.getChangeHistory({ agentId: 'frontend' });
        if (changes.length > 0) {
            changes.forEach(change => {
                console.log(`   ${change.operation}: ${change.filePath}`);
            });
        } else {
            console.log('   No changes logged');
        }

        await agent.shutdown();
        return result;

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error.stack);
        await agent.shutdown();
        throw error;
    }
}

// Run test
testAgentExecution()
    .then(result => {
        if (result && result.success) {
            console.log('\n🎉 Test PASSED!');
            process.exit(0);
        } else {
            console.log('\n❌ Test FAILED!');
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('\n💥 Test crashed:', error.message);
        process.exit(1);
    });
