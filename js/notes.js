/**
 * Notes Manager (Topic-Based)
 * Handles loading, filtering, sorting, and rendering of topic-based notes
 */

(function () {
    'use strict';

    // Global variables
    let notesData = [];
    let filteredData = [];
    let currentFolder = null;
    let categories = new Set();

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        loadNotes();
        setupModalClickOutside();
    }

    // Load notes from JSON
    async function loadNotes() {
        try {
            const response = await fetch('data/notes-list.json');
            if (!response.ok) throw new Error('Failed to load JSON');
            const data = await response.json();
            notesData = data.notes;
            filteredData = [...notesData];

            // Extract unique categories
            notesData.forEach(note => {
                if (note.category) {
                    categories.add(note.category);
                }
            });

            // Populate category filter
            populateCategoryFilter();

            sortNotes();
        } catch (error) {
            console.error('Error loading notes:', error);
            document.getElementById('notesContainer').innerHTML = `
                <div class="error">
                    <h2>Error Loading Notes</h2>
                    <p>Could not load data/notes-list.json. Please ensure the file exists.</p>
                    <p style="font-size: 0.9em; margin-top: 1rem;">For local development, run: <code style="background: rgba(0,0,0,0.1); padding: 0.2rem 0.5rem; border-radius: 4px;">python -m http.server 8000</code></p>
                </div>
            `;
        }
    }

    // Populate category filter dropdown
    function populateCategoryFilter() {
        const categoryFilter = document.getElementById('categoryFilter');
        const sortedCategories = Array.from(categories).sort();

        sortedCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            //categoryFilter.appendChild(option);
            console.log(categoryFilter);

        });

    }

    // Sort notes
    function sortNotes() {
        const sortValue = document.getElementById('sortSelect').value;

        filteredData.sort((a, b) => {
            switch (sortValue) {
                case 'date-desc':
                    return new Date(b.date) - new Date(a.date);
                case 'date-asc':
                    return new Date(a.date) - new Date(b.date);
                case 'title-asc':
                    return a.title.localeCompare(b.title);
                case 'title-desc':
                    return b.title.localeCompare(a.title);
                case 'category':
                    return (a.category || '').localeCompare(b.category || '');
                default:
                    return 0;
            }
        });

        renderNotes();
    }

    // Filter notes
    function filterNotes() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const categoryFilter = document.getElementById('categoryFilter').value;
        const difficultyFilter = document.getElementById('difficultyFilter').value;

        filteredData = notesData.filter(note => {
            const matchesSearch = note.title.toLowerCase().includes(searchTerm) ||
                (note.category || '').toLowerCase().includes(searchTerm) ||
                note.date.includes(searchTerm);
            const matchesCategory = !categoryFilter || note.category === categoryFilter;
            const matchesDifficulty = !difficultyFilter || note.difficulty === difficultyFilter;

            return matchesSearch && matchesCategory && matchesDifficulty;
        });

        sortNotes();
    }

    // Get difficulty badge HTML
    function getDifficultyBadge(difficulty) {
        const badges = {
            'Beginner': '<span class="difficulty-badge beginner">🟢 Beginner</span>',
            'Intermediate': '<span class="difficulty-badge intermediate">🟡 Intermediate</span>',
            'Advanced': '<span class="difficulty-badge advanced">🔴 Advanced</span>'
        };
        return badges[difficulty] || '';
    }

    // Render notes as folder cards
    function renderNotes() {
        const container = document.getElementById('notesContainer');

        if (filteredData.length === 0) {
            container.innerHTML = '<div class="loading">No notes found matching your criteria.</div>';
            return;
        }

        container.innerHTML = filteredData.map(note => {
            const icon = getCategoryIcon(note.category);
            const formattedDate = formatDate(note.date);
            const fileCount = note.files ? note.files.length : 0;
            const difficultyBadge = getDifficultyBadge(note.difficulty);

            return `
                <div class="note-folder" onclick='openFolder(${JSON.stringify(note).replace(/'/g, "&#39;")})'>
                    <div class="folder-icon">${icon}</div>
                    <div class="folder-content">
                        <h3>${note.title}</h3>
                        <div class="note-meta">
                            <span class="note-category">${note.category || 'General'}</span>
                            ${difficultyBadge}
                            <span class="note-date">📅 ${formattedDate}</span>
                            <span class="note-files">📝 ${fileCount} files</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Get category icon
    function getCategoryIcon(category) {
        const icons = {
            'Compute': '⚙️',
            'Storage': '💾',
            'Database': '🗄️',
            'Networking': '🌐',
            'Security': '🔒',
            'Monitoring': '📊',
            'Management': '🛠️',
            'Fundamentals': '📚',
            'General': '📂'
        };
        return icons[category] || '📂';
    }

    // Format date for display
    function formatDate(dateStr) {
        const date = new Date(dateStr);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    // Open folder modal to show files
    function openFolder(note) {
        currentFolder = note;
        document.getElementById('modalTitle').textContent = `${getCategoryIcon(note.category)} ${note.title}`;

        const modalBody = document.getElementById('modalBody');

        if (!note.files || note.files.length === 0) {
            modalBody.innerHTML = '<p class="note-description">No files in this folder yet.</p>';
        } else {
            let filesHTML = '<div class="files-list">';

            // Add images gallery link first if images exist
            if (note.hasImages && note.images && note.images.length > 0) {
                filesHTML += `
                    <div class="file-item" data-action="gallery" data-folder="${note.folder}">
                        <span class="file-icon">🖼️</span>
                        <div class="file-info">
                            <span class="file-name">Images Gallery (${note.images.length})</span>
                            <span class="file-type">View all images</span>
                        </div>
                        <span class="file-arrow">→</span>
                    </div>
                `;
            }

            // Add other files
            note.files.forEach((file, index) => {
                filesHTML += `
                    <div class="file-item" data-action="file" data-index="${index}">
                        <span class="file-icon">${file.icon}</span>
                        <div class="file-info">
                            <span class="file-name">${file.name}</span>
                            <span class="file-type">${getFileTypeLabel(file.type)}</span>
                        </div>
                        <span class="file-arrow">→</span>
                    </div>
                `;
            });

            filesHTML += '</div>';
            modalBody.innerHTML = filesHTML;

            // Add click handlers to file items
            attachFileClickHandlers(note);
        }

        document.getElementById('folderModal').classList.add('active');
    }

    // Attach click handlers to file items
    function attachFileClickHandlers(note) {
        const fileItems = document.querySelectorAll('.file-item');

        fileItems.forEach(item => {
            item.addEventListener('click', function () {
                const action = this.getAttribute('data-action');

                if (action === 'gallery') {
                    const folder = this.getAttribute('data-folder');
                    openGallery(folder);
                } else if (action === 'file') {
                    const index = parseInt(this.getAttribute('data-index'));
                    const file = note.files[index];
                    openFile(note.folder, file.file, file.type);
                }
            });
        });
    }

    // Close modal
    function closeModal() {
        document.getElementById('folderModal').classList.remove('active');
    }

    // Get file type label
    function getFileTypeLabel(type) {
        const labels = {
            'html': 'HTML Document',
            'pdf': 'PDF Document',
            'txt': 'Text File',
            'doc': 'Word Document',
            'link': 'External Link'
        };
        return labels[type] || 'File';
    }

    // Open gallery with folder parameter
    function openGallery(folder) {
        window.open(`data/notes/images.html?folder=${folder}`, '_self');
    }

    // Open file (navigate or download)
    function openFile(folder, filename, type) {
        // Special handling for external links
        if (type === 'link') {
            window.open(filename, '_blank');
            return;
        }

        // For all other file types, construct the filepath
        const filepath = `data/notes/${folder}/${filename}`;

        if (type === 'html') {
            window.open(filepath, '_self');
        } else if (type === 'pdf' || type === 'txt') {
            window.open(filepath, '_blank');
        } else if (type === 'doc') {
            const link = document.createElement('a');
            link.href = filepath;
            link.download = filename;
            link.click();
        }
    }

    // Close modal when clicking outside
    function setupModalClickOutside() {
        window.onclick = function (event) {
            const modal = document.getElementById('folderModal');
            if (event.target === modal) {
                closeModal();
            }
        };
    }

    // Expose functions to global scope for HTML event handlers
    window.filterNotes = filterNotes;
    window.sortNotes = sortNotes;
    window.openFolder = openFolder;
    window.closeModal = closeModal;
    window.openGallery = openGallery;
})();