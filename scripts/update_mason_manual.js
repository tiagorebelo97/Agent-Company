import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const projectId = "879e8a61-14af-471b-9783-ce444e390163";

    const analysisResults = {
        stack: "Vite, React, TypeScript, Supabase, Radix UI (shadcn/ui), TanStack Query",
        complexity: "Medium - Robust frontend with Supabase integration and OpenAI capabilities.",
        security: "Supabase authentication detected. Recommend reviewing RLS policies.",
        recommendations: [
            "Optimize TanStack Query caching for better UX.",
            "Verify Supabase RLS policies for all tables.",
            "Implement automated testing with Playwright for core flows.",
            "Review OpenAI token usage and cost monitoring."
        ],
        suggested_agents: ["frontend", "db", "security", "qa", "research"]
    };

    const suggestedAgents = ["frontend", "db", "security", "qa", "research"];

    console.log("Updating Mason project with manual analysis...");

    await prisma.project.update({
        where: { id: projectId },
        data: {
            analysisResults: JSON.stringify(analysisResults),
            suggestedAgents: JSON.stringify(suggestedAgents),
            localPath: "projects_cache/mason-manage"
        }
    });

    console.log("Done!");
    await prisma.$disconnect();
}

main();
