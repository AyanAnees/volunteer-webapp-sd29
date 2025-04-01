// events.js - Client-side event management functionality

// Get all events
async function fetchEvents() {
  try {
    const response = await fetch("/api/events");
    const events = await response.json();
    
    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }
    
    return { success: true, data: events };
  } catch (error) {
    console.error("Error fetching events:", error);
    return { success: false, error: error.message, data: [] };
  }
}

// Create a new event
async function createEvent(eventData) {
  try {
    // Add the current user ID to the event data if user is logged in
    const userId = getCurrentUserId();
    console.log("Current user ID:", userId);
    
    if (userId) {
      eventData.userId = userId;
    } else {
      console.log("No user ID available, event will be created anonymously");
    }
    
    // Log the complete event data being sent
    console.log("Sending event data:", JSON.stringify(eventData));
    
    const response = await fetch("/api/events", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        // Include auth header if available from localStorage session
        ...(getSession() && { 
          'Authorization': `Bearer ${getSession().access_token}` 
        })
      },
      body: JSON.stringify(eventData)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Server error response:", result);
      throw new Error(result.error || "Failed to create event");
    }
    
    return { success: true, data: result };
  } catch (error) {
    console.error("Error creating event:", error);
    return { success: false, error: error.message };
  }
}

// Delete an event
async function deleteEvent(eventId) {
  try {
    const response = await fetch(`/api/events/${eventId}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || "Failed to delete event");
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting event:", error);
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

// Display events in the UI
function displayEvents(events) {
  const eventList = document.getElementById("event-list");
  eventList.innerHTML = "";

  if (events.length === 0) {
    eventList.innerHTML = "<li class='no-events'>No events found</li>";
    return;
  }

  events.forEach(event => {
    if (!event.id) {
      console.error("Event missing ID:", event);
      return;
    }
    
    // Handle different data formats from API
    const eventName = event.event_name || event.eventName;
    const startDate = event.start_date || event.startDate;
    const endDate = event.end_date || event.endDate;
    
    const listItem = document.createElement("li");
    listItem.innerHTML = `
      <strong>Event Name:</strong> ${eventName} <br>
      <strong>Dates:</strong> ${formatDate(startDate)} to ${formatDate(endDate)} <br>
      <strong>Location:</strong> ${event.location} <br>
      <strong>Urgency:</strong> ${event.urgency} <br>
      <button onclick="handleDeleteEvent('${event.id}')">Delete</button>
    `;
    eventList.appendChild(listItem);
  });
}

// Handle event form submission
async function handleEventSubmission(event) {
  event.preventDefault();

  // Check if user is logged in
  if (!isLoggedIn()) {
    const proceed = confirm("You are not logged in. Your event will be created anonymously. Continue?");
    if (!proceed) return;
  }

  const eventData = {
    eventName: document.getElementById("event-name").value,
    eventDescription: document.getElementById("event-description").value,
    location: document.getElementById("location").value,
    urgency: document.getElementById("urgency").value,
    startDate: document.getElementById("event-start-date").value,
    endDate: document.getElementById("event-end-date").value,
    requiredSkills: getSelectedSkills()
  };

  // Create event
  const result = await createEvent(eventData);

  if (result.success) {
    alert("Event submitted successfully!");
    document.getElementById("event-management-form").reset();
    updateSelectedOptions(); // Clear selected skills list
    await loadEvents(); // Refresh event list
  } else {
    alert("Error: " + (result.error || "Failed to submit event"));
  }
}

// Handle event deletion
async function handleDeleteEvent(eventId) {
  if (!confirm("Are you sure you want to delete this event?")) return;
  
  const result = await deleteEvent(eventId);
  
  if (result.success) {
    alert("Event deleted successfully!");
    await loadEvents(); // Refresh event list
  } else {
    alert("Failed to delete event: " + (result.error || "Unknown error"));
  }
}

// Get selected skills from checkboxes
function getSelectedSkills() {
  const skills = [];
  const checkboxes = document.querySelectorAll('input[name="options"]:checked');
  
  checkboxes.forEach(checkbox => {
    skills.push(checkbox.value);
  });
  
  return skills;
}

// Load events from the server
async function loadEvents() {
  const result = await fetchEvents();
  
  if (result.success) {
    displayEvents(result.data);
  } else {
    console.error("Failed to load events:", result.error);
    // Display empty state or error
    const eventList = document.getElementById("event-list");
    eventList.innerHTML = "<li class='error'>Error loading events. Please try again later.</li>";
  }
}

// Initialize event handlers
document.addEventListener('DOMContentLoaded', function() {
  // Load auth.js
  if (typeof isLoggedIn !== 'function') {
    console.error('Auth functions not available. Make sure auth.js is loaded first.');
  }
  
  // Set up event form submission handler
  document.getElementById("event-management-form").addEventListener("submit", handleEventSubmission);
  
  // Load events
  loadEvents();
});
