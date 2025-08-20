// Your form submit function
async function savePlayerData(event) {
    // Prevent form from submitting normally
    event.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');

    // Get form data
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    
    // Validate fields
    if (!firstName || !lastName) {
        showStatus('Please fill in all fields', 'error');
        return;
    }

    // Disable submit button and show loading
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    // Prepare data for Unity Cloud Save
    const userData = {
        firstName: firstName,
        lastName: lastName,
        timestamp: new Date().toISOString()
    };

    try {
        const response = await fetch('api/coffe.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                data: userData
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('Success:', result);
            showStatus('Data saved successfully!', 'success');
             MakeBackGroundScroll();

        } else {
            console.error('Error:', result);
            showStatus('Error saving data: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Network error:', error);
        showStatus('Network error: ' + error.message, 'error');
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
    }

}

function MakeBackGroundScroll(){
    const bg = document.querySelector(".background-image");
    const continer = document.querySelector(".container");

        bg.classList.add("absolute");
        continer.classList.add("hide")
}

// Add event listener to your submit button
document.getElementById('userForm').addEventListener('submit', savePlayerData);


// Helper function for status messages (add this if you don't have it)
function showStatus(message, type) {
    console.log(`${type.toUpperCase()}: ${message}`);
    // You can add more visual feedback here if needed
}