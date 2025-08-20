<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed. Use POST.']);
    exit;
}

// Your Unity credentials (keep these secret!)
$PROJECT_ID = 'be851ebb-0f03-46aa-97c6-98fd39d04988';
$API_KEY = 'your-unity-api-key';

try {
    // Get and decode JSON data
    $json_input = file_get_contents('php://input');
    $input = json_decode($json_input, true);
    
    // Debug: Log what we received
    error_log('Received data: ' . $json_input);
    
    // Validate data
    if (empty($input['data'])) {
        http_response_code(400);
        echo json_encode(['error' => 'No data provided']);
        exit;
    }
    
    $data = $input['data'];
    
    // Validate required fields
    if (empty($data['firstName']) || empty($data['lastName'])) {
        http_response_code(400);
        echo json_encode(['error' => 'First name and last name are required']);
        exit;
    }
    
    // Step 1: Anonymous Sign In
    error_log('Step 1: Starting anonymous authentication...');
    
    $auth_url = "https://player-auth.services.api.unity.com/v1/authentication/anonymous";
    
    // Setup cURL for authentication
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $auth_url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'ProjectId: ' . $PROJECT_ID
    ]);

    // Execute authentication request
    $auth_response = curl_exec($ch);
    $auth_http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    error_log('Auth response code: ' . $auth_http_code);
    error_log('Auth response: ' . $auth_response);
    
    if ($auth_http_code !== 200) {
        error_log('Authentication failed: ' . $auth_response);
        http_response_code(500);
        echo json_encode(['error' => 'Authentication failed', 'details' => $auth_response]);
        exit;
    }
    
    // Parse authentication response
    $auth_result = json_decode($auth_response, true);
    if (!$auth_result || !isset($auth_result['userId']) || !isset($auth_result['idToken'])) {
        error_log('Invalid auth response format: ' . $auth_response);
        http_response_code(500);
        echo json_encode(['error' => 'Invalid authentication response']);
        exit;
    }
    
    $player_id = $auth_result['userId'];
    $access_token = $auth_result['idToken'];
    
    error_log('Authentication successful. Player ID: ' . $player_id);
    
    // Step 2: Save data to Unity Cloud Save
    error_log('Step 2: Saving data to Cloud Save...');
    
    $formatted_value = $data['firstName'] . ' - ' . $data['lastName'];  
    
    // Use "Player name" as the fixed key
    $item_key = "full-name";
    
    error_log('Using key: ' . $item_key);
    error_log('Using value: ' . $formatted_value);
    
    // Prepare data for Unity Cloud Save
    $unity_data = [
        'key' => $item_key,
        'value' => $formatted_value
    ];
   
    // Unity Cloud Save API endpoint
    $save_url = "https://cloud-save.services.api.unity.com/v1/data/projects/$PROJECT_ID/players/$player_id/items";

    
    // Setup cURL for Cloud Save
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $save_url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($unity_data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $access_token,
    ]);
    
    // Execute save request
    $save_response = curl_exec($ch);
    $save_http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    error_log('Save response code: ' . $save_http_code);
    error_log('Save response: ' . $save_response);
    
    if ($save_http_code == 200 || $save_http_code == 201) {
        echo json_encode([
            'success' => true, 
            'message' => 'Data saved to Unity Cloud Save successfully',
            'playerId' => $player_id,
            'data_saved' => $data
        ]);
        error_log('SUCCESS: Data saved to Unity Cloud Save');
    } else {
        error_log('Cloud Save failed: ' . $save_response);
        http_response_code(500);
        echo json_encode([
            'error' => 'Failed to save to Unity Cloud Save', 
            'details' => $save_response,
            'http_code' => $save_http_code
        ]);
    }
    
} catch (Exception $e) {
    error_log('PHP Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>