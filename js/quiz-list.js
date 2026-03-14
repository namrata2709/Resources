/**
 * Knowledge Check List Manager
 * Handles loading, filtering, sorting, and rendering of Quiz list
 */

(function() {
    'use strict';

    // Global variables
    let quizData = [];
    let filteredData = [];

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        loadQuizList();
    }

    // Load Quiz list from JSON
    async function loadQuizList() {
        try {
            const response = await fetch('data/quiz-list.json');
            if (!response.ok) throw new Error('Failed to load JSON');
            const data = await response.json();
            quizData = data.Quizzes || [];
            filteredData = [...quizData];
            
            populateTopicFilter();
            sortQuizs();
        } catch (error) {
            console.error('Error loading Quiz list:', error);
            document.getElementById('quizListContainer').innerHTML = `
                <div class="error">
                    <h2>Error Loading Knowledge Checks</h2>
                    <p>Could not load data/quiz-list.json. Please ensure the file exists.</p>
                    <p style="font-size: 0.9em; margin-top: 1rem;">For local development, run: <code style="background: rgba(0,0,0,0.1); padding: 0.2rem 0.5rem; border-radius: 4px;">python -m http.server 8000</code></p>
                </div>
            `;
        }
    }

    // Populate topic filter dropdown
    function populateTopicFilter() {
        const topicFilter = document.getElementById('topicFilter');
        const topics = [...new Set(quizData.map(quiz => quiz.topic))].sort();
        
        // Clear existing options except "All Topics"
        topicFilter.innerHTML = '<option value="">All Topics</option>';
        
        topics.forEach(topic => {
            const option = document.createElement('option');
            option.value = topic;
            option.textContent = topic;
            topicFilter.appendChild(option);
        });
    }

    // Sort Quizs based on selected option
    function sortQuizs() {
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
        
        renderQuizList();
    }

    // Filter Quizs based on search and topic
    function filterQuizs() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const topicFilter = document.getElementById('topicFilter').value;
        
        filteredData = quizData.filter(quiz => {
            const matchesSearch = quiz.title.toLowerCase().includes(searchTerm) || 
                                 quiz.topic.toLowerCase().includes(searchTerm);
            const matchesTopic = !topicFilter || quiz.topic === topicFilter;
            
            return matchesSearch && matchesTopic;
        });
        
        sortQuizs();
    }

    // Render Quiz cards
    function renderQuizList() {
        const container = document.getElementById('quizListContainer');
        
        if (filteredData.length === 0) {
            container.innerHTML = '<div class="loading">No quizs found matching your criteria.</div>';
            return;
        }

        container.innerHTML = filteredData.map(quiz => `
            <div class="quiz-card" onclick="openQuiz('${quiz.file}', '${quiz.title.replace(/'/g, "\\'")}')">
                <h3>${quiz.title}</h3>
                <p>📚 ${quiz.topic}</p>
            </div>
        `).join('');
    }

    // Open Quiz answer page
    function openQuiz(filename, title) {
        window.location.href = `quiz.html?quiz=${filename}&title=${encodeURIComponent(title)}`;
    }

    // Expose functions to global scope for HTML event handlers
    window.filterQuizs = filterQuizs;
    window.sortQuizs = sortQuizs;
    window.openQuiz = openQuiz;
})();