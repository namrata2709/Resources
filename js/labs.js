/**
 * Labs Manager
 * Handles loading, filtering, sorting, and rendering of labs
 */

(function() {
    'use strict';

    // Global variables
    let labsData = [];
    let filteredData = [];
    let currentLab = null;

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        loadLabs();
        setupModalClickOutside();
    }

    // Load labs from JSON
    async function loadLabs() {
        try {
            const response = await fetch('data/labs-list.json');
            if (!response.ok) throw new Error('Failed to load JSON');
            const data = await response.json();
            labsData = data.labs;
            filteredData = [...labsData];
            
            populateCategoryFilter();
            sortLabs();
        } catch (error) {
            console.error('Error loading labs:', error);
            document.getElementById('labsContainer').innerHTML = `
                <div class="error">
                    <h2>Error Loading Labs</h2>
                    <p>Could not load data/labs-list.json. Please ensure the file exists.</p>
                    <p style="font-size: 0.9em; margin-top: 1rem;">For local development, run: <code style="background: rgba(0,0,0,0.1); padding: 0.2rem 0.5rem; border-radius: 4px;">python -m http.server 8000</code></p>
                </div>
            `;
        }
    }

    // Populate category filter dropdown
    function populateCategoryFilter() {
        const categoryFilter = document.getElementById('categoryFilter');
        const categories = [...new Set(labsData.map(lab => lab.category))].sort();
        
        // Clear existing options except "All Categories"
        categoryFilter.innerHTML = '<option value="">All Categories</option>';
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    // Sort labs
    function sortLabs() {
        const sortValue = document.getElementById('sortSelect').value;
        
        filteredData.sort((a, b) => {
            switch(sortValue) {
                case 'order-asc':
                    return a.order - b.order;
                case 'title-asc':
                    return a.title.localeCompare(b.title);
                case 'title-desc':
                    return b.title.localeCompare(a.title);
                case 'category-asc':
                    return a.category.localeCompare(b.category) || a.order - b.order;
                default:
                    return 0;
            }
        });
        
        renderLabs();
    }

    // Filter labs
    function filterLabs() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const categoryFilter = document.getElementById('categoryFilter').value;
        const difficultyFilter = document.getElementById('difficultyFilter').value;
        
        filteredData = labsData.filter(lab => {
            const matchesSearch = lab.title.toLowerCase().includes(searchTerm) || 
                                 lab.category.toLowerCase().includes(searchTerm) ||
                                 (lab.description && lab.description.toLowerCase().includes(searchTerm));
            const matchesCategory = !categoryFilter || lab.category === categoryFilter;
            const matchesDifficulty = !difficultyFilter || lab.difficulty === difficultyFilter;
            
            return matchesSearch && matchesCategory && matchesDifficulty;
        });
        
        sortLabs();
    }

    // Render labs as folder cards
    function renderLabs() {
        const container = document.getElementById('labsContainer');
        
        if (filteredData.length === 0) {
            container.innerHTML = '<div class="loading">No labs found matching your criteria.</div>';
            return;
        }

        container.innerHTML = filteredData.map(lab => {
            const icon = getCategoryIcon(lab.category);
            const difficultyBadge = getDifficultyBadge(lab.difficulty);
            const fileCount = lab.files ? lab.files.length : 0;
            
            return `
                <div class="note-folder" onclick='openLab(${JSON.stringify(lab).replace(/'/g, "&#39;")})'>
                    <div class="folder-icon">${icon}</div>
                    <div class="folder-content">
                        <h3>${lab.title}</h3>
                        <p class="note-description">${lab.description || ''}</p>
                        <div class="note-meta">
                            <span class="note-date">📚 ${lab.category}</span>
                            <span class="note-files">📎 ${fileCount} files</span>
                            ${difficultyBadge}
                            ${lab.duration ? `<span class="note-files">⏱️ ${lab.duration}</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Get icon based on category
    function getCategoryIcon(category) {
        const icons = {
            'EC2': '💻',
            'S3': '🪣',
            'VPC': '🌐',
            'IAM': '🔐',
            'RDS': '🗄️',
            'Lambda': '⚡',
            'CloudFormation': '📋',
            'Networking': '🔗',
            'Security': '🛡️',
            'Database': '💾',
            'Monitoring': '📊',
            'Storage': '💿',
            'Linux': '🐧',
            'Python': '🐍'
        };
        return icons[category] || '🔬';
    }

    // Get difficulty badge HTML
    function getDifficultyBadge(difficulty) {
        if (!difficulty) return '';
        return `<span class="difficulty-badge ${difficulty}">${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span>`;
    }

    // Open lab modal to show files
    function openLab(lab) {
        currentLab = lab;
        document.getElementById('modalTitle').textContent = `🔬 ${lab.title}`;
        
        const modalBody = document.getElementById('modalBody');
        
        if (!lab.files || lab.files.length === 0) {
            modalBody.innerHTML = '<p class="note-description">No files available for this lab yet.</p>';
        } else {
            let filesHTML = '<div class="files-list">';
            
            // Add files
            lab.files.forEach((file, index) => {
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
            attachFileClickHandlers(lab);
        }
        
        document.getElementById('labModal').classList.add('active');
    }

    // Attach click handlers to file items
    function attachFileClickHandlers(lab) {
        const fileItems = document.querySelectorAll('.file-item');
        
        fileItems.forEach(item => {
            item.addEventListener('click', function() {
                const action = this.getAttribute('data-action');
                
                if (action === 'file') {
                    const index = parseInt(this.getAttribute('data-index'));
                    const file = lab.files[index];
                    openFile(lab.folder, file.file, file.type);
                }
            });
        });
    }

    // Close modal
    function closeModal() {
        document.getElementById('labModal').classList.remove('active');
    }

    // Get file type label
    function getFileTypeLabel(type) {
        const labels = {
            'html': 'HTML Lab Guide',
            'pdf': 'PDF Document',
            'txt': 'Text File',
            'doc': 'Word Document',
            'link': 'Video Tutorial',
            'external': 'External Resource'
        };
        return labels[type] || 'File';
    }

    // Open file (navigate or download)
    function openFile(folder, filename, type) {
        // Special handling for external links
        if (type === 'link' || type === 'external') {
            // filename is actually the full URL for link types
            window.open(filename, '_blank');
            return;
        }
        
        // For all other file types, construct the filepath
        const filepath = `data/labs/${folder}/${filename}`;
        
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
        window.onclick = function(event) {
            const modal = document.getElementById('labModal');
            if (event.target === modal) {
                closeModal();
            }
        };
    }

    // Expose functions to global scope for HTML event handlers
    window.filterLabs = filterLabs;
    window.sortLabs = sortLabs;
    window.openLab = openLab;
    window.closeModal = closeModal;
})();