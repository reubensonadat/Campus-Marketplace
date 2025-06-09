document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const itemsContainer = document.getElementById('itemsContainer');
    const categoryFilterButtons = document.querySelectorAll('.category-btn');
    const campusFilterDropdown = document.getElementById('campusFilterDropdown');
    const campusFilterOptions = document.querySelectorAll('#campusFilterOptions .dropdown-item');
    const searchInput = document.getElementById('searchInput');
    const noResultsMessage = document.getElementById('noResultsMessage');

    // Global variables to hold data and current filters
    let allItems = []; // This will store all items fetched from data.json
    let currentCategoryFilter = 'all';
    let currentCampusFilter = 'all';
    let currentSearchTerm = '';

    /**
     * Fetches item data from data.json and initializes the display.
     */
    async function fetchItems() {
        try {
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allItems = await response.json();
            console.log('Items loaded:', allItems); // For debugging
            filterItems(); // Initial filtering to display all items
        } catch (error) {
            console.error('Could not fetch items:', error);
            itemsContainer.innerHTML = '<p class="text-center text-danger">Failed to load items. Please try again later.</p>';
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
        const campusName = item.campus.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        const categoryName = item.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

        return `
            <div class="col-lg-4 col-md-6" data-category="${item.category}" data-campus="${item.campus}" data-item-id="${item.id}">
                <div class="card h-100 shadow-sm">
                    <span class="badge bg-primary campus-badge">${campusName}</span>
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
        itemsContainer.innerHTML = ''; // Clear existing items

        if (itemsToDisplay.length === 0) {
            noResultsMessage.style.display = 'block';
        } else {
            noResultsMessage.style.display = 'none';
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
            const itemCategory = item.category.toLowerCase();
            const itemCampus = item.campus.toLowerCase();
            const itemTitle = item.title.toLowerCase();
            const itemDescription = item.description.toLowerCase();

            const matchesCategory = (currentCategoryFilter === 'all' || itemCategory === currentCategoryFilter);
            const matchesCampus = (currentCampusFilter === 'all' || itemCampus === currentCampusFilter);
            const matchesSearch = (itemTitle.includes(currentSearchTerm) || itemDescription.includes(currentSearchTerm));

            return matchesCategory && matchesCampus && matchesSearch;
        });

        displayItems(filtered);
    }

    /**
     * Resets all filters to their default state ('all') and updates the UI.
     */
    window.resetFilters = function() {
        currentCategoryFilter = 'all';
        currentCampusFilter = 'all';
        currentSearchTerm = '';

        // Reset category buttons UI
        categoryFilterButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-filter') === 'all') {
                btn.classList.add('active');
            }
        });

        // Reset campus dropdown UI
        campusFilterOptions.forEach(opt => {
            opt.classList.remove('active');
            if (opt.getAttribute('data-filter') === 'all') {
                opt.classList.add('active');
            }
        });
        campusFilterDropdown.innerHTML = `<i class="fas fa-map-marker-alt me-1"></i> Campus: All Campuses`;

        // Clear search input
        searchInput.value = '';

        filterItems(); // Re-apply all filters
    };


    // --- Event Listeners for Filters ---

    // Category filtering
    categoryFilterButtons.forEach(button => {
        button.addEventListener('click', function() {
            categoryFilterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentCategoryFilter = this.getAttribute('data-filter');
            filterItems();
        });
    });

    // Campus filtering (using the dropdown items)
    campusFilterOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();

            campusFilterOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');

            currentCampusFilter = this.getAttribute('data-filter');
            const campusName = this.textContent;
            campusFilterDropdown.innerHTML = `<i class="fas fa-map-marker-alt me-1"></i> Campus: ${campusName}`;

            filterItems();
        });
    });

    // Search functionality
    searchInput.addEventListener('input', function() {
        currentSearchTerm = this.value.toLowerCase();
        filterItems();
    });
    
    // --- Initial setup and Navbar scroll effect ---

    // Fetch items and display them on load
    fetchItems();

    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        } else {
            navbar.style.boxShadow = 'none';
        }
    });
});
