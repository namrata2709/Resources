/**
 * Theme Manager
 * Universal theme toggle for all pages
 * Usage: Include this script on every page with theme toggle
 */

(function() {
    'use strict';

    // Initialize theme on page load
    function initTheme() {
        const themeToggle = document.getElementById('themeToggle');
        const html = document.documentElement;

        // Load saved theme or default to light
        const currentTheme = localStorage.getItem('theme') || 'light';
        html.setAttribute('data-theme', currentTheme);

        // Add click event listener if toggle button exists
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }
    }

    // Toggle between light and dark theme
    function toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTheme);
    } else {
        initTheme();
    }
})();