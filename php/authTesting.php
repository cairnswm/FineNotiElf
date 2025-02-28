<?php
header('Content-Type: application/json');

require_once 'dbconnection.php';
require_once './utils.php';
require_once './security/security.config.php';

echo "Issuer: $issuer\n";
echo "Subject: $subject\n";
echo "Audience: $audience\n";

$appid = getAppId();
echo $appid;

$token = getToken();
echo $token;

if (validateJwt($token, false) == false) {
    http_response_code(401);
    echo json_encode([
        'error' => true,
        'message' => 'Unauthorized'
    ]);
    die();
}

$user = getUserFromToken($token);
var_dump($user);
