// volunteer-matching.js - Client-side volunteering matching functionality

// Global variables to store the selected user
let selectedUserId = null;

// Search users by name or email
async function searchUsers(query) {
  try {
    console.log('Searching for users with query:', query);
    
    const response = await fetch(`/api/volunteer-matching/users?query=${encodeURIComponent(query)}`);
    const contentType = response.headers.get('content-type');
    
    console.log('Search response status:', response.status);
    console.log('Search response content-type:', contentType);
    
    if (!response.ok) {
      let errorMessage = 'Failed to search users';
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch (e) {
        console.error('Error parsing error response:', e);
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log('Search results:', data);
    return data;
  } catch (error) {
    console.error('Error searching users:', error);
    alert(`Search error: ${error.message}`);
    return [];
  }
}

// Get user details with skills and availability
async function getUserDetails(userId) {
  try {
    const response = await fetch(`/api/volunteer-matching/user/${userId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get user details');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting user details:', error);
    return null;
  }
}

// Get all available events (no filtering by user)
async function getMatchingEvents(userId) {
  try {
    debugLog('Getting all available events (not filtered by user skills)');
    
    // Get all events without filtering
    const response = await fetch('/api/logs/all-events');
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get events');
    }
    
    const events = await response.json();
    debugLog(`Found ${events.length} events in database`);
    
    return events;
  } catch (error) {
    console.error('Error getting events:', error);
    return [];
  }
}

// Apply user to event
async function applyForEvent(userId, eventId) {
  try {
    const response = await fetch('/api/volunteer-matching/apply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        eventId
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to apply for event');
    }
    
    return { success: true, message: result.message };
  } catch (error) {
    console.error('Error applying for event:', error);
    return { success: false, error: error.message };
  }
}

// Format date for display
function formatDate(dateString) {
  if (!dateString) return '';
  
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  try {
    return new Date(dateString).toLocaleDateString(undefined, options);
  } catch (e) {
    return dateString;
  }
}

// Display user details
function displayUserDetails(user) {
  const skillsElement = document.getElementById('skills');
  const prefsElement = document.getElementById('prefs');
  
  // Display skills
  let skillsText = "Skills: ";
  if (user.skills && user.skills.length > 0) {
    skillsText += user.skills.map(skill => 
      typeof skill === 'string' ? skill : skill.skill_name
    ).join(", ");
  } else {
    skillsText += "None specified";
  }
  skillsElement.textContent = skillsText;
  
  // Display preferences
  let prefsText = "Preferences: ";
  if (user.preferences && user.preferences.length > 0) {
    prefsText += user.preferences.join(", ");
  } else {
    prefsText += "None specified";
  }
  prefsElement.textContent = prefsText;
}

// Display all available events in dropdown
function displayMatchingEvents(events) {
  const evSelector = document.getElementById('evSelector');
  evSelector.innerHTML = '<option value="">-- Select an Event --</option>';
  
  if (!events || events.length === 0) {
    const option = document.createElement('option');
    option.disabled = true;
    option.textContent = "No events available in the database";
    evSelector.appendChild(option);
    return;
  }
  
  // Sort events by date (newest first)
  events.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  events.forEach(event => {
    const option = document.createElement('option');
    option.value = event.id;
    
    // Format display text with more details
    const eventName = event.event_name;
    const dates = `${formatDate(event.start_date)} to ${formatDate(event.end_date)}`;
    const location = event.location ? ` @ ${event.location}` : '';
    const status = event.status ? ` [${event.status}]` : '';
    
    option.textContent = `${eventName}${location} - ${dates}${status}`;
    evSelector.appendChild(option);
  });
  
  // Update UI to show this is all events, not just matches
  const skillsElement = document.getElementById('skills');
  if (skillsElement.textContent === "Skills: " || skillsElement.textContent === "Skills: None specified") {
    skillsElement.innerHTML = "Skills: <span class='text-blue-600'>(Showing all events, not filtered by skills)</span>";
  }
}

// Find volunteer and show all available events
async function match() {
  const nameInput = document.getElementById('name').value.trim();
  
  if (nameInput.length < 2) {
    alert("Please enter at least 2 characters to search");
    return;
  }
  
  // Clear previous data
  document.getElementById('skills').textContent = "Skills: ";
  document.getElementById('prefs').textContent = "Preferences: ";
  document.getElementById('evSelector').innerHTML = '<option value="">-- Select an Event --</option>';
  
  try {
    // First, search for users matching the input
    debugLog(`Searching for volunteer with query: "${nameInput}"`);
    const users = await searchUsers(nameInput);
    
    if (!users || users.length === 0) {
      alert("No users found matching your search");
      return;
    }
    
    // If multiple users found, let the user select one
    let userId;
    
    if (users.length === 1) {
      userId = users[0].id;
      debugLog(`Found one user: ${users[0].full_name} (${userId})`);
    } else {
      // Create a simple selection dialog
      debugLog(`Found ${users.length} users:`, users);
      const userNames = users.map(u => u.full_name || u.email);
      const selectedIndex = prompt(`Found ${users.length} users. Please select a number:\n${
        userNames.map((name, idx) => `${idx + 1}. ${name}`).join('\n')
      }`);
      
      const index = parseInt(selectedIndex) - 1;
      if (isNaN(index) || index < 0 || index >= users.length) {
        alert("Invalid selection");
        return;
      }
      
      userId = users[index].id;
      debugLog(`Selected user: ${users[index].full_name} (${userId})`);
    }
    
    // Store selected user ID for later
    selectedUserId = userId;
    
    // Now get the detailed user profile
    debugLog(`Getting details for user ID: ${userId}`);
    const user = await getUserDetails(userId);
    
    if (!user) {
      alert("Failed to get user details");
      return;
    }
    
    // Display user details
    debugLog("Displaying user details:", user);
    displayUserDetails(user);
    
    // Get ALL available events (not filtered by user)
    debugLog("Getting all available events");
    const events = await getMatchingEvents(userId);
    
    // Display events
    debugLog(`Displaying ${events.length} events`);
    displayMatchingEvents(events);
    
    // Update UI to indicate we're showing all events
    document.getElementById('match-info').textContent = 
      `Showing all available events for assignment to ${user.fullName}`;
    document.getElementById('match-info').classList.remove('hidden');
    
  } catch (error) {
    debugLog("Error in matching process:", error.message);
    alert(`Error: ${error.message}`);
  }
}

// Handle event selection and volunteer application
async function sendEvent() {
  if (!selectedUserId) {
    alert("Please search for a volunteer first");
    return false;
  }
  
  const eventSelect = document.getElementById('evSelector');
  const selectedEventId = eventSelect.value;
  
  if (!selectedEventId) {
    alert("Please select an event first");
    return false;
  }
  
  // Show confirmation dialog
  const confirm = window.confirm("Are you sure you want to match this volunteer with the selected event?");
  
  if (!confirm) {
    return false;
  }
  
  // Apply for the event
  const result = await applyForEvent(selectedUserId, selectedEventId);
  
  if (result.success) {
    alert("Volunteer successfully assigned to the event!");
    
    // Clear form
    document.getElementById('name').value = '';
    document.getElementById('skills').textContent = "Skills: ";
    document.getElementById('prefs').textContent = "Preferences: ";
    document.getElementById('evSelector').innerHTML = '<option value="">-- Select an Event --</option>';
    
    // Reset selected user
    selectedUserId = null;
  } else {
    alert("Error: " + (result.error || "Failed to match volunteer with event"));
  }
  
  return false; // Prevent form submission
}

// Debug logging function
function debugLog(message, data) {
  const debugElement = document.getElementById('debug-log');
  if (!debugElement) return;
  
  const timestamp = new Date().toLocaleTimeString();
  let logMessage = `[${timestamp}] ${message}`;
  
  if (data !== undefined) {
    try {
      if (typeof data === 'object') {
        logMessage += `\n${JSON.stringify(data, null, 2)}`;
      } else {
        logMessage += `\n${data}`;
      }
    } catch (e) {
      logMessage += `\n[Error stringifying data: ${e.message}]`;
    }
  }
  
  debugElement.innerHTML = logMessage + '\n\n' + debugElement.innerHTML;
  console.log(message, data);
}

// Toggle debug panel
function toggleDebug() {
  const debugPanel = document.getElementById('debug-output');
  if (debugPanel.classList.contains('hidden')) {
    debugPanel.classList.remove('hidden');
  } else {
    debugPanel.classList.add('hidden');
  }
}

// Test events API
async function testEventsApi() {
  debugLog('Testing events API');
  
  try {
    // Test direct query to events table using our special endpoint
    const response = await fetch('/api/logs/all-events', {
      headers: { 'Content-Type': 'application/json' }
    });
    
    debugLog('Events API response status:', response.status);
    
    if (!response.ok) {
      debugLog('Events API error status:', response.statusText);
      return;
    }
    
    const rawText = await response.text();
    debugLog('Raw events response:', rawText);
    
    try {
      const events = JSON.parse(rawText);
      debugLog(`Found ${events.length} events:`, events);
      alert(`Found ${events.length} events. See debug log for details.`);
    } catch (error) {
      debugLog('Failed to parse events as JSON:', error.message);
    }
  } catch (error) {
    debugLog('Events API fetch error:', error.message);
  }
}

// Create a test event
async function createTestEvent() {
  debugLog('Creating test event');
  
  try {
    // First check if user is logged in
    const authResponse = await fetch('/api/auth/user');
    const authData = await authResponse.json();
    
    if (!authData.user || !authData.user.id) {
      alert('You must be logged in to create an event');
      return;
    }
    
    const userId = authData.user.id;
    debugLog('Current user ID:', userId);
    
    // Create event data
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const eventData = {
      eventName: `Test Event ${now.toLocaleTimeString()}`,
      eventDescription: "This is a test event created from the volunteer matching page",
      location: "Test Location",
      urgency: "Medium",
      startDate: tomorrow.toISOString().split('T')[0],
      endDate: nextWeek.toISOString().split('T')[0],
      requiredSkills: ["Computer & IT", "Teaching"],
      userId: userId
    };
    
    debugLog('Creating event with data:', eventData);
    
    // Send to API
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create event');
    }
    
    const result = await response.json();
    debugLog('Event created successfully:', result);
    alert('Test event created successfully!');
    
    // Refresh event list
    await loadAllEvents();
  } catch (error) {
    debugLog('Error creating test event:', error.message);
    alert(`Error creating test event: ${error.message}`);
  }
}

// Load all events and display in dropdown
async function loadAllEvents() {
  debugLog('Loading all events');
  
  try {
    const response = await fetch('/api/events');
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch events');
    }
    
    const events = await response.json();
    debugLog(`Loaded ${events.length} events`);
    
    // Display in dropdown
    displayMatchingEvents(events);
    alert(`Loaded ${events.length} events directly from the database.`);
  } catch (error) {
    debugLog('Error loading all events:', error.message);
    alert(`Error: ${error.message}`);
  }
}

// Test direct fetch from profiles table
async function testDirectProfileFetch() {
  debugLog('Testing direct profile fetch');
  
  // Get auth session
  const session = getSession();
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (session && session.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
    debugLog('Using auth token', headers);
  } else {
    debugLog('No auth token available');
  }
  
  try {
    // First check auth status
    debugLog('Checking current user...');
    const authResponse = await fetch('/api/auth/user', { 
      method: 'GET',
      headers
    });
    const authData = await authResponse.json();
    debugLog('Auth check response', authData);
    
    if (authData.user && authData.user.id) {
      // Check if user profile exists 
      debugLog(`Checking profile for user ID: ${authData.user.id}`);
      const profileResponse = await fetch(`/api/logs/check-profile/${authData.user.id}`, {
        method: 'GET',
        headers
      });
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        debugLog('Found user profile:', profileData);
        alert(`Found your profile! Your name in the database is: "${profileData.full_name}"`);
      } else {
        const errorData = await profileResponse.json();
        debugLog('Profile check error:', errorData);
        alert('Could not find your profile in the database. See debug log for details.');
      }
    }
    
    // Try to fetch profiles directly
    const nameInput = document.getElementById('name').value.trim() || 'Ayyan';
    debugLog(`Querying for name containing: ${nameInput}`);
    
    const response = await fetch(`/api/volunteer-matching/users?query=${encodeURIComponent(nameInput)}`, {
      method: 'GET',
      headers
    });
    
    // Debug the raw response
    const rawText = await response.text();
    debugLog('Raw response text:', rawText);
    
    // Try to parse as JSON
    try {
      const data = JSON.parse(rawText);
      debugLog('Parsed search results:', data);
    } catch (error) {
      debugLog('Failed to parse response as JSON:', error.message);
    }
  } catch (error) {
    debugLog('Error in direct test:', error.message);
  }
}

// Set up event handlers
document.addEventListener('DOMContentLoaded', function() {
  // Add event listener for volunteer search form
  document.getElementById('name').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      match();
    }
  });
  
  // Overwrite the original fetch function to add debug logging
  const originalFetch = window.fetch;
  window.fetch = async function(url, options) {
    if (typeof url === 'string' && url.includes('/api/volunteer-matching')) {
      debugLog(`Fetch request to ${url}`, options);
    }
    
    try {
      const response = await originalFetch(url, options);
      
      if (typeof url === 'string' && url.includes('/api/volunteer-matching')) {
        debugLog(`Fetch response from ${url}`, {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries([...response.headers.entries()])
        });
      }
      
      return response;
    } catch (error) {
      if (typeof url === 'string' && url.includes('/api/volunteer-matching')) {
        debugLog(`Fetch error for ${url}`, error);
      }
      throw error;
    }
  };
});
