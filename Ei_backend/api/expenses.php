<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
require_once '../config/config.php';

$db = getDB();

// ------------------- GET: Fetch all Expenses transactions -------------------
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $db->prepare("SELECT * FROM transactions WHERE type='expenses' ORDER BY updated_at DESC, created_at DESC");
        $stmt->execute();
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Failed to fetch data: " . $e->getMessage()]);
    }
}

// ------------------- POST: Insert new Expenses transaction -------------------
elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'));

    // Validate required fields
    if (!isset($input->reviewer) || !isset($input->category) || !isset($input->amount)) {
        http_response_code(400);
        echo json_encode(["error" => "Missing required fields"]);
        exit;
    }

    $totalAmountOfProduct = floatval($input->quantity) * floatval($input->amount);

    try {
        $stmt = $db->prepare("
            INSERT INTO transactions (
                dateInsertedIntoDataBase, type, reviewer, category, description,
                invoiceNo, productName, quantity, amount, totalAmountOfProduct, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ");

        $stmt->execute([
            $input->dateInsertedIntoDataBase,
            'expenses',
            $input->reviewer,
            $input->category,
            $input->description,
            $input->invoiceNo,
            $input->productName,
            $input->quantity,
            $input->amount,
            $totalAmountOfProduct
        ]);

        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Failed to insert transaction: " . $e->getMessage()]);
    }
}

// ------------------- DELETE: Delete an Expenses transaction by ID -------------------
elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid or missing ID"]);
        exit;
    }

    $id = intval($_GET['id']);

    try {
        $stmt = $db->prepare("DELETE FROM transactions WHERE id = :id AND type = 'expenses'");
        $stmt->bindParam(":id", $id, PDO::PARAM_INT);

        if ($stmt->execute() && $stmt->rowCount() > 0) {
            http_response_code(200); // Success
            echo json_encode(["message" => "Transaction deleted successfully"]);
        } else {
            http_response_code(404); // Not Found
            echo json_encode(["error" => "Transaction not found or already deleted"]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
}

// ------------------- PUT: Update an expenses transaction by ID -------------------
elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'));

    // Check if id exists and is numeric
    if (!isset($input->id) || !is_numeric($input->id)) {
        http_response_code(400);
        echo json_encode(["error" => "Missing or invalid ID"]);
        exit;
    }

    // Validate required fields
    if (!isset($input->reviewer) || !isset($input->category) || !isset($input->amount)) {
        http_response_code(400);
        echo json_encode(["error" => "Missing required fields"]);
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
                id = :id AND type = 'expenses'
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
            echo json_encode(["message" => "Expenses transaction updated successfully"]);
        } else {
            echo json_encode(["message" => "No changes made or transaction not found"]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
}

// ------------------- Method Not Allowed -------------------
else {
    http_response_code(405); // Method Not Allowed
    echo json_encode(["error" => "Method not allowed"]);
}
