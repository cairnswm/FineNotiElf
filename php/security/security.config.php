<?php
include_once __DIR__."/jwt.php";
include_once __DIR__."/../cairnsgames/permissionfunctions.php";

$issuer = getSecret("jwt_issuer", "cairnsgames.co.za");
$subject = getSecret("jwt_subject", "cairnsgames token");
$audience = getSecret("jwt_audience", "cairnsgames client");



$defaultConfig = array("issuer"=>$issuer,"subject"=>$subject,"audience"=>$audience);

$JWTSECRET = getSecret("SECURE_SECRET","cairnsgameSUPERsecretPASSWORD");
$SSLSECRET = $JWTSECRET;
$PASSWORDHASH = $JWTSECRET;

function createToken($payload) {
    global $JWTSECRET;
    jwt_set_secret($JWTSECRET);
    jwt_set_payload($payload);
    $jwt = jwt_token();
    return $jwt;
}
function validateJwt($token,$time=false,$aud=NULL) {
    if ($aud == NULL) {
        $aud = getSecret("jwt_audience", "cairnsgames client");
    }
    global $JWTSECRET, $jwtError;
    jwt_set_secret($JWTSECRET);
    $valid = validate_jwt($token,$time,$aud);
    // var_dump($jwtError);
    return $valid;
}

function randomPassword($len) {
    $alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    $pass = array(); //remember to declare $pass as an array
    $alphaLength = strlen($alphabet) - 1; //put the length -1 in cache
    for ($i = 0; $i < $len; $i++) {
        $n = rand(0, $alphaLength);
        $pass[] = $alphabet[$n];
    }
    return implode($pass); //turn the array into a string
}

?>