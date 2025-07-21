<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *"); // Allow from all origins for dev
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

require_once '../config/config.php';

$requestMethod = $_SERVER['REQUEST_METHOD'];

switch ($requestMethod) {
    case 'GET':
        try {
            $db = getDB();
            $stmt = $db->query("SELECT * FROM transactions ORDER BY dateInsertedIntoDataBase DESC");
            $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode($transactions ?: []);
        } catch (PDOException $e) {
            echo json_encode(['error' => 'Error fetching transactions: ' . $e->getMessage()]);
        }
        break;

    case 'POST':
        $inputData = json_decode(file_get_contents("php://input"));

        if (!$inputData) {
            echo json_encode(['error' => 'Invalid input']);
            exit;
        }

        // Capture and sanitize data
        $dateInsertedIntoDataBase = $inputData->dateInsertedIntoDataBase ?? '';
        $reviewer = $inputData->reviewer ?? '';
        $category = $inputData->category ?? '';
        $description = $inputData->description ?? '';
        $invoiceNo = $inputData->invoiceNo ?? '';
        $productName = $inputData->productName ?? '';
        $quantity = $inputData->quantity ?? '';
        $amount = $inputData->amount ?? null;

        // Validation
        if (
            !$dateInsertedIntoDataBase || !$reviewer || !$category ||
            !$description || !$invoiceNo || !$productName ||
            $quantity === null || $amount === null
        ) {
            echo json_encode(['error' => 'Missing fields']);
            exit;
        }

        try {
            $db = getDB();

            $stmt = $db->prepare("INSERT INTO transactions (dateInsertedIntoDataBase, reviewer, category, description, invoiceNo, productName, quantity, amount) 
                                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

            $stmt->execute([
                $dateInsertedIntoDataBase,
                $reviewer,
                $category,
                $description,
                $invoiceNo,
                $productName,
                $quantity,
                $amount
            ]);

            if ($stmt->rowCount() > 0) {
                echo json_encode([
                    'dateInsertedIntoDataBase' => $dateInsertedIntoDataBase,
                    'reviewer' => $reviewer,
                    'category' => $category,
                    'description' => $description,
                    'invoiceNo' => $invoiceNo,
                    'productName' => $productName,
                    'quantity' => $quantity,
                    'amount' => $amount
                ]);
            } else {
                echo json_encode(['error' => 'Failed to insert data']);
            }
        } catch (PDOException $e) {
            echo json_encode(['error' => 'Error executing query: ' . $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
