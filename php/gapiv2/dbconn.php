<?php

include_once __DIR__ . "/../notielfconfig.php";

// Create a global $gapiconn exists for the MySQL connection
global $gapiconn;
$gapiconn = new mysqli($notielfconfig["server"], $notielfconfig["username"], $notielfconfig["password"], $notielfconfig["database"]);

if ($gapiconn->connect_error) {
    die("Connection failed: " . $gapiconn->connect_error);
}

/**
 * Execute an SQL query with prepared statements
 * 
 * @param string $sql The SQL query with placeholders
 * @param array $params The parameters to bind to the query
 * @return mysqli_stmt The executed statement object
 */
function executeSQL($sql, $params = []) {
    global $gapiconn;
    
    $stmt = $gapiconn->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Error preparing statement: " . $gapiconn->error);
    }
    
    if (!empty($params)) {
        // Determine the types of the parameters
        $types = '';
        foreach ($params as $param) {
            if (is_int($param)) {
                $types .= 'i'; // Integer
            } elseif (is_float($param)) {
                $types .= 'd'; // Double
            } elseif (is_string($param)) {
                $types .= 's'; // String
            } else {
                $types .= 'b'; // Blob and other types
            }
        }
        
        // Create an array with references to the parameters
        $bindParams = array($types);
        foreach ($params as $key => $value) {
            $bindParams[] = &$params[$key];
        }
        
        // Bind the parameters to the statement
        call_user_func_array(array($stmt, 'bind_param'), $bindParams);
    }
    
    // Execute the statement
    if (!$stmt->execute()) {
        throw new Exception("Error executing statement: " . $stmt->error);
    }
    
    return $stmt;
}
