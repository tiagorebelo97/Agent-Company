async function test() {
    const baseUrl = 'http://localhost:3001/api';
    const projectId = '879e8a61-14af-471b-9783-ce444e390163';

    console.log("--- Testing File Listing ---");
    const filesRes = await fetch(`${baseUrl}/projects/${projectId}/files`);
    const filesData = await filesRes.json();
    console.log("Files found:", filesData.files?.length);
    if (filesData.files?.length > 0) {
        console.log("First file:", filesData.files[0].name);
    } else {
        console.log("Error or empty files:", filesData.error);
    }

    console.log("\n--- Testing Repository Analysis ---");
    const anaRes = await fetch(`${baseUrl}/projects/${projectId}/analyze`, { method: 'POST' });
    const anaData = await anaRes.json();
    console.log("Analysis Result:", anaData);

}

test();
