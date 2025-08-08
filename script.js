document.addEventListener("DOMContentLoaded", () => {


 


  // Dynamic endpoint helper
  function getEndpoint() {
    const type = document.getElementById("type").value;
    const base = `http://localhost/Ei_backend/api/${type}.php`;
    return { type, endpointBase: base };
  }



  const form = document.getElementById("transactionForm");
 
  const inputs = {
    dateInput: document.getElementById("dateOfTransaction"),
    reviewerInput: document.getElementById("reviewer"),
    categoryInput: document.getElementById("category"),
    descriptionInput: document.getElementById("description"),
    invoiceNoInput: document.getElementById("invoiceNo"),
    productNameInput: document.getElementById("productName"),
    quantityInput: document.getElementById("quantity"),
    amountInput: document.getElementById("amount"),
  };
  const transactionList = document.getElementById("transactionList");
  const balanceAmountSpan =
    document.getElementById("balanceAmount") || document.getElementById("totalExpenses");
  const searchBox = document.getElementById("searchBox");
  let allTransactions = [];
  let editingTransactionId = null; // Track edit mode

  // Fetch all transactions from backend
  async function fetchTransactions() {
    try {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`Failed to fetch ${type} transactions`);
      const data = await res.json();
      allTransactions = data;
      renderTable(allTransactions);
    } catch (err) {
      console.error(`Error fetching ${type} transactions:`, err);
      alert(`Error loading ${type}: ` + err.message);
    }
  }


  // Render table rows
  function renderTable(data) {
    transactionList.innerHTML = "";
    let total = 0;

    if (Array.isArray(data) && data.length > 0) {
      data.forEach((tx) => {
        const totalAmount = parseFloat(tx.quantity) * parseFloat(tx.amount);
        total += totalAmount;

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${new Date(tx.dateInsertedIntoDataBase).toLocaleDateString()}</td>
          <td>${type}</td>
          <td>${tx.reviewer}</td>
          <td>${tx.category}</td>
          <td>${tx.description}</td>
          <td>${tx.invoiceNo}</td>
          <td>${tx.productName}</td>
          <td>${tx.quantity}</td>
          <td>${parseFloat(tx.amount)}</td>
          <td>${totalAmount.toFixed(2)}</td>
          <td>
            <button class="delete-btn" data-id="${tx.id}">Delete</button>
          </td>
        `;
        transactionList.appendChild(row);
      });


      // Attach delete handlers
      transactionList.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", async () => {
          const id = button.getAttribute("data-id");
          if (!confirm("Are you sure you want to delete this transaction?"))
            return;

          try {
            const res = await fetch(`${endpoint}?id=${id}`, {
              method: "DELETE",
            });
            if (!res.ok) {
              let errMsg = "Delete failed";
              try {
                const err = await res.json();
                errMsg = err.error || errMsg;
              } catch (_) {}
              throw new Error(errMsg);
            }
            await fetchTransactions(); // Refresh
          } catch (err) {
            console.error("Delete failed:", err);
            alert("Could not delete transaction: " + err.message);
          }
        });
      });
    } else {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 11;
      cell.textContent = `No ${type} transactions found.`;
      row.appendChild(cell);

      transactionList.appendChild(row);
    }

    balanceAmountSpan.textContent = total.toFixed(2);
  }

  // Handle form submit
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const type = document.getElementById("type").value;
      const endpoint = `http://localhost/Ei_backend/api/${type}.php`;

      const transaction = {
        dateInsertedIntoDataBase: inputs.dateInput.value,
        reviewer: inputs.reviewerInput.value,
        category: inputs.categoryInput.value,
        description: inputs.descriptionInput.value,
        invoiceNo: inputs.invoiceNoInput.value,
        productName: inputs.productNameInput.value,
        quantity: parseInt(inputs.quantityInput.value),
        amount: parseFloat(inputs.amountInput.value),
        totalAmountOfProduct:
          parseInt(inputs.quantityInput.value) *
          parseFloat(inputs.amountInput.value),
      };

      // Add ID for PUT request
      if (editingTransactionId) {
        transaction.id = parseInt(editingTransactionId);
      }

      // Basic validation
      if (
        !transaction.dateInsertedIntoDataBase ||
        !transaction.reviewer ||
        !transaction.category ||
        !transaction.description ||
        !transaction.invoiceNo ||
        !transaction.productName ||
        isNaN(transaction.quantity) ||
        isNaN(transaction.amount) ||
        transaction.quantity <= 0 ||
        transaction.amount <= 0
      ) {
        alert("Please fill in all required fields correctly.");
        return;
      }
      try {
        const res = await fetch(endpoint, {
          method: editingTransactionId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(transaction),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Failed to save transaction");
        }
        form.reset();
        editingTransactionId = null;
        await fetchTransactions();
      } catch (err) {
        console.error(`Error saving ${type} transaction:`, err);
        alert(`Failed to save ${type} transaction: ` + err.message);
      }
    });
  }
  // Search box filter
  if (searchBox) {
    searchBox.addEventListener("input", () => {
      const term = searchBox.value.toLowerCase();
      const filtered = allTransactions.filter(
        (tx) =>
          (tx.invoiceNo || "").toLowerCase().includes(term) ||
          (tx.productName || "").toLowerCase().includes(term) ||
          (tx.category || "").toLowerCase().includes(term) ||
          (tx.reviewer || "").toLowerCase().includes(term) ||
          (tx.description || "").toLowerCase().includes(term)
      );
      renderTable(filtered);
    });
  }
  fetchTransactions();
});

document.addEventListener("DOMContentLoaded", () => {
  // Get elements
  const queryParams = new URLSearchParams(window.location.search);
  let type = queryParams.get("type");
if (!type) {
  const file = window.location.pathname.split("/").pop().toLowerCase();
  if (file.includes("income")) type = "income";
  else if (file.includes("expense")) type = "expenses";
else type = "income" || "expenses"}

  const endpoint = `http://localhost/Ei_backend/api/${type}.php`;

  document.getElementById("pageTitle").textContent =`${type.charAt(0).toUpperCase()+ type.slice(1)}Transactions`;
  document.getElementById("transactionTypeLabel").textContent = type.charAt(0).toUpperCase() + type.slice(1);

  const transactionList = document.getElementById("transactionList");
  const balanceAmountSpan = document.getElementById("balanceAmount");
  const filters = {
    category: document.querySelector("select[name='category']"),
    invoiceNo: document.querySelector("select[name='invoiceNo']"),
    productName: document.querySelector("select[name='productName']"),
  };

  let allTransactions = [];
  // Fetch data
  async function fetchTransactions() {
    try {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`Failed to fetch ${type} transactions`);
      const data = await res.json();
      allTransactions = data;
      populateFilters(data);
      renderTable(data);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      alert("Error loading transactions: " + err.message);
    }
  }

  // Render rows
  function renderTable(data) {
    transactionList.innerHTML = "";
    let total = 0;

    if (Array.isArray(data) && data.length > 0) {
      data.forEach((tx) => {
        const qty = parseFloat(tx.quantity) || 0;
        const amt = parseFloat(tx.amount) || 0;
        const totalAmt = qty * amt;
        total += totalAmt;

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${new Date(tx.dateInsertedIntoDataBase).toLocaleDateString()}</td>
          <td>${type}</td>
          <td>${tx.reviewer}</td>
          <td>${tx.category}</td>
          <td>${tx.description}</td>
          <td>${tx.invoiceNo}</td>
          <td>${tx.productName}</td>
          <td>${tx.quantity}</td>
          <td>${amt}</td>
          <td>${totalAmt.toFixed(2)}</td>
        `;
        transactionList.appendChild(row);
      });
    } else {
      const row = document.createElement("tr");
      row.innerHTML = `<td colspan="10">No ${type} transactions found.</td>`;
      transactionList.appendChild(row);
    }

    balanceAmountSpan.textContent = total.toFixed(2);
  }
  // Populate filter dropdowns
  function populateFilters(data) {
    const unique = {
      category: new Set(),
      invoiceNo: new Set(),
      productName: new Set(),
    };

    data.forEach((tx) => {
      unique.category.add(tx.category);
      unique.invoiceNo.add(tx.invoiceNo);
      unique.productName.add(tx.productName);
    });

    Object.keys(filters).forEach((key) => {
      const select = filters[key];
      select.innerHTML = `<option value="all">All</option>`;
      unique[key].forEach((val) => {
        const option = document.createElement("option");
        option.value = val;
        option.textContent = val;
        select.appendChild(option);
      });
    });
  }

  // Apply filters
  function applyFilters() {
    const selected = {
      category: filters.category.value,
      invoiceNo: filters.invoiceNo.value,
      productName: filters.productName.value,
    };
    const filtered = allTransactions.filter(
      (tx) =>
        (selected.category === "all" || tx.category === selected.category) &&
        (selected.invoiceNo === "all" || tx.invoiceNo === selected.invoiceNo) &&
        (selected.productName === "all" ||
          tx.productName === selected.productName)
    );
    renderTable(filtered);
  }
  Object.values(filters).forEach((select) => {
    select.addEventListener("change", applyFilters);
  });

  fetchTransactions();
});
