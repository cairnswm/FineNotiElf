<?php
include_once dirname(__FILE__) . "/corsheaders.php";
include_once dirname(__FILE__) . "/gapiv2/dbconn.php";
include_once dirname(__FILE__) . "/gapiv2/v2apicore.php";
include_once dirname(__FILE__) . "/utils.php";
include_once dirname(__FILE__) . "/security/security.config.php";

// Get authentication details
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
$userid = $user->id;

// Define the configurations
$klokoconfigs = [
    "invite" => [
        'tablename' => 'Invite',
        'key' => 'id',
        'select' => ['id', 'to_email', 'from_id', 'from_name', 'from_email', 'document_id', 'reason', 'status', 'created_at', 'updated_at'],
        'create' => ['to_email', 'from_id', 'from_name', 'from_email', 'document_id', 'reason', 'status'],
        'update' => ['status'],
        'delete' => true,
        'beforeselect' => 'checkInviteSecurity',
        'beforecreate' => 'beforeCreateInvite',
        'beforeupdate' => 'checkInviteSecurity',
        'beforedelete' => 'checkInviteSecurity'
    ],
    "folders" => [
        'tablename' => 'Folders',
        'key' => 'id',
        'select' => ['id', 'name', 'owner_id', 'parent_id', 'created_at', 'updated_at'],
        'create' => ['name', 'owner_id', 'parent_id'],
        'update' => ['name', 'parent_id'],
        'delete' => true,
        'beforeselect' => 'checkFolderSecurity',
        'beforecreate' => 'beforeCreateFolder',
        'beforeupdate' => 'checkFolderSecurity',
        'beforedelete' => 'checkFolderSecurity',
        'subkeys' => [
            'documents' => [
                'tablename' => 'DocumentOwnership',
                'key' => 'folder_id',
                'select' => ['id', 'document_id', 'owner_id', 'folder_id', 'readonly', 'created_at', 'updated_at'],
                'beforeselect' => 'checkDocumentOwnershipSecurity'
            ]
        ]
    ],
    "documents" => [
        'tablename' => 'Documents',
        'key' => 'id',
        'select' => ['id', 'title', 'owner_id', 'type', 'content', 'readonly', 'editing_id', 'created_at', 'updated_at'],
        'create' => ['title', 'owner_id', 'type', 'content', 'readonly', 'editing_id'],
        'update' => ['title', 'content', 'readonly', 'editing_id'],
        'delete' => true,
        'beforeselect' => 'checkDocumentSecurity',
        'beforecreate' => 'beforeCreateDocument',
        'beforeupdate' => 'checkDocumentSecurity',
        'beforedelete' => 'checkDocumentSecurity',
        'subkeys' => [
            'ownership' => [
                'tablename' => 'DocumentOwnership',
                'key' => 'document_id',
                'select' => ['id', 'document_id', 'owner_id', 'folder_id', 'readonly', 'created_at', 'updated_at'],
                'beforeselect' => 'checkDocumentOwnershipSecurity'
            ]
        ]
    ],
    "documentownership" => [
        'tablename' => 'DocumentOwnership',
        'key' => 'id',
        'select' => ['id', 'document_id', 'owner_id', 'folder_id', 'readonly', 'created_at', 'updated_at'],
        'create' => ['document_id', 'owner_id', 'folder_id', 'readonly'],
        'update' => ['folder_id', 'readonly'],
        'delete' => true,
        'beforeselect' => 'checkDocumentOwnershipSecurity',
        'beforecreate' => 'beforeCreateDocumentOwnership',
        'beforeupdate' => 'checkDocumentOwnershipSecurity',
        'beforedelete' => 'checkDocumentOwnershipSecurity'
    ],
    "userdocuments" => [
        'tablename' => 'UserDocuments',
        'key' => 'id',
        'select' => ['id', 'user_id', 'document_id', 'folder_id', 'created_at', 'updated_at'],
        'create' => ['user_id', 'document_id', 'folder_id'],
        'update' => ['folder_id'],
        'delete' => true,
        'beforeselect' => 'checkUserDocumentsSecurity',
        'beforecreate' => 'beforeCreateUserDocuments',
        'beforeupdate' => 'checkUserDocumentsSecurity',
        'beforedelete' => 'checkUserDocumentsSecurity'
    ],
    "post" => [
        'getinvites' => 'getInvites',
        'acceptinvite' => 'acceptInvite',
        'declineinvite' => 'declineInvite',
        'getuserdocuments' => 'getUserDocuments'
    ]
];

// Security and hook functions
function checkInviteSecurity($config, $id = null)
{
    global $userid;
    
    if ($id) {
        // For specific invite, check if user is the sender or recipient
        $config['where']['from_id'] = $userid;
    } else {
        // For listing invites, only show those related to the user
        $config['where']['from_id'] = $userid;
    }
    
    return [$config, $id];
}

function beforeCreateInvite($config, $data)
{
    global $userid;
    
    // Set the from_id to the current user
    $data['from_id'] = $userid;
    
    return [$config, $data];
}

function checkFolderSecurity($config, $id = null)
{
    global $userid;
    
    if ($id) {
        // For specific folder, check if user is the owner
        $config['where']['owner_id'] = $userid;
    } else {
        // For listing folders, only show those owned by the user
        $config['where']['owner_id'] = $userid;
    }
    
    return [$config, $id];
}

