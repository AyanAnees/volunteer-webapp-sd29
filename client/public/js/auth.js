// auth.js - Client-side authentication functionality

// Store session in local storage
function saveSession(session) {
  localStorage.setItem('authSession', JSON.stringify(session));
}

// Get session from local storage
function getSession() {
  const sessionStr = localStorage.getItem('authSession');
  return sessionStr ? JSON.parse(sessionStr) : null;
}

// Clear session from local storage
function clearSession() {
  localStorage.removeItem('authSession');
}

// Check if user is logged in
function isLoggedIn() {
  return !!getSession();
}

// Get current user ID
function getCurrentUserId() {
  const session = getSession();
  return session ? session.user.id : null;
}

// Register a new user
async function registerUser(email, password, firstName, lastName, address1, address2, city, state, zipCode) {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        firstName,
        lastName,
        address1,
        address2,
        city,
        state,
        zipCode
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }
    
    return { success: true, message: data.message, user: data.user };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: error.message };
  }
}

// Login a user
async function loginUser(email, password) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }
    
    // Save session
    saveSession(data.session);
    
    return { success: true, message: data.message, user: data.user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
}

// Logout a user
async function logoutUser() {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    
    // Clear session regardless of server response
    clearSession();
    
    if (!response.ok) {
      throw new Error(data.error || 'Logout failed');
    }
    
    return { success: true, message: data.message };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: error.message };
  }
}

// Get current user
async function getCurrentUser() {
  try {
    const response = await fetch('/api/auth/user', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get user');
    }
    
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Get user error:', error);
    return { success: false, error: error.message };
  }
}

// Check authentication status when page loads
document.addEventListener('DOMContentLoaded', function() {
  const session = getSession();
  
  // If logged in, update UI accordingly
  if (session) {
    updateUIForLoggedInUser();
  }
});

// Update UI elements for logged-in user
function updateUIForLoggedInUser() {
  // Update navbar links
  const loginLinks = document.querySelectorAll('a[href="/login"]');
  loginLinks.forEach(link => {
    link.textContent = 'Logout';
    link.href = '#';
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      const result = await logoutUser();
      if (result.success) {
        // Refresh page after logout
        window.location.reload();
      }
    });
  });
  
  // You can add more UI updates here
}
