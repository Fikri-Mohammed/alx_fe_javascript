// script.js

let quotes = [];

// Load quotes from local storage when the application starts
function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    }
}

// Simulate server interaction
const serverUrl = 'https://jsonplaceholder.typicode.com/posts'; // Mock API endpoint

// Fetch quotes from the server
async function fetchQuotesFromServer() {
    try {
        const response = await fetch(serverUrl);
        const data = await response.json();
        
        // Simulate quotes based on fetched data
        const serverQuotes = data.map(item => ({
            text: item.title, // Using title as quote text
            category: 'General' // Assign a default category
        }));

        return serverQuotes;
    } catch (error) {
        console.error("Error fetching quotes from server:", error);
        return [];
    }
}

// Sync quotes with the server
async function syncQuotesWithServer() {
    const serverQuotes = await fetchQuotesFromServer();

    // Check for discrepancies and handle conflict resolution
    serverQuotes.forEach(serverQuote => {
        const existingQuote = quotes.find(quote => quote.text === serverQuote.text);
        
        if (!existingQuote) {
            // Add new quote from server if it doesn't exist locally
            quotes.push(serverQuote);
            notifyUser(`New quote added from server: "${serverQuote.text}"`);
        } else {
            // If the quote exists, we have a conflict
            notifyUser(`Conflict detected for quote: "${existingQuote.text}". Server version will replace local version.`);
            Object.assign(existingQuote, serverQuote); // Replace with server quote
        }
    });

    // Save updated quotes to local storage
    saveQuotes();
}

// Notify user of updates or conflicts
function notifyUser(message) {
    const notificationArea = document.getElementById('notificationArea');
    const notification = document.createElement('div');
    notification.textContent = message;
    notificationArea.appendChild(notification);

    // Auto-remove notification after a few seconds
    setTimeout(() => {
        notificationArea.removeChild(notification);
    }, 5000);
}

// Populate categories into the dropdown
function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';

    const categories = new Set(quotes.map(quote => quote.category));
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    const lastSelectedCategory = localStorage.getItem('lastSelectedCategory') || 'all';
    categoryFilter.value = lastSelectedCategory;
}

// Function to display a random quote or filter quotes based on selected category
function showQuotes(selectedCategory) {
    const displayArea = document.getElementById('quoteDisplay');
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
    localStorage.setItem('lastSelectedCategory', selectedCategory);
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

    quotes.push({ text: quoteText, category: quoteCategory });
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    saveQuotes();
    populateCategories();
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
    URL.revokeObjectURL(url);
}

// Function to import quotes from a JSON file
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        const importedQuotes = JSON.parse(event.target.result);
        quotes.push(...importedQuotes);
        saveQuotes();
        notifyUser('Quotes imported successfully!');
        populateCategories();
        showQuotes(document.getElementById('categoryFilter').value);
    };
    fileReader.readAsText(event.target.files[0]);
}

// Sync and fetch quotes periodically (every 10 seconds)
setInterval(syncQuotesWithServer, 10000);

// Event listeners
document.getElementById('newQuote').addEventListener('click', () => showQuotes(document.getElementById('categoryFilter').value));
document.getElementById('addQuoteButton').addEventListener('click', addQuote);
document.getElementById('exportQuotesButton').addEventListener('click', exportQuotes);

// Load quotes and populate categories when the application starts
loadQuotes();
populateCategories();
