<?php
header('Content-Type: application/json');

require_once 'dbconnection.php';
require_once './utils.php';
require_once './security/security.config.php';

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

$user = getUserFromToken($token);


try {
    // Get the ID parameter
    $id = $user->id;
    
    if (!$id) {
        throw new Exception("ID parameter is required");
    }
    
    // Execute SQL query to get the user document hierarchy
    $sql = "WITH Recursive FolderHierarchy AS (
        -- Base case: Get the root folder for the user
        SELECT 
            id,
            name,
            'folder' AS type,
            parent_id,
            owner_id,
            created_at,
            updated_at
        FROM Folders
        WHERE parent_id IS NULL AND owner_id = ?

        UNION ALL

        -- Recursive case: Get all nested folders
        SELECT 
            f.id,
            f.name,
            'folder' AS type,
            f.parent_id,
            f.owner_id,
            f.created_at,
            f.updated_at
        FROM Folders f
        INNER JOIN FolderHierarchy fh ON f.parent_id = fh.id
    )

    SELECT 
        fh.id,
        fh.name,
        fh.type,
        fh.parent_id,
        fh.owner_id AS owner,
        fh.created_at,
        fh.updated_at,
        COALESCE(
            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', d.id,
                        'name', d.title,
                        'type', d.type,
                        'content', d.content,
                        'owner', d.owner_id,
                        'readonly', do.readonly
                    )
                )
                FROM DocumentOwnership do
                JOIN Documents d ON do.document_id = d.id
                WHERE do.folder_id = fh.id AND d.owner_id = ?
            ),
            '[]'
        ) AS children
    FROM FolderHierarchy fh
    ORDER BY fh.parent_id, fh.id";
    
    $stmt = executeSQL($sql, [$id, $id]);
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception("No document found with ID: $id");
    }
    
    // Fetch all documents in the hierarchy
    $documents = [];
    while ($row = $result->fetch_assoc()) {
        // Convert children field from string to object
        if (isset($row['children']) && !empty($row['children'])) {
            $row['children'] = json_decode($row['children']);
            
            // Check if JSON decoding failed
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new Exception("Failed to parse children field: " . json_last_error_msg());
            }
        }
        
        $documents[] = $row;
    }
    $stmt->close();
    
    // Return the documents as JSON
    echo json_encode($documents);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => true,
        'message' => $e->getMessage()
    ]);
}
