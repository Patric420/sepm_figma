const fs = require('fs');

// Microsoft Graph PowerShell public Client ID
const CLIENT_ID = '14d82eec-204b-4c2f-b7e8-296a70dab67e'; 
const TENANT_ID = 'common'; 
const PLAN_ID = 'j2_Lq8lys0aQQUJKNTut0MkAFR0I';

async function run() {
    console.log("Initiating Device Code flow...");
    const initRes = await fetch(`https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/devicecode`, {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({
            client_id: CLIENT_ID,
            scope: 'Tasks.ReadWrite Group.ReadWrite.All offline_access'
        })
    });
    
    if (!initRes.ok) {
        console.error("Auth init failed:", await initRes.text());
        process.exit(1);
    }
    
    const deviceInit = await initRes.json();
    
    console.log("\n=======================================================");
    console.log(`To securely sign in, open this page in your browser:`);
    console.log(`----> ${deviceInit.verification_uri} <----`);
    console.log(`\nAnd enter the code: ${deviceInit.user_code}`);
    console.log("=======================================================\n");
    console.log("Waiting for your approval...");

    let token = null;
    while (!token) {
        await new Promise(r => setTimeout(r, deviceInit.interval * 1000));
        const tokenRes = await fetch(`https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: new URLSearchParams({
                grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
                client_id: CLIENT_ID,
                device_code: deviceInit.device_code
            })
        });
        const tokenData = await tokenRes.json();
        
        if (tokenData.access_token) {
            token = tokenData.access_token;
            console.log("Successfully authenticated!");
        } else if (tokenData.error !== 'authorization_pending') {
            console.error("Auth error:", tokenData);
            process.exit(1);
        }
    }

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    console.log("Fetching Buckets from your Plan...");
    const bRes = await fetch(`https://graph.microsoft.com/v1.0/planner/plans/${PLAN_ID}/buckets`, { headers });
    if (!bRes.ok) {
        console.error("Failed to fetch buckets", await bRes.text());
        process.exit(1);
    }
    const bData = await bRes.json();
    const existingBuckets = bData.value || [];

    async function addBucket(name) {
        let b = existingBuckets.find(x => x.name === name);
        if (b) return b.id;
        console.log(`Creating bucket: ${name}`);
        const res = await fetch(`https://graph.microsoft.com/v1.0/planner/buckets`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ name, planId: PLAN_ID })
        });
        if (!res.ok) console.error(await res.text());
        const data = await res.json();
        return data.id;
    }

    const b1 = await addBucket("📌 1. Setup & Design");
    const b2 = await addBucket("💻 2. Frontend Engineering");
    const b3 = await addBucket("⚙️ 3. Backend Engineering");
    const b4 = await addBucket("🚀 4. Active Sprint (To-Do)");
    const b5 = await addBucket("📈 5. Launch & Marketing");

    async function addTask(bucketId, title, desc, percent) {
        const payloadStr = JSON.stringify({
            planId: PLAN_ID,
            bucketId,
            title,
            percentComplete: percent
        });
        console.log(`Adding task: ${title}`);
        const taskRes = await fetch(`https://graph.microsoft.com/v1.0/planner/tasks`, {
            method: 'POST',
            headers,
            body: payloadStr
        });
        const task = await taskRes.json();

        if (desc && task.id) {
            await new Promise(r => setTimeout(r, 1000));
            let dRes = await fetch(`https://graph.microsoft.com/v1.0/planner/tasks/${task.id}/details`, { headers });
            let dData = await dRes.json();
            
            if (dData['@odata.etag']) {
                await fetch(`https://graph.microsoft.com/v1.0/planner/tasks/${task.id}/details`, {
                    method: 'PATCH',
                    headers: { ...headers, 'If-Match': dData['@odata.etag'] },
                    body: JSON.stringify({ description: desc })
                });
            }
        }
    }

    console.log("Creating Tasks...");
    await addTask(b1, "UI/UX Wireframing & Design", "Translating initial SaaS Figma designs to focus on the AutoSOW concept with a unified color palette and typography (Inter).", 100);
    await addTask(b1, "Initial Scaffolding", "Setting up the Vite React frontend and Node.js Express backend running concurrently. Setup Tailwind CSS.", 100);

    await addTask(b2, "Authentication Flow UI", "Implementing the modal for User Sign-Up and Login, managing global state.", 100);
    await addTask(b2, "Specialized AutoSOW Dashboard", "Building dual-pane UI component for transcript input and SOW generation preview.", 100);
    await addTask(b2, "UI Theme & Dark Mode", "Handling seamless dark mode toggling mirroring OS-level preferences.", 100);

    await addTask(b3, "JWT Security Implementation", "Securing API endpoints using bcryptjs and jsonwebtoken.", 100);
    await addTask(b3, "SOW API Endpoint", "Building express route to accept transcripts and return mock Markdown SOW docs.", 100);
    await addTask(b3, "Waitlist Lead Capture", "Endpoint to capture emails from the hero section.", 100);

    await addTask(b4, "Real LLM API Integration", "Replace simulated timeout with an actual call to OpenAI Anthropic APIs to parse transcripts.", 0);
    await addTask(b4, "File Upload Support", "Allow users to upload physical transcription files replacing raw text paste.", 0);
    await addTask(b4, "PDF Export Functionality", "Add Download as PDF button next to Copy Markdown.", 0);

    await addTask(b5, "Setup Email Campaigns", "Email sequence for leads from leads.json.", 0);
    await addTask(b5, "Record Demo Walkthrough", "Create a high-quality screen recording demonstrating the core value loop.", 0);

    console.log("Success! All tasks injected to Microsoft Planner.");
    process.exit(0);
}

run().catch(e => console.error(e));
