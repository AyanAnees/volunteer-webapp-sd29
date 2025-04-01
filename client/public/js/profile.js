// profile.js - Client-side profile functionality

// Get profile data
async function getProfile(userId) {
  try {
    const response = await fetch(`/api/profile/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get profile');
    }
    
    return { success: true, profile: data };
  } catch (error) {
    console.error('Get profile error:', error);
    return { success: false, error: error.message };
  }
}

// Save profile data
async function saveProfile(userId, profileData) {
  try {
    const response = await fetch(`/api/profile/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to save profile');
    }
    
    return { success: true, message: data.message };
  } catch (error) {
    console.error('Save profile error:', error);
    return { success: false, error: error.message };
  }
}

// Parse datetime string to readable format
function formatDateTime(dateTimeStr) {
  if (!dateTimeStr) return '';
  
  try {
    const date = new Date(dateTimeStr);
    return date.toLocaleString();
  } catch (e) {
    console.error('Error formatting date:', e);
    return dateTimeStr;
  }
}

// Load profile data
async function loadProfileData() {
  // Check if user is logged in
  const userId = getCurrentUserId();
  
  if (!userId) {
    showLoginPrompt();
    return;
  }
  
  const result = await getProfile(userId);
  
  if (result.success) {
    fillProfileForm(result.profile);
  } else {
    // If no profile exists yet, that's okay - the form will be empty
    console.log('No existing profile found or error occurred:', result.error);
  }
}

// Fill profile form with data
function fillProfileForm(profile) {
  if (!profile) return;
  
  console.log("Filling form with profile data:", profile);
  
  // Fill basic info
  document.getElementById('fullName').value = profile.full_name || '';
  document.getElementById('address1').value = profile.address_1 || '';
  document.getElementById('address2').value = profile.address_2 || '';
  document.getElementById('city').value = profile.city || '';
  document.getElementById('state').value = profile.state || '';
  document.getElementById('zipCode').value = profile.zip_code || '';
  
  // Fill skills (handle both array formats)
  if (profile.skills && profile.skills.length > 0) {
    const skillsSelect = document.getElementById('skills');
    const options = skillsSelect.options;
    
    for (let i = 0; i < options.length; i++) {
      const skillName = options[i].value;
      
      // Check if skills is an array of objects or strings
      const isSelected = profile.skills.some(skill => 
        typeof skill === 'string' 
          ? skill === skillName 
          : (skill.skill_name === skillName || skill.name === skillName)
      );
      
      if (isSelected) {
        options[i].selected = true;
      }
    }
  }
  
  // Fill availability slots - use the raw slots directly for now
  // This is a simplified approach, we'll improve this in the future
  if (profile.availability && profile.availability.length > 0) {
    const slotsContainer = document.getElementById('dateTimeSlots');
    // Clear existing slots
    slotsContainer.innerHTML = '';
    
    // Create placeholder slots with a message
    const notice = document.createElement('div');
    notice.innerHTML = '<p class="text-info">Your availability was saved in the database. Please re-enter your preferred datetime slots.</p>';
    slotsContainer.appendChild(notice);
    
    // Add one empty slot
    const newSlot = document.createElement('div');
    newSlot.innerHTML = `<input type="datetime-local" name="dateTimeSlot0" required>`;
    slotsContainer.appendChild(newSlot);
  }
}

// Show login prompt if user is not logged in
function showLoginPrompt() {
  const form = document.getElementById('profileForm');
  form.innerHTML = `
    <div class="text-center p-8">
      <h3 class="text-xl font-semibold mb-4">Please log in to view and update your profile</h3>
      <a href="/login" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Go to Login</a>
    </div>
  `;
}

// Get selected values from a multi-select dropdown
function getSelectedValues(selectElement) {
  const result = [];
  const options = selectElement.options;
  
  for (let i = 0; i < options.length; i++) {
    if (options[i].selected) {
      result.push(options[i].value);
    }
  }
  
  return result;
}

// Collect availability time slots
function collectAvailabilitySlots() {
  const slots = [];
  const inputs = document.querySelectorAll('input[name^="dateTimeSlot"]');
  
  inputs.forEach(input => {
    if (input.value) {
      slots.push(input.value);
    }
  });
  
  return slots;
}

// Check auth status when page loads
document.addEventListener('DOMContentLoaded', function() {
  loadProfileData();
  
  // Form submission handler
  document.getElementById('profileForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const userId = getCurrentUserId();
    
    if (!userId) {
      alert('You must be logged in to save your profile');
      return;
    }
    
    const skills = getSelectedValues(document.getElementById('skills'));
    const availability = collectAvailabilitySlots();
    
    // Validate that at least one skill is selected
    if (!skills.length) {
      alert('Please select at least one skill');
      return;
    }
    
    // Validate that at least one availability slot is filled
    if (!availability.length) {
      alert('Please enter at least one availability slot');
      return;
    }
    
    const profileData = {
      fullName: document.getElementById('fullName').value,
      address1: document.getElementById('address1').value,
      address2: document.getElementById('address2').value,
      city: document.getElementById('city').value,
      state: document.getElementById('state').value,
      zipCode: document.getElementById('zipCode').value,
      skills: skills,
      availability: availability
    };
    
    console.log("Saving profile data:", profileData);
    
    const result = await saveProfile(userId, profileData);
    
    if (result.success) {
      alert('Profile saved successfully!');
      // Reload profile data to show the updated information
      loadProfileData();
    } else {
      alert('Error saving profile: ' + (result.error || 'Unknown error'));
    }
  });
});
