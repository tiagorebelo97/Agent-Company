const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/projects',
    method: 'GET'
};

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        const data = JSON.parse(body);
        const mason = data.projects.find(p => p.name === 'Mason');

        console.log('Mason project found:', !!mason);
        console.log('Has businessModel field:', 'businessModel' in mason);
        console.log('businessModel value:', mason.businessModel ? mason.businessModel.substring(0, 100) + '...' : 'NULL/UNDEFINED');
        console.log('businessModel length:', mason.businessModel?.length || 0);

        if (!mason.businessModel || mason.businessModel === '{}') {
            console.log('\n❌ PROBLEM: API is not returning businessModel field!');
        } else {
            console.log('\n✅ API returns businessModel correctly');
        }
    });
});

req.on('error', (e) => {
    console.error('ERROR:', e.message);
});

req.end();
