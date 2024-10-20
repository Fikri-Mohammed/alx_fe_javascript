// script.js

let quotes = [];

// Load quotes from local storage when the application starts
function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    }
}

// Populate categories into the dropdown
function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    
    // Clear existing options except for the first
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';

    // Create a set to hold unique categories
    const categories = new Set(quotes.map(quote => quote.category));

    // Populate dropdown with unique categories
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    // Restore last selected filter from local storage
    const lastSelectedCategory = localStorage.getItem('lastSelectedCategory') || 'all';
    categoryFilter.value = lastSelectedCategory;
}

// Function to display a random quote or filter quotes based on selected category
function showQuotes(selectedCategory) {
    const displayArea = document.getElementById('quoteDisplay');

    // Filter quotes based on selected category
    const filteredQuotes = selectedCategory === 'all' ? quotes : quotes.filter(quote => quote.category === selectedCategory);

    if (filteredQuotes.length === 0) {
        displayArea.textContent = "No quotes available for this category.";
        return;
    }

    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const { text, category } = filteredQuotes[randomIndex];
    displayArea.textContent = `${text} - ${category}`;
}

// Function to filter quotes based on selected category
function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    
    // Save last selected category to local storage
    localStorage.setItem('lastSelectedCategory', selectedCategory);

    // Show quotes based on selected category
    showQuotes(selectedCategory);
}

// Function to add a new quote
function addQuote() {
    const quoteText = document.getElementById('newQuoteText').value.trim();
    const quoteCategory = document.getElementById('newQuoteCategory').value.trim();

    if (!quoteText || !quoteCategory) {
        alert("Both fields are required!");
        return;
    }

    // Add the new quote to the array
    quotes.push({ text: quoteText, category: quoteCategory });

    // Clear the input fields
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';

    // Save quotes to local storage
    saveQuotes();

    // Populate categories dynamically
    populateCategories();

    // Show the newly added quote
    showQuotes(document.getElementById('categoryFilter').value);
}

// Function to save quotes to local storage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Function to export quotes as a JSON file
function exportQuotes() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    a.click();
    
    // Clean up
    URL.revokeObjectURL(url);
}

// Function to import quotes from a JSON file
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        const importedQuotes = JSON.parse(event.target.result);
        quotes.push(...importedQuotes);
        saveQuotes();
        alert('Quotes imported successfully!');
        populateCategories(); // Update categories after import
        showQuotes(document.getElementById('categoryFilter').value); // Show a random quote after import
    };
    fileReader.readAsText(event.target.files[0]);
}

// Event listeners
document.getElementById('newQuote').addEventListener('click', () => showQuotes(document.getElementById('categoryFilter').value));
document.getElementById('addQuoteButton').addEventListener('click', addQuote);
document.getElementById('exportQuotesButton').addEventListener('click', exportQuotes);

// Load quotes and populate categories when the application starts
loadQuotes();
populateCategories();
