/**
 * Notes Template Interactive Features v5.0
 * Handles TWO-TYPE exam highlight mode and code copy functionality
 * File: js/notes-template.js
 * 
 * Exam Modes:
 * - None: No highlights visible
 * - Highlight: Both sentence and term highlights shown in yellow
 * - Test: Sentences visible (context), terms hidden (fill-in-blank)
 */

(function () {
    'use strict';

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        try {
            initCodeBlocks();
            injectStaticElements();
            initExamMode();
            initPrintMode();
            initPrintAnswerKey();
            initAccessibility();        
            enhanceExistingElements();
            enhanceAccessibilityLandmarks();
            
            // NEW: Inject menu system (replaces individual buttons)
            injectFABMenus();
            
            // All other features
            injectJumpToTopButton();
            injectReadingTimeBadge();
            injectReadingProgressBar();
            initTableOfContentsHighlight();
            enhanceCopyCodeButtons();
            initDarkModeAutoDetect();
            initSearchHistory();
            injectSearchFilters();
            initHighlightPersistence();
            injectLoadingSkeletons();
            enhanceKeyboardShortcutsPanel();
            initSmoothTransitions();
            initBookmarkSystem();
            initStudyTimer();
            
            console.log('✅ Notes template initialized successfully');
            console.log('✨ Menu system + all features loaded');
        } catch (error) {
            console.error('❌ Error initializing notes template:', error);
        }
    }

    // ============================================
    // PRINT MODE ENHANCEMENT
    // ============================================

    function initPrintMode() {
        // Print preparation handled by executePrint() via the print modal.
    }


    function markCorrectAnswers() {
        // Only if MCQ data is loaded
        if (typeof window.quizData === 'undefined') return;

        const allQuestions = document.querySelectorAll('.quiz-slide');
        allQuestions.forEach((slide, index) => {
            const questionData = window.quizData.questions[index];
            if (!questionData) return;

            const correctLetter = questionData.correctAnswer;
            const optionCards = slide.querySelectorAll('.quiz-option-card');

            optionCards.forEach(card => {
                const letter = card.querySelector('.option-letter')?.textContent?.trim();
                if (letter === correctLetter) {
                    card.setAttribute('data-correct', 'true');
                }
            });
        });
    }

    // ============================================
    // STATIC ELEMENT INJECTION (NEW SECTION)
    // ============================================



    function injectStaticElements() {
        injectStaticMeta();
        injectBreadcrumb();
        injectBreadcrumbSchema();
        injectPrintButton();
        injectThemeToggle();
        injectExamModeToggle();
        injectFooter();
        injectGoogleAnalytics();
        loadConditionalScripts();


        console.log('✅ All static elements injected');
    }
    function injectPrintButton() {
        const button = document.createElement('button');
        button.className = 'print-button';
        button.setAttribute('aria-label', 'Print or save this page as PDF');
        button.setAttribute('title', 'Print (Ctrl+P)');

        const emoji = document.createElement('span');
        emoji.className = 'print-icon';
        emoji.textContent = '🖨️';

        const text = document.createElement('span');
        text.className = 'print-text';
        text.textContent = 'Print';

        button.appendChild(emoji);
        button.appendChild(text);

        // Enhanced click handler with feedback
        button.addEventListener('click', function () {
            openPrintModal();
        });

        document.body.appendChild(button);

        console.log('✅ Print button injected');
    }

    function injectStaticMeta() {
        const head = document.head;

        // Author
        const author = document.createElement('meta');
        author.name = 'author';
        author.content = 'Namrata Mulwani';
        head.appendChild(author);

        // Robots
        const robots = document.createElement('meta');
        robots.name = 'robots';
        robots.content = 'index, follow';
        head.appendChild(robots);

        // OG Site Name
        const ogSite = document.createElement('meta');
        ogSite.setAttribute('property', 'og:site_name');
        ogSite.content = 'AWS Training by Namrata';
        head.appendChild(ogSite);

        // Twitter Card
        const twitter = document.createElement('meta');
        twitter.name = 'twitter:card';
        twitter.content = 'summary_large_image';
        head.appendChild(twitter);

        // Theme Color
        const theme = document.createElement('meta');
        theme.name = 'theme-color';
        theme.content = '#1a1a2e';
        head.appendChild(theme);

        // Color Scheme
        const colorScheme = document.createElement('meta');
        colorScheme.name = 'color-scheme';
        colorScheme.content = 'light dark';
        head.appendChild(colorScheme);

        console.log('✅ Static meta tags injected');
    }

    function injectBreadcrumb() {
        // Get page title from h1 or document title
        const h1 = document.querySelector('.note-header h1');
        const pageTitle = h1 ? h1.textContent : document.title.split(' - ')[0];

        const nav = document.createElement('nav');
        nav.className = 'breadcrumb';
        nav.setAttribute('aria-label', 'Breadcrumb');
        nav.innerHTML = `
            <ol>
                <li><a href="https://namrata2709.github.io/Resources/">🏠 Home</a></li>
                <li><a href="https://namrata2709.github.io/Resources/notes.html">📓 Notes</a></li>
                <li aria-current="page">${pageTitle}</li>
            </ol>
        `;

        // Insert at beginning of body
        document.body.insertBefore(nav, document.body.firstChild);

        console.log('✅ Breadcrumb navigation injected');
    }

    function injectBreadcrumbSchema() {
        const h1 = document.querySelector('.note-header h1');
        const pageTitle = h1 ? h1.textContent : document.title.split(' - ')[0];

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "https://namrata2709.github.io/Resources/"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Notes",
                    "item": "https://namrata2709.github.io/Resources/notes.html"
                },
                {
                    "@type": "ListItem",
                    "position": 3,
                    "name": pageTitle
                }
            ]
        });

        document.head.appendChild(script);

        console.log('✅ Breadcrumb schema injected');
    }

    function injectThemeToggle() {
        const button = document.createElement('button');
        button.id = 'themeToggle';
        button.className = 'theme-toggle';
        button.setAttribute('aria-label', 'Toggle theme');
        button.innerHTML = '<span class="theme-icon"></span>';

        // Insert after breadcrumb (which is now first element)
        const breadcrumb = document.querySelector('.breadcrumb');
        if (breadcrumb) {
            breadcrumb.insertAdjacentElement('afterend', button);
        } else {
            document.body.insertBefore(button, document.body.firstChild);
        }

        console.log('✅ Theme toggle button injected');
    }

    function injectExamModeToggle() {
        // Only inject if this is a complete notes page
        const isCompleteNotes = document.body.classList.contains('complete-notes');

        if (!isCompleteNotes) {
            console.log('ℹ️ Overview notes - Exam mode toggle skipped');
            return;
        }

        const button = document.createElement('button');
        button.id = 'examModeToggle';
        button.className = 'exam-mode-toggle';
        button.setAttribute('aria-label', 'Toggle exam mode');
        button.setAttribute('title', 'Exam Study Mode: None');
        button.innerHTML = `
            <span class="exam-icon">📚</span>
            <span class="exam-mode-text">None</span>
        `;

        // Insert after theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.insertAdjacentElement('afterend', button);
        }

        console.log('✅ Exam mode toggle injected (Complete notes)');
    }

    function injectFooter() {


        // Create footer (existing code)
        const footer = document.createElement('footer');
        footer.className = 'content-footer';
        footer.innerHTML = `
            <div class="footer-container">
                <div class="footer-block">
                    <p class="footer-copyright">© 2025 Namrata Mulwani. All rights reserved.</p>
                    <p class="footer-license">Licensed under <a href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank" rel="noopener noreferrer">Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)</a></p>
                </div>
                <div class="footer-block">
                    <h4 class="footer-heading">📜 Usage Terms</h4>
                    <ul class="footer-list">
                        <li><strong>You are free to:</strong> Share and adapt this material for educational purposes.</li>
                        <li><strong>You must:</strong> Give appropriate credit and link to the license.</li>
                        <li><strong>You cannot:</strong> Use this material for commercial purposes without permission.</li>
                    </ul>
                    <p class="footer-contact">For commercial licensing: <a href="mailto:awslecturenotes@gmail.com">awslecturenotes@gmail.com</a></p>
                </div>
                <div class="footer-disclaimer">
                    <p><strong>⚠️ Disclaimer:</strong> This content is for educational purposes only. AWS, Amazon Web Services, and all AWS service names are trademarks of Amazon.com, Inc. or its affiliates. This training material is not officially affiliated with, authorized, or endorsed by Amazon Web Services.</p>
                </div>
            </div>
        `;

        // Append both to body
        document.body.appendChild(footer);

        console.log('✅ Footer injected');
    }
    // ============================================
    // ENHANCED ACCESSIBILITY FEATURES
    // ============================================

    function initAccessibility() {
        initKeyboardNavigation();
        initSkipLinks();
        initAriaLiveRegions();
        initFocusManagement();
        initKeyboardShortcuts();

        console.log('✅ Enhanced accessibility initialized');
    }

    // Keyboard navigation detection
    function initKeyboardNavigation() {
        let isKeyboardUser = false;

        // Detect keyboard usage
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Tab') {
                isKeyboardUser = true;
                document.body.classList.add('keyboard-navigation');
            }
        });

        // Detect mouse usage
        document.addEventListener('mousedown', function () {
            isKeyboardUser = false;
            document.body.classList.remove('keyboard-navigation');
        });

        console.log('✅ Keyboard navigation detection enabled');
    }

    // Skip links for keyboard navigation
    function initSkipLinks() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Skip to main content';
        skipLink.setAttribute('accesskey', '1');

        // Insert at very beginning of body
        document.body.insertBefore(skipLink, document.body.firstChild);

        // Add ID to main content if not present
        const noteContent = document.querySelector('.note-content');
        if (noteContent && !noteContent.id) {
            noteContent.id = 'main-content';
            noteContent.setAttribute('role', 'main');
            noteContent.setAttribute('aria-label', 'Main content');
        }

        console.log('✅ Skip links added');
    }

    // ARIA live regions for dynamic content
    function initAriaLiveRegions() {
        const liveRegion = document.createElement('div');
        liveRegion.className = 'aria-live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.id = 'aria-live-region';

        document.body.appendChild(liveRegion);

        // Announce function for screen readers
        window.announceToScreenReader = function (message) {
            const liveRegion = document.getElementById('aria-live-region');
            if (liveRegion) {
                liveRegion.textContent = message;

                // Clear after announcement
                setTimeout(function () {
                    liveRegion.textContent = '';
                }, 1000);
            }
        };

        console.log('✅ ARIA live regions initialized');
    }

    // Focus management for modals and interactive elements
    function initFocusManagement() {
        // Track the element that had focus before opening modal
        let lastFocusedElement = null;

        // When quiz feedback appears, announce to screen reader
        document.addEventListener('click', function (e) {
            if (e.target.classList.contains('submit-quiz-btn')) {
                setTimeout(function () {
                    const feedback = document.querySelector('.quiz-feedback');
                    if (feedback) {
                        const isCorrect = feedback.classList.contains('correct');
                        const message = isCorrect ? 'Correct answer!' : 'Incorrect answer.';
                        window.announceToScreenReader(message);

                        // Move focus to feedback for keyboard users
                        feedback.setAttribute('tabindex', '-1');
                        feedback.focus();
                    }
                }, 100);
            }
        });

        // When collapsible section opens, announce
        document.addEventListener('toggle', function (e) {
            if (e.target.matches('details.collapsible-section')) {
                const isOpen = e.target.hasAttribute('open');
                if (isOpen) {
                    const title = e.target.querySelector('summary h2, summary h3');
                    if (title) {
                        window.announceToScreenReader(`Section expanded: ${title.textContent}`);
                    }
                }
            }
        });

        // Ensure first interactive element in quiz is focusable
        const quizOptions = document.querySelectorAll('.quiz-option-card');
        quizOptions.forEach(function (option) {
            option.setAttribute('tabindex', '0');

            // Allow keyboard selection
            option.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const radio = option.querySelector('input[type="radio"]');
                    if (radio) {
                        radio.checked = true;
                        radio.dispatchEvent(new Event('change', { bubbles: true }));
                        window.announceToScreenReader(`Selected option: ${option.textContent.trim()}`);
                    }
                }
            });
        });

        console.log('✅ Focus management initialized');
    }

    // Keyboard shortcuts
    function initKeyboardShortcuts() {
        const shortcuts = {
            'Alt+E': 'Toggle exam mode',
            'Alt+T': 'Toggle theme',
            'Alt+P': 'Print page',
            'Alt+K': 'Show keyboard shortcuts',
            '/': 'Search (if available)',
            'Escape': 'Close modals'
        };

        // Create keyboard shortcuts help
        const helpPanel = document.createElement('div');
        helpPanel.className = 'keyboard-shortcuts-help';
        helpPanel.id = 'keyboard-shortcuts-help';
        helpPanel.setAttribute('role', 'dialog');
        helpPanel.setAttribute('aria-label', 'Keyboard shortcuts');

        let helpHTML = '<h3>⌨️ Keyboard Shortcuts</h3><dl>';
        Object.entries(shortcuts).forEach(function ([key, description]) {
            helpHTML += `<dt><kbd>${key}</kbd></dt><dd>${description}</dd>`;
        });
        helpHTML += '</dl>';

        helpPanel.innerHTML = helpHTML;
        document.body.appendChild(helpPanel);

        // Keyboard shortcut handler
        document.addEventListener('keydown', function (e) {
            // Alt+E: Toggle exam mode (already implemented)
            // Alt+T: Toggle theme
            if (e.altKey && e.key.toLowerCase() === 't') {
                e.preventDefault();
                const themeToggle = document.getElementById('themeToggle');
                if (themeToggle) {
                    themeToggle.click();
                    window.announceToScreenReader('Theme toggled');
                }
            }

            // Alt+P: Print
            if (e.altKey && e.key.toLowerCase() === 'p') {
                e.preventDefault();
                window.print();
                window.announceToScreenReader('Opening print dialog');
            }

            // Alt+K: Show keyboard shortcuts
            if (e.altKey && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                const help = document.getElementById('keyboard-shortcuts-help');
                if (help) {
                    help.classList.toggle('visible');
                    if (help.classList.contains('visible')) {
                        help.focus();
                        window.announceToScreenReader('Keyboard shortcuts help opened');
                    } else {
                        window.announceToScreenReader('Keyboard shortcuts help closed');
                    }
                }
            }

            // Escape: Close modals/help
            if (e.key === 'Escape') {
                const help = document.getElementById('keyboard-shortcuts-help');
                if (help && help.classList.contains('visible')) {
                    help.classList.remove('visible');
                    window.announceToScreenReader('Keyboard shortcuts help closed');
                }
            }
        });

        console.log('✅ Keyboard shortcuts initialized');
        console.log('💡 Press Alt+K to see all keyboard shortcuts');
    }

    // Add accessibility attributes to existing elements
    function enhanceExistingElements() {
        // Add ARIA labels to buttons without them
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle && !themeToggle.getAttribute('aria-label')) {
            themeToggle.setAttribute('aria-label', 'Toggle theme between light, dark, and comfort modes');
        }

        const examToggle = document.getElementById('examModeToggle');
        if (examToggle && !examToggle.getAttribute('aria-label')) {
            examToggle.setAttribute('aria-label', 'Toggle exam study mode: none, highlight, or test');
        }

        const printButton = document.querySelector('.print-button');
        if (printButton && !printButton.getAttribute('aria-label')) {
            printButton.setAttribute('aria-label', 'Print or save this page as PDF');
        }

        // Add landmarks
        const noteContainer = document.querySelector('.note-container');
        if (noteContainer) {
            noteContainer.setAttribute('role', 'article');
            noteContainer.setAttribute('aria-label', 'AWS training notes');
        }

        const footer = document.querySelector('.content-footer');
        if (footer) {
            footer.setAttribute('role', 'contentinfo');
            footer.setAttribute('aria-label', 'Page footer with copyright and license information');
        }

        const breadcrumb = document.querySelector('.breadcrumb');
        if (breadcrumb) {
            breadcrumb.setAttribute('role', 'navigation');
            breadcrumb.setAttribute('aria-label', 'Breadcrumb navigation');
        }

        // Add aria-expanded to collapsible sections
        const collapsibleSections = document.querySelectorAll('.collapsible-section');
        collapsibleSections.forEach(function (section) {
            const summary = section.querySelector('summary');
            if (summary) {
                summary.setAttribute('aria-expanded', section.hasAttribute('open'));

                section.addEventListener('toggle', function () {
                    summary.setAttribute('aria-expanded', section.hasAttribute('open'));
                });
            }
        });

        console.log('✅ Enhanced existing elements with accessibility attributes');
    }


    function injectGoogleAnalytics() {
        // Create async script tag
        const gaScript = document.createElement('script');
        gaScript.async = true;
        gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-4JFX5WTGFN';
        document.head.appendChild(gaScript);

        // Create inline script
        const gaInline = document.createElement('script');
        gaInline.textContent = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-4JFX5WTGFN');
        `;
        document.head.appendChild(gaInline);

        console.log('✅ Google Analytics injected');
    }

    function loadConditionalScripts() {
        // Check if complete notes by class or presence of interactive elements
        const isCompleteNotes = document.body.classList.contains('complete-notes') ||
            document.querySelector('[data-mcq-source]') !== null ||
            document.querySelector('[data-checklist-source]') !== null ||
            document.querySelector('[data-glossary-source]') !== null ||
            document.querySelector('[data-interview-source]') !== null;

        // Always load touch and search scripts (work for both overview and complete)
        const universalScripts = [
            '../../../js/notes-touch.js',
            '../../../js/notes-search.js'
        ];

        universalScripts.forEach(src => {
            const script = document.createElement('script');
            script.src = src;
            script.defer = true;
            script.onload = function () {
                console.log(`✅ Loaded: ${src.split('/').pop()}`);
            };
            script.onerror = function () {
                console.warn(`⚠️ Failed to load: ${src}`);
            };
            document.body.appendChild(script);
        });

        if (!isCompleteNotes) {
            console.log('ℹ️ Overview notes - Skipping MCQ/Checklist/Glossary/Interview scripts');
            console.log('✅ Loaded universal scripts: touch gestures, search');
            return;
        }

        // Load interactive scripts for complete notes only
        const interactiveScripts = [
            '../../../js/notes-mcq.js',
            '../../../js/notes-checklist.js',
            '../../../js/notes-glossary.js',
            '../../../js/notes-interview.js'
        ];

        let loadedCount = 0;
        interactiveScripts.forEach(src => {
            const script = document.createElement('script');
            script.src = src;
            script.defer = true;
            script.onload = function () {
                loadedCount++;
                if (loadedCount === interactiveScripts.length) {
                    console.log('✅ All interactive scripts loaded');
                }
            };
            script.onerror = function () {
                console.warn(`⚠️ Failed to load: ${src}`);
            };
            document.body.appendChild(script);
        });

        console.log('📚 Loading all scripts for Complete notes...');
    }



    // ============================================
    // EXAM HIGHLIGHT MODE (3 MODES, 2 TYPES)
    // ============================================

    function initExamMode() {
        const examToggle = document.getElementById('examModeToggle');
        if (!examToggle) {
            console.log('ℹ️ No exam mode toggle found on this page');
            return;
        }

        // Count both types of highlights on page
        const sentenceHighlights = document.querySelectorAll('.exam-highlight-sentence').length;
        const termHighlights = document.querySelectorAll('.exam-highlight-term').length;
        const totalHighlights = sentenceHighlights + termHighlights;

        console.log(`📚 Found ${totalHighlights} exam highlights on this page:`);
        console.log(`   - ${sentenceHighlights} sentence highlights (full context)`);
        console.log(`   - ${termHighlights} term highlights (fill-in-blank)`);

        // Load saved exam mode from localStorage
        const savedMode = localStorage.getItem('examMode') || 'none';
        setExamMode(savedMode);

        // Toggle through modes: none → highlight → test → none
        examToggle.addEventListener('click', function () {
            const currentMode = document.body.className.match(/exam-mode-(\w+)/)?.[1] || 'none';
            let nextMode;

            if (currentMode === 'none') {
                nextMode = 'highlight';
            } else if (currentMode === 'highlight') {
                nextMode = 'test';
            } else {
                nextMode = 'none';
            }

            setExamMode(nextMode);
            localStorage.setItem('examMode', nextMode);

            console.log(`🔄 Exam mode changed: ${currentMode} → ${nextMode}`);
        });

        // Keyboard shortcut: Alt + E to toggle modes
        document.addEventListener('keydown', function (e) {
            if (e.altKey && e.key.toLowerCase() === 'e') {
                e.preventDefault();
                examToggle.click();
            }
        });

        console.log(`📚 Exam mode initialized: ${savedMode} (Press Alt+E to toggle)`);
    }

    function setExamMode(mode) {
        const body = document.body;
        const modeText = document.querySelector('.exam-mode-text');
        const modeIcon = document.querySelector('.exam-icon');

        // Remove all exam mode classes
        body.classList.remove('exam-mode-none', 'exam-mode-highlight', 'exam-mode-test');

        // Add new mode class
        body.classList.add(`exam-mode-${mode}`);

        // Update button text and icon
        if (modeText) {
            const modeNames = {
                'none': 'None',
                'highlight': 'Highlight',
                'test': 'Test'
            };
            modeText.textContent = modeNames[mode] || 'None';
        }

        if (modeIcon) {
            const modeIcons = {
                'none': '📚',      // Normal reading
                'highlight': '📝', // Show all highlights
                'test': '🎯'       // Fill-in-blank mode
            };
            modeIcon.textContent = modeIcons[mode] || '📚';
        }

        // Update button title for accessibility
        const examToggle = document.getElementById('examModeToggle');
        if (examToggle) {
            const modeTitles = {
                'none': 'Exam Study Mode: None - Normal reading (Click to show highlights)',
                'highlight': 'Exam Study Mode: Highlight - See all exam content (Click for test mode)',
                'test': 'Exam Study Mode: Test - Fill-in-blank practice (Click to reset)'
            };
            examToggle.setAttribute('title', modeTitles[mode]);
            examToggle.setAttribute('aria-label', modeTitles[mode]);
        }

        // Log mode details
        logModeDetails(mode);
    }

    function logModeDetails(mode) {
        const sentenceHighlights = document.querySelectorAll('.exam-highlight-sentence').length;
        const termHighlights = document.querySelectorAll('.exam-highlight-term').length;

        const modeDescriptions = {
            'none': 'Normal reading mode - No highlights visible',
            'highlight': `Showing ${sentenceHighlights} sentence highlights + ${termHighlights} term highlights in yellow`,
            'test': `Fill-in-blank mode - ${sentenceHighlights} sentences visible (context), ${termHighlights} terms hidden (hover to reveal)`
        };

        console.log(`📖 ${modeDescriptions[mode]}`);
    }

    // ============================================
    // CODE BLOCK COPY FUNCTIONALITY
    // ============================================

    function initCodeBlocks() {
        addCopyButtonsToCodeBlocks();
    }

    function addCopyButtonsToCodeBlocks() {
        const codeBlocks = document.querySelectorAll('pre code');

        codeBlocks.forEach((codeBlock, index) => {
            const pre = codeBlock.parentElement;

            // Skip if button already exists
            if (pre.querySelector('.copy-code-btn')) {
                return;
            }

            const copyButton = document.createElement('button');
            copyButton.className = 'copy-code-btn';
            copyButton.setAttribute('aria-label', 'Copy code to clipboard');
            copyButton.setAttribute('data-code-index', index);

            const buttonText = document.createElement('span');
            buttonText.textContent = 'Copy';
            copyButton.appendChild(buttonText);

            copyButton.addEventListener('click', function () {
                copyCodeToClipboard(codeBlock, copyButton, buttonText);
            });

            pre.style.position = 'relative';
            pre.insertBefore(copyButton, pre.firstChild);
        });

        console.log(`📋 Initialized ${codeBlocks.length} code block copy buttons`);
    }

    function copyCodeToClipboard(codeBlock, button, buttonText) {
        const codeText = codeBlock.textContent;

        // Try modern clipboard API first
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(codeText).then(function () {
                showCopySuccess(button, buttonText);
            }).catch(function (err) {
                console.warn('Clipboard API failed, using fallback:', err);
                copyCodeFallback(codeText, button, buttonText);
            });
        } else {
            // Use fallback for older browsers
            copyCodeFallback(codeText, button, buttonText);
        }
    }

    function showCopySuccess(button, buttonText) {
        button.classList.add('copied');
        buttonText.textContent = 'Copied!';

        setTimeout(function () {
            button.classList.remove('copied');
            buttonText.textContent = 'Copy';
        }, 2000);
    }

    function copyCodeFallback(text, button, buttonText) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);

        textarea.select();
        textarea.setSelectionRange(0, 99999); // For mobile devices

        try {
            const successful = document.execCommand('copy');
            if (successful) {
                showCopySuccess(button, buttonText);
            } else {
                showCopyError(button, buttonText);
            }
        } catch (err) {
            console.error('Failed to copy code:', err);
            showCopyError(button, buttonText);
        }

        document.body.removeChild(textarea);
    }

    function showCopyError(button, buttonText) {
        buttonText.textContent = 'Failed';
        button.style.backgroundColor = '#f44336';

        setTimeout(function () {
            buttonText.textContent = 'Copy';
            button.style.backgroundColor = '';
        }, 2000);
    }

    // ============================================
    // PRINT ANSWER KEY FEATURE
    // ============================================

    // ============================================
    // PRINT MODAL SYSTEM
    // ============================================

    function initPrintAnswerKey() {
        // Replaced by print modal — intercept Ctrl+P
        document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                openPrintModal();
            }
        });
        // Also intercept menuPrint if it exists
        const menuPrint = document.getElementById('menuPrint');
        if (menuPrint) {
            menuPrint.removeEventListener('click', window.print);
            menuPrint.addEventListener('click', function() {
                openPrintModal();
                if (typeof closeAllMenus === 'function') closeAllMenus();
            });
        }
    }

    function openPrintModal() {
        // Remove existing modal if any
        const existing = document.getElementById('printModal');
        if (existing) existing.remove();

        // Detect available sections
        const sections = [
            { id: 'noteContent',       label: '📄 Notes / Content',       el: document.querySelector('.note-content') },
            { id: 'quizContainer',     label: '❓ MCQ Quiz',               el: document.getElementById('quizContainer'),
              sub: [
                { id: 'mcqHighlight', label: 'Highlight correct answers' },
                { id: 'mcqExplain',   label: 'Include explanations' }
              ]
            },
            { id: 'checklistContainer',label: '✅ Checklist',              el: document.getElementById('checklistContainer') },
            { id: 'glossaryContainer', label: '📖 Glossary',               el: document.getElementById('glossaryContainer') },
            { id: 'interviewContainer',label: '🎤 Interview Questions',     el: document.getElementById('interviewContainer'),
              sub: [
                { id: 'interviewAnswers', label: 'Include answers' }
              ]
            },
            { id: 'flashcardDeck',     label: '🃏 Flashcards',             el: document.querySelector('.flashcard-deck') },
        ].filter(s => s.el);

        if (sections.length === 0) {
            window.print();
            return;
        }

        // Build modal HTML
        let sectionsHTML = sections.map(s => `
            <label class="pm-section-label">
                <input type="checkbox" class="pm-section-cb" data-section="${s.id}" checked>
                <span>${s.label}</span>
            </label>
            ${s.sub ? s.sub.map(sub => `
                <label class="pm-sub-label" data-parent="${s.id}">
                    <input type="checkbox" class="pm-sub-cb" data-option="${sub.id}" checked>
                    <span>${sub.label}</span>
                </label>
            `).join('') : ''}
        `).join('');

        const modal = document.createElement('div');
        modal.id = 'printModal';
        modal.className = 'print-modal-overlay';
        modal.innerHTML = `
            <div class="print-modal">
                <div class="print-modal-header">
                    <h2>🖨️ Print Options</h2>
                    <button class="print-modal-close" aria-label="Close">✕</button>
                </div>
                <div class="print-modal-body">
                    <p class="pm-hint">Select sections to include in print:</p>
                    <div class="pm-sections">${sectionsHTML}</div>
                </div>
                <div class="print-modal-footer">
                    <button class="pm-cancel-btn">Cancel</button>
                    <button class="pm-print-btn">🖨️ Print</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Sub-checkbox visibility toggle
        modal.querySelectorAll('.pm-section-cb').forEach(cb => {
            const updateSubs = () => {
                modal.querySelectorAll(`.pm-sub-label[data-parent="${cb.dataset.section}"]`)
                    .forEach(sub => sub.style.opacity = cb.checked ? '1' : '0.4');
            };
            cb.addEventListener('change', updateSubs);
            updateSubs();
        });

        // Close handlers
        const closeModal = () => modal.remove();
        modal.querySelector('.print-modal-close').addEventListener('click', closeModal);
        modal.querySelector('.pm-cancel-btn').addEventListener('click', closeModal);
        modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

        // Print handler
        modal.querySelector('.pm-print-btn').addEventListener('click', function() {
            const selected = {};
            modal.querySelectorAll('.pm-section-cb').forEach(cb => {
                selected[cb.dataset.section] = cb.checked;
            });
            const opts = {};
            modal.querySelectorAll('.pm-sub-cb').forEach(cb => {
                opts[cb.dataset.option] = cb.checked;
            });
            closeModal();
            executePrint(selected, opts, sections);
        });
    }

    function executePrint(selected, opts, sections) {
        const hidden = [];

        // Hide unselected sections
        sections.forEach(s => {
            if (!selected[s.id] && s.el) {
                // Hide the closest collapsible-section ancestor or the element itself
                const wrapper = s.el.closest('.collapsible-section') || s.el.closest('details') || s.el;
                wrapper.setAttribute('data-print-hidden', 'true');
                wrapper.style.display = 'none';
                hidden.push(wrapper);
            }
        });

        // MCQ options
        if (selected['quizContainer']) {
            markCorrectAnswers();
            if (opts.mcqHighlight) document.body.classList.add('print-answer-key');
            // Show/hide explanation boxes
            document.querySelectorAll('.explanation-box').forEach(box => {
                const prevDisplay = window.getComputedStyle(box).display;
                box.setAttribute('data-pre-print-display', prevDisplay !== 'none' ? prevDisplay : 'block');
                if (!opts.mcqExplain) box.style.display = 'none';
                else if (prevDisplay === 'none') {/* leave hidden — only show if already visible */}
            });
        }

        // Interview options
        if (selected['interviewContainer']) {
            const answers = document.querySelectorAll('#interviewContainer .answer-side');
            answers.forEach(a => {
                if (!opts.interviewAnswers) {
                    a.setAttribute('data-print-hidden-answer', 'true');
                    a.style.display = 'none';
                }
            });
        }

        // Show all quiz/flashcard slides
        document.querySelectorAll('.quiz-slide, .flashcard-slide').forEach(slide => {
            slide.setAttribute('data-pre-print-active', slide.classList.contains('active') ? 'true' : 'false');
            slide.style.display = 'block';
        });

        // Expand all details
        const openDetailsBefore = [];
        document.querySelectorAll('details').forEach((d, i) => {
            if (d.hasAttribute('open')) openDetailsBefore.push(i);
            d.setAttribute('open', '');
        });

        // Store exam mode & switch to highlight
        const prevMode = document.body.className.match(/exam-mode-(\w+)/)?.[1] || 'none';
        setExamMode('highlight');

        window.print();

        // Restore after print
        const restore = function() {
            // Restore hidden sections
            hidden.forEach(el => {
                el.removeAttribute('data-print-hidden');
                el.style.display = '';
            });

            // Restore MCQ state
            document.body.classList.remove('print-answer-key');
            document.querySelectorAll('.explanation-box, .quiz-feedback').forEach(box => {
                const prev = box.getAttribute('data-pre-print-display');
                if (prev !== null) { box.style.display = prev; box.removeAttribute('data-pre-print-display'); }
            });

            // Restore interview answers
            document.querySelectorAll('[data-print-hidden-answer]').forEach(a => {
                a.style.display = '';
                a.removeAttribute('data-print-hidden-answer');
            });

            // Restore slides
            document.querySelectorAll('.quiz-slide, .flashcard-slide').forEach(slide => {
                const wasActive = slide.getAttribute('data-pre-print-active') === 'true';
                slide.style.display = '';
                slide.classList.toggle('active', wasActive);
                slide.removeAttribute('data-pre-print-active');
            });

            // Restore details
            document.querySelectorAll('details').forEach((d, i) => {
                if (!openDetailsBefore.includes(i)) d.removeAttribute('open');
            });

            // Restore exam mode
            setExamMode(prevMode);

            window.removeEventListener('afterprint', restore);
        };

        window.addEventListener('afterprint', restore);
    }

    // ============================================
    // ENHANCED ACCESSIBILITY LANDMARKS
    // ============================================

    function enhanceAccessibilityLandmarks() {
        try {
            // Add landmarks to major sections
            const sections = [
                { selector: '#quizContainer', role: 'complementary', label: 'Practice quiz' },
                { selector: '#checklistContainer', role: 'complementary', label: 'Learning checklist' },
                { selector: '#glossaryContainer', role: 'complementary', label: 'Glossary' },
                { selector: '#interviewContainer', role: 'complementary', label: 'Interview questions' }
            ];
            
            sections.forEach(function(section) {
                const element = document.querySelector(section.selector);
                if (element) {
                    const details = element.closest('details');
                    if (details) {
                        details.setAttribute('role', section.role);
                        details.setAttribute('aria-label', section.label);
                    }
                }
            });
            
            // Ensure all collapsible sections have aria-expanded
            document.querySelectorAll('details').forEach(function(details) {
                const summary = details.querySelector('summary');
                if (summary) {
                    // Set initial state
                    summary.setAttribute('aria-expanded', details.hasAttribute('open').toString());
                    
                    // Update on toggle
                    details.addEventListener('toggle', function() {
                        summary.setAttribute('aria-expanded', details.hasAttribute('open').toString());
                    });
                }
            });
            
            // Add landmark to main content
            const noteContent = document.querySelector('.note-content');
            if (noteContent && !noteContent.hasAttribute('role')) {
                noteContent.setAttribute('role', 'main');
            }
            
            console.log('✅ Accessibility landmarks enhanced');
        } catch (error) {
            console.error('❌ Error enhancing accessibility:', error);
        }
    }

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================

    // Expose functions to global scope if needed
    window.setExamMode = setExamMode;

    // Log statistics about highlights
    function getHighlightStats() {
        const sentenceHighlights = document.querySelectorAll('.exam-highlight-sentence');
        const termHighlights = document.querySelectorAll('.exam-highlight-term');

        return {
            sentences: sentenceHighlights.length,
            terms: termHighlights.length,
            total: sentenceHighlights.length + termHighlights.length,
            sentenceElements: sentenceHighlights,
            termElements: termHighlights
        };
    }

    // Expose stats function
    window.getExamHighlightStats = getHighlightStats;

    // ============================================
    // FLOATING MENU SYSTEM (Like sample image)
    // ============================================
    
    function injectFABMenus() {
        createBottomLeftMenu();
        createTopRightMenu();
        createMenuOverlay();
        console.log('✅ Menu panels injected');
    }
    
    function createBottomLeftMenu() {
        // Create menu button
        const menuBtn = document.createElement('button');
        menuBtn.className = 'floating-menu-btn';
        menuBtn.id = 'floatingMenuBtn';
        menuBtn.setAttribute('aria-label', 'Settings menu');
        menuBtn.innerHTML = '☰';
        
        // Create menu panel
        const menuPanel = document.createElement('div');
        menuPanel.className = 'floating-menu-panel';
        menuPanel.id = 'floatingMenuPanel';
        
        // Get current exam mode
        const currentExamMode = localStorage.getItem('examMode') || 'none';
        const examModeLabels = {
            'none': 'None (Reading)',
            'highlight': 'Highlight',
            'test': 'Test'
        };
        
        // Get current theme
        const currentTheme = localStorage.getItem('theme') || 'light';
        const themeLabels = {
            'light': 'Light',
            'dark': 'Dark',
            'comfort': 'Comfort'
        };
        
        menuPanel.innerHTML = `
            <h4>Settings</h4>
            <div class="floating-menu-item" id="menuExamMode">
                <span class="floating-menu-item-icon">📚</span>
                <span class="floating-menu-item-text">Exam Mode</span>
                <span class="floating-menu-item-shortcut">${examModeLabels[currentExamMode]}</span>
            </div>
            <div class="floating-menu-item" id="menuTheme">
                <span class="floating-menu-item-icon">🌙</span>
                <span class="floating-menu-item-text">Theme</span>
                <span class="floating-menu-item-shortcut">${themeLabels[currentTheme]}</span>
            </div>
        `;
        
        document.body.appendChild(menuBtn);
        document.body.appendChild(menuPanel);
        
        // Toggle menu
        menuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const isActive = menuPanel.classList.contains('visible');
            closeAllMenus();
            if (!isActive) {
                // Update current states before showing
                updateMenuStates();
                menuPanel.classList.add('visible');
                menuBtn.classList.add('active');
                showMenuOverlay();
            }
        });
        
        // Exam mode click
        document.getElementById('menuExamMode').addEventListener('click', function() {
            const examToggle = document.getElementById('examModeToggle');
            if (examToggle) {
                examToggle.click();
                // Update display after click
                setTimeout(updateMenuStates, 100);
            }
            closeAllMenus();
        });
        
        // Theme click
        document.getElementById('menuTheme').addEventListener('click', function() {
            const themeToggle = document.getElementById('themeToggle');
            if (themeToggle) {
                themeToggle.click();
                // Update display after click
                setTimeout(updateMenuStates, 100);
            }
            closeAllMenus();
        });
        
        // Update menu item states
        function updateMenuStates() {
            const examMode = localStorage.getItem('examMode') || 'none';
            const theme = localStorage.getItem('theme') || 'light';
            
            const examShortcut = document.querySelector('#menuExamMode .floating-menu-item-shortcut');
            const themeShortcut = document.querySelector('#menuTheme .floating-menu-item-shortcut');
            
            if (examShortcut) examShortcut.textContent = examModeLabels[examMode];
            if (themeShortcut) themeShortcut.textContent = themeLabels[theme];
        }
    }
    
    function createTopRightMenu() {
        // Create menu button
        const menuBtn = document.createElement('button');
        menuBtn.className = 'actions-menu-btn';
        menuBtn.id = 'actionsMenuBtn';
        menuBtn.setAttribute('aria-label', 'Tools menu');
        menuBtn.innerHTML = '☰';
        
        // Build menu items
        let menuHTML = '<h4>Tools</h4>';
        
        // Search
        menuHTML += `
            <div class="floating-menu-item" id="menuSearch">
                <span class="floating-menu-item-icon">🔍</span>
                <span class="floating-menu-item-text">Search</span>
                <span class="floating-menu-item-shortcut">/</span>
            </div>
        `;
        
        // Print
        menuHTML += `
            <div class="floating-menu-item" id="menuPrint">
                <span class="floating-menu-item-icon">🖨️</span>
                <span class="floating-menu-item-text">Print</span>
                <span class="floating-menu-item-shortcut">Ctrl+P</span>
            </div>
        `;
        
        // Bookmarks
        menuHTML += `
            <div class="floating-menu-item" id="menuBookmarks">
                <span class="floating-menu-item-icon">📑</span>
                <span class="floating-menu-item-text">Bookmarks</span>
            </div>
        `;
        
        // Export (complete notes only)
        if (document.body.classList.contains('complete-notes')) {
            menuHTML += `
                <div class="floating-menu-item" id="menuExport">
                    <span class="floating-menu-item-icon">📤</span>
                    <span class="floating-menu-item-text">Export Highlights</span>
                </div>
            `;
        }
        
        // Timer toggle
        const timerHidden = localStorage.getItem('timerHidden') === 'true';
        menuHTML += `
            <div class="menu-divider"></div>
            <div class="floating-menu-item" id="menuTimer">
                <span class="floating-menu-item-icon">⏱️</span>
                <span class="floating-menu-item-text">Study Timer</span>
                <span class="floating-menu-item-shortcut">${timerHidden ? 'Show' : 'Hide'}</span>
            </div>
        `;
        
        // Create menu panel
        const menuPanel = document.createElement('div');
        menuPanel.className = 'actions-menu-panel';
        menuPanel.id = 'actionsMenuPanel';
        menuPanel.innerHTML = menuHTML;
        
        document.body.appendChild(menuBtn);
        document.body.appendChild(menuPanel);
        
        // Toggle menu
        menuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const isActive = menuPanel.classList.contains('visible');
            closeAllMenus();
            if (!isActive) {
                // Update timer state before showing
                updateTimerMenuState();
                menuPanel.classList.add('visible');
                menuBtn.classList.add('active');
                showMenuOverlay();
            }
        });
        
        // Search click - FIXED
        document.getElementById('menuSearch').addEventListener('click', function() {
            closeAllMenus();
            
            // Wait for menu to close, then open search
            setTimeout(function() {
                const searchContainer = document.getElementById('search-container');
                if (searchContainer) {
                    searchContainer.classList.add('visible');
                    searchContainer.style.display = 'block'; // Force display
                    const searchInput = document.getElementById('search-input');
                    if (searchInput) {
                        setTimeout(function() {
                            searchInput.focus();
                            searchInput.select();
                        }, 100);
                    }
                } else {
                    console.error('Search container #search-container not found');
                    showNotification('Search not available - notes-search.js not loaded');
                }
            }, 200);
        });
        
        // Print click
        document.getElementById('menuPrint').addEventListener('click', function() {
            closeAllMenus();
            openPrintModal();
        });
        
        // Bookmarks click
        document.getElementById('menuBookmarks').addEventListener('click', function() {
            closeAllMenus();
            
            const bookmarksPanel = document.getElementById('bookmarksPanel');
            if (bookmarksPanel) {
                bookmarksPanel.classList.toggle('visible');
            }
        });
        
        // Export click (if exists)
        const exportBtn = document.getElementById('menuExport');
        if (exportBtn) {
            exportBtn.addEventListener('click', function() {
                exportExamHighlights();
                closeAllMenus();
            });
        }
        
        // Timer toggle click
        document.getElementById('menuTimer').addEventListener('click', function() {
            const timerDisplay = document.getElementById('studyTimerDisplay');
            if (timerDisplay) {
                timerDisplay.classList.toggle('hidden');
                const isHidden = timerDisplay.classList.contains('hidden');
                localStorage.setItem('timerHidden', isHidden.toString());
                showNotification(isHidden ? 'Timer hidden' : 'Timer shown');
                updateTimerMenuState();
            }
            closeAllMenus();
        });
        
        // Update timer menu state
        function updateTimerMenuState() {
            const timerDisplay = document.getElementById('studyTimerDisplay');
            const timerShortcut = document.querySelector('#menuTimer .floating-menu-item-shortcut');
            if (timerShortcut && timerDisplay) {
                const isHidden = timerDisplay.classList.contains('hidden');
                timerShortcut.textContent = isHidden ? 'Show' : 'Hide';
            }
        }
    }
    
    function createMenuOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'menu-overlay';
        overlay.id = 'menuOverlay';
        overlay.addEventListener('click', closeAllMenus);
        document.body.appendChild(overlay);
    }
    
    function showMenuOverlay() {
        document.getElementById('menuOverlay').classList.add('active');
    }
    
    function closeAllMenus() {
        document.querySelectorAll('.floating-menu-panel, .actions-menu-panel').forEach(function(panel) {
            panel.classList.remove('visible');
        });
        document.querySelectorAll('.floating-menu-btn, .actions-menu-btn').forEach(function(btn) {
            btn.classList.remove('active');
        });
        document.getElementById('menuOverlay').classList.remove('active');
    }
    
    function exportExamHighlights() {
        const sentenceHighlights = document.querySelectorAll('.exam-highlight-sentence');
        const termHighlights = document.querySelectorAll('.exam-highlight-term');
        
        let content = '# Exam Highlights\n\n';
        content += `Generated: ${new Date().toLocaleString()}\n`;
        content += `Page: ${document.title}\n\n`;
        
        content += '## Key Sentences\n\n';
        sentenceHighlights.forEach(function(highlight, i) {
            content += `${i + 1}. ${highlight.textContent.trim()}\n\n`;
        });
        
        content += '\n## Key Terms\n\n';
        const terms = Array.from(termHighlights).map(h => h.textContent.trim());
        const uniqueTerms = [...new Set(terms)];
        uniqueTerms.forEach(function(term, i) {
            content += `${i + 1}. ${term}\n`;
        });
        
        // Download
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = document.title.replace(/[^a-z0-9]/gi, '-').toLowerCase() + '-highlights.txt';
        a.click();
        URL.revokeObjectURL(url);
        
        showNotification('Highlights exported!');
    }
    
    // Replace old button functions with stubs
    function injectSearchButton() {
        console.log('ℹ️ Search in top-right menu');
    }
    
    function injectJumpToTopButton() {
        // Keep simple jump to top button
        const topBtn = document.createElement('button');
        topBtn.className = 'jump-to-top-btn';
        topBtn.setAttribute('aria-label', 'Scroll to top');
        topBtn.innerHTML = '⬆️';
        topBtn.className = 'jump-to-top-btn';

        topBtn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        window.addEventListener('scroll', function() {
            topBtn.classList.toggle('visible', window.pageYOffset > 500);
        });
        
        document.body.appendChild(topBtn);
        console.log('✅ Jump to top button injected');
    }

    // ============================================
    // FEATURE #3: SEARCH HISTORY
    // ============================================
    
    function initSearchHistory() {
        const pageId = document.title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
        const historyKey = 'searchHistory-' + pageId;
        
        // Load search history
        window.searchHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
        
        // Add search history to search input
        const searchInput = document.getElementById('search-input');
        if (!searchInput) return;
        
        // Create datalist for autocomplete
        const datalist = document.createElement('datalist');
        datalist.id = 'search-history-list';
        
        window.searchHistory.slice(0, 5).forEach(function(term) {
            const option = document.createElement('option');
            option.value = term;
            datalist.appendChild(option);
        });
        
        searchInput.setAttribute('list', 'search-history-list');
        searchInput.parentElement.appendChild(datalist);
        
        // Save search on successful search
        const originalPerformSearch = window.NotesSearch?.performSearch;
        if (originalPerformSearch) {
            window.NotesSearch.performSearch = function(query) {
                originalPerformSearch.call(this, query);
                
                if (query && query.length >= 2) {
                    // Add to history
                    window.searchHistory = window.searchHistory.filter(h => h !== query);
                    window.searchHistory.unshift(query);
                    window.searchHistory = window.searchHistory.slice(0, 10); // Keep last 10
                    localStorage.setItem(historyKey, JSON.stringify(window.searchHistory));
                    
                    // Update datalist
                    updateSearchHistoryDatalist();
                }
            };
        }
        
        function updateSearchHistoryDatalist() {
            const datalist = document.getElementById('search-history-list');
            if (!datalist) return;
            
            datalist.innerHTML = '';
            window.searchHistory.slice(0, 5).forEach(function(term) {
                const option = document.createElement('option');
                option.value = term;
                datalist.appendChild(option);
            });
        }
        
        console.log('✅ Search history initialized');
    }

    // ============================================
    // FEATURE #4: ESTIMATED READING TIME
    // ============================================
    
    function injectReadingTimeBadge() {
        const noteContent = document.querySelector('.note-content');
        if (!noteContent) return;
        
        // Calculate reading time (200 words per minute)
        const text = noteContent.innerText;
        const words = text.trim().split(/\s+/).length;
        const minutes = Math.ceil(words / 200);
        
        const badge = document.createElement('div');
        badge.className = 'reading-time-badge';
        badge.innerHTML = `<span class="reading-time-icon">📖</span> <span class="reading-time-text">${minutes} min read</span>`;
        
        const header = document.querySelector('.note-header');
        if (header) {
            header.appendChild(badge);
        }
        
        console.log(`✅ Reading time badge injected (${minutes} minutes)`);
    }

    // ============================================
    // FEATURE #5: READING PROGRESS BAR
    // ============================================
    
    function injectReadingProgressBar() {
        const progressBar = document.createElement('div');
        progressBar.className = 'reading-progress-bar';
        progressBar.id = 'readingProgressBar';
        
        const progressFill = document.createElement('div');
        progressFill.className = 'reading-progress-fill';
        progressBar.appendChild(progressFill);
        
        document.body.insertBefore(progressBar, document.body.firstChild);
        
        // Update progress on scroll
        function updateProgress() {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100;
            const clampedPercentage = Math.min(100, Math.max(0, scrollPercentage));
            
            progressFill.style.width = clampedPercentage + '%';
        }
        
        window.addEventListener('scroll', updateProgress);
        window.addEventListener('resize', updateProgress);
        
        // Initial update
        updateProgress();
        
        console.log('✅ Reading progress bar injected');
    }

    // ============================================
    // FEATURE #6: TABLE OF CONTENTS HIGHLIGHT
    // ============================================
    
    function initTableOfContentsHighlight() {
        const tocLinks = document.querySelectorAll('a[href^="#"]');
        if (tocLinks.length === 0) return;
        
        const sections = document.querySelectorAll('h2[id], h3[id]');
        if (sections.length === 0) return;
        
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -70% 0px',
            threshold: 0
        };
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    
                    // Remove active class from all links
                    tocLinks.forEach(function(link) {
                        link.classList.remove('toc-active');
                    });
                    
                    // Add active class to matching link
                    const activeLink = document.querySelector(`a[href="#${id}"]`);
                    if (activeLink) {
                        activeLink.classList.add('toc-active');
                    }
                }
            });
        }, observerOptions);
        
        sections.forEach(function(section) {
            observer.observe(section);
        });
        
        console.log('✅ Table of contents highlighting initialized');
    }

    // ============================================
    // FEATURE #7: COPY CODE TOOLTIP
    // ============================================
    
    function enhanceCopyCodeButtons() {
        const copyButtons = document.querySelectorAll('.copy-code-btn');
        
        copyButtons.forEach(function(button) {
            const originalClickHandler = button.onclick;
            
            button.addEventListener('click', function(e) {
                // Show tooltip
                showCopyTooltip(button);
                
                // Trigger haptic feedback if available
                if ('vibrate' in navigator) {
                    navigator.vibrate(10);
                }
            });
        });
        
        function showCopyTooltip(button) {
            const tooltip = document.createElement('div');
            tooltip.className = 'copy-tooltip';
            tooltip.textContent = 'Copied! ✓';
            
            // Position relative to button
            const rect = button.getBoundingClientRect();
            tooltip.style.position = 'fixed';
            tooltip.style.top = (rect.top - 40) + 'px';
            tooltip.style.left = (rect.left + rect.width / 2) + 'px';
            tooltip.style.transform = 'translateX(-50%)';
            
            document.body.appendChild(tooltip);
            
            // Animate in
            setTimeout(() => tooltip.classList.add('visible'), 10);
            
            // Remove after 2 seconds
            setTimeout(() => {
                tooltip.classList.remove('visible');
                setTimeout(() => tooltip.remove(), 300);
            }, 2000);
        }
        
        console.log('✅ Copy code tooltips enhanced');
    }

    // ============================================
    // FEATURE #8: DARK MODE AUTO-DETECT
    // ============================================
    
    function initDarkModeAutoDetect() {
        // Only auto-detect on first visit
        if (localStorage.getItem('theme')) {
            console.log('ℹ️ User has theme preference, skipping auto-detect');
            return;
        }
        
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
        
        if (prefersDark) {
            setTheme('dark');
            localStorage.setItem('theme', 'dark');
            console.log('✅ Auto-detected dark mode preference');
        } else if (prefersLight) {
            setTheme('light');
            localStorage.setItem('theme', 'light');
            console.log('✅ Auto-detected light mode preference');
        }
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
            if (!localStorage.getItem('userSetTheme')) {
                setTheme(e.matches ? 'dark' : 'light');
                showNotification('Theme updated to match system preference');
            }
        });
    }

    // ============================================
    // FEATURE #9: SEARCH FILTERS
    // ============================================
    
    function injectSearchFilters() {
        const searchBox = document.querySelector('.search-box');
        if (!searchBox) return;
        
        const filterContainer = document.createElement('div');
        filterContainer.className = 'search-filter-container';
        filterContainer.innerHTML = `
            <select id="search-filter" aria-label="Filter search results">
                <option value="all">All content</option>
                <option value="exam">Exam highlights</option>
                <option value="code">Code examples</option>
                <option value="headings">Headings only</option>
            </select>
        `;
        
        searchBox.appendChild(filterContainer);
        
        const filter = document.getElementById('search-filter');
        filter.addEventListener('change', function() {
            // Re-run current search with filter
            const searchInput = document.getElementById('search-input');
            if (searchInput && searchInput.value) {
                if (typeof window.NotesSearch !== 'undefined') {
                    window.NotesSearch.performSearch(searchInput.value);
                }
            }
        });
        
        // Store filter preference
        const savedFilter = localStorage.getItem('searchFilter') || 'all';
        filter.value = savedFilter;
        
        filter.addEventListener('change', function() {
            localStorage.setItem('searchFilter', this.value);
        });
        
        console.log('✅ Search filters injected');
    }

    // ============================================
    // FEATURE #10: HIGHLIGHT PERSISTENCE
    // ============================================
    
    function initHighlightPersistence() {
        // Already implemented in exam mode, just add visual feedback
        const examToggle = document.getElementById('examModeToggle');
        if (!examToggle) return;
        
        examToggle.addEventListener('click', function() {
            setTimeout(() => {
                const currentMode = document.body.className.match(/exam-mode-(\w+)/)?.[1] || 'none';
                showNotification(`Exam mode: ${currentMode.toUpperCase()} (saved)`);
            }, 100);
        });
        
        console.log('✅ Highlight persistence notifications enabled');
    }

    // ============================================
    // FEATURE #11: LOADING SKELETONS
    // ============================================
    
    function injectLoadingSkeletons() {
        // Add skeletons for quiz, checklist, glossary, interview
        const containers = [
            { id: 'quizContainer', lines: 4 },
            { id: 'checklistContainer', lines: 6 },
            { id: 'glossaryContainer', lines: 5 },
            { id: 'interviewContainer', lines: 3 }
        ];
        
        containers.forEach(function(container) {
            const element = document.getElementById(container.id);
            if (!element) return;
            
            // Create skeleton
            const skeleton = document.createElement('div');
            skeleton.className = 'skeleton-loader';
            
            for (let i = 0; i < container.lines; i++) {
                const line = document.createElement('div');
                line.className = 'skeleton-line';
                if (i === container.lines - 1) {
                    line.classList.add('short');
                }
                skeleton.appendChild(line);
            }
            
            // Show skeleton while loading
            element.appendChild(skeleton);
            
            // Remove skeleton after content loads
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.addedNodes.length > 0) {
                        // Content loaded, remove skeleton
                        skeleton.remove();
                        observer.disconnect();
                    }
                });
            });
            
            observer.observe(element, { childList: true });
        });
        
        console.log('✅ Loading skeletons injected');
    }

    // ============================================
    // FEATURE #12: ENHANCED KEYBOARD SHORTCUTS PANEL
    // ============================================
    
    function enhanceKeyboardShortcutsPanel() {
        const helpPanel = document.getElementById('keyboard-shortcuts-help');
        if (!helpPanel) return;
        
        // Enhance the existing panel with better styling
        helpPanel.classList.add('enhanced-shortcuts-panel');
        
        // Add category headers
        const dl = helpPanel.querySelector('dl');
        if (dl) {
            const shortcuts = {
                'Navigation': [
                    { key: '/', desc: 'Open search' },
                    { key: 'Enter', desc: 'Next search result' },
                    { key: 'Shift+Enter', desc: 'Previous search result' },
                    { key: 'Esc', desc: 'Close search/modals' }
                ],
                'Study Modes': [
                    { key: 'Alt+E', desc: 'Toggle exam mode' },
                    { key: 'Alt+T', desc: 'Toggle theme' }
                ],
                'Actions': [
                    { key: 'Alt+P', desc: 'Print page' },
                    { key: 'Alt+K', desc: 'Show shortcuts' }
                ]
            };
            
            let newHTML = '<div class="shortcuts-grid">';
            
            Object.keys(shortcuts).forEach(function(category) {
                newHTML += `<div class="shortcut-category"><h4>${category}</h4>`;
                shortcuts[category].forEach(function(shortcut) {
                    newHTML += `
                        <div class="shortcut-item">
                            <kbd>${shortcut.key}</kbd>
                            <span>${shortcut.desc}</span>
                        </div>
                    `;
                });
                newHTML += '</div>';
            });
            
            newHTML += '</div>';
            
            helpPanel.innerHTML = '<h3>⌨️ Keyboard Shortcuts</h3>' + newHTML;
        }
        
        console.log('✅ Keyboard shortcuts panel enhanced');
    }

    // ============================================
    // FEATURE #13: SMOOTH TRANSITIONS
    // ============================================
    
    function initSmoothTransitions() {
        // Add smooth transition class to body
        document.body.classList.add('smooth-transitions');
        
        // Smooth scroll for all anchor links
        document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Update URL without jumping
                    history.pushState(null, null, href);
                }
            });
        });
        
        console.log('✅ Smooth transitions initialized');
    }

    // ============================================
    // FEATURE #14: BOOKMARK SYSTEM
    // ============================================
    
    function initBookmarkSystem() {
        const pageId = window.location.pathname;
        const bookmarksKey = 'bookmarks-' + pageId.replace(/[^a-z0-9]/gi, '-');
        
        // Load bookmarks
        let bookmarks = JSON.parse(localStorage.getItem(bookmarksKey) || '[]');
        
        // Add bookmark buttons to section headers
        const headers = document.querySelectorAll('.note-content h2[id], .note-content h3[id]');
        
        headers.forEach(function(header) {
            const id = header.getAttribute('id');
            const isBookmarked = bookmarks.includes(id);
            
            const bookmarkBtn = document.createElement('button');
            bookmarkBtn.className = 'bookmark-btn' + (isBookmarked ? ' bookmarked' : '');
            bookmarkBtn.setAttribute('aria-label', 'Bookmark this section');
            bookmarkBtn.setAttribute('title', isBookmarked ? 'Remove bookmark' : 'Bookmark this section');
            bookmarkBtn.innerHTML = isBookmarked ? '⭐' : '☆';
            
            bookmarkBtn.addEventListener('click', function(e) {
                e.preventDefault();
                toggleBookmark(id, bookmarkBtn);
            });
            
            header.appendChild(bookmarkBtn);
        });
        
        function toggleBookmark(id, button) {
            if (bookmarks.includes(id)) {
                // Remove bookmark
                bookmarks = bookmarks.filter(b => b !== id);
                button.classList.remove('bookmarked');
                button.innerHTML = '☆';
                button.setAttribute('title', 'Bookmark this section');
                showNotification('Bookmark removed');
            } else {
                // Add bookmark
                bookmarks.push(id);
                button.classList.add('bookmarked');
                button.innerHTML = '⭐';
                button.setAttribute('title', 'Remove bookmark');
                showNotification('Bookmark added');
            }
            
            localStorage.setItem(bookmarksKey, JSON.stringify(bookmarks));
            
            // Update or create bookmarks panel
            updateBookmarksPanel();
        }
        
        // Always create bookmarks panel (even if empty)
        injectBookmarksPanel();
        
        function injectBookmarksPanel() {
            // Remove existing panel if any
            const existingPanel = document.getElementById('bookmarksPanel');
            if (existingPanel) {
                existingPanel.remove();
            }
            
            const panel = document.createElement('div');
            panel.className = 'bookmarks-panel';
            panel.id = 'bookmarksPanel';
            panel.innerHTML = `
                <h3>📑 Your Bookmarks</h3>
                <ul class="bookmarks-list"></ul>
                <button class="close-bookmarks-btn" onclick="document.getElementById('bookmarksPanel').classList.remove('visible')">Close</button>
            `;
            
            document.body.appendChild(panel);
            updateBookmarksPanel();
        }
        
        function updateBookmarksPanel() {
            const panel = document.getElementById('bookmarksPanel');
            if (!panel) return;
            
            const list = panel.querySelector('.bookmarks-list');
            list.innerHTML = '';
            
            if (bookmarks.length === 0) {
                list.innerHTML = '<li style="color: var(--text-secondary); font-style: italic;">No bookmarks yet. Click ⭐ on any heading.</li>';
                return;
            }
            
            bookmarks.forEach(function(id) {
                const header = document.getElementById(id);
                if (!header) return;
                
                const li = document.createElement('li');
                const link = document.createElement('a');
                link.href = '#' + id;
                link.textContent = header.textContent.replace(/[⭐☆]/, '').trim();
                link.addEventListener('click', function() {
                    panel.classList.remove('visible');
                });
                
                li.appendChild(link);
                list.appendChild(li);
            });
        }
        
        console.log(`✅ Bookmark system initialized (${bookmarks.length} bookmarks)`);
    }

    // ============================================
    // FEATURE #16: STUDY TIMER
    // ============================================
    
    function initStudyTimer() {
        const pageId = window.location.pathname.replace(/[^a-z0-9]/gi, '-');
        const timerKey = 'studyTime-' + pageId;
        const sessionKey = 'studySession-' + pageId;
        
        const startTime = Date.now();
        const storedTotal = parseInt(localStorage.getItem(timerKey) || '0');
        
        // Create timer display with close and reset buttons
        const timerDisplay = document.createElement('div');
        timerDisplay.className = 'study-timer-display';
        timerDisplay.id = 'studyTimerDisplay';
        
        // Check if timer should be hidden (from localStorage)
        let timerHidden = localStorage.getItem('timerHidden') === 'true';
        
        // Auto-hide on mobile devices
        const isMobile = window.innerWidth <= 768;
        if (isMobile && localStorage.getItem('timerHidden') === null) {
            // First time on mobile - auto-hide
            timerHidden = true;
            localStorage.setItem('timerHidden', 'true');
        }
        
        if (timerHidden) {
            timerDisplay.classList.add('hidden');
        }
        
        timerDisplay.innerHTML = `
            <button class="timer-close-btn" id="timerCloseBtn" title="Hide timer">×</button>
            <div class="timer-icon">⏱️</div>
            <div class="timer-text">
                <div class="timer-session">Session: <span id="sessionTime">0s</span></div>
                <div class="timer-total">Total: <span id="totalTime">${formatTime(storedTotal)}</span></div>
            </div>
            <div class="timer-actions">
                <button class="timer-reset-btn" id="timerResetBtn" title="Reset total time">Reset</button>
                <div class="timer-hint">💡 Alt+Shift+T or Menu → Tools → Timer</div>
            </div>
        `;
        
        document.body.appendChild(timerDisplay);
        
        // Close button
        document.getElementById('timerCloseBtn').addEventListener('click', function() {
            timerDisplay.classList.add('hidden');
            localStorage.setItem('timerHidden', 'true');
            showNotification('Timer hidden. Use Menu → Tools → Timer to show.');
        });
        
        // Keyboard shortcut to toggle timer (Alt+Shift+T)
        document.addEventListener('keydown', function(e) {
            if (e.altKey && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                timerDisplay.classList.toggle('hidden');
                const isHidden = timerDisplay.classList.contains('hidden');
                localStorage.setItem('timerHidden', isHidden.toString());
                showNotification(isHidden ? 'Timer hidden' : 'Timer shown');
            }
        });
        
        
        // Update every 10 seconds
        const updateInterval = setInterval(updateTimer, 10000);
        
        // Initial update after 1 second
        setTimeout(updateTimer, 1000);
        
        // Reset button
        document.getElementById('timerResetBtn').addEventListener('click', function() {
            if (confirm('Reset total study time for this page?')) {
                localStorage.removeItem(timerKey);
                localStorage.removeItem(sessionKey);
                document.getElementById('totalTime').textContent = '0m';
                showNotification('Study timer reset');
            }
        });
        
        // Save on page unload
        window.addEventListener('beforeunload', saveStudyTime);
        
        // Save every 2 minutes
        const saveInterval = setInterval(saveStudyTime, 120000);
        
        function updateTimer() {
            const sessionTime = Date.now() - startTime;
            const sessionMinutes = Math.floor(sessionTime / 60000);
            const sessionSeconds = Math.floor((sessionTime % 60000) / 1000);
            
            // Show session time
            if (sessionMinutes > 0) {
                document.getElementById('sessionTime').textContent = sessionMinutes + 'm';
            } else {
                document.getElementById('sessionTime').textContent = sessionSeconds + 's';
            }
            
            // Update total display
            const currentTotal = storedTotal + sessionTime;
            document.getElementById('totalTime').textContent = formatTime(currentTotal);
        }
        
        function saveStudyTime() {
            const sessionTime = Date.now() - startTime;
            const newTotal = storedTotal + sessionTime;
            localStorage.setItem(timerKey, newTotal.toString());
            localStorage.setItem(sessionKey, Date.now().toString());
        }
        
        function formatTime(ms) {
            const totalMinutes = Math.floor(ms / 60000);
            
            if (totalMinutes === 0) return '0m';
            if (totalMinutes < 60) return totalMinutes + 'm';
            
            const hours = Math.floor(totalMinutes / 60);
            const mins = totalMinutes % 60;
            
            if (hours < 24) {
                return hours + 'h ' + (mins > 0 ? mins + 'm' : '');
            } else {
                const days = Math.floor(hours / 24);
                const remainingHours = hours % 24;
                return days + 'd ' + (remainingHours > 0 ? remainingHours + 'h' : '');
            }
        }
        
        console.log('✅ Study timer initialized');
        
        // Cleanup on page unload
        window.addEventListener('beforeunload', function() {
            clearInterval(updateInterval);
            clearInterval(saveInterval);
        });
    }

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    
    // Single reusable toast element
    const _toastEl = (function() {
        const el = document.createElement('div');
        el.className = 'toast-notification';
        document.addEventListener('DOMContentLoaded', () => document.body.appendChild(el));
        return el;
    })();
    let _toastTimer = null;

    function showNotification(message) {
        _toastEl.textContent = message;
        _toastEl.classList.add('visible');

        clearTimeout(_toastTimer);
        _toastTimer = setTimeout(() => {
            _toastEl.classList.remove('visible');
        }, 3000);
    }

    // Expose functions to global scope if needed
    window.setExamMode = setExamMode;

    // Log statistics about highlights
    function getHighlightStats() {
        const sentenceHighlights = document.querySelectorAll('.exam-highlight-sentence');
        const termHighlights = document.querySelectorAll('.exam-highlight-term');

        return {
            sentences: sentenceHighlights.length,
            terms: termHighlights.length,
            total: sentenceHighlights.length + termHighlights.length,
            sentenceElements: sentenceHighlights,
            termElements: termHighlights
        };
    }

    // Expose stats function
    window.getExamHighlightStats = getHighlightStats;

    console.log('🚀 Notes template v5.2 loaded successfully');
    console.log('💡 Tip: Use Alt+E to cycle through exam modes');
    console.log('💡 Tip: Press / (slash) to search notes');
    console.log('✨ All 16 enhancement features active');

})();