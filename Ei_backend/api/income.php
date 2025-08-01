<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
require_once '../config/config.php';

$db = getDB();

// ------------------- GET: Fetch all income transactions -------------------
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $db->prepare("SELECT * FROM transactions WHERE type='income' ORDER BY updated_at DESC, created_at DESC");
    $stmt->execute();
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}

// ------------------- POST: Insert new income transaction -------------------
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'));

    $totalAmountOfProduct = floatval($input->quantity) * floatval($input->amount);

    $stmt = $db->prepare("
        INSERT INTO transactions (
            dateInsertedIntoDataBase, type, reviewer, category, description,
            invoiceNo, productName, quantity, amount, totalAmountOfProduct, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ");

    $stmt->execute([
        $input->dateInsertedIntoDataBase,
        'income',
        $input->reviewer,
        $input->category,
        $input->description,
        $input->invoiceNo,
        $input->productName,
        $input->quantity,
        $input->amount,
        $totalAmountOfProduct
    ]);

    echo $stmt->rowCount() ? json_encode(['success' => true]) : json_encode(['error' => 'Insert failed']);
}
// ------------------- DELETE: Delete an income transaction by ID -------------------
elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid or missing ID"]);
        exit;
    }

    $id = intval($_GET['id']);

    try {
        $stmt = $db->prepare("DELETE FROM transactions WHERE id = :id AND type = 'income'");
        $stmt->bindParam(":id", $id, PDO::PARAM_INT);

        if ($stmt->execute() && $stmt->rowCount() > 0) {
            echo json_encode(["message" => "Transaction deleted successfully"]);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Transaction not found or already deleted"]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }

    exit;
}

// ------------------- PUT: Update an income transaction -------------------
elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'));

    if (!isset($input->id) || !is_numeric($input->id)) {
        http_response_code(400);
        echo json_encode(["error" => "Missing or invalid ID"]);
        exit;
    }

    $totalAmountOfProduct = floatval($input->quantity) * floatval($input->amount);

    try {
        $stmt = $db->prepare("
            UPDATE transactions 
            SET 
                dateInsertedIntoDataBase = :date,
                reviewer = :reviewer,
                category = :category,
                description = :description,
                invoiceNo = :invoiceNo,
                productName = :productName,
                quantity = :quantity,
                amount = :amount,
                totalAmountOfProduct = :total,
                updated_at = CURRENT_TIMESTAMP
            WHERE 
                id = :id AND type = 'income'
        ");

        $stmt->execute([
            ':date' => $input->dateInsertedIntoDataBase,
            ':reviewer' => $input->reviewer,
            ':category' => $input->category,
            ':description' => $input->description,
            ':invoiceNo' => $input->invoiceNo,
            ':productName' => $input->productName,
            ':quantity' => $input->quantity,
            ':amount' => $input->amount,
            ':total' => $totalAmountOfProduct,
            ':id' => $input->id
        ]);

        if ($stmt->rowCount() > 0) {
            echo json_encode(["message" => "Income transaction updated successfully"]);
        } else {
            echo json_encode(["message" => "No changes made or transaction not found"]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }

    exit;
}