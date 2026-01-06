async function askPM() {
    console.log('💬 Asking Project Manager...\n');

    const message = "Preciso de criar um modelo de negocio, és tu o agent apropriado para isso ou preciso de outro?";

    try {
        const response = await fetch('http://localhost:3001/api/agents/pm/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: message,
                fromId: 'user', // Simulate user
                projectId: 'default' // Or a specific project ID if known
            })
        });

        const data = await response.json();

        if (data.success) {
            console.log('✅ Response received:');
            console.log('---------------------------------------------------');
            console.log(data.response);
            console.log('---------------------------------------------------');
        } else {
            console.error('❌ Failed to get response:', data.error || 'Unknown error');
        }
    } catch (error) {
        console.error('❌ Network error:', error.message);
    }
}

askPM();
