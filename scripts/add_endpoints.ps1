$file = "src\server.js"
$content = Get-Content $file -Raw
$insertAfter = "    }
});"

$newEndpoints = @"

/**
 * GET /api/projects/:id/files/:path
 * Read file content
 */
app.get('/api/projects/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absoluteProjectPath = path.resolve(process.cwd(), project.localPath);
        const absoluteFilePath = path.resolve(absoluteProjectPath, filePath);

        if (!absoluteFilePath.startsWith(absoluteProjectPath)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        if (!fs.existsSync(absoluteFilePath)) {
            return res.status(404).json({ success: false, error: 'File not found' });
        }

        const content = fs.readFileSync(absoluteFilePath, 'utf-8');
        res.json({ success: true, content, path: filePath });
    } catch (error) {
        logger.error('Error reading file:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * PUT /api/projects/:id/files/:path
 * Write file content
 */
app.put('/api/projects/:id/files/:path(*)', async (req, res) => {
    try {
        const { id, path: filePath } = req.params;
        const { content } = req.body;
        const project = await prisma.project.findUnique({ where: { id } });

        if (!project || !project.localPath) {
            return res.status(404).json({ success: false, error: 'Project or local path not found' });
        }

        const absoluteProjectPath = path.resolve(process.cwd(), project.localPath);
        const absoluteFilePath = path.resolve(absoluteProjectPath, filePath);

        if (!absoluteFilePath.startsWith(absoluteProjectPath)) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }

        fs.writeFileSync(absoluteFilePath, content, 'utf-8');
        logger.info(`File updated: ${absoluteFilePath}`);
        res.json({ success: true, path: filePath });
    } catch (error) {
        logger.error('Error writing file:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
"@

# Find the position to insert (after the files listing endpoint)
$pattern = [regex]::Escape($insertAfter)
if ($content -match $pattern) {
    $content = $content -replace $pattern, ($insertAfter + $newEndpoints)
    Set-Content $file $content -NoNewline
    Write-Host "Endpoints added successfully!"
} else {
    Write-Host "Could not find insertion point"
}
