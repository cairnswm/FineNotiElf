<?php

include_once dirname(__FILE__) . "/getselect.php";

// Function to handle limit and order by from query string
function getLimitAndOrderBy()
{
    $limit = '';
    $orderBy = '';

    $page = getParam('page', 1);
    $pageSize = getParam('pageSize', 20);
    $order = getParam('order', null);

    if ($page && $pageSize) {
        $offset = ($page - 1) * $pageSize;
        $limit = "LIMIT $offset, $pageSize";
    }

    if ($order) {
        $orderDirection = strtoupper(getParam('orderDirection', "ASC")) === 'DESC' ? 'DESC' : 'ASC';
        $orderBy = "ORDER BY $order $orderDirection";
    }

    return [$limit, $orderBy];
}

function SelectData($config, $id = null)
{
    global $gapiconn;

    if (!isset($config['select']) || !$config['select']) {
        die("Select operation not allowed");
    }

    if (isset($config['beforeselect']) && function_exists($config['beforeselect'])) {
        $res = call_user_func($config['beforeselect'], $config, []);
        $config = $res[0];
    }

    $types = "";
    $params = [];

    // Handle the case where select is a function name
    if (is_string($config['select'])) {
        if (function_exists($config['select'])) {
            // Call the function with the config and id
            return call_user_func($config['select'], $config, $id);
        } else {
            // Handle the case where select is a raw SQL statement
            if (!isset($config['where'])) {
                $config['where'] = [];
            }
            $info = buildQuery($config);

            $query = $info['query'];
            $types = $info['types'];
            $params = $info['params'];

            // Execute query with database connection
            $stmt = $gapiconn->prepare($query);
            if (!empty($types) && !empty($params)) {
                $stmt->bind_param($types, ...$params);
            }
            $stmt->execute();
            $result = $stmt->get_result();
            $rows = [];
            while ($row = $result->fetch_assoc()) {
                $rows[] = $row;
            }
            $stmt->close();
        }
    } elseif (is_array($config['select'])) {
        // Handle the case where select is an array of fields
        $fields = implode(", ", $config['select']);
        $where = "1=1";
        if (isset($config['where'])) {
            foreach ($config['where'] as $key => $value) {
                $where .= " AND $key = ?";
            }
        }
        if ($id) {
            $where .= " AND " . $config['key'] . " = ?";
        }
        if (!isset($config['orderBy'])) {
            $config['orderBy'] = '';
        }
        if (!isset($config['limit'])) {
            $config['limit'] = '';
        }
        $query = "SELECT $fields FROM " . $config['tablename'] . " WHERE $where " . $config['orderBy'] . " " . $config['limit'];

        if (isset($config['where']) && count($config['where']) > 0) {
            $types = str_repeat('s', count($config['where']));
            $params = array_values($config['where']);
            if ($id) {
                $types .= 's';
                $params[] = $id;
            }
        } elseif ($id) {
            $types = 's';
            $params[] = $id;
        }

        // Execute query with database connection
        $stmt = $gapiconn->prepare($query);
        if (!empty($types) && !empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
        $stmt->execute();
        $result = $stmt->get_result();
        $rows = [];
        while ($row = $result->fetch_assoc()) {
            $rows[] = $row;
        }
        $stmt->close();
    }

    // echo "Query: $query\n";
    // echo "Types: $types\n";
    // echo "Params: " . json_encode($params) . "\n";

    if (isset($config['afterselect']) && function_exists($config['afterselect'])) {
        $rows = call_user_func($config['afterselect'], $config, $rows);
    }

    // var_dump($rows);

    return $rows;
}
