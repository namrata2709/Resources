/**
 * Notes Template Interactive Features
 * Handles checklist, quiz, and flashcard functionality for notes pages
 * Usage: Include this script on overview.html and complete.html pages
 * 
 * File location: js/notes-template.js
 * Linked in HTML as: <script src="../../../js/notes-template.js"></script>
 */

(function() {
    'use strict';

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        initChecklist();
        // Quiz and flashcard functions are called via onclick in HTML
    }

    // ============================================
    // CHECKLIST MANAGEMENT
    // ============================================

    const pageId = typeof document !== 'undefined' 
        ? document.title.replace(/[^a-z0-9]/gi, '-').toLowerCase() 
        : 'default';

    function initChecklist() {
        loadChecklistState();
        
        // Add listeners to all checkboxes
        const checkboxes = document.querySelectorAll('.checklist-item');
        checkboxes.forEach(cb => {
            cb.addEventListener('change', saveChecklistState);
        });
    }

    function updateChecklistProgress() {
        const checkboxes = document.querySelectorAll('.checklist-item');
        const checked = document.querySelectorAll('.checklist-item:checked').length;
        const total = checkboxes.length;
        const percentage = total > 0 ? (checked / total) * 100 : 0;
        
        const progressText = document.getElementById('checklistProgress');
        const progressFill = document.getElementById('progressFill');
        
        if (progressText) progressText.textContent = `${checked}/${total}`;
        if (progressFill) progressFill.style.width = `${percentage}%`;
    }

    function saveChecklistState() {
        const checkboxes = document.querySelectorAll('.checklist-item');
        checkboxes.forEach(cb => {
            const key = `${pageId}-${cb.dataset.key}`;
            localStorage.setItem(key, cb.checked);
        });
        updateChecklistProgress();
    }

    function loadChecklistState() {
        const checkboxes = document.querySelectorAll('.checklist-item');
        checkboxes.forEach(cb => {
            const key = `${pageId}-${cb.dataset.key}`;
            const saved = localStorage.getItem(key);
            if (saved === 'true') cb.checked = true;
        });
        updateChecklistProgress();
    }

    function resetChecklist() {
        if (confirm('Reset all checklist items?')) {
            const checkboxes = document.querySelectorAll('.checklist-item');
            checkboxes.forEach(cb => {
                cb.checked = false;
                const key = `${pageId}-${cb.dataset.key}`;
                localStorage.removeItem(key);
            });
            updateChecklistProgress();
        }
    }

    // ============================================
    // QUIZ MANAGEMENT
    // ============================================

    function checkAllAnswers() {
        const questions = document.querySelectorAll('.quiz-question');
        let correct = 0;
        let total = questions.length;
        
        if (total === 0) {
            alert('No quiz questions found on this page.');
            return;
        }
        
        questions.forEach(q => {
            const correctAnswer = q.dataset.correct;
            const selected = q.querySelector('input[type="radio"]:checked');
            const explanation = q.querySelector('.quiz-explanation');
            
            // Show explanation
            if (explanation) explanation.style.display = 'block';
            
            // Mark correct/incorrect
            if (selected && selected.value === correctAnswer) {
                q.classList.add('correct');
                q.classList.remove('incorrect');
                correct++;
            } else {
                q.classList.add('incorrect');
                q.classList.remove('correct');
            }
        });
        
        const scoreDiv = document.getElementById('quizScore');
        if (scoreDiv) {
            const percentage = total > 0 ? ((correct / total) * 100).toFixed(1) : 0;
            scoreDiv.innerHTML = `<strong>Score: ${correct}/${total} (${percentage}%)</strong>`;
            scoreDiv.style.display = 'block';
            
            // Add color coding for score
            scoreDiv.className = 'quiz-score';
            if (percentage >= 80) {
                scoreDiv.classList.add('excellent');
            } else if (percentage >= 60) {
                scoreDiv.classList.add('good');
            } else {
                scoreDiv.classList.add('needs-improvement');
            }
        }
    }

    function resetQuiz() {
        if (confirm('Reset all quiz answers?')) {
            const questions = document.querySelectorAll('.quiz-question');
            questions.forEach(q => {
                q.classList.remove('correct', 'incorrect');
                const explanation = q.querySelector('.quiz-explanation');
                if (explanation) explanation.style.display = 'none';
                q.querySelectorAll('input[type="radio"]').forEach(input => {
                    input.checked = false;
                });
            });
            const scoreDiv = document.getElementById('quizScore');
            if (scoreDiv) {
                scoreDiv.style.display = 'none';
                scoreDiv.className = 'quiz-score';
            }
        }
    }

    // ============================================
    // FLASHCARD MANAGEMENT
    // ============================================

    /**
     * Flashcards use inline onclick handlers for simplicity:
     * onclick="this.closest('.flashcard-inner').classList.toggle('flipped')"
     * 
     * This allows for simple flip functionality without complex event delegation
     * Each flashcard independently manages its own flip state
     */

    // Optional: Add keyboard navigation for flashcards
    function initFlashcardKeyboard() {
        document.addEventListener('keydown', function(e) {
            // Press 'F' to flip the currently hovered flashcard
            if (e.key === 'f' || e.key === 'F') {
                const hovered = document.querySelector('.flashcard:hover .flashcard-inner');
                if (hovered) {
                    hovered.classList.toggle('flipped');
                }
            }
        });
    }

    // ============================================
    // COLLAPSIBLE SECTIONS
    // ============================================

    /**
     * Collapsible sections use native HTML <details> and <summary> elements
     * No JavaScript needed - browser handles it automatically
     * 
     * To make a section collapsible in HTML:
     * <details class="collapsible-section">
     *     <summary><h2>Section Title</h2></summary>
     *     <div class="section-content">
     *         Content here...
     *     </div>
     * </details>
     */

    // Optional: Save/load collapsed state
    function saveCollapsedState() {
        const details = document.querySelectorAll('details.collapsible-section');
        details.forEach((detail, index) => {
            const key = `${pageId}-section-${index}`;
            localStorage.setItem(key, detail.open);
        });
    }

    function loadCollapsedState() {
        const details = document.querySelectorAll('details.collapsible-section');
        details.forEach((detail, index) => {
            const key = `${pageId}-section-${index}`;
            const saved = localStorage.getItem(key);
            if (saved !== null) {
                detail.open = saved === 'true';
            }
        });
    }

    // Add listeners to save state when sections are toggled
    function initCollapsibleState() {
        const details = document.querySelectorAll('details.collapsible-section');
        details.forEach(detail => {
            detail.addEventListener('toggle', saveCollapsedState);
        });
        loadCollapsedState();
    }

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================

    /**
     * Scroll to top of page
     */
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    /**
     * Print current page
     */
    function printPage() {
        window.print();
    }

    /**
     * Copy code block to clipboard
     */
    function copyCodeBlock(button) {
        const codeBlock = button.parentElement.querySelector('code');
        if (codeBlock) {
            const text = codeBlock.textContent;
            navigator.clipboard.writeText(text).then(() => {
                const originalText = button.textContent;
                button.textContent = '✓ Copied!';
                setTimeout(() => {
                    button.textContent = originalText;
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy:', err);
                alert('Failed to copy to clipboard');
            });
        }
    }

    // ============================================
    // EXPOSE FUNCTIONS TO GLOBAL SCOPE
    // ============================================

    window.resetChecklist = resetChecklist;
    window.checkAllAnswers = checkAllAnswers;
    window.resetQuiz = resetQuiz;
    window.scrollToTop = scrollToTop;
    window.printPage = printPage;
    window.copyCodeBlock = copyCodeBlock;

    // Optional features - uncomment to enable
    // initFlashcardKeyboard();
    // initCollapsibleState();

})();