/**
 * Create Backend and QA Test Tasks
 * 
 * Tests the new Backend Engineer and QA Agent capabilities
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createBackendQATasks() {
    console.log('🧪 Creating Backend and QA test tasks...\n');

    const tasks = [
        {
            title: 'Create User Authentication API',
            description: 'Build a complete user authentication API with login, register, logout endpoints. Include JWT token generation, password hashing, and session management.',
            priority: 'high',
            tags: JSON.stringify(['backend', 'api', 'auth', 'security']),
            agentIds: ['backend'],
            requirements: {
                endpoints: [
                    'POST /api/auth/register',
                    'POST /api/auth/login',
                    'POST /api/auth/logout',
                    'GET /api/auth/me'
                ],
                features: ['JWT tokens', 'Password hashing', 'Input validation', 'Error handling']
            }
        },
        {
            title: 'Write E2E Tests for TaskBoard',
            description: 'Create comprehensive Playwright tests for the TaskBoard component. Test task creation, drag-and-drop, status changes, filtering, and search functionality.',
            priority: 'high',
            tags: JSON.stringify(['testing', 'e2e', 'playwright', 'taskboard']),
            agentIds: ['qa'],
            requirements: {
                testCases: [
                    'Task creation flow',
                    'Drag and drop between columns',
                    'Status updates',
                    'Filter by priority/status',
                    'Search functionality'
                ]
            }
        },
        {
            title: 'Implement Task Analytics Service',
            description: 'Create a backend service that calculates task analytics: completion rates, average time to complete, agent performance metrics, and trend analysis.',
            priority: 'medium',
            tags: JSON.stringify(['backend', 'analytics', 'service']),
            agentIds: ['backend'],
            requirements: {
                features: [
                    'Calculate completion rates',
                    'Track average completion time',
                    'Agent performance metrics',
                    'Trend analysis over time',
                    'Export data as JSON/CSV'
                ]
            }
        },
        {
            title: 'Create Unit Tests for Agent Services',
            description: 'Write Jest unit tests for the AgentRegistry, TaskMonitor, and AgentFileSystem services. Test all major functions and edge cases.',
            priority: 'medium',
            tags: JSON.stringify(['testing', 'unit', 'jest', 'services']),
            agentIds: ['qa'],
            requirements: {
                services: ['AgentRegistry', 'TaskMonitor', 'AgentFileSystem'],
                coverage: 'Test all public methods and edge cases'
            }
        }
    ];

    console.log(`📝 Creating ${tasks.length} tasks...\n`);

    for (const taskData of tasks) {
        const { agentIds, requirements, ...taskFields } = taskData;

        try {
            const task = await prisma.task.create({
                data: {
                    ...taskFields,
                    requirements: JSON.stringify(requirements),
                    status: 'todo'
                }
            });

            if (agentIds && agentIds.length > 0) {
                await Promise.all(
                    agentIds.map(agentId =>
                        prisma.taskAgent.create({
                            data: { taskId: task.id, agentId }
                        })
                    )
                );
            }

            console.log(`✅ Created: "${task.title}"`);
            console.log(`   Agent: ${agentIds.join(', ')}`);
            console.log(`   Priority: ${task.priority}\n`);

        } catch (error) {
            console.error(`❌ Failed: ${taskData.title}`);
            console.error(`   Error: ${error.message}\n`);
        }
    }

    console.log('🎉 Backend and QA tasks created!');
    console.log('\n📊 Summary:');
    console.log(`   Backend tasks: 2`);
    console.log(`   QA tasks: 2`);
    console.log(`   Total: ${tasks.length}`);
    console.log('\n⏳ TaskMonitor will assign within 30s...');

    await prisma.$disconnect();
}

createBackendQATasks().catch(console.error);
