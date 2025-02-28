<?php

include_once __DIR__ . "/../notielfconfig.php";

// Create a global $gapiconn exists for the MySQL connection
global $gapiconn;
$gapiconn = new mysqli($notielfconfig["server"], $notielfconfig["username"], $notielfconfig["password"], $notielfconfig["database"]);

if ($gapiconn->connect_error) {
    die("Connection failed: " . $gapiconn->connect_error);
}