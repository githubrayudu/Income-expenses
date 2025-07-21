<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
require_once '../config/config.php';

$db = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  $stmt = $db->prepare("SELECT * FROM transactions WHERE type='income' ORDER BY dateInsertedIntoDataBase DESC");
  $stmt->execute();
  echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}
elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $input = json_decode(file_get_contents('php://input'));
  // Validate...
  $stmt = $db->prepare("INSERT INTO transactions (dateInsertedIntoDataBase, type, reviewer, category, description, invoiceNo, productName, quantity, amount) VALUES (?,?,?,?,?,?,?,?,?)");
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
    
  ]);
  echo $stmt->rowCount() ? json_encode(['success'=>true]) : json_encode(['error'=>'Insert failed']);
}
elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // ✅ Use $_GET to read ?id=...
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