function beforeCreateFolder($config, $data)
{
    global $userid;
    
    // Set the owner_id to the current user
    $data['owner_id'] = $userid;
    
    return [$config, $data];
}

function checkDocumentSecurity($config, $id = null)
{
    global $userid;
    
    if ($id) {
        // For specific document, check if user is the owner or has access through DocumentOwnership
        $config['where']['owner_id'] = $userid;
    } else {
        // For listing documents, only show those owned by the user or shared with them
        $config['where']['owner_id'] = $userid;
    }
    
    return [$config, $id];
}

function beforeCreateDocument($config, $data)
{
    global $userid;
    
    // Set the owner_id to the current user
    $data['owner_id'] = $userid;
    
    return [$config, $data];
}

function checkDocumentOwnershipSecurity($config, $id = null)
{
    global $userid;
    
    if ($id) {
        // For specific ownership record, check if user is the owner
        $config['where']['owner_id'] = $userid;
    } else {
        // For listing ownership records, only show those related to the user
        $config['where']['owner_id'] = $userid;
    }
    
    return [$config, $id];
}

function beforeCreateDocumentOwnership($config, $data)
{
    global $userid;
    
    // Set the owner_id to the current user
    $data['owner_id'] = $userid;
    
    return [$config, $data];
}

function checkUserDocumentsSecurity($config, $id = null)
{
    global $userid;
    
    if ($id) {
        // For specific user document record, check if it belongs to the user
        $config['where']['user_id'] = $userid;
    } else {
        // For listing user documents, only show those belonging to the user
        $config['where']['user_id'] = $userid;
    }
    
    return [$config, $id];
}

function beforeCreateUserDocuments($config, $data)
{
    global $userid;
    
    // Set the user_id to the current user
    $data['user_id'] = $userid;
    
    return [$config, $data];
}

function getInvites($data)
{
    global $userid;
    
    // Get user email from token or database
    $userEmail = getUserEmail($userid);
    
    // Execute SQL query to get the invites for the email
    $sql = "SELECT Invite.id, Invite.to_email, Invite.from_id, Invite.from_name, Invite.from_email, Invite.document_id, Documents.title document_title, Invite.reason, Invite.created_at, Invite.status
            FROM Invite, Documents
            WHERE to_email = ?
            AND Invite.document_id = Documents.id
            AND Invite.status = 'sent'";
    
    $stmt = executeSQL($sql, [$userEmail]);
    
    // Bind result variables
    $stmt->bind_result($id, $to_email, $from_id, $from_name, $from_email, $document_id, $document_title, $reason, $created_at, $status);
    
    // Fetch all invites
    $invites = [];
    
    while ($stmt->fetch()) {
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
    
    return $invites;
}

function acceptInvite($data)
{
    global $userid;
    
    if (!isset($data['invite_id'])) {
        return ['error' => true, 'message' => 'Invite ID is required'];
    }
    
    $inviteId = $data['invite_id'];
    
    // Update invite status
    $sql = "UPDATE Invite SET status = 'accepted' WHERE id = ?";
    executeSQL($sql, [$inviteId]);
    
    // Get invite details
    $sql = "SELECT document_id, folder_id FROM Invite WHERE id = ?";
    $stmt = executeSQL($sql, [$inviteId]);
    $stmt->bind_result($documentId, $folderId);
    $stmt->fetch();
    $stmt->close();
    
    // Create document ownership record
    $sql = "INSERT INTO DocumentOwnership (document_id, owner_id, folder_id) VALUES (?, ?, ?)";
    executeSQL($sql, [$documentId, $userid, $folderId]);
    
    return ['success' => true, 'message' => 'Invite accepted successfully'];
}

function declineInvite($data)
{
    if (!isset($data['invite_id'])) {
        return ['error' => true, 'message' => 'Invite ID is required'];
    }
    
    $inviteId = $data['invite_id'];
    
    // Update invite status
    $sql = "UPDATE Invite SET status = 'declined' WHERE id = ?";
    executeSQL($sql, [$inviteId]);
    
    return ['success' => true, 'message' => 'Invite declined successfully'];
}

function getUserDocuments($data)
{
    global $userid;
    
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
    
    $stmt = executeSQL($sql, [$userid, $userid]);
    
    // Bind result variables
    $stmt->bind_result($id, $name, $type, $parent_id, $owner, $created_at, $updated_at, $children_json);
    
    // Fetch all documents in the hierarchy
    $documents = [];
    
    while ($stmt->fetch()) {
        // Create an associative array manually
        $row = [
            'id' => $id,
            'name' => $name,
            'type' => $type,
            'parent_id' => $parent_id,
            'owner' => $owner,
            'created_at' => $created_at,
            'updated_at' => $updated_at,
            'children' => json_decode($children_json)
        ];
        
        $documents[] = $row;
    }
    
    $stmt->close();
    
    return $documents;
}

// Helper function to get user email
function getUserEmail($userId)
{
    $sql = "SELECT email FROM Users WHERE id = ?";
    $stmt = executeSQL($sql, [$userId]);
    $stmt->bind_result($email);
    $stmt->fetch();
    $stmt->close();
    
    return $email;
}

// Run the API with the configurations
runAPI($klokoconfigs);
