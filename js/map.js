// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the map inside the 'map' div with initial coordinates and zoom level
    var map = L.map('map').setView([51.505, -0.09], 13); // Coordinates for London

    // Add the OpenStreetMap tile layer (this is the actual map layer)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Optionally, add a marker to the map
    L.marker([51.505, -0.09]).addTo(map)
        .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
        .openPopup();
});


document.getElementById("apply-details").addEventListener("click", async function (event) {
    event.preventDefault(); // Prevent the default form submission

    const taskCategory = document.getElementById("task-category").value;
    const taskTime = document.getElementById("time").value;
    const taskLocationInput = document.getElementById('task-location');
    const suggestionBox = document.getElementById('suggestion-box');
    const startDate = document.getElementById('start-date');
    const startTime = document.getElementById('start-time');
    const endDate = document.getElementById('end-date');
    const endTime = document.getElementById('end-time');
    let lat, lon, display_name;

    const location = taskLocationInput.value.trim();
    if (!location) {
        alert('Please enter a location.');
        return;
    }

    const geocodeResult = await geocodeLocation(location);

    if (geocodeResult.error) {
        console.log(`Error: ${geocodeResult.error}`);
    } else {
        ({ lat, lon, display_name } = geocodeResult);
    }

    if (!lat || !lon) {
        alert("Unable to get coordinates for the specified location.");
        return;
    }

    // Fetch weather data from the backend
    try {
        const weatherResponse = await fetch(`https://weathersense-be.onrender.com/weather?lat=${lat}&lon=${lon}`);
        if (!weatherResponse.ok) {
            throw new Error('Failed to fetch weather data.');
        }

        const weatherData = await weatherResponse.json();

        if (weatherData.error) {
            alert(`Error: ${weatherData.error}`);
        } else {
            // Render the response to the frontend
            const resultDiv = document.getElementById('remarks-text');
            resultDiv.innerHTML = `
                <p><strong>Remark:</strong> ${weatherData.remark}</p>
                <p><strong>Date:</strong> ${weatherData.date || 'N/A'}</p>
                <p><strong>Cloud Cover:</strong> ${weatherData.clouds !== undefined ? weatherData.clouds + '%' : 'N/A'}</p>
            `;
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while fetching the weather data.');
    }
});

// Geocoding function
async function geocodeLocation(location) {
    const apiUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&addressdetails=1`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        if (data.length === 0) {
            throw new Error('No results found');
        }

        const { lat, lon, display_name } = data[0];
        return { lat, lon, display_name };
    } catch (error) {
        console.error(error.message);
        return { error: error.message };
    }
}



// Form Data Update

// document.getElementById("apply-details").addEventListener("click", async function (event) {
//     event.preventDefault(); // Prevent the default form submission

//     const taskCategory = document.getElementById("task-category").value;
//     const taskTime = document.getElementById("time").value;
//     const taskLocationInput = document.getElementById('task-location');
//     const suggestionBox = document.getElementById('suggestion-box');
//     const startDate = document.getElementById('start-date');
//     const starrTime = document.getElementById('start-time');
//     const endDate = document.getElementById('end-date');
//     const endTime = document.getElementById('end-time');
//     let lat, lon, display_name;

//     const location = taskLocationInput.value.trim();
//     if (!location) {
//         alert('Please enter a location.');
//         return;
//     }

//     const geocodeResult = await geocodeLocation(location);

//     if (geocodeResult.error) {
//         console.log(`Error: ${geocodeResult.error}`);
//     } else {
//         ({ lat, lon, display_name } = geocodeResult);
//         // console.log(`results: lat: ${lat}, lon: ${lon}, name: ${display_name} ********************`);
//     }

//     // Prepare the data to send
//     const formData = {
//         location: {'lat': lat, 'lon': lon},
//         taskCat: taskCategory,
//         taskTime: taskTime
//     };

//     // Use Fetch API to send data to the Flask backend
//     fetch("http://127.0.0.1:5000/create", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify(formData)
//     })
//         .then(response => response.json())
//         .then(data => {
//             console.log('Success:', data);
//             alert('Form submitted successfully!');
//         })
//         .catch((error) => {
//             console.error('Error:', error);
//             alert('There was an error submitting the form');
//         });
// });

// // Geocoding function
// async function geocodeLocation(location) {
//     const apiUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&addressdetails=1`;

//     try {
//         const response = await fetch(apiUrl);
//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }

//         const data = await response.json();
//         if (data.length === 0) {
//             throw new Error('No results found');
//         }

//         const { lat, lon, display_name } = data[0];
//         return { lat, lon, display_name };
//     } catch (error) {
//         console.error(error.message);
//         return { error: error.message };
//     }
// }

// // Add input event listener for suggestions
// document.getElementById('task-location').addEventListener('input', async function () {
//     const input = this.value.trim();
//     const suggestionBox = document.getElementById('suggestion-box');

//     // Clear previous suggestions
//     suggestionBox.innerHTML = '';

//     if (input.length < 3) return; // Only fetch suggestions for 3 or more characters

//     const apiUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(input)}&format=json&addressdetails=1`;

//     try {
//         const response = await fetch(apiUrl);
//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }

//         const data = await response.json();

//         data.forEach(item => {
//             const suggestionItem = document.createElement('div');
//             suggestionItem.textContent = item.display_name;
//             suggestionItem.classList.add('suggestion-item');

//             // Click event to set the selected suggestion
//             suggestionItem.addEventListener('click', () => {
//                 document.getElementById('task-location').value = item.display_name;
//                 suggestionBox.innerHTML = ''; // Clear suggestions
//             });

//             suggestionBox.appendChild(suggestionItem);
//         });
//     } catch (error) {
//         console.error('Error fetching suggestions:', error);
//     }
// });
