// Add this to the top of your script.js or inside the DOMContentLoaded event
//to make the thing downloadable
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // DOM elements - only get elements that might exist on the current page
    const itemsContainer = document.getElementById('itemsContainer');
    const categoryFilterButtons = document.querySelectorAll('.category-btn');
    const searchInput = document.getElementById('searchInput');
    const noResultsMessage = document.getElementById('noResultsMessage');

    // Global variables to hold data and current filters
    let allItems = []; // This will store all items fetched from data.json
    let currentCategoryFilter = 'all';
    let currentSearchTerm = '';

    /**
     * Fetches item data from data.json and initializes the display.
     * This function will only display items if the 'itemsContainer' element exists,
     * ensuring it only runs on the categories.html page.
     */
    async function fetchItems() {
        if (!itemsContainer) {
            // If itemsContainer doesn't exist, we are not on the categories page, so do nothing.
            return;
        }

        try {
            const response = await fetch('data.json');
            if (!response.ok) {
                // Log the HTTP status for better debugging
                console.error(`HTTP error! Status: ${response.status} - Could not fetch data.json`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allItems = await response.json();
            console.log('Items loaded:', allItems); // For debugging
            filterItems(); // Initial filtering to display all items
        } catch (error) {
            console.error('Could not fetch items:', error);
            if (itemsContainer) {
                itemsContainer.innerHTML = '<p class="text-center text-danger">Failed to load items. Please try again later.</p>';
            }
        }
    }

    /**
     * Creates an HTML string for a single item card.
     * @param {object} item - The item object from the data.
     * @returns {string} The HTML string for the item card.
     */
    function createItemCard(item) {
        // Ensure image URL has a fallback to a placeholder if empty
        const imageUrl = item.imageUrl || `https://placehold.co/400x200/cccccc/333333?text=${encodeURIComponent(item.title)}`;
        const categoryName = item.category ? item.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'N/A'; // Handle missing category

        return `
            <div class="col-lg-4 col-md-6" data-category="${item.category || 'unknown'}" data-item-id="${item.id}">
                <div class="card h-100 shadow-sm">
                    <span class="badge ${item.badgeColor || 'bg-info'} item-badge">${categoryName}</span>
                    <img src="${imageUrl}" class="card-img-top" alt="${item.title}" onerror="this.onerror=null;this.src='https://placehold.co/400x200/cccccc/333333?text=No+Image';">
                    <div class="card-body">
                        <h5 class="card-title">${item.title}</h5>
                        <p class="price">${item.price}</p>
                        <p class="card-text">${item.description}</p>
                        <a href="${item.whatsappLink}" class="btn btn-success w-100">
                            <i class="fab fa-whatsapp me-2"></i> Contact Seller
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Displays a given array of items in the itemsContainer.
     * Hides/shows the "no results" message accordingly.
     * @param {Array<object>} itemsToDisplay - The array of item objects to render.
     */
    function displayItems(itemsToDisplay) {
        if (!itemsContainer) return; // Prevent error if not on categories page

        itemsContainer.innerHTML = ''; // Clear existing items

        if (itemsToDisplay.length === 0) {
            if (noResultsMessage) noResultsMessage.style.display = 'block';
        } else {
            if (noResultsMessage) noResultsMessage.style.display = 'none';
            itemsToDisplay.forEach(item => {
                itemsContainer.insertAdjacentHTML('beforeend', createItemCard(item));
            });
        }
    }

    /**
     * Filters the allItems array based on current filter settings and displays them.
     */
    function filterItems() {
        const filtered = allItems.filter(item => {
            const itemCategory = (item.category || '').toLowerCase(); // Handle undefined category
            const itemTitle = (item.title || '').toLowerCase(); // Handle undefined title
            const itemDescription = (item.description || '').toLowerCase(); // Handle undefined description

            const matchesCategory = (currentCategoryFilter === 'all' || itemCategory === currentCategoryFilter);
            const matchesSearch = (itemTitle.includes(currentSearchTerm) || itemDescription.includes(currentSearchTerm));

            return matchesCategory && matchesSearch;
        });

        displayItems(filtered);
    }

    /**
     * Resets all filters to their default state ('all') and updates the UI.
     */
    window.resetFilters = function() {
        currentCategoryFilter = 'all';
        currentSearchTerm = '';

        // Reset category buttons UI
        if (categoryFilterButtons) {
            categoryFilterButtons.forEach(btn => {
                btn.classList.remove('active');
                if (btn.getAttribute('data-filter') === 'all') {
                    btn.classList.add('active');
                }
            });
        }

        // Clear search input
        if (searchInput) {
            searchInput.value = '';
        }

        filterItems(); // Re-apply all filters
    };


    // --- Event Listeners for Filters ---
    if (categoryFilterButtons) {
        categoryFilterButtons.forEach(button => {
            button.addEventListener('click', function() {
                categoryFilterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                currentCategoryFilter = this.getAttribute('data-filter');
                filterItems();
            });
        });
    }

    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            currentSearchTerm = this.value.toLowerCase();
            filterItems();
        });
    }
    
    // --- Initial setup and Navbar scroll effect ---

    // Fetch items and display them on load (only runs if itemsContainer exists)
    fetchItems();

    // Navbar scroll effect (applies to all pages)
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (navbar) { // Check if navbar exists on the page
            if (window.scrollY > 50) {
                navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
            } else {
                navbar.style.boxShadow = 'none';
            }
        }
    });
});
