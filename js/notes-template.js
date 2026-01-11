/**
 * Enhanced Notes Template Interactive Features v2.0
 * Handles checklist, quiz, and flashcard functionality
 * File: js/notes-template.js
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
        try {
            initChecklist();
            initFlashcards();
            initQuiz();
            initCodeBlocks();
            console.log('✅ Notes template initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing notes template:', error);
        }
    }

    // ============================================
    // CHECKLIST MANAGEMENT
    // ============================================

    const pageId = typeof document !== 'undefined' 
        ? document.title.replace(/[^a-z0-9]/gi, '-').toLowerCase() 
        : 'default';

    function initChecklist() {
        const checkboxes = document.querySelectorAll('.checklist-item');
        if (checkboxes.length === 0) return;

        loadChecklistState();
        
        checkboxes.forEach(cb => {
            cb.addEventListener('change', saveChecklistState);
        });

        console.log(`📋 Initialized ${checkboxes.length} checklist items`);
    }

    function updateChecklistProgress() {
        const checkboxes = document.querySelectorAll('.checklist-item');
        const checked = document.querySelectorAll('.checklist-item:checked').length;
        const total = checkboxes.length;
        
        if (total === 0) return;
        
        const percentage = (checked / total) * 100;
        
        const progressText = document.getElementById('checklistProgress');
        const progressFill = document.getElementById('progressFill');
        
        if (progressText) {
            progressText.textContent = `${checked}/${total}`;
        }
        
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
            progressFill.textContent = `${Math.round(percentage)}%`;
        }

        // Save progress to localStorage
        try {
            localStorage.setItem(`${pageId}-checklist-progress`, JSON.stringify({
                checked,
                total,
                percentage,
                lastUpdated: new Date().toISOString()
            }));
        } catch (e) {
            console.warn('Could not save checklist progress:', e);
        }
    }

    function saveChecklistState() {
        const checkboxes = document.querySelectorAll('.checklist-item');
        checkboxes.forEach(cb => {
            const key = `${pageId}-${cb.dataset.key}`;
            try {
                localStorage.setItem(key, cb.checked.toString());
            } catch (e) {
                console.warn(`Could not save checkbox ${key}:`, e);
            }
        });
        updateChecklistProgress();
    }

    function loadChecklistState() {
        const checkboxes = document.querySelectorAll('.checklist-item');
        checkboxes.forEach(cb => {
            const key = `${pageId}-${cb.dataset.key}`;
            try {
                const saved = localStorage.getItem(key);
                if (saved === 'true') {
                    cb.checked = true;
                }
            } catch (e) {
                console.warn(`Could not load checkbox ${key}:`, e);
            }
        });
        updateChecklistProgress();
    }

    function resetChecklist() {
        if (!confirm('Reset all checklist items? This cannot be undone.')) {
            return;
        }

        const checkboxes = document.querySelectorAll('.checklist-item');
        checkboxes.forEach(cb => {
            cb.checked = false;
            const key = `${pageId}-${cb.dataset.key}`;
            try {
                localStorage.removeItem(key);
            } catch (e) {
                console.warn(`Could not remove checkbox ${key}:`, e);
            }
        });
        
        try {
            localStorage.removeItem(`${pageId}-checklist-progress`);
        } catch (e) {
            console.warn('Could not remove progress:', e);
        }
        
        updateChecklistProgress();
        console.log('✅ Checklist reset complete');
    }

    // ============================================
    // QUIZ MANAGEMENT (CAROUSEL STYLE)
    // ============================================

    let currentQuizQuestion = 1;
    let quizAnswers = {};
    let totalQuizQuestions = 0;

    function initQuiz() {
        const slides = document.querySelectorAll('.quiz-slide');
        totalQuizQuestions = slides.length;
        
        if (totalQuizQuestions === 0) return;

        // Load saved quiz state
        loadQuizState();
        
        updateQuizDisplay();
        
        // Add keyboard navigation
        document.addEventListener('keydown', handleQuizKeyboard);
        
        console.log(`📝 Initialized quiz with ${totalQuizQuestions} questions`);
    }

    function handleQuizKeyboard(e) {
        if (!document.querySelector('.quiz-carousel-container')) return;
        
        // Left arrow - previous question
        if (e.key === 'ArrowLeft' && currentQuizQuestion > 1) {
            previousQuestion();
        }
        
        // Right arrow - next question
        if (e.key === 'ArrowRight' && currentQuizQuestion < totalQuizQuestions) {
            nextQuestion();
        }
    }

    function updateQuizDisplay() {
        const slides = document.querySelectorAll('.quiz-slide');
        
        // Hide all slides
        slides.forEach(slide => slide.classList.remove('active'));

        // Show current slide
        const currentSlide = document.querySelector(`.quiz-slide[data-question="${currentQuizQuestion}"]`);
        if (currentSlide) {
            currentSlide.classList.add('active');
        }

        // Update counter
        const counter = document.getElementById('quizCounter');
        if (counter) {
            counter.textContent = `Question ${currentQuizQuestion} of ${totalQuizQuestions}`;
        }

        // Update navigation buttons
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (prevBtn) {
            prevBtn.disabled = currentQuizQuestion === 1;
        }
        if (nextBtn) {
            nextBtn.disabled = currentQuizQuestion === totalQuizQuestions;
        }

        // Update progress bar
        updateQuizProgressBar();
        
        // Update score
        updateQuizScore();
    }

    function updateQuizProgressBar() {
        const progressBar = document.querySelector('.quiz-progress-bar');
        if (!progressBar) return;
        
        const percentage = (currentQuizQuestion / totalQuizQuestions) * 100;
        progressBar.style.width = `${percentage}%`;
    }

    function updateBottomNavigation(questionNum, isCorrect) {
        const slide = document.querySelector(`.quiz-slide[data-question="${questionNum}"]`);
        if (!slide) return;

        // Check if bottom navigation already exists
        let bottomNav = slide.querySelector('.quiz-bottom-navigation');
        
        if (!bottomNav) {
            // Create bottom navigation
            bottomNav = document.createElement('div');
            bottomNav.className = 'quiz-bottom-navigation';
            
            const feedback = document.getElementById(`feedback${questionNum}`);
            if (feedback) {
                feedback.appendChild(bottomNav);
            }
        }

        // Clear existing buttons
        bottomNav.innerHTML = '';

        // Add Previous button (if not first question)
        if (currentQuizQuestion > 1) {
            const prevBtn = document.createElement('button');
            prevBtn.className = 'quiz-bottom-nav-btn';
            prevBtn.textContent = '← Previous Question';
            prevBtn.onclick = previousQuestion;
            bottomNav.appendChild(prevBtn);
        }

        // Add Next button (if not last question)
        if (currentQuizQuestion < totalQuizQuestions) {
            const nextBtn = document.createElement('button');
            nextBtn.className = 'quiz-bottom-nav-btn';
            nextBtn.textContent = 'Next Question →';
            nextBtn.onclick = nextQuestion;
            bottomNav.appendChild(nextBtn);
        }

        // Add "View Summary" button on last question if answered correctly
        if (currentQuizQuestion === totalQuizQuestions && isCorrect) {
            const summaryBtn = document.createElement('button');
            summaryBtn.className = 'quiz-bottom-nav-btn';
            summaryBtn.textContent = '📊 View Quiz Summary';
            summaryBtn.onclick = showQuizSummary;
            bottomNav.appendChild(summaryBtn);
        }
    }

    function nextQuestion() {
        if (currentQuizQuestion < totalQuizQuestions) {
            currentQuizQuestion++;
            updateQuizDisplay();
            saveQuizState();
        }
    }

    function previousQuestion() {
        if (currentQuizQuestion > 1) {
            currentQuizQuestion--;
            updateQuizDisplay();
            saveQuizState();
        }
    }

    function submitQuizAnswer(questionNum) {
        const slide = document.querySelector(`.quiz-slide[data-question="${questionNum}"]`);
        if (!slide) {
            console.error(`Quiz slide ${questionNum} not found`);
            return;
        }

        const correctAnswer = slide.dataset.correct;
        const selectedInput = slide.querySelector('input[type="radio"]:checked');
        
        if (!selectedInput) {
            alert('Please select an answer before submitting.');
            return;
        }

        const selectedAnswer = selectedInput.value;
        const isCorrect = selectedAnswer === correctAnswer;

        // Store answer
        quizAnswers[questionNum] = {
            selected: selectedAnswer,
            correct: correctAnswer,
            isCorrect: isCorrect,
            timestamp: new Date().toISOString()
        };

        // Show feedback
        const feedback = document.getElementById(`feedback${questionNum}`);
        const feedbackIcon = document.getElementById(`feedbackIcon${questionNum}`);
        const feedbackResult = document.getElementById(`feedbackResult${questionNum}`);
        const submitBtn = document.getElementById(`submitBtn${questionNum}`);

        if (feedback && feedbackIcon && feedbackResult) {
            feedback.style.display = 'block';
            
            if (isCorrect) {
                feedback.className = 'quiz-feedback correct';
                feedbackIcon.textContent = '✅';
                feedbackResult.textContent = '🎉 Correct! Well done!';
            } else {
                feedback.className = 'quiz-feedback incorrect';
                feedbackIcon.textContent = '❌';
                feedbackResult.textContent = '❌ Incorrect. Review the explanation below.';
            }
        }

        // Disable submit button only if answer is correct
        if (submitBtn) {
            if (isCorrect) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Answer Submitted ✓';
            } else {
                // For wrong answers, change to "Try Again"
                submitBtn.textContent = 'Try Again';
                submitBtn.style.background = 'var(--warning)';
            }
        }

        // Disable all radio buttons only if answer is correct
        if (isCorrect) {
            slide.querySelectorAll('input[type="radio"]').forEach(input => {
                input.disabled = true;
            });
        }

        // Show/update bottom navigation buttons
        updateBottomNavigation(questionNum, isCorrect);

        // Update score
        updateQuizScore();
        
        // Save state
        saveQuizState();

        // Show completion message if this was the last question
        if (currentQuizQuestion === totalQuizQuestions) {
            setTimeout(() => {
                showQuizCompletion();
            }, 1500);
        }
    }

    function updateQuizScore() {
        const answered = Object.keys(quizAnswers).length;
        const correct = Object.values(quizAnswers).filter(a => a.isCorrect).length;
        const percentage = answered > 0 ? ((correct / answered) * 100).toFixed(1) : 0;

        const scoreDisplay = document.getElementById('quizScoreDisplay');
        if (!scoreDisplay) return;
        
        scoreDisplay.textContent = `Score: ${correct}/${answered} (${percentage}%)`;
        
        // Color code based on performance
        if (percentage >= 80) {
            scoreDisplay.style.background = 'var(--success-light)';
            scoreDisplay.style.color = 'var(--success)';
        } else if (percentage >= 60) {
            scoreDisplay.style.background = 'var(--warning-light)';
            scoreDisplay.style.color = 'var(--warning)';
        } else if (answered > 0) {
            scoreDisplay.style.background = 'var(--error-light)';
            scoreDisplay.style.color = 'var(--error)';
        }
    }

    function showQuizSummary() {
        const answered = Object.keys(quizAnswers).length;
        
        if (answered === 0) {
            alert('Please answer at least one question first.');
            return;
        }

        const correct = Object.values(quizAnswers).filter(a => a.isCorrect).length;
        const percentage = ((correct / answered) * 100).toFixed(1);
        
        let message = `📊 QUIZ SUMMARY\n${'='.repeat(40)}\n\n`;
        message += `Total Questions: ${totalQuizQuestions}\n`;
        message += `Questions Answered: ${answered}\n`;
        message += `Correct Answers: ${correct}\n`;
        message += `Incorrect Answers: ${answered - correct}\n`;
        message += `Current Score: ${percentage}%\n\n`;
        
        if (percentage >= 90) {
            message += '🏆 OUTSTANDING! You have excellent mastery of this material!';
        } else if (percentage >= 80) {
            message += '🎉 EXCELLENT! You have a strong understanding of the concepts.';
        } else if (percentage >= 70) {
            message += '👍 GOOD! You\'re doing well, but review the explanations for missed questions.';
        } else if (percentage >= 60) {
            message += '📚 FAIR: Review the material and try again to improve your score.';
        } else {
            message += '📖 NEEDS IMPROVEMENT: Study the material more thoroughly and retake the quiz.';
        }
        
        if (answered < totalQuizQuestions) {
            message += `\n\n⚠️ You have ${totalQuizQuestions - answered} unanswered questions.`;
        }
        
        alert(message);
    }

    function showQuizCompletion() {
        const correct = Object.values(quizAnswers).filter(a => a.isCorrect).length;
        const total = Object.keys(quizAnswers).length;
        const percentage = ((correct / total) * 100).toFixed(1);
        
        let message = '🎊 Quiz Complete!\n\n';
        message += `Final Score: ${correct}/${total} (${percentage}%)\n\n`;
        
        if (percentage >= 80) {
            message += '🌟 Excellent work! You\'ve demonstrated strong mastery.';
        } else {
            message += '📚 Review the explanations and try again to improve your score.';
        }
        
        alert(message);
    }

    function resetEntireQuiz() {
        if (!confirm('Reset the entire quiz? This will clear all your answers and cannot be undone.')) {
            return;
        }

        quizAnswers = {};
        currentQuizQuestion = 1;

        const slides = document.querySelectorAll('.quiz-slide');
        slides.forEach(slide => {
            const questionNum = slide.dataset.question;
            
            // Hide feedback
            const feedback = document.getElementById(`feedback${questionNum}`);
            if (feedback) {
                feedback.style.display = 'none';
            }

            // Re-enable submit button
            const submitBtn = document.getElementById(`submitBtn${questionNum}`);
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Answer';
            }

            // Re-enable and uncheck radio buttons
            slide.querySelectorAll('input[type="radio"]').forEach(input => {
                input.disabled = false;
                input.checked = false;
            });
        });

        // Clear saved state
        try {
            localStorage.removeItem(`${pageId}-quiz-state`);
            localStorage.removeItem(`${pageId}-quiz-answers`);
        } catch (e) {
            console.warn('Could not clear quiz state:', e);
        }

        updateQuizDisplay();
        console.log('✅ Quiz reset complete');
    }

    function saveQuizState() {
        try {
            localStorage.setItem(`${pageId}-quiz-state`, JSON.stringify({
                currentQuestion: currentQuizQuestion,
                lastUpdated: new Date().toISOString()
            }));
            localStorage.setItem(`${pageId}-quiz-answers`, JSON.stringify(quizAnswers));
        } catch (e) {
            console.warn('Could not save quiz state:', e);
        }
    }

    function loadQuizState() {
        try {
            const stateStr = localStorage.getItem(`${pageId}-quiz-state`);
            const answersStr = localStorage.getItem(`${pageId}-quiz-answers`);
            
            if (stateStr) {
                const state = JSON.parse(stateStr);
                currentQuizQuestion = state.currentQuestion || 1;
            }
            
            if (answersStr) {
                quizAnswers = JSON.parse(answersStr);
                
                // Restore answered questions
                Object.keys(quizAnswers).forEach(questionNum => {
                    const slide = document.querySelector(`.quiz-slide[data-question="${questionNum}"]`);
                    if (!slide) return;
                    
                    const answer = quizAnswers[questionNum];
                    
                    // Check the selected option
                    const radio = slide.querySelector(`input[value="${answer.selected}"]`);
                    if (radio) {
                        radio.checked = true;
                        radio.disabled = true;
                    }
                    
                    // Disable submit button
                    const submitBtn = document.getElementById(`submitBtn${questionNum}`);
                    if (submitBtn) {
                        submitBtn.disabled = true;
                        submitBtn.textContent = 'Answer Submitted ✓';
                    }
                    
                    // Show feedback
                    const feedback = document.getElementById(`feedback${questionNum}`);
                    if (feedback) {
                        feedback.style.display = 'block';
                        feedback.className = answer.isCorrect ? 'quiz-feedback correct' : 'quiz-feedback incorrect';
                    }
                });
            }
        } catch (e) {
            console.warn('Could not load quiz state:', e);
        }
    }

    // ============================================
    // FLASHCARD MANAGEMENT (CAROUSEL STYLE)
    // ============================================

    const deckPositions = {};

    function initFlashcards() {
        const decks = document.querySelectorAll('.flashcard-deck');
        if (decks.length === 0) return;

        decks.forEach(deck => {
            const deckId = deck.id;
            if (deckId) {
                deckPositions[deckId] = 0;
                updateDeckDisplay(deckId);
            }
        });

        // Load saved positions
        loadFlashcardState();
        
        // Add keyboard navigation
        document.addEventListener('keydown', handleFlashcardKeyboard);
        
        console.log(`🃏 Initialized ${decks.length} flashcard decks`);
    }

    function handleFlashcardKeyboard(e) {
        // Find active flashcard deck
        const activeCard = document.querySelector('.flashcard-slide.active');
        if (!activeCard) return;
        
        const deck = activeCard.closest('.flashcard-deck');
        if (!deck) return;
        
        const deckId = deck.id;
        const level = deckId.replace('-deck', '');
        
        // Space - toggle answer
        if (e.code === 'Space') {
            e.preventDefault();
            const btn = activeCard.querySelector('.show-answer-btn');
            if (btn) toggleAnswer(btn);
        }
        
        // Left arrow - previous card
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            previousCard(level);
        }
        
        // Right arrow - next card
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            nextCard(level);
        }
    }

    function nextCard(level) {
        const deckId = level + '-deck';
        const deck = document.getElementById(deckId);
        if (!deck) return;
        
        const slides = deck.querySelectorAll('.flashcard-slide');
        const currentPos = deckPositions[deckId] || 0;
        
        if (currentPos < slides.length - 1) {
            deckPositions[deckId] = currentPos + 1;
            updateDeckDisplay(deckId);
            saveFlashcardState();
        }
    }

    function previousCard(level) {
        const deckId = level + '-deck';
        const currentPos = deckPositions[deckId] || 0;
        
        if (currentPos > 0) {
            deckPositions[deckId] = currentPos - 1;
            updateDeckDisplay(deckId);
            saveFlashcardState();
        }
    }

    function updateDeckDisplay(deckId) {
        const deck = document.getElementById(deckId);
        if (!deck) return;
        
        const slides = deck.querySelectorAll('.flashcard-slide');
        const currentPos = deckPositions[deckId] || 0;
        
        // Hide all slides
        slides.forEach(slide => {
            slide.classList.remove('active');
            slide.style.display = 'none';
        });
        
        // Show current slide
        if (slides[currentPos]) {
            slides[currentPos].classList.add('active');
            slides[currentPos].style.display = 'block';
            
            // Hide answer and reset button
            const answerSide = slides[currentPos].querySelector('.answer-side');
            if (answerSide) answerSide.style.display = 'none';
            
            const btn = slides[currentPos].querySelector('.show-answer-btn');
            if (btn) btn.textContent = 'Show Answer';
        }
        
        // Update counter
        const level = deckId.replace('-deck', '');
        const counter = document.getElementById(level + '-counter');
        if (counter) {
            counter.textContent = `${currentPos + 1} / ${slides.length}`;
        }
    }

    function toggleAnswer(button) {
        const slide = button.closest('.flashcard-slide');
        if (!slide) return;
        
        const answerSide = slide.querySelector('.answer-side');
        if (!answerSide) return;
        
        if (answerSide.style.display === 'none' || answerSide.style.display === '') {
            answerSide.style.display = 'block';
            button.textContent = 'Hide Answer';
        } else {
            answerSide.style.display = 'none';
            button.textContent = 'Show Answer';
        }
    }

    function saveFlashcardState() {
        try {
            localStorage.setItem(`${pageId}-flashcard-positions`, JSON.stringify(deckPositions));
        } catch (e) {
            console.warn('Could not save flashcard state:', e);
        }
    }

    function loadFlashcardState() {
        try {
            const saved = localStorage.getItem(`${pageId}-flashcard-positions`);
            if (saved) {
                const positions = JSON.parse(saved);
                Object.keys(positions).forEach(deckId => {
                    deckPositions[deckId] = positions[deckId];
                    updateDeckDisplay(deckId);
                });
            }
        } catch (e) {
            console.warn('Could not load flashcard state:', e);
        }
    }

    // ============================================
// CODE BLOCK COPY FUNCTIONALITY
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Add copy buttons to all code blocks
    addCopyButtonsToCodeBlocks();
});

function addCopyButtonsToCodeBlocks() {
    // Find all <pre><code> blocks
    const codeBlocks = document.querySelectorAll('pre code');
    
    codeBlocks.forEach((codeBlock, index) => {
        const pre = codeBlock.parentElement;
        
        // Create copy button
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-code-btn';
        copyButton.setAttribute('aria-label', 'Copy code to clipboard');
        copyButton.setAttribute('data-code-index', index);
        
        // Add button text
        const buttonText = document.createElement('span');
        buttonText.textContent = 'Copy';
        copyButton.appendChild(buttonText);
        
        // Add click event
        copyButton.addEventListener('click', function() {
            copyCodeToClipboard(codeBlock, copyButton, buttonText);
        });
        
        // Insert button into pre element
        pre.style.position = 'relative';
        pre.insertBefore(copyButton, pre.firstChild);
    });
}

function copyCodeToClipboard(codeBlock, button, buttonText) {
    // Get the code text
    const codeText = codeBlock.textContent;
    
    // Copy to clipboard
    navigator.clipboard.writeText(codeText).then(function() {
        // Success - change button appearance
        button.classList.add('copied');
        buttonText.textContent = 'Copied!';
        
        // Reset button after 2 seconds
        setTimeout(function() {
            button.classList.remove('copied');
            buttonText.textContent = 'Copy';
        }, 2000);
    }).catch(function(err) {
        // Fallback for older browsers
        copyCodeFallback(codeText, button, buttonText);
    });
}

function copyCodeFallback(text, button, buttonText) {
    // Create temporary textarea
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    
    // Select and copy
    textarea.select();
    try {
        document.execCommand('copy');
        
        // Success
        button.classList.add('copied');
        buttonText.textContent = 'Copied!';
        
        setTimeout(function() {
            button.classList.remove('copied');
            buttonText.textContent = 'Copy';
        }, 2000);
    } catch (err) {
        console.error('Failed to copy code:', err);
        buttonText.textContent = 'Failed';
        
        setTimeout(function() {
            buttonText.textContent = 'Copy';
        }, 2000);
    }
    
    // Remove textarea
    document.body.removeChild(textarea);
}

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================

    function scrollToTop() {
        window.scrollTo({ 
            top: 0, 
            behavior: 'smooth' 
        });
    }

    function printPage() {
        window.print();
    }

    // ============================================
    // EXPOSE FUNCTIONS TO GLOBAL SCOPE
    // ============================================

    window.resetChecklist = resetChecklist;
    window.nextQuestion = nextQuestion;
    window.previousQuestion = previousQuestion;
    window.submitQuizAnswer = submitQuizAnswer;
    window.showQuizSummary = showQuizSummary;
    window.resetEntireQuiz = resetEntireQuiz;
    window.nextCard = nextCard;
    window.previousCard = previousCard;
    window.toggleAnswer = toggleAnswer;
    window.scrollToTop = scrollToTop;
    window.printPage = printPage;
    window.copyCodeBlock = copyCodeBlock;

    console.log('🚀 Notes template loaded successfully');

})();