/**
 * Create Diverse Test Tasks
 * 
 * Creates a variety of tasks to test different agent capabilities
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestTasks() {
    console.log('🧪 Creating diverse test tasks for agent validation...\n');

    const tasks = [
        {
            title: 'Create Agent Performance Dashboard Widget',
            description: 'Build a React component that displays real-time agent performance metrics including tasks completed, success rate, average completion time, and current status. Use charts/graphs for visualization.',
            priority: 'high',
            tags: JSON.stringify(['frontend', 'dashboard', 'analytics', 'charts']),
            agentIds: ['frontend', 'design'],
            requirements: {
                features: [
                    'Real-time metrics display',
                    'Chart visualization (success rate, completion time)',
                    'Agent status indicators',
                    'Responsive design',
                    'Auto-refresh every 30s'
                ],
                techStack: ['React', 'inline styles', 'dark theme']
            }
        },
        {
            title: 'Implement Task Priority Queue System',
            description: 'Create a backend service that manages task prioritization using a priority queue algorithm. High priority tasks should be assigned first, with load balancing across available agents.',
            priority: 'high',
            tags: JSON.stringify(['backend', 'algorithms', 'task-management']),
            agentIds: ['backend'],
            requirements: {
                features: [
                    'Priority queue implementation',
                    'Load balancing algorithm',
                    'Agent availability checking',
                    'Task assignment optimization',
                    'API endpoints for queue management'
                ],
                techStack: ['Node.js', 'Express', 'Prisma']
            }
        },
        {
            title: 'Add Task Filtering and Search Component',
            description: 'Create a search and filter component for the TaskBoard that allows filtering by status, priority, assigned agents, tags, and date range. Include a search bar for text search.',
            priority: 'medium',
            tags: JSON.stringify(['frontend', 'ui', 'search', 'filters']),
            agentIds: ['frontend'],
            requirements: {
                features: [
                    'Multi-select filters (status, priority, agents, tags)',
                    'Date range picker',
                    'Text search with debouncing',
                    'Clear all filters button',
                    'Filter count badges',
                    'Smooth animations'
                ],
                techStack: ['React', 'hooks', 'dark theme']
            }
        },
        {
            title: 'Create Agent Collaboration Workflow',
            description: 'Implement a system where multiple agents can collaborate on complex tasks. Include task decomposition, subtask assignment, and progress tracking.',
            priority: 'medium',
            tags: JSON.stringify(['backend', 'collaboration', 'workflow']),
            agentIds: ['backend', 'architect'],
            requirements: {
                features: [
                    'Task decomposition logic',
                    'Subtask creation and assignment',
                    'Inter-agent communication',
                    'Progress aggregation',
                    'Dependency management'
                ],
                techStack: ['Node.js', 'WebSockets', 'Prisma']
            }
        },
        {
            title: 'Build Agent Activity Timeline Component',
            description: 'Create a visual timeline component showing agent activities over time. Display task starts, completions, status changes, and idle periods with color-coded events.',
            priority: 'low',
            tags: JSON.stringify(['frontend', 'visualization', 'timeline']),
            agentIds: ['frontend', 'design'],
            requirements: {
                features: [
                    'Horizontal timeline with time markers',
                    'Color-coded event types',
                    'Hover tooltips with details',
                    'Zoom and pan controls',
                    'Filter by agent',
                    'Export timeline as image'
                ],
                techStack: ['React', 'SVG', 'animations']
            }
        }
    ];

    console.log(`📝 Creating ${tasks.length} test tasks...\n`);

    for (const taskData of tasks) {
        const { agentIds, requirements, ...taskFields } = taskData;

        try {
            // Create task
            const task = await prisma.task.create({
                data: {
                    ...taskFields,
                    requirements: JSON.stringify(requirements),
                    status: 'todo'
                }
            });

            // Assign agents
            if (agentIds && agentIds.length > 0) {
                await Promise.all(
                    agentIds.map(agentId =>
                        prisma.taskAgent.create({
                            data: {
                                taskId: task.id,
                                agentId
                            }
                        })
                    )
                );
            }

            console.log(`✅ Created: "${task.title}"`);
            console.log(`   Priority: ${task.priority}`);
            console.log(`   Agents: ${agentIds.join(', ')}`);
            console.log('');

        } catch (error) {
            console.error(`❌ Failed to create task: ${taskData.title}`);
            console.error(`   Error: ${error.message}\n`);
        }
    }

    console.log('🎉 Test tasks created successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Total tasks: ${tasks.length}`);
    console.log(`   Frontend: 3 tasks`);
    console.log(`   Backend: 2 tasks`);
    console.log(`   High priority: 2 tasks`);
    console.log(`   Medium priority: 2 tasks`);
    console.log(`   Low priority: 1 task`);
    console.log('\n⏳ TaskMonitor will assign these within 30 seconds...');

    await prisma.$disconnect();
}

createTestTasks().catch(console.error);
