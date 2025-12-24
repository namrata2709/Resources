/**
 * Knowledge Check List Manager
 * Handles loading, filtering, sorting, and rendering of KC list
 */

(function() {
    'use strict';

    // Global variables
    let kcData = [];
    let filteredData = [];

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        loadKCList();
    }

    // Load KC list from JSON
    async function loadKCList() {
        try {
            const response = await fetch('data/kc-list.json');
            if (!response.ok) throw new Error('Failed to load JSON');
            const data = await response.json();
            kcData = data.knowledgeChecks;
            filteredData = [...kcData];
            
            populateTopicFilter();
            sortKCs();
        } catch (error) {
            console.error('Error loading KC list:', error);
            document.getElementById('kcListContainer').innerHTML = `
                <div class="error">
                    <h2>Error Loading Knowledge Checks</h2>
                    <p>Could not load data/kc-list.json. Please ensure the file exists.</p>
                    <p style="font-size: 0.9em; margin-top: 1rem;">For local development, run: <code style="background: rgba(0,0,0,0.1); padding: 0.2rem 0.5rem; border-radius: 4px;">python -m http.server 8000</code></p>
                </div>
            `;
        }
    }

    // Populate topic filter dropdown
    function populateTopicFilter() {
        const topicFilter = document.getElementById('topicFilter');
        const topics = [...new Set(kcData.map(kc => kc.topic))].sort();
        
        // Clear existing options except "All Topics"
        topicFilter.innerHTML = '<option value="">All Topics</option>';
        
        topics.forEach(topic => {
            const option = document.createElement('option');
            option.value = topic;
            option.textContent = topic;
            topicFilter.appendChild(option);
        });
    }

    // Sort KCs based on selected option
    function sortKCs() {
        const sortValue = document.getElementById('sortSelect').value;
        
        filteredData.sort((a, b) => {
            switch(sortValue) {
                case 'title-asc':
                    return a.title.localeCompare(b.title);
                case 'title-desc':
                    return b.title.localeCompare(a.title);
                case 'topic-asc':
                    return a.topic.localeCompare(b.topic) || a.title.localeCompare(b.title);
                case 'topic-desc':
                    return b.topic.localeCompare(a.topic) || a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });
        
        renderKCList();
    }

    // Filter KCs based on search and topic
    function filterKCs() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const topicFilter = document.getElementById('topicFilter').value;
        
        filteredData = kcData.filter(kc => {
            const matchesSearch = kc.title.toLowerCase().includes(searchTerm) || 
                                 kc.topic.toLowerCase().includes(searchTerm);
            const matchesTopic = !topicFilter || kc.topic === topicFilter;
            
            return matchesSearch && matchesTopic;
        });
        
        sortKCs();
    }

    // Render KC cards
    function renderKCList() {
        const container = document.getElementById('kcListContainer');
        
        if (filteredData.length === 0) {
            container.innerHTML = '<div class="loading">No knowledge checks found matching your criteria.</div>';
            return;
        }

        container.innerHTML = filteredData.map(kc => `
            <div class="kc-card" onclick="openKC('${kc.file}', '${kc.title.replace(/'/g, "\\'")}')">
                <h3>${kc.title}</h3>
                <p>📚 ${kc.topic}</p>
            </div>
        `).join('');
    }

    // Open KC answer page
    function openKC(filename, title) {
        window.location.href = `kc-answer.html?kc=${filename}&title=${encodeURIComponent(title)}`;
    }

    // Expose functions to global scope for HTML event handlers
    window.filterKCs = filterKCs;
    window.sortKCs = sortKCs;
    window.openKC = openKC;
})();