<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

require_once '../config/config.php';

$db = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get search term from query string
    $searchTerm = isset($_GET['q']) ? trim($_GET['q']) : '';

    // Return empty result if no term provided
    if (empty($searchTerm)) {
        echo json_encode([]);
        exit;
    }

    try {
        $stmt = $db->prepare("
            SELECT DISTINCT category 
            FROM transactions 
            WHERE type = 'income' AND category LIKE :search 
            ORDER BY category ASC
        ");
        $stmt->execute([':search' => '%' . $searchTerm . '%']);

        $results = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $results[] = $row['category'];
        }

        echo json_encode($results);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
}
