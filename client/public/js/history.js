// history.js - Client-side history functionality

// Get user volunteer history
async function getUserHistory(userId) {
  try {
    const response = await fetch(`/api/history/user/${userId}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error('Failed to fetch volunteer history');
    }
    
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching history:", error);
    return { success: false, error: error.message, data: [] };
  }
}

// Format date for display
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  try {
    return new Date(dateString).toLocaleDateString(undefined, options);
  } catch (e) {
    return dateString;
  }
}

// Get status class for styling
function getStatusClass(status) {
  switch (status) {
    case 'Applied': return 'status-applied';
    case 'Accepted': return 'status-accepted';
    case 'Declined': return 'status-declined';
    case 'Participated': return 'status-participated';
    case 'NoShow': return 'status-noshow';
    default: return '';
  }
}

// Display history data in the table
function displayHistory(historyData) {
  const tableBody = document.getElementById('history-table-body');
  if (!tableBody) return;
  
  tableBody.innerHTML = '';
  
  if (!historyData || historyData.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `
      <td colspan="7" class="empty-message">
        No volunteer history found. Start by applying for events!
      </td>
    `;
    tableBody.appendChild(emptyRow);
    return;
  }
  
  historyData.forEach(entry => {
    const row = document.createElement('tr');
    
    const event = entry.events || {};
    
    row.innerHTML = `
      <td>${event.event_name || 'N/A'}</td>
      <td>${event.description ? event.description.substring(0, 50) + '...' : 'N/A'}</td>
      <td>${event.location || 'N/A'}</td>
      <td>${event.required_skills ? event.required_skills.join(', ') : 'None'}</td>
      <td>${event.urgency || 'N/A'}</td>
      <td>${formatDate(event.start_date)}</td>
      <td class="${getStatusClass(entry.status)}">${entry.status || 'N/A'}</td>
    `;
    
    tableBody.appendChild(row);
  });
}

// Load history data
async function loadHistory() {
  // Check if user is logged in
  const userId = getCurrentUserId();
  
  if (!userId) {
    showLoginPrompt();
    return;
  }
  
  // Show loading state
  const tableBody = document.getElementById('history-table-body');
  if (tableBody) {
    tableBody.innerHTML = '<tr><td colspan="7" class="loading-message">Loading volunteer history...</td></tr>';
  }
  
  const result = await getUserHistory(userId);
  
  if (result.success) {
    displayHistory(result.data);
  } else {
    if (tableBody) {
      tableBody.innerHTML = `<tr><td colspan="7" class="error-message">Error loading history: ${result.error}</td></tr>`;
    }
  }
}

// Show login prompt if user is not logged in
function showLoginPrompt() {
  const historyContainer = document.querySelector('.history-container');
  if (historyContainer) {
    historyContainer.innerHTML = `
      <div class="login-prompt">
        <h3>Please login to view your volunteer history</h3>
        <a href="/login" class="login-button">Go to Login</a>
      </div>
    `;
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Make sure auth.js is loaded
  if (typeof getCurrentUserId !== 'function') {
    console.error('Auth functions not available. Make sure auth.js is loaded first.');
  }
  
  // Load history data
  loadHistory();
});