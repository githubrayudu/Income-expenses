// This waits for the full HTML to be loaded before running your script 
document.addEventListener("DOMContentLoaded",()=>{

  //gets the elements into form and type
const form = document.getElementById("transactionForm");
const type = document.getElementById("type").value; // 'income' or 'expenses'

console.log(type);

//shows error message if it does not provide input 
if(!type){
  console.error("Transaction type not specified on form");
  return;
}


// Dynamically builds the API endPoint URL depending on the type ,income, expenses
const endpoint = `http://localhost/Ei_backend/api/${type}.php`;

//object that holds references to all form input elements 

const inputs ={
 dateInput :document.getElementById("dateOfTransaction"),
  reviewerInput : document.getElementById("reviewer"),
 categoryInput :document.getElementById("category"),
 descriptionInput : document.getElementById("description"),
 invoiceNoInput : document.getElementById("invoiceNo"),
 productNameInput : document.getElementById("productName"),
 quantityInput : document.getElementById("quantity"),
 amountInput : document.getElementById("amount")
};


//transactionList is the <tbody> of your transactions table  where rows will be added
//balance is also added  
const transactionList = document.getElementById("transactionList");

if (!transactionList) {
  console.error("transactionList element not found");
}
const balanceAmountSpan = document.getElementById("balanceAmount") || document.getElementById("totalExpenses");

// Load transactions
//sends a get request to the backend (income.php or expenses.php)
async function fetchTransactions() {
  try {
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error(`Failed to fetch ${type} transactions`);

    
    const data = await res.json();
     console.log("Fetched data:", data); // 👈 LOG THIS

    //clears the table content 
    transactionList.innerHTML = '';
    let total = 0;

    //read table rows if data is present or not 
    if (Array.isArray(data) && data.length > 0) {
      //loops throught each transaction in the responce 
      data.forEach(tx => {
          console.log("Rendering transaction:", tx);
        //create a new <tr> with transaction data 
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${new Date(tx.dateInsertedIntoDataBase).toLocaleDateString()}</td>
          <td>${type}</td><td>${tx.reviewer}</td><td>${tx.category}</td><td>${tx.description}</td>
          <td>${tx.invoiceNo}</td><td>${tx.productName}</td><td>${tx.quantity}</td>
          <td>${parseFloat(tx.amount).toFixed(2)}</td>
        `;
        //appends each row to the table 
        transactionList.appendChild(row);

        //calculate and displayes total amout 
        total += parseFloat(tx.amount);
      });
    }
     else {
      const row = document.createElement("tr");
      row.innerHTML = `<td colspan="9">No ${type} transactions found.</td>`;
      transactionList.appendChild(row);
    }
//calculate and displayes total amout 
    balanceAmountSpan.textContent = total.toFixed(2);
  } catch (err) {
    console.error(`Error fetching ${type} transactions:`, err);
    alert(`Error loading ${type}: ` + err.message);
  }
}

// Submit handler adds an event listener to handle form submission wihtout reloading the page 
if (form){
form.addEventListener("submit", async e => {
  e.preventDefault();

  //build the transaction Object 
  const transaction = {
    dateInsertedIntoDataBase: inputs.dateInput.value,
    reviewer: inputs.reviewerInput.value,
    category: inputs.categoryInput.value,
    description: inputs.descriptionInput.value,
    invoiceNo: inputs.invoiceNoInput.value,
    productName: inputs.productNameInput.value,
    quantity: parseInt(inputs.quantityInput.value),
    amount: parseFloat(inputs.amountInput.value)
  };
//Prevents submission if any required field is missing or invalid.
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

  //Send post request 
  //If successful, resets the form and reloads the table.
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transaction)
    });
//If it fails, displays an error message.
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
}
fetchTransactions();
});

