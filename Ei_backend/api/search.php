<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

require_once '../config/config.php';

$db = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $searchTerm = isset($_GET['q']) ? trim($_GET['q']) : '';
    $type = isset($_GET['type']) ? trim($_GET['type']) : 'income';
    $field = isset($_GET['field']) ? trim($_GET['field']) : 'category';

    // Whitelist of allowed searchable fields
    $allowedFields = ['category', 'productName', 'invoiceNo', 'reviewer'];

    // Validate field
    if (!in_array($field, $allowedFields)) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid field requested."]);
        exit;
    }

    // Return empty array if no search term
    if (empty($searchTerm)) {
        echo json_encode([]);
        exit;
    }

    try {
        $stmt = $db->prepare("
            SELECT DISTINCT $field 
            FROM transactions 
            WHERE type = :type AND $field LIKE :search 
            ORDER BY $field ASC
        ");
        $stmt->execute([
            ':type' => $type,
            ':search' => '%' . $searchTerm . '%'
        ]);

        $results = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $results[] = $row[$field];
        }

        echo json_encode($results);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
}
