/**
 * Flow Design Guide - Navigation & Utilities
 * Handles: sidebar navigation, search, dark mode toggle, mobile menu
 */

(function() {
    'use strict';

    // ========================================
    // Dark Mode Toggle
    // ========================================

    const themeToggle = document.querySelector('.theme-toggle');
    const html = document.documentElement;

    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('flow-theme') || 'light';
    html.setAttribute('data-theme', savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';

            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('flow-theme', newTheme);
        });
    }

    // ========================================
    // Mobile Menu Toggle
    // ========================================

    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');

    if (mobileMenuToggle && sidebar) {
        mobileMenuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            mobileMenuToggle.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!sidebar.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                sidebar.classList.remove('open');
                mobileMenuToggle.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });

        // Close menu when clicking a nav link
        const navLinks = sidebar.querySelectorAll('.nav-link:not(.disabled)');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                sidebar.classList.remove('open');
                mobileMenuToggle.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
    }

    // ========================================
    // Search Functionality
    // ========================================

    const searchInput = document.querySelector('.search-input');
    const searchResults = document.querySelector('.search-results');

    // Searchable content index
    const searchIndex = [
        {
            title: 'Overview',
            url: getBasePath() + 'index.html',
            keywords: ['home', 'welcome', 'getting started', 'flow', 'design guide'],
            description: 'Welcome to the Flow Design Guide'
        },
        {
            title: 'Drawing Sheet Filenaming',
            url: getBasePath() + 'standards/drawing-sheet-naming.html',
            keywords: ['drawing', 'sheet', 'filenaming', 'naming', 'protocol', 'discipline', 'zone', 'sub-zone', 'sheet series', 'descriptor', 'revision', 'consultant', 'project code'],
            description: 'Drawing sheet file naming protocol and conventions'
        },
        {
            title: 'BIM Folder Structure',
            url: getBasePath() + 'standards/bim-folder-structure.html',
            keywords: ['bim', 'folder', 'structure', 'directory', 'organization', 'revit', 'model', 'project', 'archive', 'discipline', 'coordination', 'linked', 'export', 'wip'],
            description: 'Standardized folder structure for BIM projects'
        },
        {
            title: 'BIM Models Filenaming',
            url: getBasePath() + 'standards/bim-models-filenaming.html',
            keywords: ['bim', 'model', 'filenaming', 'naming', 'protocol', 'revit', 'navisworks', 'nwc', 'nwd', 'dwg', 'autocad', 'discipline', 'zone', 'consultant', 'project code'],
            description: 'BIM model file naming protocol and conventions'
        },        {            title: 'BIM Definitions',            url: getBasePath() + 'standards/bim-definitions.html',            keywords: ['bim', 'definitions', 'terms', 'glossary', 'vocabulary', 'bep', 'bim execution plan', 'cde', 'common data environment', 'clash', 'coordination', 'federated model', 'ifc', 'lod', 'loi', 'loin', 'guid', 'cobie', 'cafm', 'gis'],            description: 'Standard BIM terminology and definitions'        },        {            title: 'BIM Abbreviations',            url: getBasePath() + 'standards/bim-abbreviations.html',            keywords: ['bim', 'abbreviations', 'acronyms', '2d', '3d', '4d', '5d', '6d', '7d', 'arc', 'str', 'mep', 'mec', 'ele', 'int', 'lsd', 'dwg', 'dwf', 'dxf', 'rvt', 'rfa', 'nwc', 'nwd', 'ifc', 'cad', 'cde', 'lod', 'loi', 'cd', 'pd', 'dd', 'td', 'fm'],            description: 'Standard abbreviations used in BIM documentation'
        }
    ];

    function getBasePath() {
        // Determine if we're in a subdirectory
        const path = window.location.pathname;
        if (path.includes('/standards/')) {
            return '../';
        }
        return '';
    }

    function performSearch(query) {
        if (!query || query.length < 2) {
            searchResults.innerHTML = '';
            searchResults.classList.remove('active');
            return;
        }

        const lowerQuery = query.toLowerCase();
        const results = searchIndex.filter(item => {
            return item.title.toLowerCase().includes(lowerQuery) ||
                   item.keywords.some(k => k.includes(lowerQuery)) ||
                   item.description.toLowerCase().includes(lowerQuery);
        });

        if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-result-item no-results">No results found</div>';
        } else {
            searchResults.innerHTML = results.map(item => `
                <a href="${item.url}" class="search-result-item">
                    <div class="search-result-title">${highlightMatch(item.title, query)}</div>
                    <div class="search-result-desc">${item.description}</div>
                </a>
            `).join('');
        }

        searchResults.classList.add('active');
    }

    function highlightMatch(text, query) {
        const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    function escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    if (searchInput && searchResults) {
        let debounceTimer;

        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                performSearch(e.target.value.trim());
            }, 200);
        });

        // Close search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.classList.remove('active');
            }
        });

        // Keyboard navigation
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchResults.classList.remove('active');
                searchInput.blur();
            }
        });
    }

    // ========================================
    // Active Navigation Highlighting
    // ========================================

    function setActiveNav() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && currentPath.endsWith(href.replace('../', '').replace('./', ''))) {
                link.classList.add('active');
            }
        });
    }

    setActiveNav();

    // ========================================
    // Smooth Scroll for Anchor Links
    // ========================================

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ========================================
    // Print / PDF Export Enhancement
    // ========================================

    // Add print-specific class when printing
    window.addEventListener('beforeprint', () => {
        document.body.classList.add('printing');
    });

    window.addEventListener('afterprint', () => {
        document.body.classList.remove('printing');
    });

})();
