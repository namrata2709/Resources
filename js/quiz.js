/**
 * Quiz Engine — AWS Learning Dashboard
 * File: js/quiz.js
 *
 * PHASE 1: Field-config map, toast, dynamic labels, letter icons, loader fix, print button
 * PHASE 2: Progress bar, navigator, score badge, summary card, result badge, next button, ARIA
 *
 * PHASE 3:
 *   #P3-1  localStorage persistence — saves progress; resume banner on return
 *   #P3-2  Keyboard nav — 1-4 / A-D keys select the focused question's options
 *   #P3-3  Shuffle toggle — toolbar button re-randomises order, preserves answers
 *   #P3-4  Timer — count-up from first answer; pauses on page hide; saved to localStorage
 *   #P3-5  Bookmarking — 🔖 per card; navigator dot indicator; filter to show bookmarked only
 *
 * PHASE 4:
 *   #P4-1  Option shuffle — randomises option order within each question; persisted in localStorage
 *   #P4-2  Mobile swipe — horizontal swipe scrolls to next/prev unanswered question
 *   #P4-3  Quiz history — stores up to 20 past attempts per quiz; history panel in toolbar
 *   #P4-4  Export results — "Copy summary" to clipboard + "Download PDF" from summary card
 *   #P4-5  Theme persistence fix — guards against FOUC on resume; theme key validated on init
 *
 * PHASE 5 (this file):
 *   AUDIT FIXES:
 *     B1/A12 — Navigator rebuild after shuffle (dots were stale after re-order)
 *     A1     — Resume banner: role="region" + aria-label; buttons get descriptive aria-labels
 *     A2     — Timer: aria-label="Time elapsed"; icon aria-hidden
 *     A3     — Swipe hint: aria-hidden="true" (visual affordance, not meaningful text)
 *     A4     — History list: <ul role="list"> + <li> rows for screen reader semantics
 *     A7     — Toolbar: role="toolbar" aria-label="Quiz controls"
 *     A10    — History button: aria-controls="quizHistoryPanel"
 *     A11    — Question number: role="heading" aria-level="3"
 *     A13    — Answered single-choice options: aria-disabled="true" + tabindex="-1"
 *     PR1    — .swipe-hint added to @media print hide list
 *     K1     — Escape key blurs focus from option
 *   NEW FEATURES:
 *   #P5-1  Search/filter — keyword search + status filter (all/unanswered/correct/incorrect)
 *   #P5-2  Question flagging — 🚩 per card cycles none→confusing→incorrect; persisted; in clipboard export
 *   #P5-3  Weak areas panel — category/tag error-rate breakdown; toolbar button; collapsible
 *   #P5-4  Study mode — answer revealed immediately; "Got it / Still learning" self-rating; score paused
 */

class QuizEngine {
    constructor(containerId) {
        this.container  = document.getElementById(containerId);
        this.data       = null;
        this.quizFile   = null;  // set by loadFromJSON caller; used as localStorage key

        this.state = {
            selectedAnswers:   {},   // { qId: optionId } | { qId: [optionId,...] }
            answeredQuestions: {},   // { qId: true }
            bookmarks:         {},   // { qId: true }
            questionOrder:     [],   // persisted shuffle order (array of question ids)
        };

        // #P3-4 Timer state
        this._timerEl       = null;
        this._timerInterval = null;
        this._elapsedSeconds = 0;
        this._timerStarted  = false;

        // #P3-5 Bookmark filter
        this._bookmarkFilterActive = false;

        // #P4-1 Option shuffle — { qId: [optionId, optionId, ...] } persisted order
        this._optionOrder = {};

        // #P4-2 Swipe state
        this._swipeTouchStartX = 0;
        this._swipeTouchStartY = 0;

        // #P5-1 Search/filter state
        this._searchQuery   = '';
        this._statusFilter  = 'all'; // 'all' | 'unanswered' | 'correct' | 'incorrect'
        this._searchDebounce = null;

        // #P5-2 Flagging — { qId: 'confusing' | 'incorrect' | null }
        this.state.flags = {};

        // #P5-3 Weak areas — derived on demand from state, no extra storage needed

        // #P5-4 Study mode
        this._studyMode = false;
        this.state.ratings = {}; // { qId: 'got-it' | 'still-learning' }

        // Phase 1 — explanation field config map
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

        this._toast      = null;
        this._liveRegion = null;
    }

    /* ============================================================
       TOAST  (Phase 1)
       ============================================================ */

