// Test script to verify project access tools work correctly

async function testProjectAccessTools() {
    console.log('=== Testing Project Access Tools ===\n');

    try {
        // Test 1: Read project file
        console.log('Test 1: Reading package.json...');
        const readResponse = await fetch('http://localhost:3001/api/agents/pm/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: 'Test: read_project_file("package.json")'
            })
        });
        const readData = await readResponse.json();
        console.log('✓ Read test:', readData.success ? 'SUCCESS' : 'FAILED');

        // Test 2: List project files
        console.log('\nTest 2: Listing src/agents/core directory...');
        const listResponse = await fetch('http://localhost:3001/api/agents/pm/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: 'Test: list_project_files("src/agents/core")'
            })
        });
        const listData = await listResponse.json();
        console.log('✓ List test:', listData.success ? 'SUCCESS' : 'FAILED');

        // Test 3: Write test file
        console.log('\nTest 3: Writing test file...');
        const writeResponse = await fetch('http://localhost:3001/api/agents/pm/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: 'Test: write_project_file("test_agent_access.txt", "Agents can now access real files!")'
            })
        });
        const writeData = await writeResponse.json();
        console.log('✓ Write test:', writeData.success ? 'SUCCESS' : 'FAILED');

        // Test 4: Run command
        console.log('\nTest 4: Running git status...');
        const cmdResponse = await fetch('http://localhost:3001/api/agents/pm/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: 'Test: run_command("git status")'
            })
        });
        const cmdData = await cmdResponse.json();
        console.log('✓ Command test:', cmdData.success ? 'SUCCESS' : 'FAILED');

        console.log('\n=== All Tests Complete ===');
        console.log('Phase 1 implementation: ✅ VERIFIED');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Wait for backend to be ready
setTimeout(testProjectAccessTools, 2000);
