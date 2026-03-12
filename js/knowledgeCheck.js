/**
 * Knowledge Check Engine
 * Loads and renders interactive knowledge check questions from JSON
 *
 * PHASE 1 CHANGES:
 *  FIX #3  - renderExplanation() refactored: field-config map replaces 200+ lines of if-blocks
 *  FIX #4  - Multi-select max: dims unavailable options + shows toast, no silent ignore
 *  FIX #5  - renderSpecificQuestion() now finds card by [data-question-id] scoped correctly
 *  FIX #9  - "(Select TWO)" label is dynamic: reads from correctAnswers count in JSON
 *  FIX #10 - Option icons show letter label (A, B, C…) before selection; ✓/✗ after
 *  FIX #12 - Page loader hidden only after renderQuestions() completes, not on window.load
 *  FIX #13 - renderExplanation() field-config map: adding new JSON fields = 1 line, not 10
 *  FIX #19 - Print button wired to window.print()
 */

class KnowledgeCheckEngine {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.data = null;
        this.state = {
            selectedAnswers: {},      // { questionId: ['A','B'] } multi | { questionId: 'A' } single
            expandedExplanations: {}  // reserved for future use
        };

        // FIX #13 — Field config map for renderExplanation()
        // Format: [ label, jsonKey ]
        // To add a new explanation field: add ONE line here. No other changes needed.
        this._explanationFields = [
            ['Key Points',              'keyPoints'],
            ['Examples',                'examples'],
            ['Important',               'why'],
            ['Analogy',                 'analogy'],
            ['Comparison',              'comparison'],
            ['What it does',            'whatItDoes'],
            ['What it does NOT do',     'whatItDoesNot'],
            ['Speed Comparison',        'speedComparison'],
            ['Why so fast',             'whyFast'],
            ['Key Functions',           'keyFunctions'],
            ['Key Features',            'keyFeatures'],
            ['Characteristics',         'characteristics'],
            ['What RAM stores',         'whatRAMStores'],
            ['Real-world implications', 'implications'],
            ['How it works',            'howItWorks'],
            ['What is EC2',             'whatIsEC2'],
            ['How it relates to OS',    'howItRelates'],
            ['Architecture',            'architecture'],
            ['Key Distinction',         'keyDistinction'],
            ['Common Confusion',        'confusion'],
            ['Identification',          'identification'],
            ['Performance Impact',      'performanceImpact'],
            ['Additional Info',         'additionalInfo'],
        ];