    _getToast() {
        if (!this._toast) {
            this._toast = document.createElement('div');
            this._toast.className = 'quiz-toast';
            this._toast.setAttribute('role', 'status');
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
       ARIA-LIVE REGION  (Phase 2 #28)
       ============================================================ */

    _getLiveRegion() {
        if (!this._liveRegion) {
            this._liveRegion = document.createElement('div');
            this._liveRegion.setAttribute('aria-live', 'polite');
            this._liveRegion.setAttribute('aria-atomic', 'true');
            this._liveRegion.className = 'sr-only';
            document.body.appendChild(this._liveRegion);
        }
        return this._liveRegion;
    }

    _announce(message) {
        const region = this._getLiveRegion();
        region.textContent = '';
        requestAnimationFrame(() => { region.textContent = message; });
    }

    /* ============================================================
       #P3-1  LOCALSTORAGE PERSISTENCE
       Key: quiz_progress_<quizFile>
       Stores: selectedAnswers, answeredQuestions, bookmarks,
               questionOrder, elapsedSeconds
       ============================================================ */

    _storageKey() {
        return `quiz_progress_${this.quizFile}`;
    }

    _saveState() {
        if (!this.quizFile) return;
        try {
            const payload = {
                selectedAnswers:   this.state.selectedAnswers,
                answeredQuestions: this.state.answeredQuestions,
                bookmarks:         this.state.bookmarks,
                flags:             this.state.flags,      // #P5-2
                ratings:           this.state.ratings,    // #P5-4
                questionOrder:     this.data.questions.map(q => q.id),
                optionOrder:       this._optionOrder,     // #P4-1
                elapsedSeconds:    this._elapsedSeconds,
                studyMode:         this._studyMode,       // #P5-4
                savedAt:           Date.now(),
            };
            localStorage.setItem(this._storageKey(), JSON.stringify(payload));
        } catch (e) {
            // localStorage unavailable (private mode, quota) — fail silently
        }
    }

    _loadSavedState() {
        if (!this.quizFile) return null;
        try {
            const raw = localStorage.getItem(this._storageKey());
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    _clearSavedState() {
        if (!this.quizFile) return;
        try { localStorage.removeItem(this._storageKey()); } catch (e) {}
    }

    /**
     * Show a resume banner if saved progress exists.
     * Returns true if the user chooses to resume.
     */
    _showResumeBanner(saved) {
        const answered  = Object.keys(saved.answeredQuestions).length;
        const total     = this.data.questions.length;
        const timeStr   = this._formatTime(saved.elapsedSeconds || 0);
        const savedDate = new Date(saved.savedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

        const banner = document.createElement('div');
        banner.id = 'quizResumeBanner';
        banner.className = 'quiz-resume-banner';
        banner.setAttribute('role', 'region');                    // A1
        banner.setAttribute('aria-label', 'Quiz progress saved'); // A1
        banner.innerHTML = `
            <div class="resume-info">
                <span class="resume-icon" aria-hidden="true">💾</span>
                <div class="resume-text">
                    <strong>Progress saved</strong>
                    <span>${answered} / ${total} answered · ${timeStr} · ${savedDate}</span>
                </div>
            </div>
            <div class="resume-actions">
                <button class="resume-btn resume-continue" id="resumeContinueBtn"
                        aria-label="Resume quiz from ${answered} of ${total} answered">Resume</button>
                <button class="resume-btn resume-fresh" id="resumeFreshBtn"
                        aria-label="Discard saved progress and start fresh">Start fresh</button>
            </div>
        `;

        this.container.parentNode.insertBefore(banner, this.container);

        return new Promise(resolve => {
            document.getElementById('resumeContinueBtn').addEventListener('click', () => {
                banner.remove();
                resolve(true);
            });
            document.getElementById('resumeFreshBtn').addEventListener('click', () => {
                this._clearSavedState();
                banner.remove();
                resolve(false);
            });
        });
    }

    /* ============================================================
       #P3-4  TIMER
       Count-up from first answer. Pauses on page hide.
       ============================================================ */

    _formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    _startTimer() {
        if (this._timerInterval) return; // already running

        // Remove idle tooltip as soon as timer is running
        const timerEl = document.getElementById('quizTimer');
        if (timerEl) delete timerEl.dataset.idle;

        this._timerInterval = setInterval(() => {
            this._elapsedSeconds++;
            this._updateTimerDisplay();
            if (this._elapsedSeconds % 10 === 0) this._saveState();
        }, 1000);

        // Remove before adding — guarantees exactly one listener even after
        // tab-hide/show cycles call _startTimer multiple times.
        document.removeEventListener('visibilitychange', this._handleVisibility);
        document.addEventListener('visibilitychange', this._handleVisibility);
    }

    _handleVisibility = () => {
        if (document.hidden) {
            clearInterval(this._timerInterval);
            this._timerInterval = null;
        } else {
            this._startTimer();
        }
    };

    _updateTimerDisplay() {
        // Re-query by id each tick in case _timerEl is detached or stale
        if (!this._timerEl || !this._timerEl.isConnected) {
            this._timerEl = document.getElementById('timerValue');
        }
        if (this._timerEl) {
            this._timerEl.textContent = this._formatTime(this._elapsedSeconds);
        }
    }

    _initTimer() {
        const existing = document.getElementById('quizTimer');
        if (existing) {
            this._timerEl = document.getElementById('timerValue')
                         ?? existing.querySelector('.timer-value');
            return;
        }

        const wrapper = document.createElement('div');
        wrapper.id = 'quizTimer';
        wrapper.className = 'quiz-timer';
        wrapper.setAttribute('aria-label', 'Time elapsed'); // A2
        wrapper.innerHTML = `<span class="timer-icon" aria-hidden="true">⏱</span><span class="timer-value" id="timerValue">0:00</span>`;
        wrapper.dataset.idle = ''; // tooltip visible until first answer

        // Insertion priority:
        //   1. Append into progress bar row (normal case)
        //   2. Insert before questions container (if bar missing)
        //   3. Append to body as last resort
        const bar = document.getElementById('quizProgressBar');
        if (bar) {
            bar.appendChild(wrapper);
        } else {
            const ref = document.getElementById('quizNavigator')
                     ?? this.container
                     ?? document.body;
            if (ref.parentNode) ref.parentNode.insertBefore(wrapper, ref);
            else document.body.appendChild(wrapper);
        }

        // Always query from the live document after insertion — never use the detached reference
        this._timerEl = document.getElementById('timerValue');
    }

    /* ============================================================
       #P3-3  SHUFFLE TOGGLE
       Toolbar button that reshuffles questions in place.
       Already-answered state is preserved; display numbers update.
       ============================================================ */

    _initShuffleBtn() {
        const existing = document.getElementById('quizShuffleBtn');
        if (existing) return;

        const btn = document.createElement('button');
        btn.id = 'quizShuffleBtn';
        btn.className = 'quiz-toolbar-btn';
        btn.setAttribute('aria-label', 'Shuffle question order');
        btn.title = 'Shuffle questions';
        btn.innerHTML = `<span>🔀</span><span class="toolbar-btn-label">Shuffle</span>`;

        btn.addEventListener('click', () => {
            // Confirm if already answered some questions
            const answeredCount = this._answeredCount();
            if (answeredCount > 0) {
                if (!confirm(`Shuffle will re-order the questions but keep your ${answeredCount} answered question(s). Continue?`)) return;
            }
            this.shuffleQuestions();
            this.shuffleOptions(); // #P4-1
            this.renderQuestions();
            this._rebuildNavigator(); // B1/A12 — rebuild dots with correct display numbers
            this._updateAll();
            this._saveState();
            this._applySearchFilter(); // #P5-1 — re-apply active filter after shuffle
            this._showToast('Questions reshuffled!');
        });

        this._appendToToolbar(btn);
    }

    /* ============================================================
       #P3-5  BOOKMARKING
       🔖 button on each question card. Bookmarked dot in navigator.
       Filter button to show bookmarked questions only.
       ============================================================ */

    _initBookmarkFilterBtn() {
        const existing = document.getElementById('quizBookmarkFilterBtn');
        if (existing) return;

        const btn = document.createElement('button');
        btn.id = 'quizBookmarkFilterBtn';
        btn.className = 'quiz-toolbar-btn';
        btn.setAttribute('aria-label', 'Show bookmarked questions only');
        btn.title = 'Show bookmarked questions';
        btn.innerHTML = `<span>🔖</span><span class="toolbar-btn-label">Bookmarks</span>`;

        btn.addEventListener('click', () => {
            this._bookmarkFilterActive = !this._bookmarkFilterActive;
            btn.classList.toggle('active', this._bookmarkFilterActive);
            btn.setAttribute('aria-pressed', String(this._bookmarkFilterActive));
            this._applyBookmarkFilter();
            this._announce(
                this._bookmarkFilterActive
                    ? 'Showing bookmarked questions only'
                    : 'Showing all questions'
            );
        });

        this._appendToToolbar(btn);
    }

    _applyBookmarkFilter() {
        const cards = this.container.querySelectorAll('.question-card');
        cards.forEach(card => {
            const qid = parseInt(card.dataset.questionId);
            if (this._bookmarkFilterActive && !this.state.bookmarks[qid]) {
                card.classList.add('bookmark-hidden');
            } else {
                card.classList.remove('bookmark-hidden');
            }
        });

        // Show empty state if no bookmarks exist
        let emptyMsg = this.container.querySelector('.bookmark-empty');
        if (this._bookmarkFilterActive && Object.keys(this.state.bookmarks).length === 0) {
            if (!emptyMsg) {
                emptyMsg = document.createElement('div');
                emptyMsg.className = 'bookmark-empty loading';
                emptyMsg.textContent = 'No bookmarked questions yet. Click 🔖 on any question to bookmark it.';
                this.container.prepend(emptyMsg);
            }
        } else {
            emptyMsg?.remove();
        }
    }

    _toggleBookmark(questionId) {
        if (this.state.bookmarks[questionId]) {
            delete this.state.bookmarks[questionId];
        } else {
            this.state.bookmarks[questionId] = true;
        }

        // Update bookmark button on the card
        const card = this.container.querySelector(`.question-card[data-question-id="${questionId}"]`);
        if (card) {
            const btn = card.querySelector('.bookmark-btn');
            if (btn) {
                const isBookmarked = !!this.state.bookmarks[questionId];
                btn.classList.toggle('bookmarked', isBookmarked);
                btn.setAttribute('aria-pressed', String(isBookmarked));
                btn.title = isBookmarked ? 'Remove bookmark' : 'Bookmark this question';
            }
        }

        this._updateNavigator(); // refresh dot indicators
        if (this._bookmarkFilterActive) this._applyBookmarkFilter();
        this._saveState();
    }

    /* ============================================================
       TOOLBAR HELPER
       Toolbar is inserted once between progress bar and navigator.
       ============================================================ */

    _appendToToolbar(btn) {
        let toolbar = document.getElementById('quizToolbar');
        if (!toolbar) {
            toolbar = document.createElement('div');
            toolbar.id = 'quizToolbar';
            toolbar.className = 'quiz-toolbar';
            toolbar.setAttribute('role', 'toolbar');            // A7
            toolbar.setAttribute('aria-label', 'Quiz controls'); // A7

            const nav = document.getElementById('quizNavigator');
            if (nav) {
                nav.before(toolbar);
            } else {
                const bar = document.getElementById('quizProgressBar');
                if (bar) bar.after(toolbar);
                else this.container.parentNode.insertBefore(toolbar, this.container);
            }
        }
        toolbar.appendChild(btn);
    }

    /* ============================================================
       B1/A12  NAVIGATOR REBUILD
       Called after shuffle — removes existing nav so _initNavigator
       rebuilds it with correct display numbers and aria-labels.
       ============================================================ */

    _rebuildNavigator() {
        const existing = document.getElementById('quizNavigator');
        if (existing) existing.remove();
        const hint = document.querySelector('.swipe-hint');
        if (hint) hint.remove();
        this._initNavigator();
    }

    /* ============================================================
       #P4-1  OPTION SHUFFLE
       Randomises the display order of options within each question.
       Order is stored in this._optionOrder and persisted to localStorage
       so that resuming a session shows the same option positions.
       The original question.options array is never mutated — we store
       a per-question id ordering and sort at render time.
       ============================================================ */

    shuffleOptions() {
        if (!this.data?.questions) return;
        this._optionOrder = {};
        for (const q of this.data.questions) {
            const ids = q.options.map(o => o.id);
            // Fisher-Yates
            for (let i = ids.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [ids[i], ids[j]] = [ids[j], ids[i]];
            }
            this._optionOrder[q.id] = ids;
        }
    }

    /**
     * Returns options for a question in their (shuffled) display order.
     * Falls back to original order if no shuffle recorded.
     */
    _getOrderedOptions(question) {
        const order = this._optionOrder[question.id];
        if (!order) return question.options;
        return order.map(id => question.options.find(o => o.id === id)).filter(Boolean);
    }

    /* ============================================================
       #P4-2  MOBILE SWIPE
       Horizontal swipe (>50 px, not primarily vertical) scrolls to
       the next or previous unanswered question.
       ============================================================ */

    _initSwipe() {
        document.addEventListener('touchstart', e => {
            this._swipeTouchStartX = e.changedTouches[0].screenX;
            this._swipeTouchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        document.addEventListener('touchend', e => {
            const dx = e.changedTouches[0].screenX - this._swipeTouchStartX;
            const dy = e.changedTouches[0].screenY - this._swipeTouchStartY;

            // Ignore if primarily vertical or too short
            if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)) return;

            const questions   = this.data?.questions;
            if (!questions?.length) return;

            // Find the question currently most visible in the viewport
            let closestId  = null;
            let closestDist = Infinity;
            this.container.querySelectorAll('.question-card').forEach(card => {
                const rect = card.getBoundingClientRect();
                const dist = Math.abs(rect.top);
                if (dist < closestDist) { closestDist = dist; closestId = parseInt(card.dataset.questionId); }
            });

            const currentIdx = questions.findIndex(q => q.id === closestId);
            if (currentIdx === -1) return;

            let targetQuestion = null;
            if (dx < 0) {
                // Swipe left → next unanswered after current
                targetQuestion = questions.slice(currentIdx + 1).find(q => !this.state.answeredQuestions[q.id]);
                // If none after, wrap to first unanswered overall
                if (!targetQuestion) targetQuestion = questions.find(q => !this.state.answeredQuestions[q.id]);
            } else {
                // Swipe right → previous unanswered before current
                targetQuestion = [...questions.slice(0, currentIdx)].reverse().find(q => !this.state.answeredQuestions[q.id]);
                // If none before, wrap to last unanswered overall
                if (!targetQuestion) targetQuestion = [...questions].reverse().find(q => !this.state.answeredQuestions[q.id]);
            }

            if (!targetQuestion) return;

            const card = this.container.querySelector(`.question-card[data-question-id="${targetQuestion.id}"]`);
            if (card) {
                card.scrollIntoView({ behavior: 'smooth', block: 'start' });
                this._focusedQuestionId = targetQuestion.id;
                // Brief visual pulse so student knows the swipe registered
                card.classList.add('swipe-highlight');
                setTimeout(() => card.classList.remove('swipe-highlight'), 600);
            }
        }, { passive: true });
    }

    /* ============================================================
       #P4-3  QUIZ HISTORY
       Key: quiz_history_<quizFile>  (separate from quiz_progress_)
       Stores up to 20 attempts: [{ date, score, total, pct, timeSeconds, passed }, ...]
       Recorded when _showScoreSummary() fires.
       ============================================================ */

    _historyKey() {
        return `quiz_history_${this.quizFile}`;
    }

    _recordAttempt() {
        const total   = this._totalQuestions();
        const correct = this._correctCount();
        const pct     = Math.round((correct / total) * 100);
        const attempt = {
            date:        new Date().toISOString(),
            score:       correct,
            total,
            pct,
            timeSeconds: this._elapsedSeconds,
            passed:      pct >= 70,
        };
        try {
            const raw     = localStorage.getItem(this._historyKey());
            const history = raw ? JSON.parse(raw) : [];
            history.push(attempt);
            // Keep most recent 20
            if (history.length > 20) history.splice(0, history.length - 20);
            localStorage.setItem(this._historyKey(), JSON.stringify(history));
        } catch (e) {}
    }

    _loadHistory() {
        try {
            const raw = localStorage.getItem(this._historyKey());
            return raw ? JSON.parse(raw) : [];
        } catch (e) { return []; }
    }

    _initHistoryBtn() {
        const history = this._loadHistory();
        if (history.length === 0) return;

        // If button already exists, just refresh the panel data and return
        const existing = document.getElementById('quizHistoryBtn');
        if (existing) {
            this._renderHistoryPanel(history);
            return;
        }

        const btn = document.createElement('button');
        btn.id = 'quizHistoryBtn';
        btn.className = 'quiz-toolbar-btn';
        btn.setAttribute('aria-label', 'View attempt history');
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-controls', 'quizHistoryPanel'); // A10
        btn.title = 'Past attempts';
        btn.innerHTML = `<span>📊</span><span class="toolbar-btn-label">History</span>`;

        btn.addEventListener('click', () => {
            const panel = document.getElementById('quizHistoryPanel');
            if (panel) {
                const isOpen = panel.classList.toggle('open');
                btn.classList.toggle('active', isOpen);
                btn.setAttribute('aria-expanded', String(isOpen));
            }
        });

        this._appendToToolbar(btn);
        this._renderHistoryPanel(history);
    }

    _renderHistoryPanel(history) {
        const existing = document.getElementById('quizHistoryPanel');
        if (existing) existing.remove();

        const panel = document.createElement('div');
        panel.id = 'quizHistoryPanel';
        panel.className = 'quiz-history-panel';
        panel.setAttribute('role', 'region');
        panel.setAttribute('aria-label', 'Quiz attempt history');

        const best    = Math.max(...history.map(h => h.pct));
        const avg     = Math.round(history.reduce((s, h) => s + h.pct, 0) / history.length);
        const recent5 = history.slice(-5);

        panel.innerHTML = `
            <div class="history-header">
                <span class="history-title">📊 Attempt History</span>
                <span class="history-meta">${history.length} attempt${history.length > 1 ? 's' : ''} · Best: ${best}% · Avg: ${avg}%</span>
            </div>
            <div class="history-chart" aria-hidden="true">
                ${recent5.map(h => `
                    <div class="history-bar-wrap" title="${h.pct}% on ${new Date(h.date).toLocaleDateString()}">
                        <div class="history-bar ${h.passed ? 'bar-pass' : 'bar-fail'}"
                             style="height: ${Math.max(h.pct, 4)}%">
                        </div>
                        <span class="history-bar-label">${h.pct}%</span>
                    </div>
                `).join('')}
            </div>
            <ul class="history-list" role="list" aria-label="Recent attempts">
                ${[...history].reverse().slice(0, 10).map((h, i) => `
                    <li class="history-row ${h.passed ? 'row-pass' : 'row-fail'}"
                        aria-label="${h.passed ? 'Passed' : 'Failed'}: ${h.score} of ${h.total}, ${h.pct}%, ${this._formatTime(h.timeSeconds)}">
                        <span class="history-badge" aria-hidden="true">${h.passed ? '✓' : '✗'}</span>
                        <span class="history-score">${h.score}/${h.total}</span>
                        <span class="history-pct">${h.pct}%</span>
                        <span class="history-time">⏱ ${this._formatTime(h.timeSeconds)}</span>
                        <span class="history-date">${new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    </li>
                `).join('')}
            </ul>
        `;

        const toolbar = document.getElementById('quizToolbar');
        if (toolbar) toolbar.after(panel);
    }

    /* ============================================================
       #P4-4  EXPORT RESULTS
       Two buttons injected into the summary card:
         • Copy summary — writes plain-text scorecard to clipboard
         • Download PDF — adds body class, triggers print, removes class
       ============================================================ */

    _injectExportButtons(summaryEl) {
        const wrap = document.createElement('div');
        wrap.className = 'summary-export-wrap';

        // Copy to clipboard
        const copyBtn = document.createElement('button');
        copyBtn.className = 'summary-export-btn';
        copyBtn.innerHTML = '📋 Copy summary';
        copyBtn.setAttribute('aria-label', 'Copy score summary to clipboard');
        copyBtn.addEventListener('click', () => this._copyResultsToClipboard(copyBtn));

        // PDF via print
        const pdfBtn = document.createElement('button');
        pdfBtn.className = 'summary-export-btn';
        pdfBtn.innerHTML = '⬇️ Download PDF';
        pdfBtn.setAttribute('aria-label', 'Download quiz results as PDF');
        pdfBtn.addEventListener('click', () => {
            document.body.classList.add('print-summary-only');
            window.print();
            // Remove class after print dialog closes (setTimeout is the only reliable hook)
            setTimeout(() => document.body.classList.remove('print-summary-only'), 1000);
        });

        wrap.appendChild(copyBtn);
        wrap.appendChild(pdfBtn);

        // Insert before the retry button
        const retryBtn = summaryEl.querySelector('#summaryRetryBtn');
        if (retryBtn) retryBtn.before(wrap);
        else summaryEl.appendChild(wrap);
    }

    /* ============================================================
       #P4-5  THEME PERSISTENCE FIX
       theme.js sets data-theme on <html> from localStorage key 'theme'.
       It runs before quiz.js, so by the time QuizEngine initialises
       the theme is already applied.
       Risk: If theme.js uses a key we don't know, or fails silently,
       the resume banner/history panel render against the wrong theme.
       Fix: Read the same key and re-apply if not already set, before
       any DOM injection. This is a safety guard only — theme.js still
       owns the toggle logic.
       ============================================================ */

    _applyThemeGuard() {
        // theme.js typically uses key 'theme' with values 'dark' | 'comfort' | (absent = light)
        try {
            const saved = localStorage.getItem('theme');
            const html  = document.documentElement;
            if (saved && !html.getAttribute('data-theme')) {
                html.setAttribute('data-theme', saved);
            }
        } catch (e) {}
    }

    /* ============================================================
       LOAD
       ============================================================ */

    async loadFromJSON(jsonUrl) {
        this._applyThemeGuard(); // #P4-5 — before any DOM injection

        // Extract quizFile from URL for storage key
        const match = jsonUrl.match(/\/([^/]+)\.json$/);
        this.quizFile = match ? match[1] : jsonUrl;

        try {
            const response = await fetch(jsonUrl);
            if (!response.ok) throw new Error(`Failed to load: ${jsonUrl}`);
            this.data = await response.json();

            // Check for saved progress
            const saved = this._loadSavedState();
            let useSaved = false;

            if (saved && Object.keys(saved.answeredQuestions || {}).length > 0) {
                // Hide loader NOW so the resume banner is visible and clickable.
                // The banner is a blocking prompt — loader must not sit on top of it.
                const loader = document.getElementById('pageLoader');
                if (loader) loader.classList.add('hidden');

                useSaved = await this._showResumeBanner(saved);
            }

            if (useSaved) {
                // Restore saved order
                const orderMap = {};
                this.data.questions.forEach(q => { orderMap[q.id] = q; });
                const orderedQuestions = saved.questionOrder
                    .map(id => orderMap[id])
                    .filter(Boolean);
                // Add any questions not in saved order (new questions added to JSON)
                const savedIds = new Set(saved.questionOrder);
                this.data.questions.forEach(q => {
                    if (!savedIds.has(q.id)) orderedQuestions.push(q);
                });
                this.data.questions = orderedQuestions;
                this.data.questions.forEach((q, i) => { q.displayNumber = i + 1; });

                // Restore state
                this.state.selectedAnswers   = saved.selectedAnswers   || {};
                this.state.answeredQuestions = saved.answeredQuestions || {};
                this.state.bookmarks         = saved.bookmarks         || {};
                this.state.flags             = saved.flags             || {};  // #P5-2
                this.state.ratings           = saved.ratings           || {};  // #P5-4
                this._optionOrder            = saved.optionOrder       || {};  // #P4-1
                this._elapsedSeconds         = saved.elapsedSeconds    || 0;
                this._studyMode              = saved.studyMode         || false; // #P5-4
            } else {
                this.shuffleQuestions();
                this.shuffleOptions(); // #P4-1
            }

            this.renderQuestions();
            this._initProgressBar();
            this._initTimer();          // #P3-4
            this._initNavigator();
            this._initScoreBadge();
            this._initShuffleBtn();         // #P3-3
            this._initBookmarkFilterBtn();   // #P3-5
            this._initKeyboardNav();         // #P3-2
            this._initSwipe();               // #P4-2
            this._initHistoryBtn();          // #P4-3
            this._initSearchFilter();        // #P5-1
            this._initWeakAreasBtn();        // #P5-3
            this._initStudyModeBtn();        // #P5-4
            this._initShowAllAnswers();      // #25
            this._initTimedMode();           // #33
            this._initThemeTooltip();        // #6
            this._initPrintPicker();         // print mode picker
            this._updateAll();

            // Restore study mode visual state if resuming
            if (this._studyMode) {
                const btn = document.getElementById('quizStudyModeBtn');
                if (btn) { btn.classList.add('active'); btn.setAttribute('aria-pressed', 'true'); }
            }

            // Restore timer if resuming
            if (useSaved && this._elapsedSeconds > 0) {
                this._updateTimerDisplay();
                if (this._answeredCount() < this._totalQuestions()) {
                    this._startTimer();
                    this._timerStarted = true;
                }
            }

            // Restore bookmark filter visibility
            this._applyBookmarkFilter();

            const loader = document.getElementById('pageLoader');
            if (loader) loader.classList.add('hidden');

        } catch (error) {
            console.error('Error loading Quiz data:', error);
            this.container.innerHTML = `
                <div class="quiz-error-state">
                    <div class="quiz-error-icon" aria-hidden="true">⚠️</div>
                    <h2 class="quiz-error-title">Failed to load quiz</h2>
                    <p class="quiz-error-file">Could not fetch <code>${jsonUrl}</code></p>
                    <p class="quiz-error-detail">${error.message || 'Network error or file not found.'}</p>
                    <div class="quiz-error-tip">
                        <strong>💡 Running locally?</strong> GitHub Pages won't serve files opened directly from disk.
                        Start a local server instead:<br>
                        <code>npx serve .</code> &nbsp;or&nbsp; <code>python -m http.server 8080</code>
                    </div>
                    <a href="quiz-list.html" class="quiz-error-back">← Back to Quiz List</a>
                </div>
            `;
            const loader = document.getElementById('pageLoader');
            if (loader) loader.classList.add('hidden');
        }
    }

    /* ============================================================
       SHUFFLE
       ============================================================ */

    shuffleQuestions() {
        if (!this.data?.questions) return;
        const q = this.data.questions;
        for (let i = q.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [q[i], q[j]] = [q[j], q[i]];
        }
        q.forEach((question, index) => { question.displayNumber = index + 1; });
    }

    /* ============================================================
       #P3-2  KEYBOARD NAVIGATION
       1-4 or A-D selects the corresponding option in the
       currently focused (or most recently interacted) question.
       ============================================================ */

    _initKeyboardNav() {
        this._focusedQuestionId = null;

        // Track which question the user is interacting with
        this.container.addEventListener('focusin', e => {
            const card = e.target.closest('.question-card');
            if (card) this._focusedQuestionId = parseInt(card.dataset.questionId);
        });

        document.addEventListener('keydown', e => {
            // K1: Escape blurs focus from option
            if (e.key === 'Escape') {
                if (document.activeElement?.classList.contains('option')) {
                    document.activeElement.blur();
                }
                return;
            }

            // Don't fire if typing in an input, textarea, or select
            const tag = document.activeElement?.tagName;
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
            // Don't fire if a modifier key is held (browser shortcut guard)
            if (e.ctrlKey || e.metaKey || e.altKey) return;

            const keyMap = {
                '1': 0, '2': 1, '3': 2, '4': 3,
                'a': 0, 'b': 1, 'c': 2, 'd': 3,
                'A': 0, 'B': 1, 'C': 2, 'D': 3,
            };

            if (!(e.key in keyMap)) return;

            const qid = this._focusedQuestionId;
            if (qid === null) {
                // No focus yet — use first unanswered question
                const firstUnanswered = this.data?.questions?.find(q => !this.state.answeredQuestions[q.id]);
                if (!firstUnanswered) return;
                this._focusedQuestionId = firstUnanswered.id;
            }

            const question = this.data?.questions?.find(q => q.id === this._focusedQuestionId);
            if (!question) return;

            const optionIndex = keyMap[e.key];
            const option = this._getOrderedOptions(question)[optionIndex]; // #P4-1 use shuffled order
            if (!option) return;

            e.preventDefault();
            this.selectOption(question.id, option.id, question.multiSelect === true);

            // Move visual focus to the selected option
            const card = this.container.querySelector(`.question-card[data-question-id="${question.id}"]`);
            const optionEl = card?.querySelectorAll('.option')[optionIndex];
            optionEl?.focus();
        });
    }

    /* ============================================================
       SCORE HELPERS
       ============================================================ */

    _totalQuestions()  { return this.data?.questions?.length ?? 0; }
    _answeredCount()   { return Object.keys(this.state.answeredQuestions).length; }

    _isQuestionCorrect(questionId) {
        const question = this.data.questions.find(q => q.id === questionId);
        if (!question) return false;
        const selected      = this.state.selectedAnswers[questionId];
        const correctOptions = question.options.filter(o => o.isCorrect).map(o => o.id);
        if (question.multiSelect) {
            if (!Array.isArray(selected)) return false;
            return correctOptions.length === selected.length
                && correctOptions.every(id => selected.includes(id));
        }
        return correctOptions.includes(selected);
    }

    _correctCount() {
        return Object.keys(this.state.answeredQuestions)
            .filter(id => this._isQuestionCorrect(parseInt(id))).length;
    }

    /* ============================================================
       PROGRESS BAR  (Phase 2 #18)
       ============================================================ */

    _initProgressBar() {
        const existing = document.getElementById('quizProgressBar');
        if (existing) return;

        const bar = document.createElement('div');
        bar.id = 'quizProgressBar';
        bar.className = 'quiz-progress-bar';
        bar.innerHTML = `
            <div class="quiz-progress-track">
                <div class="quiz-progress-fill" id="quizProgressFill"
                     role="progressbar" aria-valuemin="0"
                     aria-valuemax="${this._totalQuestions()}"
                     aria-valuenow="0"></div>
            </div>
            <span class="quiz-progress-label" id="quizProgressLabel">0 / ${this._totalQuestions()} answered</span>
        `;
        this.container.parentNode.insertBefore(bar, this.container);
    }

    _updateProgressBar() {
        const fill  = document.getElementById('quizProgressFill');
        const label = document.getElementById('quizProgressLabel');
        if (!fill || !label) return;
        const answered = this._answeredCount();
        const total    = this._totalQuestions();
        const pct      = total > 0 ? (answered / total) * 100 : 0;
        fill.style.width = `${pct}%`;
        label.textContent = `${answered} / ${total} answered`;
        fill.setAttribute('aria-valuenow', answered);
    }

    /* ============================================================
       QUESTION NAVIGATOR  (Phase 2 #22)
       Phase 3: adds bookmark indicator dot on nav dots
       ============================================================ */

    _initNavigator() {
        const existing = document.getElementById('quizNavigator');
        if (existing) return;

        const nav = document.createElement('nav');
        nav.id = 'quizNavigator';
        nav.className = 'quiz-navigator';
        nav.setAttribute('aria-label', 'Question navigation');

        nav.innerHTML = this.data.questions.map((q, i) => `
            <button class="quiz-nav-dot"
                    data-qid="${q.id}"
                    aria-label="Question ${i + 1}"
                    title="Question ${i + 1}">
                ${i + 1}
            </button>
        `).join('');

        const progressBar = document.getElementById('quizProgressBar');
        if (progressBar) progressBar.after(nav);
        else this.container.parentNode.insertBefore(nav, this.container);

        // #P4-2 Swipe hint — visible only on touch/mobile via CSS
        const hint = document.createElement('div');
        hint.className = 'swipe-hint';
        hint.setAttribute('aria-hidden', 'true'); // A3 — visual affordance only
        hint.textContent = '← swipe to navigate →';
        nav.after(hint);

        nav.addEventListener('click', e => {
            const btn = e.target.closest('.quiz-nav-dot');
            if (!btn) return;
            const card = this.container.querySelector(`.question-card[data-question-id="${btn.dataset.qid}"]`);
            if (card) {
                card.scrollIntoView({ behavior: 'smooth', block: 'start' });
                card.classList.add('nav-highlight');
                setTimeout(() => card.classList.remove('nav-highlight'), 800);
                this._focusedQuestionId = parseInt(btn.dataset.qid); // #P3-2 sync
            }
        });
    }

    /* ============================================================
       LIVE SCORE BADGE  (Phase 2 #15)
       ============================================================ */

    _initScoreBadge() {
        const existing = document.getElementById('quizScoreBadge');
        if (existing) return;
        const badge = document.createElement('div');
        badge.id = 'quizScoreBadge';
        badge.className = 'quiz-score-badge';
        badge.setAttribute('aria-live', 'polite');
        badge.setAttribute('aria-label', 'Current score');
        badge.innerHTML = `<span id="quizScoreText">0 / ${this._totalQuestions()} ✓</span>`;
        document.body.appendChild(badge);
    }

    _updateScoreBadge() {
        const el = document.getElementById('quizScoreText');
        if (!el) return;
        const correct  = this._correctCount();
        const total    = this._totalQuestions();
        const answered = this._answeredCount();
        el.textContent = `${correct} / ${total} ✓`;
        const badge = document.getElementById('quizScoreBadge');
        if (!badge) return;
        if (answered === 0) {
            badge.className = 'quiz-score-badge';
        } else {
            const pct = correct / answered;
            badge.classList.remove('score-good', 'score-ok', 'score-poor');
            badge.classList.add(pct >= 0.8 ? 'score-good' : pct >= 0.5 ? 'score-ok' : 'score-poor');
        }
    }

    /* ============================================================
       SCORE SUMMARY CARD  (Phase 2 #16)
       Phase 3: adds time taken; clears localStorage on retry
       ============================================================ */

    _showScoreSummary() {
        const existing = document.getElementById('quizSummary');
        if (existing) return;

        const total   = this._totalQuestions();
        const correct = this._correctCount();
        const pct     = Math.round((correct / total) * 100);
        const passed  = pct >= 70;
        const timeStr = this._formatTime(this._elapsedSeconds);

        const summary = document.createElement('div');
        summary.id = 'quizSummary';
        summary.className = `quiz-summary ${passed ? 'summary-pass' : 'summary-fail'}`;
        summary.setAttribute('role', 'region');
        summary.setAttribute('aria-label', 'Quiz results');
        summary.innerHTML = `
            <div class="summary-icon">${passed ? '🎉' : '📚'}</div>
            <h2 class="summary-title">${passed ? 'Well done!' : 'Keep practising!'}</h2>
            <div class="summary-score">${correct} / ${total}</div>
            <div class="summary-pct">${pct}%</div>
            <div class="summary-time">⏱ Time: ${timeStr}</div>
            <div class="summary-bar-wrap">
                <div class="summary-bar-fill" style="width: ${pct}%"></div>
            </div>
            <p class="summary-message">
                ${passed
                    ? `You passed with ${pct}%. ${total - correct > 0 ? `Review the ${total - correct} missed question${total - correct > 1 ? 's' : ''}.` : 'Perfect score!'}`
                    : `You scored ${pct}%. You need 70% to pass. Review the explanations and try again.`
                }
            </p>
            <button class="summary-retry-btn" id="summaryRetryBtn">🔄 Retry Quiz</button>
        `;

        this.container.appendChild(summary);
        setTimeout(() => summary.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);

        this._recordAttempt();          // #P4-3 save to history
        this._initHistoryBtn();         // #P4-3 show button now (first attempt case)
        this._injectExportButtons(summary); // #P4-4

        // #P3-1 Retry clears saved state before reload
        document.getElementById('summaryRetryBtn').addEventListener('click', () => {
            this._clearSavedState();
            window.location.reload();
        });

        this._announce(`Quiz complete. ${correct} out of ${total}, ${pct} percent. ${passed ? 'Passed.' : 'Not passed.'} Time: ${timeStr}.`);
    }

    /* ============================================================
       PER-QUESTION RESULT BADGE  (Phase 2 #17)
       ============================================================ */

    _updateQuestionBadge(questionId) {
        const card = this.container.querySelector(`.question-card[data-question-id="${questionId}"]`);
        if (!card) return;
        card.querySelector('.question-result-badge')?.remove();
        if (!this.state.answeredQuestions[questionId]) return;

        const correct = this._isQuestionCorrect(questionId);
        const badge   = document.createElement('div');
        badge.className = `question-result-badge ${correct ? 'badge-correct' : 'badge-wrong'}`;
        badge.textContent = correct ? '✓' : '✗';
        badge.setAttribute('aria-label', correct ? 'Correct' : 'Incorrect');
        card.querySelector('.question-header').appendChild(badge);
    }

    /* ============================================================
       NEXT UNANSWERED BUTTON  (Phase 2 #23)
       ============================================================ */

    _addNextButton(questionId) {
        const card = this.container.querySelector(`.question-card[data-question-id="${questionId}"]`);
        if (!card) return;
        card.querySelector('.quiz-next-btn')?.remove();

        const questions    = this.data.questions;
        const currentIndex = questions.findIndex(q => q.id === questionId);
        const nextQuestion = questions.slice(currentIndex + 1).find(q => !this.state.answeredQuestions[q.id]);
        if (!nextQuestion) return;

        const btn = document.createElement('button');
        btn.className = 'quiz-next-btn';
        btn.textContent = 'Next question →';
        btn.setAttribute('aria-label', `Go to question ${nextQuestion.displayNumber}`);
        btn.addEventListener('click', () => {
            const nextCard = this.container.querySelector(`.question-card[data-question-id="${nextQuestion.id}"]`);
            if (nextCard) {
                nextCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
                const firstOption = nextCard.querySelector('.option');
                if (firstOption) firstOption.focus();
                this._focusedQuestionId = nextQuestion.id; // #P3-2 sync
            }
        });
        card.appendChild(btn);
    }

    /* ============================================================
       RENDER ALL QUESTIONS
       ============================================================ */

    renderQuestions() {
        if (!this.data?.questions?.length) {
            this.container.innerHTML = '<div class="loading">No questions available.</div>';
            return;
        }
        this.container.innerHTML = this.data.questions.map(q => this.renderQuestion(q)).join('');
        this.attachEventListeners();
        // Re-apply bookmark filter after re-render
        if (this._bookmarkFilterActive) this._applyBookmarkFilter();
    }

    /* ============================================================
       RENDER ONE QUESTION CARD
       Phase 3: adds bookmark button to question-header
       ============================================================ */

    renderQuestion(question) {
        const isMultiSelect   = question.multiSelect === true;
        const selectedAnswers = this.state.selectedAnswers[question.id];
        const displayNum      = question.displayNumber ?? question.id;
        const isBookmarked    = !!this.state.bookmarks[question.id];
        const flagState       = this.state.flags[question.id] || null; // #P5-2
        const flagIcon        = flagState === 'confusing' ? '🚩' : flagState === 'incorrect' ? '⛳' : '🚩';
        const flagLabel       = flagState === 'confusing' ? 'Flagged as confusing' : flagState === 'incorrect' ? 'Flagged as incorrect' : 'Flag this question';

        let multiLabel = '';
        if (isMultiSelect) {
            const correctCount = question.options?.filter(o => o.isCorrect).length ?? 2;
            const words = ['', 'ONE', 'TWO', 'THREE', 'FOUR'];
            multiLabel = `<small class="multi-select-hint">(Select ${words[correctCount] ?? correctCount})</small>`;
        }

        const listRole = isMultiSelect ? 'group' : 'radiogroup';

        // Study mode: show rating buttons if answered and in study mode
        const isAnswered = !!this.state.answeredQuestions[question.id];
        const rating     = this.state.ratings[question.id] || null;
        const studyRatingHtml = (this._studyMode && isAnswered)
            ? this._renderStudyRating(question.id, rating)
            : '';

        // #38 — Difficulty badge (if JSON has a difficulty field)
        const difficulty = question.difficulty ?? null;
        const difficultyHtml = difficulty
            ? `<span class="difficulty-badge diff-${difficulty.toLowerCase()}" aria-label="Difficulty: ${difficulty}">${difficulty}</span>`
            : '';

        return `
            <div class="question-card${flagState ? ' flagged-' + flagState : ''}" data-question-id="${question.id}">
                <div class="question-header">
                    <div class="question-number"
                         role="heading" aria-level="3"
                         aria-label="Question ${displayNum}"
                         aria-hidden="true">${displayNum}</div>
                    <div class="question-text" id="question-label-${question.id}">
                        ${question.question}${multiLabel ? `<br>${multiLabel}` : ''}
                        ${difficultyHtml}
                    </div>
                    <button class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}"
                            data-qid="${question.id}"
                            aria-pressed="${isBookmarked}"
                            aria-label="Bookmark question ${displayNum}"
                            title="${isBookmarked ? 'Remove bookmark' : 'Bookmark this question'}">🔖</button>
                    <button class="flag-btn ${flagState ? 'flagged flag-' + flagState : ''}"
                            data-qid="${question.id}"
                            aria-pressed="${flagState ? 'true' : 'false'}"
                            aria-label="${flagLabel} ${displayNum}"
                            title="${flagLabel}">${flagIcon}</button>
                </div>
                <div class="options-list"
                     role="${listRole}"
                     aria-labelledby="question-label-${question.id}">
                    ${this._getOrderedOptions(question).map((option, idx) =>
                        this.renderOption(question.id, option, isMultiSelect, selectedAnswers, idx)
                    ).join('')}
                </div>
                ${studyRatingHtml}
                ${isAnswered && !this._studyMode ? `
                    <div class="question-reset-wrap">
                        <button class="question-reset-btn" data-qid="${question.id}"
                                aria-label="Reset question ${displayNum} — clear your answer">
                            ↺ Reset answer
                        </button>
                    </div>` : ''}
            </div>
        `;
    }

    /* ============================================================
       RENDER ONE OPTION
       ============================================================ */

    renderOption(questionId, option, isMultiSelect, selectedAnswers, optionIndex) {
        const isSelected = isMultiSelect
            ? Array.isArray(selectedAnswers) && selectedAnswers.includes(option.id)
            : selectedAnswers === option.id;

        const currentSelected = this.state.selectedAnswers[questionId];
        const correctCount    = this._getCorrectCount(questionId);
        const isMaxReached    = isMultiSelect
            && Array.isArray(currentSelected)
            && currentSelected.length >= correctCount
            && !isSelected;

        // A13: single-choice answered = all options locked
        const isAnswered     = !!this.state.answeredQuestions[questionId];
        const isLockedSingle = !isMultiSelect && isAnswered && !this._studyMode;
        const isDisabled     = isMaxReached || isLockedSingle;

        let optionClass = 'option';
        if (isSelected)    optionClass += option.isCorrect ? ' correct' : ' incorrect';
        if (isMaxReached)  optionClass += ' max-reached';
        if (isLockedSingle && !isSelected) optionClass += ' locked';

        const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
        let iconContent = letters[optionIndex] ?? String(optionIndex + 1);
        if (isSelected) iconContent = option.isCorrect ? '✓' : '✗';

        const role        = isMultiSelect ? 'checkbox' : 'radio';
        const ariaChecked  = isSelected    ? 'true' : 'false';
        const ariaDisabled = isDisabled    ? 'true' : 'false'; // A13

        return `
            <div class="${optionClass}"
                 data-question-id="${questionId}"
                 data-option-id="${option.id}"
                 data-is-correct="${option.isCorrect}"
                 data-multi-select="${isMultiSelect}"
                 data-option-index="${optionIndex}"
                 role="${role}"
                 aria-checked="${ariaChecked}"
                 aria-disabled="${ariaDisabled}"
                 tabindex="${isDisabled ? '-1' : '0'}">
                <div class="option-icon" aria-hidden="true">${iconContent}</div>
                <div class="option-text">${option.text}</div>
            </div>
            ${isSelected ? this.renderExplanation(option) : ''}
            ${!isSelected && option.isCorrect
                ? `<div class="explanation correct print-only" data-print-explanation="correct">${this._renderExplanationInner(option)}</div>`
                : ''}
            ${!isSelected && !option.isCorrect
                ? `<div class="explanation incorrect print-only" data-print-explanation="incorrect">${this._renderExplanationInner(option)}</div>`
                : ''}
        `;
    }

    /* ============================================================
       RENDER EXPLANATION
       ============================================================ */

    renderExplanation(option) {
        const exp = option.explanation;
        if (!exp) return '';
        const cls    = option.isCorrect ? 'explanation correct' : 'explanation incorrect';
        const prefix = option.isCorrect ? '✓ Why this is correct:' : '✗ Why this is incorrect:';
        return `<div class="${cls}">
            <div class="explanation-text"><strong>${prefix}</strong><br>${exp.summary || ''}</div>
            ${this._renderExplanationInner(option)}
        </div>`;
    }

    _renderExplanationInner(option) {
        const exp = option.explanation;
        if (!exp) return '';

        // Known fields — rendered in this order with friendly labels
        const knownKeys = new Set(this._explanationFields.map(([, k]) => k));
        knownKeys.add('learnMore'); // handled separately below

        let html = '';

        // Render known fields in config order
        for (const [label, key] of this._explanationFields) {
            const value = exp[key];
            if (!value) continue;
            if (Array.isArray(value) && value.length > 0) {
                html += `<div class="explanation-text"><strong>${label}:</strong>
                    <ul style="margin:0.5rem 0 0 1.5rem;">${value.map(item => `<li>${item}</li>`).join('')}</ul>
                </div>`;
            } else if (typeof value === 'string' && value.trim()) {
                const formatted = key === 'comparison' ? value.replace(/\n/g, '<br>') : value;
                html += `<div class="explanation-text"><strong>${label}:</strong> ${formatted}</div>`;
            }
        }

        // #3/13 — Unknown field passthrough: any field in the JSON not in the config map
        // renders automatically with a title-cased label, so new JSON fields never silently disappear.
        for (const [key, value] of Object.entries(exp)) {
            if (knownKeys.has(key)) continue;
            if (!value) continue;
            const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim();
            if (Array.isArray(value) && value.length > 0) {
                html += `<div class="explanation-text"><strong>${label}:</strong>
                    <ul style="margin:0.5rem 0 0 1.5rem;">${value.map(item => `<li>${item}</li>`).join('')}</ul>
                </div>`;
            } else if (typeof value === 'string' && value.trim()) {
                html += `<div class="explanation-text"><strong>${label}:</strong> ${value}</div>`;
            }
        }

        if (exp.learnMore?.length > 0) {
            html += `<div class="learn-more-links" style="margin-top:0.75rem;">`;
            for (const link of exp.learnMore) {
                html += `<a href="${link.url}" target="_blank" rel="noopener noreferrer"
                            class="learn-more"
                            tabindex="0">${link.title} →</a><br>`;  // #27 tabindex explicit
            }
            html += `</div>`;
        }
        return html;
    }

    /* ============================================================
       EVENT LISTENERS
       ============================================================ */

    attachEventListeners() {
        this.container.querySelectorAll('.option').forEach(opt => {
            opt.addEventListener('click',   () => this._handleOptionClick(opt));
            opt.addEventListener('keydown', e => {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    this._handleOptionClick(opt);
                }
            });
        });

        // #P3-5 Bookmark buttons
        this.container.querySelectorAll('.bookmark-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                this._toggleBookmark(parseInt(btn.dataset.qid));
            });
        });

        // #P5-2 Flag buttons
        this.container.querySelectorAll('.flag-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                this._cycleFlag(parseInt(btn.dataset.qid));
            });
        });

        // #P5-4 Study rating buttons
        this.container.querySelectorAll('.study-rating-btn').forEach(btn => {
            btn.addEventListener('click', () => this._setRating(parseInt(btn.dataset.qid), btn.dataset.rating));
        });

        // #14 Per-question reset buttons
        this.container.querySelectorAll('.question-reset-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                this._resetQuestion(parseInt(btn.dataset.qid));
            });
        });
    }

    _handleOptionClick(option) {
        const questionId    = parseInt(option.dataset.questionId);
        const optionId      = option.dataset.optionId;
        const isMultiSelect = option.dataset.multiSelect === 'true';
        this._focusedQuestionId = questionId; // #P3-2 sync
        this.selectOption(questionId, optionId, isMultiSelect);
    }

    /* ============================================================
       SELECTION LOGIC
       Phase 3: starts timer on first answer; autosaves after each
       ============================================================ */

    selectOption(questionId, optionId, isMultiSelect) {
        // #P3-4 Start timer on first interaction
        if (!this._timerStarted) {
            this._timerStarted = true;
            this._startTimer();
        }

        if (isMultiSelect) {
            if (!this.state.selectedAnswers[questionId]) {
                this.state.selectedAnswers[questionId] = [];
            }
            const selected   = this.state.selectedAnswers[questionId];
            const idx        = selected.indexOf(optionId);
            const maxAllowed = this._getCorrectCount(questionId);

            if (idx > -1) {
                selected.splice(idx, 1);
                delete this.state.answeredQuestions[questionId];
            } else if (selected.length < maxAllowed) {
                selected.push(optionId);
                if (selected.length === maxAllowed) {
                    this.state.answeredQuestions[questionId] = true;
                }
            } else {
                const words = ['', 'one', 'two', 'three', 'four'];
                this._showToast(`You can only select ${words[maxAllowed] ?? maxAllowed} answer${maxAllowed > 1 ? 's' : ''} for this question.`);
                return;
            }
        } else {
            this.state.selectedAnswers[questionId] = optionId;
            this.state.answeredQuestions[questionId] = true;
        }

        this.renderSpecificQuestion(questionId);

        if (this.state.answeredQuestions[questionId]) {
            const correct = this._isQuestionCorrect(questionId);
            const q = this.data.questions.find(q => q.id === questionId);
            this._announce(correct
                ? `Question ${q.displayNumber}: Correct!`
                : `Question ${q.displayNumber}: Incorrect. See the explanation below.`
            );
        }

        this._updateAll(questionId);
        this._saveState(); // #P3-1 autosave after each answer
    }

    /* ============================================================
       HELPERS
       ============================================================ */

    _getCorrectCount(questionId) {
        const question = this.data?.questions?.find(q => q.id === questionId);
        if (!question?.options) return 1;
        return question.options.filter(o => o.isCorrect).length || 1;
    }

    /* ============================================================
       RE-RENDER ONE QUESTION
       ============================================================ */

    renderSpecificQuestion(questionId) {
        const question = this.data.questions.find(q => q.id === questionId);
        if (!question) return;
        // #5 — Use attribute equals selector (quoted value) so non-integer IDs work safely
        const questionCard = this.container.querySelector(`.question-card[data-question-id="${CSS.escape(String(questionId))}"]`);
        if (!questionCard) return;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.renderQuestion(question);
        const newCard = tempDiv.firstElementChild;
        questionCard.replaceWith(newCard);

        newCard.querySelectorAll('.option').forEach(opt => {
            opt.addEventListener('click',   () => this._handleOptionClick(opt));
            opt.addEventListener('keydown', e => {
                if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); this._handleOptionClick(opt); }
            });
        });

        // Re-attach bookmark listener
        const bookmarkBtn = newCard.querySelector('.bookmark-btn');
        if (bookmarkBtn) {
            bookmarkBtn.addEventListener('click', e => {
                e.stopPropagation();
                this._toggleBookmark(parseInt(bookmarkBtn.dataset.qid));
            });
        }

        // Re-attach flag listener (#P5-2)
        const flagBtn = newCard.querySelector('.flag-btn');
        if (flagBtn) {
            flagBtn.addEventListener('click', e => {
                e.stopPropagation();
                this._cycleFlag(parseInt(flagBtn.dataset.qid));
            });
        }

        // Re-attach study mode rating listeners (#P5-4)
        newCard.querySelectorAll('.study-rating-btn').forEach(btn => {
            btn.addEventListener('click', () => this._setRating(parseInt(btn.dataset.qid), btn.dataset.rating));
        });

        // Re-attach reset button listener (#14)
        const resetBtn = newCard.querySelector('.question-reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', e => {
                e.stopPropagation();
                this._resetQuestion(parseInt(resetBtn.dataset.qid));
            });
        }
    }

    /* ============================================================
       #P5-1  SEARCH / FILTER
       Keyword search (debounced 200ms) + status filter dropdown.
       Filters .question-card visibility in place — no re-render.
       Shows "N of M questions shown" count below the filter bar.
       ============================================================ */

    _initSearchFilter() {
        const existing = document.getElementById('quizSearchFilter');
        if (existing) return;

        const wrap = document.createElement('div');
        wrap.id = 'quizSearchFilter';
        wrap.className = 'quiz-search-filter';
        wrap.setAttribute('role', 'search');
        wrap.setAttribute('aria-label', 'Filter questions');
        wrap.innerHTML = `
            <div class="search-input-wrap">
                <span class="search-icon" aria-hidden="true">🔍</span>
                <input type="search"
                       id="quizSearchInput"
                       class="quiz-search-input"
                       placeholder="Search questions…"
                       aria-label="Search questions by keyword"
                       autocomplete="off"
                       spellcheck="false">
                <button class="search-clear-btn" id="quizSearchClear"
                        aria-label="Clear search" hidden>✕</button>
            </div>
            <select id="quizStatusFilter" class="quiz-status-select" aria-label="Filter by answer status">
                <option value="all">All questions</option>
                <option value="unanswered">Unanswered</option>
                <option value="correct">Correct</option>
                <option value="incorrect">Incorrect</option>
                <option value="flagged">Flagged</option>
            </select>
            <span class="search-count" id="quizSearchCount" aria-live="polite" aria-atomic="true"></span>
        `;

        // Insert above questionsContainer
        this.container.parentNode.insertBefore(wrap, this.container);

        const input  = wrap.querySelector('#quizSearchInput');
        const select = wrap.querySelector('#quizStatusFilter');
        const clear  = wrap.querySelector('#quizSearchClear');

        input.addEventListener('input', () => {
            this._searchQuery = input.value.trim().toLowerCase();
            clear.hidden = !this._searchQuery;
            clearTimeout(this._searchDebounce);
            this._searchDebounce = setTimeout(() => this._applySearchFilter(), 200);
        });

        clear.addEventListener('click', () => {
            input.value = '';
            this._searchQuery = '';
            clear.hidden = true;
            this._applySearchFilter();
            input.focus();
        });

        select.addEventListener('change', () => {
            this._statusFilter = select.value;
            this._applySearchFilter();
        });
    }

    _applySearchFilter() {
        const cards = this.container.querySelectorAll('.question-card');
        const total = cards.length;
        let shown   = 0;

        cards.forEach(card => {
            const qid      = parseInt(card.dataset.questionId);
            const question = this.data?.questions?.find(q => q.id === qid);
            if (!question) return;

            // Keyword match — question text + all option texts
            let textMatch = true;
            if (this._searchQuery) {
                const haystack = [
                    question.question,
                    ...question.options.map(o => o.text),
                ].join(' ').toLowerCase();
                textMatch = haystack.includes(this._searchQuery);
            }

            // Status filter
            let statusMatch = true;
            const answered  = !!this.state.answeredQuestions[qid];
            const correct   = answered && this._isQuestionCorrect(qid);
            const flagged   = !!this.state.flags[qid];

            switch (this._statusFilter) {
                case 'unanswered': statusMatch = !answered;  break;
                case 'correct':    statusMatch = correct;    break;
                case 'incorrect':  statusMatch = answered && !correct; break;
                case 'flagged':    statusMatch = flagged;    break;
            }

            const visible = textMatch && statusMatch;
            card.classList.toggle('search-hidden', !visible);
            if (visible) shown++;
        });

        // Update count label
        const countEl = document.getElementById('quizSearchCount');
        if (countEl) {
            if (this._searchQuery || this._statusFilter !== 'all') {
                countEl.textContent = `${shown} of ${total} question${total !== 1 ? 's' : ''}`;
            } else {
                countEl.textContent = '';
            }
        }
    }

    /* ============================================================
       #P5-2  QUESTION FLAGGING
       Cycles: none → confusing → incorrect → none
       Persisted in state.flags (saved to localStorage).
       Flagged state visible in navigator dot (orange ring, distinct
       from bookmark's yellow ring).
       Flag data included in clipboard export and history panel.
       Also adds 'flagged' status to search filter dropdown.
       ============================================================ */

    _cycleFlag(questionId) {
        const current = this.state.flags[questionId] || null;
        const next = current === null ? 'confusing'
                   : current === 'confusing' ? 'incorrect'
                   : null;

        if (next === null) {
            delete this.state.flags[questionId];
        } else {
            this.state.flags[questionId] = next;
        }

        // Re-render the card to update flag button appearance
        this.renderSpecificQuestion(questionId);
        this._updateNavigator(); // refresh dot ring
        this._saveState();

        const label = next === 'confusing' ? 'Flagged as confusing'
                    : next === 'incorrect'  ? 'Flagged as incorrect'
                    : 'Flag removed';
        this._showToast(label);
        this._announce(label);
    }

    /* ============================================================
       #P5-3  WEAK AREAS PANEL
       Reads category/tag from question JSON (question.category or
       question.tags[]). Falls back gracefully if field absent.
       Only shows when ≥3 questions answered.
       Shows categories sorted by error rate descending.
       ============================================================ */

    _initWeakAreasBtn() {
        const existing = document.getElementById('quizWeakAreasBtn');
        if (existing) return;

        // Only show if any question has a category/tag field
        const hasMeta = this.data?.questions?.some(q => q.category || q.tags?.length);
        if (!hasMeta) return;

        const btn = document.createElement('button');
        btn.id = 'quizWeakAreasBtn';
        btn.className = 'quiz-toolbar-btn';
        btn.setAttribute('aria-label', 'View weak areas by category');
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-controls', 'quizWeakAreasPanel');
        btn.title = 'Weak areas';
        btn.innerHTML = `<span aria-hidden="true">📉</span><span class="toolbar-btn-label">Weak areas</span>`;

        btn.addEventListener('click', () => {
            const panel = document.getElementById('quizWeakAreasPanel');
            if (!panel) return;
            const isOpen = panel.classList.toggle('open');
            btn.classList.toggle('active', isOpen);
            btn.setAttribute('aria-expanded', String(isOpen));
            if (isOpen) this._refreshWeakAreasPanel();
        });

        this._appendToToolbar(btn);
        this._renderWeakAreasPanel(); // build panel in collapsed state
    }

    _getCategoryForQuestion(question) {
        if (question.category) return question.category;
        if (question.tags?.length) return question.tags[0];
        return 'General';
    }

    _renderWeakAreasPanel() {
        const existing = document.getElementById('quizWeakAreasPanel');
        if (existing) existing.remove();

        const panel = document.createElement('div');
        panel.id = 'quizWeakAreasPanel';
        panel.className = 'quiz-weak-areas-panel';
        panel.setAttribute('role', 'region');
        panel.setAttribute('aria-label', 'Weak areas by category');

        panel.innerHTML = `<div class="weak-areas-body" id="weakAreasBody">
            <p class="weak-areas-placeholder">Answer at least 3 questions to see category breakdown.</p>
        </div>`;

        const toolbar = document.getElementById('quizToolbar');
        if (toolbar) toolbar.after(panel);
    }

    _refreshWeakAreasPanel() {
        const body = document.getElementById('weakAreasBody');
        if (!body) return;

        const answered = Object.keys(this.state.answeredQuestions);
        if (answered.length < 3) {
            body.innerHTML = `<p class="weak-areas-placeholder">Answer at least 3 questions to see category breakdown.</p>`;
            return;
        }

        // Tally by category
        const stats = {}; // { category: { correct, total } }
        for (const question of this.data.questions) {
            if (!this.state.answeredQuestions[question.id]) continue;
            const cat = this._getCategoryForQuestion(question);
            if (!stats[cat]) stats[cat] = { correct: 0, total: 0 };
            stats[cat].total++;
            if (this._isQuestionCorrect(question.id)) stats[cat].correct++;
        }

        const categories = Object.entries(stats)
            .map(([cat, s]) => ({ cat, ...s, errorRate: (s.total - s.correct) / s.total }))
            .sort((a, b) => b.errorRate - a.errorRate);

        const rows = categories.map(c => {
            const pct      = Math.round((c.correct / c.total) * 100);
            const strength = pct >= 80 ? 'strong' : pct >= 50 ? 'ok' : 'weak';
            return `
                <div class="weak-area-row" role="listitem">
                    <div class="weak-area-label">
                        <span class="weak-area-cat">${c.cat}</span>
                        <span class="weak-area-stat">${c.correct}/${c.total} correct</span>
                    </div>
                    <div class="weak-area-bar-track" aria-hidden="true">
                        <div class="weak-area-bar-fill wa-${strength}" style="width:${pct}%"></div>
                    </div>
                    <span class="weak-area-pct">${pct}%</span>
                </div>
            `;
        }).join('');

        body.innerHTML = `
            <p class="weak-areas-meta">${answered.length} questions answered across ${categories.length} categor${categories.length === 1 ? 'y' : 'ies'}</p>
            <div class="weak-area-list" role="list" aria-label="Category scores">
                ${rows}
            </div>
        `;
    }

    /* ============================================================
       #P5-4  STUDY MODE
       Toggle button in toolbar. When active:
       — Single-choice questions don't lock after first selection.
         User can change their answer until they click "Got it".
       — After each answer: "✅ Got it / 🔁 Still learning" rating
         buttons appear below the options list.
       — Self-rating stored in state.ratings (persisted).
       — Score summary is suppressed while in study mode.
       — Turning study mode off resets all answers for a clean test.
       ============================================================ */

    _initStudyModeBtn() {
        const existing = document.getElementById('quizStudyModeBtn');
        if (existing) return;

        const btn = document.createElement('button');
        btn.id = 'quizStudyModeBtn';
        btn.className = 'quiz-toolbar-btn';
        btn.setAttribute('aria-label', 'Toggle study mode');
        btn.setAttribute('aria-pressed', String(this._studyMode));
        btn.title = 'Study mode';
        btn.innerHTML = `<span aria-hidden="true">📖</span><span class="toolbar-btn-label">Study</span>`;

        btn.addEventListener('click', () => {
            this._studyMode = !this._studyMode;
            btn.classList.toggle('active', this._studyMode);
            btn.setAttribute('aria-pressed', String(this._studyMode));

            if (!this._studyMode) {
                // Exiting study mode: offer to reset answers for a real test
                if (this._answeredCount() > 0) {
                    if (confirm('Exit study mode? This will reset all answers so you can take the quiz properly.')) {
                        this._clearSavedState();
                        window.location.reload();
                        return;
                    }
                    // User cancelled — re-enable study mode
                    this._studyMode = true;
                    btn.classList.add('active');
                    btn.setAttribute('aria-pressed', 'true');
                    return;
                }
            }

            this._saveState();
            this.renderQuestions(); // re-render to apply/remove locked styles and rating buttons
            this._applyBookmarkFilter();
            this._applySearchFilter();
            const msg = this._studyMode ? 'Study mode on. Answers can be changed freely.' : 'Study mode off.';
            this._showToast(msg);
            this._announce(msg);
        });

        this._appendToToolbar(btn);
    }

    /**
     * Renders "Got it / Still learning" rating buttons below a question's options.
     * Only shown in study mode after a question is answered.
     */
    _renderStudyRating(questionId, currentRating) {
        return `
            <div class="study-rating" role="group" aria-label="Self-rating for question ${questionId}">
                <span class="study-rating-label">How did you go?</span>
                <button class="study-rating-btn ${currentRating === 'got-it' ? 'rating-active' : ''}"
                        data-qid="${questionId}" data-rating="got-it"
                        aria-pressed="${currentRating === 'got-it'}"
                        aria-label="Got it — I understood this question">✅ Got it</button>
                <button class="study-rating-btn ${currentRating === 'still-learning' ? 'rating-active' : ''}"
                        data-qid="${questionId}" data-rating="still-learning"
                        aria-pressed="${currentRating === 'still-learning'}"
                        aria-label="Still learning — I need more practice on this">🔁 Still learning</button>
            </div>
        `;
    }

    _setRating(questionId, rating) {
        const current = this.state.ratings[questionId];
        // Toggle off if same rating clicked again
        this.state.ratings[questionId] = (current === rating) ? null : rating;
        if (this.state.ratings[questionId] === null) delete this.state.ratings[questionId];

        // Update just the rating widget without full re-render
        const card = this.container.querySelector(`.question-card[data-question-id="${questionId}"]`);
        if (card) {
            const existing = card.querySelector('.study-rating');
            if (existing) {
                const newRating = this.state.ratings[questionId] || null;
                existing.outerHTML = this._renderStudyRating(questionId, newRating);
                // Re-attach listeners on the new element
                card.querySelectorAll('.study-rating-btn').forEach(btn => {
                    btn.addEventListener('click', () => this._setRating(parseInt(btn.dataset.qid), btn.dataset.rating));
                });
            }
        }
        this._saveState();
    }

    /* ============================================================
       STUDY MODE: override _updateAll to skip score summary
       ============================================================ */

    _updateAll(changedQuestionId = null) {
        this._updateProgressBar();
        this._updateNavigator();
        this._updateScoreBadge();

        if (changedQuestionId !== null) {
            this._updateQuestionBadge(changedQuestionId);
            this._addNextButton(changedQuestionId);
        }

        // #25 keep show-all panels in sync after any state change
        if (this._showAllActive) this._applyShowAll();

        // #P5-4 Suppress score summary in study mode
        if (this._answeredCount() === this._totalQuestions() && this._totalQuestions() > 0 && !this._studyMode) {
            clearInterval(this._timerInterval);
            this._timerInterval = null;
            this._saveState();
            setTimeout(() => this._showScoreSummary(), 400);
        }
    }

    /* ============================================================
       NAVIGATOR UPDATES — include flag ring colour
       Override _updateNavigator to also show flag state
       ============================================================ */

    _updateNavigator() {
        const nav = document.getElementById('quizNavigator');
        if (!nav) return;
        nav.querySelectorAll('.quiz-nav-dot').forEach(btn => {
            const qid = parseInt(btn.dataset.qid);
            btn.classList.remove('answered-correct', 'answered-wrong', 'unanswered', 'bookmarked', 'flagged-confusing', 'flagged-incorrect');

            if (this.state.answeredQuestions[qid]) {
                btn.classList.add(this._isQuestionCorrect(qid) ? 'answered-correct' : 'answered-wrong');
            } else {
                btn.classList.add('unanswered');
            }
            if (this.state.bookmarks[qid]) btn.classList.add('bookmarked');
            // #P5-2 flag indicator on dot
            const flag = this.state.flags[qid];
            if (flag) btn.classList.add('flagged-' + flag);
        });
    }

    /* ============================================================
       EXPORT — include flagged questions in clipboard copy (#P5-2)
       Override _copyResultsToClipboard to append flag summary
       ============================================================ */

    async _copyResultsToClipboard(btn) {
        const total   = this._totalQuestions();
        const correct = this._correctCount();
        const pct     = Math.round((correct / total) * 100);
        const timeStr = this._formatTime(this._elapsedSeconds);
        const passed  = pct >= 70;
        const quizTitle = document.getElementById('pageTitle')?.textContent?.replace(/^📝\s*/, '') ?? this.quizFile ?? 'Quiz';
        const date    = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

        const flaggedQuestions = this.data.questions.filter(q => this.state.flags[q.id]);
        const flagSection = flaggedQuestions.length > 0
            ? [
                `─────────────────────`,
                `Flagged questions (${flaggedQuestions.length}):`,
                ...flaggedQuestions.map(q => {
                    const flag = this.state.flags[q.id];
                    const qText = q.question.replace(/<[^>]+>/g, '').trim().slice(0, 60);
                    return `  [${flag}] Q${q.displayNumber}: ${qText}${q.question.length > 60 ? '…' : ''}`;
                }),
              ]
            : [];

        const studyRatings = Object.keys(this.state.ratings || {});
        const gotIt = studyRatings.filter(id => this.state.ratings[id] === 'got-it').length;
        const stillLearning = studyRatings.filter(id => this.state.ratings[id] === 'still-learning').length;
        const ratingSection = studyRatings.length > 0
            ? [`─────────────────────`, `Study ratings: ✅ Got it: ${gotIt}  🔁 Still learning: ${stillLearning}`]
            : [];

        const text = [
            `📝 ${quizTitle}`,
            `📅 ${date}`,
            `─────────────────────`,
            `Score:  ${correct} / ${total}  (${pct}%)`,
            `Result: ${passed ? '✅ PASSED' : '❌ NOT PASSED'}`,
            `Time:   ${timeStr}`,
            ...flagSection,
            ...ratingSection,
            `─────────────────────`,
            passed
                ? `Well done! ${total - correct > 0 ? `Review ${total - correct} missed question${total - correct > 1 ? 's' : ''}.` : 'Perfect score!'}`
                : `Need 70% to pass. Keep practising!`,
        ].join('\n');

        try {
            await navigator.clipboard.writeText(text);
            btn.innerHTML = '✅ Copied!';
            setTimeout(() => { btn.innerHTML = '📋 Copy summary'; }, 2000);
        } catch (e) {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed'; ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.focus(); ta.select();
            document.execCommand('copy');
            ta.remove();
            btn.innerHTML = '✅ Copied!';
            setTimeout(() => { btn.innerHTML = '📋 Copy summary'; }, 2000);
        }
    }

    /* ============================================================
       #14  PER-QUESTION RESET
       Clears one question's answer without touching any others.
       Re-renders the card, updates all indicators.
       If score summary is showing, hides it (quiz is in-progress again).
       ============================================================ */

    _resetQuestion(questionId) {
        // Clear this question's state
        delete this.state.selectedAnswers[questionId];
        delete this.state.answeredQuestions[questionId];
        delete this.state.ratings[questionId];

        // Hide score summary if it was showing (quiz is live again)
        const summary = document.getElementById('quizSummary');
        if (summary) summary.remove();

        // Remove result badge and next button for this card before re-render
        const card = this.container.querySelector(`.question-card[data-question-id="${CSS.escape(String(questionId))}"]`);
        if (card) {
            card.querySelector('.question-result-badge')?.remove();
            card.querySelector('.quiz-next-btn')?.remove();
        }

        this.renderSpecificQuestion(questionId);
        this._updateAll(questionId);
        this._saveState();
        this._announce(`Question ${questionId} reset. Select a new answer.`);
    }

    /* ============================================================
       #25  SHOW ALL ANSWERS TOGGLE
       Toolbar button. Expands all correct explanations at once
       (same content as clicking each correct answer individually).
       Toggles — a second click collapses all.
       ============================================================ */

    _initShowAllAnswers() {
        const existing = document.getElementById('quizShowAllBtn');
        if (existing) return;

        const btn = document.createElement('button');
        btn.id = 'quizShowAllBtn';
        btn.className = 'quiz-toolbar-btn';
        btn.setAttribute('aria-label', 'Show all correct answers');
        btn.setAttribute('aria-pressed', 'false');
        btn.title = 'Show all answers';
        btn.innerHTML = `<span aria-hidden="true">👁</span><span class="toolbar-btn-label">Show answers</span>`;

        this._showAllActive = false;

        btn.addEventListener('click', () => {
            this._showAllActive = !this._showAllActive;
            btn.classList.toggle('active', this._showAllActive);
            btn.setAttribute('aria-pressed', String(this._showAllActive));
            btn.querySelector('.toolbar-btn-label').textContent = this._showAllActive ? 'Hide answers' : 'Show answers';
            btn.setAttribute('aria-label', this._showAllActive ? 'Hide all correct answers' : 'Show all correct answers');
            this._applyShowAll();
        });

        this._appendToToolbar(btn);
    }

    _applyShowAll() {
        // For each unanswered question, inject or remove a reveal panel
        for (const question of this.data.questions) {
            const isAnswered = !!this.state.answeredQuestions[question.id];
            if (isAnswered) continue; // answered questions already show their explanation

            const card = this.container.querySelector(`.question-card[data-question-id="${CSS.escape(String(question.id))}"]`);
            if (!card) continue;

            const existing = card.querySelector('.show-all-reveal');
            if (this._showAllActive) {
                if (existing) continue; // already shown
                const correctOptions = question.options.filter(o => o.isCorrect);
                if (!correctOptions.length) continue;

                const panel = document.createElement('div');
                panel.className = 'show-all-reveal';
                panel.setAttribute('aria-label', 'Correct answer revealed');
                panel.innerHTML = correctOptions.map(o => `
                    <div class="explanation correct">
                        <div class="explanation-header">
                            <span class="explanation-icon" aria-hidden="true">✓</span>
                            <strong>Correct answer: ${o.text}</strong>
                        </div>
                        ${this._renderExplanationInner(o)}
                    </div>
                `).join('');
                card.querySelector('.options-list').after(panel);
            } else {
                existing?.remove();
            }
        }
    }

    /* ============================================================
       #33  TIMED MODE
       Optional countdown per quiz. Toolbar button opens a small
       picker (5 / 10 / 15 / 20 / 30 min). Timer counts down;
       when it hits 0:00 the quiz auto-submits (shows summary).
       Coexists with count-up timer — countdown shown in red when
       under 60 seconds. Timed mode state is NOT persisted to
       localStorage (it's a session choice).
       ============================================================ */

    _initTimedMode() {
        const existing = document.getElementById('quizTimedModeBtn');
        if (existing) return;

        this._countdownSeconds  = 0;
        this._countdownInterval = null;
        this._countdownEl       = null;

        const btn = document.createElement('button');
        btn.id = 'quizTimedModeBtn';
        btn.className = 'quiz-toolbar-btn';
        btn.setAttribute('aria-label', 'Enable timed mode');
        btn.setAttribute('aria-expanded', 'false');
        btn.title = 'Timed mode';
        btn.innerHTML = `<span aria-hidden="true">⏳</span><span class="toolbar-btn-label">Timed</span>`;

        // Picker panel
        const picker = document.createElement('div');
        picker.id = 'quizTimedPicker';
        picker.className = 'quiz-timed-picker';
        picker.hidden = true;
        picker.setAttribute('role', 'dialog');
        picker.setAttribute('aria-label', 'Choose countdown duration');
        picker.innerHTML = `
            <p class="timed-picker-label">Set a countdown timer:</p>
            <div class="timed-picker-options">
                ${[5, 10, 15, 20, 30].map(m => `
                    <button class="timed-pick-btn" data-minutes="${m}"
                            aria-label="${m} minutes">${m} min</button>
                `).join('')}
            </div>
            <button class="timed-cancel-btn" aria-label="Cancel timed mode">Cancel</button>
        `;

        btn.addEventListener('click', () => {
            if (this._countdownInterval) {
                // Already running — stop it
                this._stopCountdown();
                return;
            }
            const isOpen = picker.hidden === false;
            picker.hidden = isOpen;
            btn.setAttribute('aria-expanded', String(!isOpen));
        });

        picker.querySelectorAll('.timed-pick-btn').forEach(pickBtn => {
            pickBtn.addEventListener('click', () => {
                const minutes = parseInt(pickBtn.dataset.minutes);
                picker.hidden = true;
                btn.setAttribute('aria-expanded', 'false');
                this._startCountdown(minutes * 60);
            });
        });

        picker.querySelector('.timed-cancel-btn').addEventListener('click', () => {
            picker.hidden = true;
            btn.setAttribute('aria-expanded', 'false');
        });

        this._appendToToolbar(btn);
        // Insert picker right after toolbar
        const toolbar = document.getElementById('quizToolbar');
        if (toolbar) toolbar.after(picker);
        else this.container.parentNode.insertBefore(picker, this.container);
    }

    _startCountdown(totalSeconds) {
        this._countdownSeconds = totalSeconds;

        // Build countdown display inside progress bar row
        if (!document.getElementById('quizCountdown')) {
            const bar = document.getElementById('quizProgressBar');
            const el  = document.createElement('div');
            el.id = 'quizCountdown';
            el.className = 'quiz-countdown';
            el.setAttribute('aria-live', 'off'); // announced only at key thresholds
            el.setAttribute('aria-label', 'Countdown timer');
            el.innerHTML = `<span class="countdown-icon" aria-hidden="true">⏳</span><span class="countdown-value" id="countdownValue"></span>`;
            if (bar) bar.appendChild(el);
            this._countdownEl = document.getElementById('countdownValue');
        }

        this._updateCountdownDisplay();

        const btn = document.getElementById('quizTimedModeBtn');
        if (btn) {
            btn.classList.add('active');
            btn.querySelector('.toolbar-btn-label').textContent = 'Stop timer';
            btn.setAttribute('aria-label', 'Stop countdown timer');
        }

        this._countdownInterval = setInterval(() => {
            this._countdownSeconds--;
            this._updateCountdownDisplay();

            // Announce at 60s and 30s thresholds
            if (this._countdownSeconds === 60) this._announce('One minute remaining.');
            if (this._countdownSeconds === 30) this._announce('30 seconds remaining.');

            if (this._countdownSeconds <= 0) {
                this._stopCountdown();
                this._announce('Time is up! Submitting your quiz.');
                // Auto-submit: mark all unanswered questions, show summary
                this._forceFinish();
            }
        }, 1000);
    }

    _stopCountdown() {
        clearInterval(this._countdownInterval);
        this._countdownInterval = null;
        this._countdownSeconds  = 0;

        document.getElementById('quizCountdown')?.remove();
        this._countdownEl = null;

        const btn = document.getElementById('quizTimedModeBtn');
        if (btn) {
            btn.classList.remove('active');
            btn.querySelector('.toolbar-btn-label').textContent = 'Timed';
            btn.setAttribute('aria-label', 'Enable timed mode');
        }
    }

    _updateCountdownDisplay() {
        if (!this._countdownEl || !this._countdownEl.isConnected) {
            this._countdownEl = document.getElementById('countdownValue');
        }
        if (!this._countdownEl) return;
        const s   = this._countdownSeconds;
        const m   = Math.floor(s / 60);
        const sec = s % 60;
        this._countdownEl.textContent = `${m}:${String(sec).padStart(2, '0')}`;

        // Turn red under 60 seconds
        const wrap = document.getElementById('quizCountdown');
        if (wrap) wrap.classList.toggle('countdown-urgent', s <= 60);
    }

    _forceFinish() {
        // Show summary immediately without requiring all questions answered
        clearInterval(this._timerInterval);
        this._timerInterval = null;
        this._saveState();
        this._showScoreSummary();
    }

    /* ============================================================
       #6  THEME TOGGLE TOOLTIP
       Adds a tooltip to the theme toggle button showing what the
       next theme will be. Updates after each click.
       ============================================================ */

    _initThemeTooltip() {
        const btn = document.getElementById('themeToggle');
        if (!btn) return;

        const _updateTitle = () => {
            const current = document.documentElement.getAttribute('data-theme') || 'light';
            const nextMap = { light: 'Dark mode', dark: 'Comfort mode', comfort: 'Light mode' };
            const next    = nextMap[current] ?? 'Toggle theme';
            btn.setAttribute('title', `Switch to ${next}`);
            btn.setAttribute('aria-label', `Switch to ${next}`);
        };

        _updateTitle();
        btn.addEventListener('click', () => setTimeout(_updateTitle, 50)); // after theme.js updates data-theme
    }

    /* ============================================================
       #32  MOBILE SCORE BADGE
       On small screens the floating score badge anchors to the
       bottom of the viewport and spans the full width — replacing
       the fixed floating pill with a sticky footer strip.
       Handled entirely in CSS (see quiz.css @media rules).
       This method exists as a hook for any future JS behaviour.
       ============================================================ */

    // (no JS needed — CSS handles the mobile layout change)

    /* ============================================================
       PRINT MODE PICKER
       Four print modes — set via data-print-mode on <body>.
       CSS @media print rules key off this attribute.

       Modes:
         question-paper   — options shown, nothing selected, no answers
         answer-key       — correct options highlighted, no explanations
         answer-reasons   — correct options + explanations for correct only
         full-explanations — correct options highlighted + explanations
                            for ALL options (right and wrong)
       ============================================================ */

    _initPrintPicker() {
        const existing = document.getElementById('quizPrintPicker');
        if (existing) return;

        const picker = document.createElement('div');
        picker.id = 'quizPrintPicker';
        picker.className = 'quiz-print-picker';
        picker.hidden = true;
        picker.setAttribute('role', 'dialog');
        picker.setAttribute('aria-modal', 'true');
        picker.setAttribute('aria-label', 'Choose print format');

        const modes = [
            {
                value: 'question-paper',
                icon:  '📄',
                label: 'Question paper',
                desc:  'Questions and options only — nothing selected, no answers shown. Use for blank tests.',
            },
            {
                value: 'answer-key',
                icon:  '✅',
                label: 'Answer key',
                desc:  'Correct option(s) highlighted in green. No explanations.',
            },
            {
                value: 'answer-reasons',
                icon:  '💡',
                label: 'Correct answers + reasons',
                desc:  'Correct option(s) highlighted with full explanation. Wrong options shown but not explained.',
            },
            {
                value: 'full-explanations',
                icon:  '📚',
                label: 'Full answer guide',
                desc:  'Correct options highlighted. Explanation shown for every option — right and wrong.',
            },
        ];

        picker.innerHTML = `
            <div class="print-picker-backdrop"></div>
            <div class="print-picker-panel" role="document">
                <div class="print-picker-header">
                    <h2 class="print-picker-title">🖨️ Print format</h2>
                    <button class="print-picker-close" aria-label="Close print options">✕</button>
                </div>
                <p class="print-picker-subtitle">Choose what to include in your printout:</p>
                <div class="print-picker-options">
                    ${modes.map(m => `
                        <button class="print-pick-btn" data-mode="${m.value}"
                                aria-label="${m.label}: ${m.desc}">
                            <span class="pick-icon" aria-hidden="true">${m.icon}</span>
                            <span class="pick-body">
                                <span class="pick-label">${m.label}</span>
                                <span class="pick-desc">${m.desc}</span>
                            </span>
                        </button>
                    `).join('')}
                </div>
                <button class="print-picker-cancel">Cancel</button>
            </div>
        `;

        document.body.appendChild(picker);

        // Close handlers
        const close = () => { picker.hidden = true; };
        picker.querySelector('.print-picker-close').addEventListener('click', close);
        picker.querySelector('.print-picker-cancel').addEventListener('click', close);
        picker.querySelector('.print-picker-backdrop').addEventListener('click', close);
        picker.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

        // Print mode buttons
        picker.querySelectorAll('.print-pick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                close();
                const mode = btn.dataset.mode;
                const snapshot = this._preparePrintDOM(mode);
                document.body.setAttribute('data-print-mode', mode);
                window.print();
                setTimeout(() => {
                    document.body.removeAttribute('data-print-mode');
                    this._restorePrintDOM(snapshot);
                }, 1200);
            });
        });
    }

    /* ============================================================
       PRINT DOM PREPARATION
       Before window.print() fires we mutate the live DOM to match
       exactly what each print mode should show. After print we
       restore everything from the snapshot so the page is unchanged.

       Why DOM mutation instead of pure CSS:
         — Options carry .correct/.incorrect classes set when the
           student clicked. CSS [data-print-mode] rules can restyle
           them but cannot REMOVE them, so a wrong-selected option
           would still show its red background in "question-paper"
           mode no matter what CSS we write.
         — We need to: strip selected-state classes, swap letter
           icons back in (replacing ✓/✗), and hide or show inline
           explanation divs — all of which require DOM changes.

       Snapshot structure: array of { el, className, iconHTML,
       explanationsRemoved } — one entry per option element.
       ============================================================ */

    _preparePrintDOM(mode) {
        /*
         * DOM structure inside .options-list:
         *
         *   .option[data-is-correct][data-option-index]   ← may have .correct/.incorrect
         *   .explanation.correct  (or .incorrect)         ← only if student selected this option
         *   .explanation.print-only[data-print-explanation] ← always present for unselected options
         *   .option ...
         *   ...
         *
         * We walk each .options-list child-by-child so we always know
         * which option owns which explanation sibling(s).
         */
        const snapshot = [];   // { el, className, iconHTML, hiddenExps[] }
        const letters  = ['A', 'B', 'C', 'D', 'E', 'F'];

        this.container.querySelectorAll('.options-list').forEach(list => {
            let currentOpt   = null;
            let currentEntry = null;
            let optIdx       = 0;

            Array.from(list.children).forEach(child => {

                if (child.classList.contains('option')) {
                    // ── New option element ──────────────────────────────
                    currentOpt   = child;
                    const icon   = child.querySelector('.option-icon');
                    const isCorrect = child.dataset.isCorrect === 'true';
                    const letter = letters[optIdx] ?? String(optIdx + 1);
                    optIdx++;

                    currentEntry = {
                        el:         child,
                        className:  child.className,
                        iconHTML:   icon ? icon.innerHTML : null,
                        hiddenExps: [],
                    };
                    snapshot.push(currentEntry);

                    // Apply per-mode option class + icon
                    if (mode === 'question-paper') {
                        child.className = 'option';
                        if (icon) icon.innerHTML = letter;

                    } else if (mode === 'answer-key') {
                        child.className = isCorrect ? 'option correct' : 'option';
                        if (icon) icon.innerHTML = isCorrect ? '✓' : letter;

                    } else if (mode === 'answer-reasons') {
                        child.className = isCorrect ? 'option correct' : 'option';
                        if (icon) icon.innerHTML = isCorrect ? '✓' : letter;

                    } else if (mode === 'full-explanations') {
                        child.className = isCorrect ? 'option correct' : 'option';
                        if (icon) icon.innerHTML = isCorrect ? '✓' : letter;
                    }

                } else if (child.classList.contains('explanation') && currentEntry) {
                    // ── Explanation sibling belonging to currentOpt ─────
                    const isPrintOnly = child.classList.contains('print-only');
                    const isCorrectExp = child.classList.contains('correct');

                    let shouldHide = false;

                    if (mode === 'question-paper') {
                        // Hide ALL explanations — blank paper shows nothing
                        shouldHide = true;

                    } else if (mode === 'answer-key') {
                        // Hide ALL explanations — key shows only highlighted options
                        shouldHide = true;

                    } else if (mode === 'answer-reasons') {
                        // Show only correct explanations; hide incorrect ones
                        shouldHide = !isCorrectExp;

                    } else if (mode === 'full-explanations') {
                        // Show all — nothing to hide
                        shouldHide = false;
                    }

                    if (shouldHide) {
                        child.style.display = 'none';
                        currentEntry.hiddenExps.push(child);
                    }
                }
            });
        });

        return snapshot;
    }

    _restorePrintDOM(snapshot) {
        for (const entry of snapshot) {
            entry.el.className = entry.className;
            const icon = entry.el.querySelector('.option-icon');
            if (icon && entry.iconHTML !== null) icon.innerHTML = entry.iconHTML;
            for (const exp of entry.hiddenExps) exp.style.display = '';
        }
    }

}

/* ============================================================
   PRINT BUTTON — opens print mode picker (Phase 1 #19 extended)
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    const printBtn = document.querySelector('.print-button');
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            // If QuizEngine is running, show the picker
            const picker = document.getElementById('quizPrintPicker');
            if (picker) {
                picker.hidden = !picker.hidden;
                if (!picker.hidden) picker.querySelector('.print-pick-btn')?.focus();
            } else {
                window.print(); // fallback if engine not loaded
            }
        });
    }
});

window.QuizEngine = QuizEngine;