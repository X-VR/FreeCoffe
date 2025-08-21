// api/index.js
export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    // Your Unity credentials (keep these secret!)
    const PROJECT_ID = 'be851ebb-0f03-46aa-97c6-98fd39d04988';
    const API_KEY = 'your-unity-api-key';

    try {
        // Get JSON data from request body
        const input = req.body;
        
        // Debug: Log what we received
        console.log('Received data:', JSON.stringify(input));
        
        // Validate data
        if (!input.data) {
            return res.status(400).json({ error: 'No data provided' });
        }
        
        const data = input.data;
        
        // Validate required fields
        if (!data.firstName || !data.lastName) {
            return res.status(400).json({ error: 'First name and last name are required' });
        }
        
        // Step 1: Anonymous Sign In
        console.log('Step 1: Starting anonymous authentication...');
        
        const auth_url = "https://player-auth.services.api.unity.com/v1/authentication/anonymous";
        
        // Setup fetch for authentication
        const authResponse = await fetch(auth_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'ProjectId': PROJECT_ID
            }
        });
        
        console.log('Auth response code:', authResponse.status);
        
        const authResponseText = await authResponse.text();
        console.log('Auth response:', authResponseText);
        
        if (authResponse.status !== 200) {
            console.error('Authentication failed:', authResponseText);
            return res.status(500).json({ 
                error: 'Authentication failed', 
                details: authResponseText 
            });
        }
        
        // Parse authentication response
        let auth_result;
        try {
            auth_result = JSON.parse(authResponseText);
        } catch (parseError) {
            console.error('Failed to parse auth response:', parseError);
            return res.status(500).json({ error: 'Invalid authentication response format' });
        }
        
        if (!auth_result || !auth_result.userId || !auth_result.idToken) {
            console.error('Invalid auth response format:', authResponseText);
            return res.status(500).json({ error: 'Invalid authentication response' });
        }
        
        const player_id = auth_result.userId;
        const access_token = auth_result.idToken;
        
        console.log('Authentication successful. Player ID:', player_id);
        
        // Step 2: Save data to Unity Cloud Save
        console.log('Step 2: Saving data to Cloud Save...');
        
        const formatted_value = data.firstName + ' - ' + data.lastName;
        
        // Use "Player name" as the fixed key
        const item_key = "full-name";
        
        console.log('Using key:', item_key);
        console.log('Using value:', formatted_value);
        
        // Prepare data for Unity Cloud Save
        const unity_data = {
            key: item_key,
            value: formatted_value
        };
        
        // Unity Cloud Save API endpoint
        const save_url = `https://cloud-save.services.api.unity.com/v1/data/projects/${PROJECT_ID}/players/${player_id}/items`;
        
        // Setup fetch for Cloud Save
        const saveResponse = await fetch(save_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + access_token
            },
            body: JSON.stringify(unity_data)
        });
        
        console.log('Save response code:', saveResponse.status);
        
        const saveResponseText = await saveResponse.text();
        console.log('Save response:', saveResponseText);
        
        if (saveResponse.status === 200 || saveResponse.status === 201) {
            const successResponse = {
                success: true,
                message: 'Data saved to Unity Cloud Save successfully',
                playerId: player_id,
                data_saved: data
            };
            
            console.log(player_id);
            console.log('SUCCESS: Data saved to Unity Cloud Save');
            
            return res.status(200).json(successResponse);
        } else {
            console.error('Cloud Save failed:', saveResponseText);
            return res.status(500).json({
                error: 'Failed to save to Unity Cloud Save',
                details: saveResponseText,
                http_code: saveResponse.status
            });
        }
        
    } catch (error) {
        console.error('Server Error:', error.message);
        return res.status(500).json({ error: 'Server error: ' + error.message });
    }
}