        // FIX #4 — Toast element (created once, reused)
        this._toast = null;
    }

    /* ============================================================
       TOAST (FIX #4)
       ============================================================ */

    _getToast() {
        if (!this._toast) {
            this._toast = document.createElement('div');
            this._toast.className = 'kc-toast';
            document.body.appendChild(this._toast);
        }
        return this._toast;
    }

    _showToast(message) {
        const toast = this._getToast();
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
    }

    /* ============================================================
       LOAD
       ============================================================ */

    /**
     * Load KC data from JSON file
     */
    async loadFromJSON(jsonUrl) {
        try {
            const response = await fetch(jsonUrl);
            if (!response.ok) throw new Error(`Failed to load: ${jsonUrl}`);
            this.data = await response.json();

            this.shuffleQuestions();
            this.renderQuestions();

            // FIX #12 — Hide loader AFTER render, not on window.load
            const loader = document.getElementById('pageLoader');
            if (loader) loader.classList.add('hidden');

        } catch (error) {
            console.error('Error loading KC data:', error);

            // FIX #8 — Styled error with specific filename
            this.container.innerHTML = `
                <div class="error">
                    <h2>⚠️ Error Loading Questions</h2>
                    <p>Could not load <code style="background:rgba(0,0,0,0.1);padding:0.2rem 0.5rem;border-radius:4px;">${jsonUrl}</code></p>
                    <p style="margin-top:0.75rem;font-size:0.9em;color:inherit;">
                        For local development, run:<br>
                        <code style="background:rgba(0,0,0,0.1);padding:0.2rem 0.5rem;border-radius:4px;">python -m http.server 8000</code>
                    </p>
                    <a href="kc-list.html" class="back-btn" style="margin-top:1.5rem;display:inline-block;">
                        ← Back to KC List
                    </a>
                </div>
            `;

            // Still hide loader even on error
            const loader = document.getElementById('pageLoader');
            if (loader) loader.classList.add('hidden');
        }
    }

    /* ============================================================
       SHUFFLE
       ============================================================ */

    /**
     * Shuffle questions using Fisher-Yates algorithm
     */
    shuffleQuestions() {
        if (!this.data?.questions) return;

        const questions = this.data.questions;
        for (let i = questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [questions[i], questions[j]] = [questions[j], questions[i]];
        }

        questions.forEach((q, index) => { q.displayNumber = index + 1; });
    }

    /* ============================================================
       RENDER ALL QUESTIONS
       ============================================================ */

    renderQuestions() {
        if (!this.data?.questions?.length) {
            this.container.innerHTML = '<div class="loading">No questions available.</div>';
            return;
        }

        this.container.innerHTML = this.data.questions
            .map(q => this.renderQuestion(q))
            .join('');

        this.attachEventListeners();
    }

    /* ============================================================
       RENDER ONE QUESTION CARD
       ============================================================ */

    renderQuestion(question) {
        const isMultiSelect = question.multiSelect === true;
        const selectedAnswers = this.state.selectedAnswers[question.id];
        const displayNum = question.displayNumber ?? question.id;

        // FIX #9 — Dynamic "Select X" label from correctAnswers count, not hardcoded "TWO"
        let multiLabel = '';
        if (isMultiSelect) {
            const correctCount = question.options
                ? question.options.filter(o => o.isCorrect).length
                : 2;
            const words = ['', 'ONE', 'TWO', 'THREE', 'FOUR'];
            const label = words[correctCount] ?? correctCount.toString();
            multiLabel = `<br><small style="color:var(--text-muted);font-weight:normal;">(Select ${label})</small>`;
        }

        return `
            <div class="question-card" data-question-id="${question.id}">
                <div class="question-header">
                    <div class="question-number">${displayNum}</div>
                    <div class="question-text">
                        ${question.question}${multiLabel}
                    </div>
                </div>
                <div class="options-list">
                    ${question.options.map((option, idx) =>
                        this.renderOption(question.id, option, isMultiSelect, selectedAnswers, idx)
                    ).join('')}
                </div>
            </div>
        `;
    }

    /* ============================================================
       RENDER ONE OPTION
       FIX #10 — Letter label shown before selection
       ============================================================ */

    renderOption(questionId, option, isMultiSelect, selectedAnswers, optionIndex) {
        // Determine selection state
        let isSelected = isMultiSelect
            ? Array.isArray(selectedAnswers) && selectedAnswers.includes(option.id)
            : selectedAnswers === option.id;

        // Determine current max-reached state for multi-select dimming
        const currentSelected = this.state.selectedAnswers[questionId];
        const correctCount = this._getCorrectCount(questionId);
        const isMaxReached = isMultiSelect
            && Array.isArray(currentSelected)
            && currentSelected.length >= correctCount
            && !isSelected;

        // Build CSS classes
        let optionClass = 'option';
        if (isSelected) optionClass += option.isCorrect ? ' correct' : ' incorrect';
        if (isMaxReached) optionClass += ' max-reached';

        // FIX #10 — Icon content: letter before answer, symbol after
        const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
        let iconContent = letters[optionIndex] ?? (optionIndex + 1).toString();
        if (isSelected) iconContent = option.isCorrect ? '✓' : '✗';

        const showExplanation = isSelected;

        return `
            <div class="${optionClass}"
                 data-question-id="${questionId}"
                 data-option-id="${option.id}"
                 data-is-correct="${option.isCorrect}"
                 data-multi-select="${isMultiSelect}"
                 data-option-index="${optionIndex}"
                 role="${isMultiSelect ? 'checkbox' : 'radio'}"
                 aria-checked="${isSelected}"
                 tabindex="0">
                <div class="option-icon" aria-hidden="true">${iconContent}</div>
                <div class="option-text">${option.text}</div>
            </div>
            ${showExplanation ? this.renderExplanation(option) : ''}
        `;
    }

    /* ============================================================
       RENDER EXPLANATION
       FIX #3 / FIX #13 — Field-config map replaces 200+ if-blocks
       To add a new field: add one entry to this._explanationFields
       ============================================================ */

    renderExplanation(option) {
        const exp = option.explanation;
        if (!exp) return '';

        const cls = option.isCorrect ? 'explanation correct' : 'explanation incorrect';
        const prefix = option.isCorrect
            ? '✓ Why this is correct:'
            : '✗ Why this is incorrect:';

        let html = `<div class="${cls}">`;

        // Summary always first
        if (exp.summary) {
            html += `<div class="explanation-text">
                <strong>${prefix}</strong><br>${exp.summary}
            </div>`;
        }

        // Iterate config map — renders any present field automatically
        for (const [label, key] of this._explanationFields) {
            const value = exp[key];
            if (!value) continue;

            if (Array.isArray(value) && value.length > 0) {
                html += `<div class="explanation-text">
                    <strong>${label}:</strong>
                    <ul style="margin:0.5rem 0 0 1.5rem;">
                        ${value.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>`;
            } else if (typeof value === 'string' && value.trim()) {
                // Comparison field has newlines → convert to <br>
                const formatted = key === 'comparison'
                    ? value.replace(/\n/g, '<br>')
                    : value;
                html += `<div class="explanation-text">
                    <strong>${label}:</strong> ${formatted}
                </div>`;
            }
        }

        // Learn More links
        if (exp.learnMore?.length > 0) {
            html += `<div style="margin-top:0.75rem;">`;
            for (const link of exp.learnMore) {
                html += `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="learn-more">
                    ${link.title} →
                </a><br>`;
            }
            html += `</div>`;
        }

        html += `</div>`;
        return html;
    }

    /* ============================================================
       EVENT LISTENERS
       ============================================================ */

    attachEventListeners() {
        const options = this.container.querySelectorAll('.option');
        options.forEach(option => {
            option.addEventListener('click', () => this._handleOptionClick(option));
            // Keyboard: Space/Enter activates option
            option.addEventListener('keydown', (e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    this._handleOptionClick(option);
                }
            });
        });
    }

    _handleOptionClick(option) {
        const questionId  = parseInt(option.dataset.questionId);
        const optionId    = option.dataset.optionId;
        const isMultiSelect = option.dataset.multiSelect === 'true';
        this.selectOption(questionId, optionId, isMultiSelect);
    }

    /* ============================================================
       SELECTION LOGIC
       FIX #4 — Toast feedback when max selections reached
       ============================================================ */

    selectOption(questionId, optionId, isMultiSelect) {
        if (isMultiSelect) {
            if (!this.state.selectedAnswers[questionId]) {
                this.state.selectedAnswers[questionId] = [];
            }

            const selected = this.state.selectedAnswers[questionId];
            const index = selected.indexOf(optionId);
            const maxAllowed = this._getCorrectCount(questionId);

            if (index > -1) {
                // Deselect
                selected.splice(index, 1);
            } else if (selected.length < maxAllowed) {
                // Select
                selected.push(optionId);
            } else {
                // FIX #4 — Was silent; now shows toast
                const words = ['', 'one', 'two', 'three', 'four'];
                const label = words[maxAllowed] ?? maxAllowed.toString();
                this._showToast(`You can only select ${label} answer${maxAllowed > 1 ? 's' : ''} for this question.`);
                return; // Don't re-render
            }
        } else {
            this.state.selectedAnswers[questionId] = optionId;
        }

        this.renderSpecificQuestion(questionId);
    }

    /* ============================================================
       HELPERS
       ============================================================ */

    /**
     * FIX #9 — Get number of correct answers for a question
     */
    _getCorrectCount(questionId) {
        const question = this.data?.questions?.find(q => q.id === questionId);
        if (!question?.options) return 2;
        return question.options.filter(o => o.isCorrect).length || 2;
    }

    /* ============================================================
       RE-RENDER ONE QUESTION
       FIX #5 — Selector scoped to container to avoid collisions
       ============================================================ */

    renderSpecificQuestion(questionId) {
        const question = this.data.questions.find(q => q.id === questionId);
        if (!question) return;

        // FIX #5 — querySelector scoped to container
        const questionCard = this.container.querySelector(
            `.question-card[data-question-id="${questionId}"]`
        );
        if (!questionCard) return;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.renderQuestion(question);
        const newCard = tempDiv.firstElementChild;

        questionCard.replaceWith(newCard);

        // Re-attach listeners for this card only
        newCard.querySelectorAll('.option').forEach(option => {
            option.addEventListener('click', () => this._handleOptionClick(option));
            option.addEventListener('keydown', (e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    this._handleOptionClick(option);
                }
            });
        });
    }
}

/* ============================================================
   FIX #19 — Wire print button to window.print()
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    const printBtn = document.querySelector('.print-button');
    if (printBtn) {
        printBtn.addEventListener('click', () => window.print());
    }
});

// Global export
window.KnowledgeCheckEngine = KnowledgeCheckEngine;