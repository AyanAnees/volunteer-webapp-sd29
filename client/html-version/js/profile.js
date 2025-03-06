
document.addEventListener('DOMContentLoaded', function () {
    const profileForm = document.getElementById('profileForm');

    let slotCount = 1; available

    window.addDateTimeSlot = function () {
        const lastSlot = document.querySelector(`#dateTimeSlots input:last-of-type`);
    
        if (lastSlot && !lastSlot.value) {
            alert("Please fill in the previous slot before adding a new one.");
            return;
        }

        if (slotCount < 7) {
            const slotContainer = document.getElementById('dateTimeSlots');
            const newSlot = document.createElement('div');
            newSlot.innerHTML = `<input type="datetime-local" name="dateTimeSlot${slotCount}" required>`;
            slotContainer.appendChild(newSlot);
            slotCount++;
        } else {
            alert('Maximum of 7 date-time slots allowed.');
        }
    };

    if (profileForm) {
        profileForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const submitButton = profileForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = "Saving...";

            const formData = new FormData(profileForm);
            const profileData = {};

            // Extract regular form data
            for (const [key, value] of formData.entries()) {
                profileData[key] = value;
            }
            const skillsSelect = document.getElementById('skills');
            const selectedSkills = Array.from(skillsSelect.selectedOptions).map(option => option.value);
            profileData.skills = selectedSkills.length > 0 ? selectedSkills : [];
            const availabilitySlots = [];
            for (let i = 0; i < slotCount; i++) {
                const slotValue = formData.get(`dateTimeSlot${i}`);
                if (slotValue && !availabilitySlots.includes(slotValue) && new Date(slotValue) > new Date()) {
                    availabilitySlots.push(slotValue);
                }
            }
            profileData.availability = availabilitySlots;

            if (availabilitySlots.length === 0) {
                alert("Please add at least one valid date-time slot.");
                submitButton.disabled = false;
                submitButton.textContent = "Save Profile";
                return;
            }

            fetch('/api/save-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData)
            })
            .then(response => response.json())
            .then(data => {
                console.log('Server Response:', data);
                alert('Profile saved successfully!');
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error saving profile.');
            })
            .finally(() => {
                submitButton.disabled = false;
                submitButton.textContent = "Save Profile";
            });
        });
    }
});



