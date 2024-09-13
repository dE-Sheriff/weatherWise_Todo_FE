// Task title input handler - Enable category selection after title length >= 10
document.getElementById('task-title').addEventListener('input', function () {
	const title = this.value;
	const categorySelect = document.getElementById('task-category');
	if (title.length >= 10) {
		categorySelect.disabled = false;
	} else {
		categorySelect.disabled = true;
	}
});

// Suggestion checkbox handler - Enable suggestion period dropdown
document.getElementById('auto-suggest').addEventListener('change', function () {
	const suggestionPeriod = document.getElementById('suggestion-period');
	suggestionPeriod.disabled = !this.checked;
});

// Document ready function
document.getElementById('task-title').addEventListener('input', function () {
	const title = this.value;
	const categorySelect = document.getElementById('task-category');
	if (title.length >= 10) {
		categorySelect.disabled = false;
	} else {
		categorySelect.disabled = true;
	}
});

document.getElementById('auto-suggest').addEventListener('change', function () {
	const suggestionPeriod = document.getElementById('suggestion-period');
	suggestionPeriod.disabled = !this.checked;
});

document.addEventListener('DOMContentLoaded', function () {
	const calendarEl = document.getElementById('calendar');
	const startDateInput = document.getElementById('start-date');
	const endDateInput = document.getElementById('end-date');

	// Initialize the calendar
	const calendar = new FullCalendar.Calendar(calendarEl, {
		initialView: 'dayGridMonth',
		headerToolbar: {
			left: 'prev,next today',
			center: 'title',
			right: 'dayGridMonth,timeGridWeek,timeGridDay'
		},
		editable: true,
		selectable: true,
		dateClick: function (info) {
			handleDateSelection(info.dateStr);
		},
		events: [
			// Example events; replace with dynamic data if needed
			{ title: 'Meeting', start: '2024-09-10T10:00:00' },
			{ title: 'Lunch', start: '2024-09-12T12:00:00' }
		]
	});

	// Render the calendar
	calendar.render();

	// Handle date selection logic
	function handleDateSelection(dateStr) {
		if (!startDateInput.value) {
			startDateInput.value = dateStr;
			clearHighlights(); // Clear previous highlights
			highlightDate(dateStr, dateStr); // Highlight the start date
		} else if (!endDateInput.value) {
			endDateInput.value = dateStr;
			highlightDate(startDateInput.value, dateStr); // Highlight the range from start to end date
		} else {
			// Reset and start over
			startDateInput.value = dateStr;
			endDateInput.value = '';
			clearHighlights();
			highlightDate(dateStr, dateStr);
		}
	}

	// Highlight selected date range in the calendar
	function highlightDate(start, end) {
		let startDate = new Date(start);
		let endDate = new Date(end);
		let currentDate = startDate;

		while (currentDate <= endDate) {
			calendar.addEvent({
				start: currentDate.toISOString().split('T')[0], // Format date as YYYY-MM-DD
				allDay: true,
				display: 'background',
				backgroundColor: 'red' // Customize highlight color
			});
			currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
		}
	}

	// Clear date highlights
	function clearHighlights() {
		calendar.getEvents().forEach(event => {
			if (event.display === 'background') {
				event.remove();
			}
		});
	}

	// Fetch user's geolocation
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
	} else {
		alert('Geolocation is not supported by this browser.');
	}

	// Success callback for geolocation
	function successCallback(position) {
		const lat = position.coords.latitude;
		const lon = position.coords.longitude;

		// Call the weather API with user's lat and lon
		fetchWeatherData(lat, lon);
	}

	// Error callback for geolocation
	function errorCallback(error) {
		alert('Unable to retrieve your location.');
	}

	// Fetch weather data using OpenWeather API
	function fetchWeatherData(lat, lon) {
		const apiKey = 'fccb7140ec9703e9de31a771d85387e3'; // Replace with your OpenWeather API key
		const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

		fetch(url)
			.then(response => response.json())
			.then(data => {
				console.log('Weather data:', data);
				// You can now use the weather data to influence task suggestions or events
			})
			.catch(error => {
				console.error('Error fetching weather data:', error);
			});
	}
	function initMap() {
		// Try to get user's current location
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				position => {
					const userLocation = {
						lat: position.coords.latitude,
						lng: position.coords.longitude
					};
					map = new google.maps.Map(document.getElementById('map'), {
						center: userLocation,
						zoom: 12
					});

					// Marker for user's location
					marker = new google.maps.Marker({
						position: userLocation,
						map: map,
						title: 'Your Location'
					});
				},
				() => {
					// Fallback if geolocation fails
					handleLocationError(true);
				}
			);
		} else {
			// Browser doesn't support Geolocation
			handleLocationError(false);
		}
	}
});

// Function to update the map with task location
document.getElementById('task-location').addEventListener('input', function () {
	const address = this.value;

	const geocoder = new google.maps.Geocoder();
	geocoder.geocode({ address: address }, function (results, status) {
		if (status === 'OK') {
			const taskLocation = results[0].geometry.location;
			map.setCenter(taskLocation);

			// Move marker to new task location
			if (marker) {
				marker.setPosition(taskLocation);
			} else {
				marker = new google.maps.Marker({
					position: taskLocation,
					map: map,
					title: 'Task Location'
				});
			}
		} else {
			alert('Geocode was not successful for the following reason: ' + status);
		}
	});
});

function handleLocationError(browserHasGeolocation) {
	const defaultLocation = { lat: -34.397, lng: 150.644 }; // Default location (fallback)
	map = new google.maps.Map(document.getElementById('map'), {
		center: defaultLocation,
		zoom: 12
	});
}
