<?php

include_once __DIR__ . "/corsheaders.php";

header('Content-Type: application/json');

include_once 'dbconnection.php';
include_once './utils.php';
include_once './security/security.config.php';

error_reporting(E_ALL);
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');

$appid = getAppId();

$token = getToken();

if (validateJwt($token, false) == false) {
    http_response_code(401);
    echo json_encode([
        'error' => true,
        'message' => 'Unauthorized'
    ]);
    die();
}

try {
    // Get the email parameter from query string
    $email = isset($_GET['email']) ? $_GET['email'] : null;
    
    if (!$email) {
        throw new Exception("Email parameter is required");
    }
    
    // Execute SQL query to get the invites for the email
    $sql = "SELECT Invite.id, Invite.to_email, Invite.from_id, Invite.from_name, Invite.from_email, Invite.document_id, Documents.title document_title, Invite.reason, Invite.created_at, Invite.status
            FROM Invite, Documents
            WHERE to_email = ?
            AND Invite.document_id = Documents.id
            AND Invite.status = 'sent'";
    
    $stmt = executeSQL($sql, [$email]);
    
    // Bind result variables
    $stmt->bind_result($id, $to_email, $from_id, $from_name, $from_email, $document_id, $document_title, $reason, $created_at, $status);
    
    // Fetch all invites
    $invites = [];
    $hasResults = false;
    
    while ($stmt->fetch()) {
        $hasResults = true;
        
        // Create an associative array manually
        $row = [
            'id' => $id,
            'to_email' => $to_email,
            'from_id' => $from_id,
            'from_name' => $from_name,
            'from_email' => $from_email,
            'document_id' => $document_id,
            'document_title' => $document_title,
            'reason' => $reason,
            'created_at' => $created_at,
            'status' => $status
        ];
        
        $invites[] = $row;
    }
    
    $stmt->close();
    
    // Return the invites as JSON
    echo json_encode($invites);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => $e->getMessage()
    ]);
}
