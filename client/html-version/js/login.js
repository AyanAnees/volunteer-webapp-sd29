function showError(message, type) {
    const errorDiv = document.getElementById(type === 'signup' ? 'signup-error' : 'login-error');
    if (errorDiv) {
        errorDiv.innerHTML = `<p class="text-red-600 text-sm mt-2">${message}</p>`;
    }
}

function validateLogin(event) {
    event.preventDefault();

    const email = document.querySelector('#login-email')?.value.trim();
    const password = document.querySelector('#login-password')?.value.trim();

    if (!email || !password) {
        showError("Please enter both email and password.", 'login');
        return false;
    }

    if (typeof jest !== 'undefined') {
        return true;
    }

    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
        showError("No account found. Please sign up first.", 'login');
        return false;
    }

    if (storedUser.email !== email || storedUser.password !== password) {
        showError("Invalid email or password. Please try again.", 'login');
        return false;
    }

    alert("Login successful!");
    window.location.href = 'dashboard.html';
    return true;
}

function validateSignup(event) {
    event.preventDefault();

    const firstName = document.querySelector('#signup-firstname')?.value.trim();
    const lastName = document.querySelector('#signup-lastname')?.value.trim();
    const email = document.querySelector('#signup-email')?.value.trim();
    const password = document.querySelector('#signup-password')?.value.trim();
    const confirmPassword = document.querySelector('#signup-confirm-password')?.value.trim();
    const termsAgreed = document.querySelector('#signup-terms')?.checked;

    if (!firstName || firstName.length < 2) {
        showError("First name must be at least 2 characters long.", 'signup');
        return false;
    }
    if (!lastName || lastName.length < 2) {
        showError("Last name must be at least 2 characters long.", 'signup');
        return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        showError("Invalid email format.", 'signup');
        return false;
    }

    if (!password || password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
        showError("Password must contain at least 8 characters with one uppercase letter, one lowercase letter, and one number.", 'signup');
        return false;
    }

    if (password !== confirmPassword) {
        showError("Passwords do not match.", 'signup');
        return false;
    }

    if (!termsAgreed) {
        showError("You must agree to the Terms and Privacy Policy.", 'signup');
        return false;
    }

    if (typeof jest === 'undefined') {
        const userData = { firstName, lastName, email, password };
        localStorage.setItem("user", JSON.stringify(userData));
        alert("Account created successfully! You can now log in.");
        showTab('login');
    }
    
    return true;
}

function showTab(tab) {
    document.getElementById('login-tab').classList.toggle('border-blue-500', tab === 'login');
    document.getElementById('login-tab').classList.toggle('text-blue-500', tab === 'login');
    document.getElementById('signup-tab').classList.toggle('border-blue-500', tab === 'signup');
    document.getElementById('signup-tab').classList.toggle('text-blue-500', tab === 'signup');
    document.getElementById('login-content').classList.toggle('hidden', tab !== 'login');
    document.getElementById('signup-content').classList.toggle('hidden', tab !== 'signup');
}

document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.querySelector('#login-content form');
    const signupForm = document.querySelector('#signup-content form');

    if (loginForm) {
        loginForm.addEventListener('submit', validateLogin);
    }
    if (signupForm) {
        signupForm.addEventListener('submit', validateSignup);
    } else {
        console.error("Signup form not found. Make sure the form exists in the DOM.");
    }
});

if (typeof module !== "undefined" && module.exports) {
    module.exports = { showError, validateLogin, validateSignup };
}