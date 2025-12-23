/**
 * Knowledge Check Engine
 * Loads and renders interactive knowledge check questions from JSON
 */

class KnowledgeCheckEngine {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.data = null;
        this.state = {
            selectedAnswers: {}, // { questionId: ['A', 'B'] } for multi-select or { questionId: 'A' } for single
            expandedExplanations: {} // { questionId_optionId: true/false }
        };
    }

    /**
     * Load KC data from JSON file
     */
    async loadFromJSON(jsonUrl) {
        try {
            const response = await fetch(jsonUrl);
            if (!response.ok) throw new Error(`Failed to load: ${jsonUrl}`);
            this.data = await response.json();
            
            // Randomize question order
            this.shuffleQuestions();
            
            this.renderQuestions();
        } catch (error) {
            console.error('Error loading KC data:', error);
            this.container.innerHTML = `
                <div class="error">
                    <h2>Error Loading Questions</h2>
                    <p>Could not load ${jsonUrl}. Please ensure the file exists.</p>
                    <p style="font-size: 0.9em; margin-top: 1rem;">For local development, run: <code style="background: rgba(0,0,0,0.1); padding: 0.2rem 0.5rem; border-radius: 4px;">python -m http.server 8000</code></p>
                </div>
            `;
        }
    }

    /**
     * Shuffle questions randomly using Fisher-Yates algorithm
     */
    shuffleQuestions() {
        if (!this.data || !this.data.questions) return;
        
        const questions = this.data.questions;
        for (let i = questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [questions[i], questions[j]] = [questions[j], questions[i]];
        }
        
        // Reassign sequential display numbers after shuffling
        questions.forEach((question, index) => {
            question.displayNumber = index + 1;
        });
    }

    /**
     * Render all questions
     */
    renderQuestions() {
        if (!this.data || !this.data.questions) {
            this.container.innerHTML = '<div class="loading">No questions available.</div>';
            return;
        }

        this.container.innerHTML = this.data.questions.map(question => 
            this.renderQuestion(question)
        ).join('');

        // Attach event listeners
        this.attachEventListeners();
    }

    /**
     * Render a single question card
     */
    renderQuestion(question) {
        const isMultiSelect = question.multiSelect === true;
        const selectedAnswers = this.state.selectedAnswers[question.id];
        const displayNum = question.displayNumber || question.id;

        return `
            <div class="question-card" data-question-id="${question.id}">
                <div class="question-header">
                    <div class="question-number">${displayNum}</div>
                    <div class="question-text">
                        ${question.question}
                        ${isMultiSelect ? '<br><small style="color: var(--text-muted); font-weight: normal;">(Select TWO)</small>' : ''}
                    </div>
                </div>
                <div class="options-list">
                    ${question.options.map(option => 
                        this.renderOption(question.id, option, isMultiSelect, selectedAnswers)
                    ).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Render a single option
     */
    renderOption(questionId, option, isMultiSelect, selectedAnswers) {
        let isSelected = false;
        
        if (isMultiSelect) {
            isSelected = Array.isArray(selectedAnswers) && selectedAnswers.includes(option.id);
        } else {
            isSelected = selectedAnswers === option.id;
        }

        const showExplanation = isSelected;
        
        let optionClass = 'option';
        let icon = '';
        
        if (isSelected) {
            if (option.isCorrect) {
                optionClass += ' correct';
                icon = '✓';
            } else {
                optionClass += ' incorrect';
                icon = '✗';
            }
        }

        return `
            <div class="${optionClass}" 
                 data-question-id="${questionId}" 
                 data-option-id="${option.id}"
                 data-is-correct="${option.isCorrect}"
                 data-multi-select="${isMultiSelect}">
                <div class="option-icon">${icon}</div>
                <div class="option-text">${option.text}</div>
            </div>
            ${showExplanation ? this.renderExplanation(option) : ''}
        `;
    }

    /**
     * Render explanation for an option
     */
    renderExplanation(option) {
        const explanationClass = option.isCorrect ? 'explanation correct' : 'explanation incorrect';
        const exp = option.explanation;

        let html = `<div class="${explanationClass}">`;

        // Summary
        if (exp.summary) {
            html += `<div class="explanation-text"><strong>${option.isCorrect ? '✓ Why this is correct:' : '✗ Why this is incorrect:'}</strong><br>${exp.summary}</div>`;
        }

        // Key Points (for correct answers)
        if (exp.keyPoints && exp.keyPoints.length > 0) {
            html += `<div class="explanation-text"><strong>Key Points:</strong><ul style="margin: 0.5rem 0 0 1.5rem;">`;
            exp.keyPoints.forEach(point => {
                html += `<li>${point}</li>`;
            });
            html += `</ul></div>`;
        }

        // Examples (for correct answers)
        if (exp.examples && exp.examples.length > 0) {
            html += `<div class="explanation-text"><strong>Examples:</strong><ul style="margin: 0.5rem 0 0 1.5rem;">`;
            exp.examples.forEach(example => {
                html += `<li>${example}</li>`;
            });
            html += `</ul></div>`;
        }

        // Additional Info
        if (exp.additionalInfo) {
            html += `<div class="explanation-text">${exp.additionalInfo}</div>`;
        }

        // Why (for incorrect answers)
        if (exp.why) {
            html += `<div class="explanation-text"><strong>Important:</strong> ${exp.why}</div>`;
        }

        // Analogy
        if (exp.analogy) {
            html += `<div class="explanation-text"><strong>Analogy:</strong> ${exp.analogy}</div>`;
        }

        // Comparison
        if (exp.comparison) {
            html += `<div class="explanation-text"><strong>Comparison:</strong><br>${exp.comparison.replace(/\n/g, '<br>')}</div>`;
        }

        // What It Does / Does Not
        if (exp.whatItDoes && exp.whatItDoes.length > 0) {
            html += `<div class="explanation-text"><strong>What it does:</strong><ul style="margin: 0.5rem 0 0 1.5rem;">`;
            exp.whatItDoes.forEach(item => {
                html += `<li>${item}</li>`;
            });
            html += `</ul></div>`;
        }

        if (exp.whatItDoesNot && exp.whatItDoesNot.length > 0) {
            html += `<div class="explanation-text"><strong>What it does NOT do:</strong><ul style="margin: 0.5rem 0 0 1.5rem;">`;
            exp.whatItDoesNot.forEach(item => {
                html += `<li>${item}</li>`;
            });
            html += `</ul></div>`;
        }

        // Speed Comparison
        if (exp.speedComparison && exp.speedComparison.length > 0) {
            html += `<div class="explanation-text"><strong>Speed Comparison:</strong><ul style="margin: 0.5rem 0 0 1.5rem;">`;
            exp.speedComparison.forEach(item => {
                html += `<li>${item}</li>`;
            });
            html += `</ul></div>`;
        }

        // Why Fast
        if (exp.whyFast && exp.whyFast.length > 0) {
            html += `<div class="explanation-text"><strong>Why so fast:</strong><ul style="margin: 0.5rem 0 0 1.5rem;">`;
            exp.whyFast.forEach(item => {
                html += `<li>${item}</li>`;
            });
            html += `</ul></div>`;
        }

        // Key Functions
        if (exp.keyFunctions && exp.keyFunctions.length > 0) {
            html += `<div class="explanation-text"><strong>Key Functions:</strong><ul style="margin: 0.5rem 0 0 1.5rem;">`;
            exp.keyFunctions.forEach(func => {
                html += `<li>${func}</li>`;
            });
            html += `</ul></div>`;
        }

        // Key Features
        if (exp.keyFeatures && exp.keyFeatures.length > 0) {
            html += `<div class="explanation-text"><strong>Key Features:</strong><ul style="margin: 0.5rem 0 0 1.5rem;">`;
            exp.keyFeatures.forEach(feature => {
                html += `<li>${feature}</li>`;
            });
            html += `</ul></div>`;
        }

        // Characteristics
        if (exp.characteristics && exp.characteristics.length > 0) {
            html += `<div class="explanation-text"><strong>Characteristics:</strong><ul style="margin: 0.5rem 0 0 1.5rem;">`;
            exp.characteristics.forEach(char => {
                html += `<li>${char}</li>`;
            });
            html += `</ul></div>`;
        }

        // What RAM Stores
        if (exp.whatRAMStores && exp.whatRAMStores.length > 0) {
            html += `<div class="explanation-text"><strong>What RAM stores:</strong><ul style="margin: 0.5rem 0 0 1.5rem;">`;
            exp.whatRAMStores.forEach(item => {
                html += `<li>${item}</li>`;
            });
            html += `</ul></div>`;
        }

        // Implications
        if (exp.implications && exp.implications.length > 0) {
            html += `<div class="explanation-text"><strong>Real-world implications:</strong><ul style="margin: 0.5rem 0 0 1.5rem;">`;
            exp.implications.forEach(item => {
                html += `<li>${item}</li>`;
            });
            html += `</ul></div>`;
        }

        // How It Works
        if (exp.howItWorks && exp.howItWorks.length > 0) {
            html += `<div class="explanation-text"><strong>How it works:</strong><ul style="margin: 0.5rem 0 0 1.5rem;">`;
            exp.howItWorks.forEach(step => {
                html += `<li>${step}</li>`;
            });
            html += `</ul></div>`;
        }

        // What Is EC2 / Other specific sections
        if (exp.whatIsEC2 && exp.whatIsEC2.length > 0) {
            html += `<div class="explanation-text"><strong>What is EC2:</strong><ul style="margin: 0.5rem 0 0 1.5rem;">`;
            exp.whatIsEC2.forEach(item => {
                html += `<li>${item}</li>`;
            });
            html += `</ul></div>`;
        }

        if (exp.howItRelates && exp.howItRelates.length > 0) {
            html += `<div class="explanation-text"><strong>How it relates to OS:</strong><ul style="margin: 0.5rem 0 0 1.5rem;">`;
            exp.howItRelates.forEach(item => {
                html += `<li>${item}</li>`;
            });
            html += `</ul></div>`;
        }

        // Architecture
        if (exp.architecture) {
            html += `<div class="explanation-text"><strong>Architecture:</strong> ${exp.architecture}</div>`;
        }

        // Key Distinction
        if (exp.keyDistinction) {
            html += `<div class="explanation-text"><strong>Key Distinction:</strong> ${exp.keyDistinction}</div>`;
        }

        // Confusion
        if (exp.confusion) {
            html += `<div class="explanation-text"><strong>Common Confusion:</strong> ${exp.confusion}</div>`;
        }

        // Identification
        if (exp.identification) {
            html += `<div class="explanation-text"><strong>Identification:</strong> ${exp.identification}</div>`;
        }

        // Performance Impact
        if (exp.performanceImpact) {
            html += `<div class="explanation-text"><strong>Performance Impact:</strong> ${exp.performanceImpact}</div>`;
        }

        // Learn More Links (for all options)
        if (exp.learnMore && exp.learnMore.length > 0) {
            html += `<div style="margin-top: 0.75rem;">`;
            exp.learnMore.forEach(link => {
                html += `
                    <a href="${link.url}" target="_blank" class="learn-more">
                        ${link.title} →
                    </a><br>
                `;
            });
            html += `</div>`;
        }

        html += `</div>`;
        return html;
    }

    /**
     * Attach event listeners to options
     */
    attachEventListeners() {
        const options = this.container.querySelectorAll('.option');
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                const questionId = parseInt(option.dataset.questionId);
                const optionId = option.dataset.optionId;
                const isMultiSelect = option.dataset.multiSelect === 'true';
                
                this.selectOption(questionId, optionId, isMultiSelect);
            });
        });
    }

    /**
     * Handle option selection
     */
    selectOption(questionId, optionId, isMultiSelect) {
        if (isMultiSelect) {
            // Multi-select logic
            if (!this.state.selectedAnswers[questionId]) {
                this.state.selectedAnswers[questionId] = [];
            }

            const selected = this.state.selectedAnswers[questionId];
            const index = selected.indexOf(optionId);

            if (index > -1) {
                // Deselect
                selected.splice(index, 1);
            } else {
                // Select (max 2 for "Select TWO")
                if (selected.length < 2) {
                    selected.push(optionId);
                }
            }
        } else {
            // Single-select logic
            this.state.selectedAnswers[questionId] = optionId;
        }

        // Re-render the specific question
        this.renderSpecificQuestion(questionId);
    }

    /**
     * Re-render a specific question after state change
     */
    renderSpecificQuestion(questionId) {
        const question = this.data.questions.find(q => q.id === questionId);
        if (!question) return;

        const questionCard = this.container.querySelector(`[data-question-id="${questionId}"]`);
        if (!questionCard) return;

        const newHTML = this.renderQuestion(question);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = newHTML;
        const newQuestionCard = tempDiv.firstElementChild;

        questionCard.replaceWith(newQuestionCard);

        // Re-attach event listeners for this question
        const options = newQuestionCard.querySelectorAll('.option');
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                const qId = parseInt(option.dataset.questionId);
                const optId = option.dataset.optionId;
                const isMulti = option.dataset.multiSelect === 'true';
                
                this.selectOption(qId, optId, isMulti);
            });
        });
    }
}

// Make it globally available
window.KnowledgeCheckEngine = KnowledgeCheckEngine;