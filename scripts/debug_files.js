import fs from 'fs';
import path from 'path';

const projectPath = 'projects_cache/mason-manage';
const absolutePath = path.resolve(process.cwd(), projectPath);

console.log("Absolute Path:", absolutePath);

const listFiles = async (dir, baseDir) => {
    try {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });
        const files = await Promise.all(entries.map(async (entry) => {
            const fullPath = path.join(dir, entry.name);
            const relativePath = path.relative(baseDir, fullPath);

            if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.next' || entry.name === 'dist') {
                return null;
            }

            if (entry.isDirectory()) {
                const children = await listFiles(fullPath, baseDir);
                return {
                    name: entry.name,
                    path: relativePath,
                    type: 'directory',
                    children: children
                };
            } else {
                return {
                    name: entry.name,
                    path: relativePath,
                    type: 'file'
                };
            }
        }));
        return files.filter(Boolean);
    } catch (e) {
        console.error("Error listing files in", dir, e);
        return [];
    }
};

listFiles(absolutePath, absolutePath).then(files => {
    console.log("Files found:", files.length);
    if (files.length > 0) {
        console.log("Structure:", JSON.stringify(files.slice(0, 3), null, 2));
    }
});
