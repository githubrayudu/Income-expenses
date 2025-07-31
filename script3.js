document.addEventListener("DOMContentLoaded", () => {
  const clockElement = document.getElementById("clock");
  const transactionList = document.getElementById("transactionList");

  const dateFilter = document.getElementById("dateFilter");
  const typeFilter = document.getElementById("typeFilter");
  const reviewerFilter = document.getElementById("reviewerFilter");
  const categoryFilter = document.getElementById("categoryFilter");
  const descriptionFilter = document.getElementById("descriptionFilter");
  const invoiceNoFilter = document.getElementById("invoiceNoFilter");
  const productNameFilter = document.getElementById("productNameFilter");
  const quantityFilter = document.getElementById("quantityFilter");
  const amountFilter = document.getElementById("amountFilter");
  const totalAmountFilter = document.getElementById("totalAmountFilter");

  const resetFiltersButton = document.getElementById("resetFilters");

  const form = document.getElementById("transactionForm");
  let allTransactions = [];

  const endpoint = "http://localhost/Ei_backend/api/income.php"; // Modify the endpoint if needed

  // Fetch all transactions from backend
  async function fetchTransactions() {
    try {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error("Failed to fetch transactions");
      const data = await res.json();
      allTransactions = data;
      renderTable(allTransactions);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      alert("Error loading transactions: " + err.message);
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
          <td>${tx.type}</td>
          <td>${tx.reviewer}</td>
          <td>${tx.category}</td>
          <td>${tx.description}</td>
          <td>${tx.invoiceNo}</td>
          <td>${tx.productName}</td>
          <td>${tx.quantity}</td>
          <td>${tx.amount}</td>
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
          if (!confirm("Are you sure you want to delete this transaction?")) return;

          try {
            const res = await fetch(`${endpoint}?id=${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Delete failed");
            await fetchTransactions(); // Refresh the transactions
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
      cell.textContent = "No transactions found.";
      row.appendChild(cell);
      transactionList.appendChild(row);
    }
  }

  // Filter the table rows based on input fields
  function filterTable() {
    const dateValue = dateFilter.value;
    const typeValue = typeFilter.value.toLowerCase();
    const reviewerValue = reviewerFilter.value.toLowerCase();
    const categoryValue = categoryFilter.value.toLowerCase();
    const descriptionValue = descriptionFilter.value.toLowerCase();
    const invoiceNoValue = invoiceNoFilter.value.toLowerCase();
    const productNameValue = productNameFilter.value.toLowerCase();
    const quantityValue = quantityFilter.value;
    const amountValue = amountFilter.value;
    const totalAmountValue = totalAmountFilter.value;

    const filtered = allTransactions.filter((tx) => {
      return (
        (!dateValue || tx.dateInsertedIntoDataBase.includes(dateValue)) &&
        (!typeValue || tx.type.toLowerCase().includes(typeValue)) &&
        (!reviewerValue || tx.reviewer.toLowerCase().includes(reviewerValue)) &&
        (!categoryValue || tx.category.toLowerCase().includes(categoryValue)) &&
        (!descriptionValue || tx.description.toLowerCase().includes(descriptionValue)) &&
        (!invoiceNoValue || tx.invoiceNo.toLowerCase().includes(invoiceNoValue)) &&
        (!productNameValue || tx.productName.toLowerCase().includes(productNameValue)) &&
        (!quantityValue || tx.quantity.toString().includes(quantityValue)) &&
        (!amountValue || tx.amount.toString().includes(amountValue)) &&
        (!totalAmountValue || totalAmountValue === "" || (tx.quantity * tx.amount).toString().includes(totalAmountValue))
      );
    });

    renderTable(filtered);
  }

  // Reset filters
  resetFiltersButton.addEventListener("click", () => {
    dateFilter.value = "";
    typeFilter.value = "";
    reviewerFilter.value = "";
    categoryFilter.value = "";
    descriptionFilter.value = "";
    invoiceNoFilter.value = "";
    productNameFilter.value = "";
    quantityFilter.value = "";
    amountFilter.value = "";
    totalAmountFilter.value = "";
    fetchTransactions(); // Refresh the table with all transactions
  });

  // Event listeners for each filter input
  dateFilter.addEventListener("input", filterTable);
  typeFilter.addEventListener("input", filterTable);
  reviewerFilter.addEventListener("input", filterTable);
  categoryFilter.addEventListener("input", filterTable);
  descriptionFilter.addEventListener("input", filterTable);
  invoiceNoFilter.addEventListener("input", filterTable);
  productNameFilter.addEventListener("input", filterTable);
  quantityFilter.addEventListener("input", filterTable);
  amountFilter.addEventListener("input", filterTable);
  totalAmountFilter.addEventListener("input", filterTable);

  // Fetch transactions on page load
  fetchTransactions();

  // Clock update function
  function updateClock() {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, "0");
    const monthNames = [
      "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ];
    const month = monthNames[now.getMonth()];
    const year = now.getFullYear();

    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // Fix hour '0' to 12

    const time = `${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;
    const formatted = `${day} ${month} ${year} ${time}`;

    // Update clock element
    clockElement.textContent = formatted;
  }

  // Call updateClock immediately and set interval to update every second
  setInterval(updateClock, 1000);
  updateClock();  // Initialize clock immediately
});
