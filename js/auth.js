/**
 * Flow Design Guide - Simple Password Protection
 *
 * This provides basic client-side password protection.
 * Note: This is NOT secure for sensitive data - the password can be found in source.
 * For true security, use server-side authentication.
 */

(function() {
    'use strict';

    // Configuration
    const AUTH_CONFIG = {
        // Password hash (SHA-256 of "flowdesign2024")
        // To change password: generate new hash at https://emn178.github.io/online-tools/sha256.html
        passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
        sessionKey: 'flow-design-guide-auth',
        sessionDuration: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    };

    // Simple SHA-256 hash function
    async function sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    // Check if user is authenticated
    function isAuthenticated() {
        const session = localStorage.getItem(AUTH_CONFIG.sessionKey);
        if (!session) return false;

        try {
            const { timestamp, hash } = JSON.parse(session);
            const now = Date.now();

            // Check if session is still valid (within duration)
            if (now - timestamp > AUTH_CONFIG.sessionDuration) {
                localStorage.removeItem(AUTH_CONFIG.sessionKey);
                return false;
            }

            // Verify the hash matches
            return hash === AUTH_CONFIG.passwordHash;
        } catch (e) {
            localStorage.removeItem(AUTH_CONFIG.sessionKey);
            return false;
        }
    }

    // Set authentication session
    function setAuthenticated() {
        const session = {
            timestamp: Date.now(),
            hash: AUTH_CONFIG.passwordHash
        };
        localStorage.setItem(AUTH_CONFIG.sessionKey, JSON.stringify(session));
    }

    // Clear authentication
    function logout() {
        localStorage.removeItem(AUTH_CONFIG.sessionKey);
        showLoginOverlay();
    }

    // Create and show login overlay
    function showLoginOverlay() {
        // Hide main content
        document.body.style.overflow = 'hidden';

        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'auth-overlay';
        overlay.innerHTML = `
            <div class="auth-container">
                <div class="auth-logo">
                    <svg viewBox="0 0 120 40" width="120" height="40">
                        <text x="0" y="30" font-family="Poppins, sans-serif" font-size="28" font-weight="700" fill="currentColor">FLOW</text>
                    </svg>
                    <span class="auth-subtitle">Design Guide</span>
                </div>
                <form class="auth-form" id="auth-form">
                    <div class="auth-field">
                        <label for="auth-password">Password</label>
                        <input type="password" id="auth-password" placeholder="Enter password" autocomplete="current-password" autofocus>
                    </div>
                    <div class="auth-error" id="auth-error"></div>
                    <button type="submit" class="auth-button">Access Guide</button>
                </form>
                <p class="auth-hint">Contact your project manager for access credentials.</p>
            </div>
        `;

        // Add styles
        const styles = document.createElement('style');
        styles.textContent = `
            #auth-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: var(--color-bg, #ffffff);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
            }

            [data-theme="dark"] #auth-overlay {
                background: #09090b;
            }

            .auth-container {
                width: 100%;
                max-width: 360px;
                padding: 40px;
                text-align: center;
            }

            .auth-logo {
                margin-bottom: 40px;
                color: var(--color-text, #18181b);
            }

            [data-theme="dark"] .auth-logo {
                color: #fafafa;
            }

            .auth-subtitle {
                display: block;
                font-size: 12px;
                color: var(--color-text-muted, #a1a1aa);
                text-transform: uppercase;
                letter-spacing: 0.1em;
                margin-top: 4px;
            }

            .auth-form {
                text-align: left;
            }

            .auth-field {
                margin-bottom: 20px;
            }

            .auth-field label {
                display: block;
                font-size: 14px;
                font-weight: 500;
                color: var(--color-text, #18181b);
                margin-bottom: 8px;
            }

            [data-theme="dark"] .auth-field label {
                color: #fafafa;
            }

            .auth-field input {
                width: 100%;
                padding: 12px 16px;
                font-size: 16px;
                font-family: inherit;
                border: 1px solid var(--color-border, #e4e4e7);
                border-radius: 8px;
                background: var(--color-bg, #ffffff);
                color: var(--color-text, #18181b);
                transition: border-color 0.15s ease, box-shadow 0.15s ease;
            }

            [data-theme="dark"] .auth-field input {
                background: #18181b;
                border-color: #27272a;
                color: #fafafa;
            }

            .auth-field input:focus {
                outline: none;
                border-color: #E59500;
                box-shadow: 0 0 0 3px rgba(229, 149, 0, 0.1);
            }

            .auth-field input::placeholder {
                color: var(--color-text-muted, #a1a1aa);
            }

            .auth-error {
                color: #ef4444;
                font-size: 14px;
                margin-bottom: 16px;
                min-height: 20px;
            }

            .auth-button {
                width: 100%;
                padding: 12px 24px;
                font-size: 16px;
                font-weight: 500;
                font-family: inherit;
                background: #E59500;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                transition: background-color 0.15s ease;
            }

            .auth-button:hover {
                background: #CC8400;
            }

            .auth-button:active {
                transform: translateY(1px);
            }

            .auth-hint {
                margin-top: 24px;
                font-size: 13px;
                color: var(--color-text-muted, #a1a1aa);
            }

            /* Hide content behind overlay */
            body.auth-locked > *:not(#auth-overlay):not(style):not(script) {
                visibility: hidden;
            }
        `;

        document.head.appendChild(styles);
        document.body.appendChild(overlay);
        document.body.classList.add('auth-locked');

        // Handle form submission
        const form = document.getElementById('auth-form');
        const passwordInput = document.getElementById('auth-password');
        const errorDiv = document.getElementById('auth-error');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const password = passwordInput.value;

            if (!password) {
                errorDiv.textContent = 'Please enter a password';
                return;
            }

            const hash = await sha256(password);

            if (hash === AUTH_CONFIG.passwordHash) {
                setAuthenticated();
                overlay.remove();
                document.body.classList.remove('auth-locked');
                document.body.style.overflow = '';
            } else {
                errorDiv.textContent = 'Incorrect password';
                passwordInput.value = '';
                passwordInput.focus();
            }
        });
    }

    // Add logout button to sidebar
    function addLogoutButton() {
        const sidebarFooter = document.querySelector('.sidebar-footer');
        if (sidebarFooter) {
            const logoutBtn = document.createElement('button');
            logoutBtn.className = 'theme-toggle';
            logoutBtn.style.marginTop = '8px';
            logoutBtn.innerHTML = `
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span style="margin-left: 4px;">Logout</span>
            `;
            logoutBtn.addEventListener('click', logout);
            sidebarFooter.appendChild(logoutBtn);
        }
    }

    // Initialize authentication check
    function init() {
        if (!isAuthenticated()) {
            showLoginOverlay();
        } else {
            addLogoutButton();
        }
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose logout function globally
    window.flowAuth = { logout };

})();
