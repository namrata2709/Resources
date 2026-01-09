/**
 * Theme Manager
 * Universal theme toggle for all pages with 3 modes
 * Modes: light (day) → dark (night) → comfort (eye comfort)
 * Usage: Include this script on every page with theme toggle
 */

(function() {
    'use strict';

    // Theme cycle order
    const THEMES = ['light', 'dark', 'comfort'];

    // Initialize theme on page load
    function initTheme() {
        const themeToggle = document.getElementById('themeToggle');
        const html = document.documentElement;

        // Load saved theme or default to light
        const currentTheme = localStorage.getItem('theme') || 'light';
        
        // Validate theme
        if (!THEMES.includes(currentTheme)) {
            html.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        } else {
            html.setAttribute('data-theme', currentTheme);
        }

        // Add click event listener if toggle button exists
        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }
    }

    // Toggle between light, dark, and comfort themes
    function toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        
        // Get current theme index
        const currentIndex = THEMES.indexOf(currentTheme);
        
        // Get next theme (cycle through: light → dark → comfort → light)
        const nextIndex = (currentIndex + 1) % THEMES.length;
        const newTheme = THEMES[nextIndex];
        
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