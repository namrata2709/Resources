/**
 * Advanced Notes Manager (Final)
 * - Auto inject tag filter
 * - Search (title, category, tags, date)
 * - Filter (category, difficulty, tags)
 * - Clickable tags
 * - Related notes
 */

(function () {
    'use strict';

    let notesData = [];
    let filteredData = [];
    let categories = new Set();
    let tagsSet = new Set();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        injectTagFilter();
        loadNotes();
        setupModalClickOutside();
    }

    // ----------------------------
    // INJECT TAG FILTER
    // ----------------------------

    function injectTagFilter() {
        const filterControls = document.querySelector('.filter-controls');
        if (!filterControls) return;

        if (document.getElementById('tagFilter')) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'filter-group';

        wrapper.innerHTML = `
            <label for="tagFilter">Filter by Tag:</label>
            <select id="tagFilter" onchange="filterNotes()">
                <option value="">All Tags</option>
            </select>
        `;

        const firstGroup = filterControls.querySelector('.filter-group');
        if (firstGroup) {
            filterControls.insertBefore(wrapper, firstGroup.nextSibling);
        } else {
            filterControls.appendChild(wrapper);
        }
    }

    // ----------------------------
    // LOAD DATA
    // ----------------------------

    async function loadNotes() {
        try {
            const response = await fetch('data/notes-list.json');
            if (!response.ok) throw new Error('Failed to load JSON');

            const data = await response.json();
            notesData = data.notes;
            filteredData = [...notesData];

            notesData.forEach(note => {
                if (note.category) categories.add(note.category);

                if (note.tags) {
                    note.tags.forEach(tag => tagsSet.add(tag));
                }
            });

            populateCategoryFilter();
            populateTagFilter();

            sortNotes();

        } catch (error) {
            console.error(error);
            document.getElementById('notesContainer').innerHTML =
                `<div class="error">Error loading notes.</div>`;
        }
    }

    // ----------------------------
    // FILTER DROPDOWNS
    // ----------------------------

    function populateCategoryFilter() {
        const el = document.getElementById('categoryFilter');
        if (!el) return;

        Array.from(categories).sort().forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            el.appendChild(option);
        });
    }

    function populateTagFilter() {
        const el = document.getElementById('tagFilter');
        if (!el) return;

        Array.from(tagsSet).sort().forEach(tag => {
            const option = document.createElement('option');
            option.value = tag;
            option.textContent = tag;
            el.appendChild(option);
        });
    }

    // ----------------------------
    // FILTER + SEARCH
    // ----------------------------

    function filterNotes() {
        const search = document.getElementById('searchInput').value.toLowerCase();
        const category = document.getElementById('categoryFilter')?.value;
        const difficulty = document.getElementById('difficultyFilter')?.value;
        const tag = document.getElementById('tagFilter')?.value;

        filteredData = notesData.filter(note => {

            const matchesSearch =
                note.title.toLowerCase().includes(search) ||
                (note.category || '').toLowerCase().includes(search) ||
                (note.tags || []).join(' ').toLowerCase().includes(search) ||
                note.date.includes(search);

            const matchesCategory = !category || note.category === category;
            const matchesDifficulty = !difficulty || note.difficulty === difficulty;
            const matchesTag = !tag || (note.tags || []).includes(tag);

            return matchesSearch && matchesCategory && matchesDifficulty && matchesTag;
        });

        sortNotes();
    }

    function sortNotes() {
        const sortValue = document.getElementById('sortSelect').value;

        filteredData.sort((a, b) => {
            switch (sortValue) {
                case 'date-desc': return new Date(b.date) - new Date(a.date);
                case 'date-asc': return new Date(a.date) - new Date(b.date);
                case 'title-asc': return a.title.localeCompare(b.title);
                case 'title-desc': return b.title.localeCompare(a.title);
                default: return 0;
            }
        });

        renderNotes();
    }

    // ----------------------------
    // RENDER
    // ----------------------------

    function renderNotes() {
        const container = document.getElementById('notesContainer');

        if (filteredData.length === 0) {
            container.innerHTML = `<div class="loading">No notes found</div>`;
            return;
        }

        container.innerHTML = filteredData.map(note => {



            return `
                <div class="note-folder" onclick='openFolder(${JSON.stringify(note).replace(/'/g, "&#39;")})'>
                    <div class="folder-icon">${getCategoryIcon(note.category)}</div>

                    <div class="folder-content">
                        <h3>${note.title}</h3>

                        <div class="note-meta">
                            <span>${note.category || 'General'}</span>
                            ${getDifficultyBadge(note.difficulty)}
                            <span>📅 ${formatDate(note.date)}</span>
                        </div>

                    </div>
                </div>
            `;
        }).join('');
    }

    // ----------------------------
    // RELATED NOTES
    // ----------------------------

    function getRelatedNotes(currentNote) {
        if (!currentNote.tags) return [];

        return notesData
            .filter(n => n.folder !== currentNote.folder)
            .map(n => {
                const overlap = (n.tags || []).filter(t => currentNote.tags.includes(t)).length;
                return { note: n, score: overlap };
            })
            .filter(x => x.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)
            .map(x => x.note);
    }

    // ----------------------------
    // MODAL
    // ----------------------------

    function openFolder(note) {
        document.getElementById('modalTitle').textContent = note.title;
        let tagsHTML = '';

        if (note.tags && note.tags.length > 0) {
            tagsHTML = `
    <div class="modal-tags">
        <span class="tags-label">Tags:</span>
        ${note.tags.map(tag => `
            <span class="tag-chip" onclick="filterByTag('${tag}')">${tag}</span>
        `).join('')}
    </div>
`;
        }
        let html = tagsHTML + '<div class="files-list">';

        if (note.files) {
            note.files.forEach(file => {
                html += `
                    <div class="file-item" onclick="openFile('${note.folder}','${file.file}','${file.type}')">
                        <span>${file.icon}</span>
                        <span>${file.name}</span>
                    </div>
                `;
            });
        }

        html += '</div>';

        const related = getRelatedNotes(note);

        if (related.length > 0) {
            html += `<h3 style="margin-top:20px;">Related Notes</h3>`;
            html += related.map(r => `
                <div class="related-item" onclick='openFolder(${JSON.stringify(r).replace(/'/g, "&#39;")})'>
                    ${r.title}
                </div>
            `).join('');
        }

        document.getElementById('modalBody').innerHTML = html;
        document.getElementById('folderModal').classList.add('active');
    }

    function closeModal() {
        document.getElementById('folderModal').classList.remove('active');
    }

    function setupModalClickOutside() {
        window.onclick = function (event) {
            const modal = document.getElementById('folderModal');
            if (event.target === modal) closeModal();
        };
    }

    // ----------------------------
    // HELPERS
    // ----------------------------

    function filterByTag(tag) {
        const el = document.getElementById('tagFilter');
        if (el) el.value = tag;
        filterNotes();
    }

    function getCategoryIcon(category) {
        const icons = {
            Compute: '⚙️',
            Storage: '💾',
            Database: '🗄️',
            Networking: '🌐',
            Security: '🔒',
            Monitoring: '📊',
            Management: '🛠️',
            Fundamentals: '📚'
        };
        return icons[category] || '📂';
    }

    function formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    function getDifficultyBadge(difficulty) {
        const map = {
            Beginner: '🟢 Beginner',
            Intermediate: '🟡 Intermediate',
            Advanced: '🔴 Advanced'
        };
        return map[difficulty] ? `<span>${map[difficulty]}</span>` : '';
    }

    function openFile(folder, file, type) {
        const path = `data/notes/${folder}/${file}`;

        if (type === 'html') {
            window.open(path, '_self');
        } else {
            window.open(path, '_blank');
        }
    }

    // expose globally
    window.filterNotes = filterNotes;
    window.sortNotes = sortNotes;
    window.openFolder = openFolder;
    window.closeModal = closeModal;
    window.filterByTag = filterByTag;

})();