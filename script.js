// Get form and inputs
const form = document.getElementById("transactionForm");
const type = document.getElementById("type").value; // 'income' or 'expenses'
const endpoint = `http://localhost/Ei_backend/api/${type}.php`;




const dateInput = document.getElementById("dateOfTransaction");
const reviewerInput = document.getElementById("reviewer");
const categoryInput = document.getElementById("category");
const descriptionInput = document.getElementById("description");
const invoiceNoInput = document.getElementById("invoiceNo");
const productNameInput = document.getElementById("productName");
const quantityInput = document.getElementById("quantity");
const amountInput = document.getElementById("amount");

const transactionList = document.getElementById("transactionList") || document.getElementById("expList");
const balanceAmountSpan = document.getElementById("balanceAmount") || document.getElementById("totalExpenses");

// Load transactions
async function fetchTransactions() {
  try {
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error(`Failed to fetch ${type} transactions`);

    const data = await res.json();
    transactionList.innerHTML = '';
    let total = 0;

    if (Array.isArray(data) && data.length > 0) {
      data.forEach(tx => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${new Date(tx.dateInsertedIntoDataBase).toLocaleDateString()}</td>
          <td>${type}</td><td>${tx.reviewer}</td><td>${tx.category}</td><td>${tx.description}</td>
          <td>${tx.invoiceNo}</td><td>${tx.productName}</td><td>${tx.quantity}</td>
          <td>${parseFloat(tx.amount).toFixed(2)}</td>
        `;
        transactionList.appendChild(row);
        total += parseFloat(tx.amount);
      });
    }
     else {
      const row = document.createElement("tr");
      row.innerHTML = `<td colspan="9">No ${type} transactions found.</td>`;
      transactionList.appendChild(row);
    }

    balanceAmountSpan.textContent = total.toFixed(2);
  } catch (err) {
    console.error(`Error fetching ${type} transactions:`, err);
    alert(`Error loading ${type}: ` + err.message);
  }
}

// Submit handler
form.addEventListener("submit", async e => {
  e.preventDefault();

  const transaction = {
    dateInsertedIntoDataBase: dateInput.value,
    reviewer: reviewerInput.value,
    category: categoryInput.value,
    description: descriptionInput.value,
    invoiceNo: invoiceNoInput.value,
    productName: productNameInput.value,
    quantity: parseInt(quantityInput.value),
    amount: parseFloat(amountInput.value)
  };

  if (
    !transaction.dateInsertedIntoDataBase ||
    !transaction.reviewer ||
    !transaction.category ||
    !transaction.description ||
    !transaction.invoiceNo ||
    !transaction.productName ||
    isNaN(transaction.quantity) ||
    isNaN(transaction.amount)
  ) {
    alert("Please fill in all required fields correctly.");
    return;
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transaction)
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to save transaction");
    }

    form.reset();
    await fetchTransactions();
  } catch (err) {
    console.error(`Error saving ${type} transaction:`, err);
    alert(`Failed to save ${type} transaction: ` + err.message);
  }
});

// Initial load
document.addEventListener("DOMContentLoaded", fetchTransactions);
