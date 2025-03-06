/**
 * @jest-environment jsdom
 */

const { showError, validateLogin, validateSignup } = require('../js/login');

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  },
  writable: true
});

global.jest = true;

describe('Login & Signup Form Validation', () => {
    let loginForm, signupForm, loginErrorDiv, signupErrorDiv;

    beforeEach(() => {
        document.body.innerHTML = `
            <div id="login-error" class="text-red-600 text-sm"></div>
            <form id="login-content">
                <input type="email" id="login-email">
                <input type="password" id="login-password">
                <button type="submit">Login</button>
            </form>

            <div id="signup-error" class="text-red-600 text-sm"></div>
            <form id="signup-content">
                <input type="text" id="signup-firstname">
                <input type="text" id="signup-lastname">
                <input type="email" id="signup-email">
                <input type="password" id="signup-password">
                <input type="password" id="signup-confirm-password">
                <input type="checkbox" id="signup-terms">
                <button type="submit">Sign Up</button>
            </form>
        `;

        loginForm = document.querySelector('#login-content');
        signupForm = document.querySelector('#signup-content');
        loginErrorDiv = document.querySelector('#login-error');
        signupErrorDiv = document.querySelector('#signup-error');
        
        localStorage.getItem.mockClear();
        localStorage.setItem.mockClear();
    });

    test('showError should display error messages correctly', () => {
        showError('This is a login error', 'login');
        expect(loginErrorDiv.innerHTML).toBe('<p class="text-red-600 text-sm mt-2">This is a login error</p>');

        showError('This is a signup error', 'signup');
        expect(signupErrorDiv.innerHTML).toBe('<p class="text-red-600 text-sm mt-2">This is a signup error</p>');
    });

    test('Login should fail if email or password is missing', () => {
        const event = { preventDefault: jest.fn() };

        document.querySelector('#login-email').value = '';
        document.querySelector('#login-password').value = 'password123';

        validateLogin(event);
        expect(loginErrorDiv.innerHTML).toContain('Please enter both email and password.');

        document.querySelector('#login-email').value = 'user@example.com';
        document.querySelector('#login-password').value = '';

        validateLogin(event);
        expect(loginErrorDiv.innerHTML).toContain('Please enter both email and password.');
    });

    test('Signup should fail for invalid inputs', () => {
        const event = { preventDefault: jest.fn() };

        document.querySelector('#signup-firstname').value = 'A';
        document.querySelector('#signup-lastname').value = 'Doe';
        document.querySelector('#signup-email').value = 'user@example.com';
        document.querySelector('#signup-password').value = 'Password123';
        document.querySelector('#signup-confirm-password').value = 'Password123';
        document.querySelector('#signup-terms').checked = true;

        validateSignup(event);
        expect(signupErrorDiv.innerHTML).toContain('First name must be at least 2 characters long.');

        document.querySelector('#signup-firstname').value = 'John';
        document.querySelector('#signup-email').value = 'invalid-email';

        validateSignup(event);
        expect(signupErrorDiv.innerHTML).toContain('Invalid email format.');

        document.querySelector('#signup-email').value = 'user@example.com';
        document.querySelector('#signup-password').value = 'weakpass';

        validateSignup(event);
        expect(signupErrorDiv.innerHTML).toContain('Password must contain at least 8 characters');

        document.querySelector('#signup-password').value = 'Password123';
        document.querySelector('#signup-confirm-password').value = 'Password321';

        validateSignup(event);
        expect(signupErrorDiv.innerHTML).toContain('Passwords do not match.');

        document.querySelector('#signup-confirm-password').value = 'Password123';
        document.querySelector('#signup-terms').checked = false;

        validateSignup(event);
        expect(signupErrorDiv.innerHTML).toContain('You must agree to the Terms and Privacy Policy.');
    });

    // Test successful signup
    test('Signup should pass with valid inputs', () => {
        const event = { preventDefault: jest.fn() };

        document.querySelector('#signup-firstname').value = 'John';
        document.querySelector('#signup-lastname').value = 'Doe';
        document.querySelector('#signup-email').value = 'user@example.com';
        document.querySelector('#signup-password').value = 'Password123';
        document.querySelector('#signup-confirm-password').value = 'Password123';
        document.querySelector('#signup-terms').checked = true;

        const result = validateSignup(event);
        expect(result).toBe(true);
    });

    // Test successful login
    test('Login should pass with valid inputs', () => {
        const event = { preventDefault: jest.fn() };

        document.querySelector('#login-email').value = 'user@example.com';
        document.querySelector('#login-password').value = 'Password123';

        const result = validateLogin(event);
        expect(result).toBe(true);
    });
});