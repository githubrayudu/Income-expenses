<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

require_once '../config/config.php';

$db = getDB();
$type = 'expenses'; // single-word, to match "expenses" and standard practice

// ------------------- GET: Fetch all expenses transactions -------------------
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $db->prepare("SELECT * FROM transactions WHERE type = :type ORDER BY updated_at DESC, created_at DESC");
        $stmt->execute([':type' => $type]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Failed to fetch data: " . $e->getMessage()]);
    }
}

// ------------------- POST: Insert new expenses transaction -------------------
elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'));

    // Basic field validation
    $required = ['dateInsertedIntoDataBase', 'reviewer', 'category', 'amount', 'quantity'];
    foreach ($required as $field) {
        if (empty($input->$field)) {
            http_response_code(400);
            echo json_encode(["error" => "Missing required field: $field"]);
            exit;
        }
    }

    $totalAmount = floatval($input->quantity) * floatval($input->amount);

    try {
        $stmt = $db->prepare("
            INSERT INTO transactions (
                dateInsertedIntoDataBase, type, reviewer, category, description,
                invoiceNo, productName, quantity, amount, totalAmountOfProduct, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ");

        $stmt->execute([
            $input->dateInsertedIntoDataBase,
            $type,
            $input->reviewer,
            $input->category,
            $input->description ?? '',
            $input->invoiceNo ?? '',
            $input->productName ?? '',
            $input->quantity,
            $input->amount,
            $totalAmount
        ]);

        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Insert failed: " . $e->getMessage()]);
    }
}

// ------------------- DELETE: Delete an expenses transaction by ID -------------------
elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid or missing ID"]);
        exit;
    }

    $id = (int) $_GET['id'];

    try {
        $stmt = $db->prepare("DELETE FROM transactions WHERE id = :id AND type = :type");
        $stmt->execute([':id' => $id, ':type' => $type]);

        if ($stmt->rowCount() > 0) {
            echo json_encode(["message" => "Transaction deleted successfully"]);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Transaction not found or already deleted"]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Delete failed: " . $e->getMessage()]);
    }
}

// ------------------- PUT: Update an expenses transaction -------------------
elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'));

    if (!isset($input->id) || !is_numeric($input->id)) {
        http_response_code(400);
        echo json_encode(["error" => "Missing or invalid ID"]);
        exit;
    }

    $required = ['dateInsertedIntoDataBase', 'reviewer', 'category', 'amount', 'quantity'];
    foreach ($required as $field) {
        if (empty($input->$field)) {
            http_response_code(400);
            echo json_encode(["error" => "Missing required field: $field"]);
            exit;
        }
    }

    $totalAmount = floatval($input->quantity) * floatval($input->amount);

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
                id = :id AND type = :type
        ");

        $stmt->execute([
            ':date' => $input->dateInsertedIntoDataBase,
            ':reviewer' => $input->reviewer,
            ':category' => $input->category,
            ':description' => $input->description ?? '',
            ':invoiceNo' => $input->invoiceNo ?? '',
            ':productName' => $input->productName ?? '',
            ':quantity' => $input->quantity,
            ':amount' => $input->amount,
            ':total' => $totalAmount,
            ':id' => $input->id,
            ':type' => $type
        ]);

        echo json_encode([
            "message" => $stmt->rowCount() > 0
                ? "Transaction updated successfully"
                : "No changes made or transaction not found"
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Update failed: " . $e->getMessage()]);
    }
}

// ------------------- Fallback for unsupported methods -------------------
else {
    http_response_code(405); // Method Not Allowed
    echo json_encode(["error" => "Method not allowed"]);
}
