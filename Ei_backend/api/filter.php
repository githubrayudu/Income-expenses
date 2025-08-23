<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

require_once '../config/config.php';
$db = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $type = isset($_GET['type']) ? strtolower(trim($_GET['type'])) : 'income';  // Default: income
    $allowedTypes = ['income', 'expenses'];

    if (!in_array($type, $allowedTypes)) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid transaction type"]);
        exit;
    }

    // Whitelisted filter fields
    $allowedFilters = ['category', 'invoiceNo', 'productName', 'reviewer'];

    $sql = "SELECT * FROM transactions WHERE type = :type";
    $params = [':type' => $type];

    foreach ($allowedFilters as $filterKey) {
        if (!empty($_GET[$filterKey])) {
            $sql .= " AND $filterKey LIKE :$filterKey";
            $params[":$filterKey"] = '%' . trim($_GET[$filterKey]) . '%';
        }
    }

    $sql .= " ORDER BY dateInsertedIntoDataBase DESC";

    try {
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}
