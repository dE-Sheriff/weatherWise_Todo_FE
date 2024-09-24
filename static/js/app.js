document.addEventListener('DOMContentLoaded', function () {
	const taskTitleInput = document.getElementById('todo-title');
	const categorySelect = document.getElementById('task-category');
	const suggestionCheckbox = document.getElementById('auto-suggest');
	const suggestionPeriod = document.getElementById('suggestion-period');
	const calendarEl = document.getElementById('calendar');
	const startDateInput = document.getElementById('start-date');
	const endDateInput = document.getElementById('end-date');
	const taskLocationInput = document.getElementById('task-location');
	const locationSuggestions = document.getElementById('location-suggestions');
	const remarksElement = document.querySelector('.remarks'); // Adjusted to select by class

	// Initialize Leaflet map
	let map;
	let marker;

	// Initialize the map
	function initLeafletMap(lat, lon) {
		if (!map) {
			// Initialize the map only if it hasn't been initialized
			map = L.map('map').setView([51.505, -0.09], 13);
			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			}).addTo(map);

			marker = L.marker([lat, lon]).addTo(map)
				.bindPopup('Your Location')
				.openPopup();
		}
	}

	// Update Leaflet map with new coordinates
	function updateLeafletMap(lat, lon) {
		if (map) {
			// If map already exists, update its view
			map.setView([lat, lon], 12);
			if (marker) {
				marker.setLatLng([lat, lon]);
			} else {
				marker = L.marker([lat, lon]).addTo(map);
			}
			marker.bindPopup('Task Location').openPopup();
		} else {
			// If map doesn't exist, initialize it
			initLeafletMap(lat, lon);
		}
	}

	// Enable category selection after title length >= 10
	taskTitleInput.addEventListener('input', function () {
		const titleLength = this.value.length;
		if (titleLength >= 10) {
			categorySelect.disabled = false;
		} else {
			categorySelect.disabled = true;
		}
	});

	// Disable category by default
	categorySelect.disabled = true;

	// Enable suggestion period dropdown
	suggestionCheckbox.addEventListener('change', function () {
		suggestionPeriod.disabled = !this.checked;
	});

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

	calendar.render();

	// Handle date selection logic
	function handleDateSelection(dateStr) {
		if (!startDateInput.value) {
			startDateInput.value = dateStr;
			clearHighlights();
			highlightDate(dateStr, dateStr);
		} else if (!endDateInput.value) {
			endDateInput.value = dateStr;
			highlightDate(startDateInput.value, dateStr);
		} else {
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
				start: currentDate.toISOString().split('T')[0],
				allDay: true,
				display: 'background',
				backgroundColor: 'red'
			});
			currentDate.setDate(currentDate.getDate() + 1);
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

		// Initialize the map with user's location
		initLeafletMap(lat, lon);

	}

	// Error callback for geolocation
	function errorCallback(error) {
		alert('Unable to retrieve your location.');
		updateRemarks('Unable to retrieve your location.');
	}

	// Fetch weather data using OpenWeather API
	function fetchWeatherData(lat, lon) {
		const apiKey = 'fccb7140ec9703e9de31a771d85387e3'; // Replace with your OpenWeather API key
		const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

		fetch(url)
			.then(response => response.json())
			.then(data => {
				console.log('Weather data:', data);
				const remarks = generateRemarks(data); // Process the data to create remarks
				updateRemarks(remarks); // Update the remarks section
			})
			.catch(error => {
				console.error('Error fetching weather data:', error);
				updateRemarks('Error fetching weather data.');
			});
	}

	// Generate remarks based on weather data
	function generateRemarks(data) {
		// Example logic to generate remarks based on weather data
		if (data.list && data.list.length > 0) {
			const weather = data.list[0].weather[0].description;
			return `The weather for the selected period is ${weather}.`;
		}
		return 'No weather data available for the selected period.';
	}

	// Update the remarks section
	function updateRemarks(remarks) {
		if (remarksElement) {
			remarksElement.textContent = remarks; // or .innerHTML if the content is HTML
		}
	}

	// Send latitude and longitude to the server
	function sendLocationToServer(latitude, longitude) {
		fetch('/api/update-location', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				lat: latitude,
				lon: longitude
			})
		})
			.then(response => response.json())
			.then(data => {
				console.log('Location data sent successfully:', data);
			})
			.catch((error) => {
				console.error('Error sending location data:', error);
			});
	}

	// Fetch location suggestions
	function fetchLocationSuggestions(query) {
		fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`)
			.then(response => response.json())
			.then(data => {
				locationSuggestions.innerHTML = ''; // Clear previous suggestions
				data.forEach(item => {
					const li = document.createElement('li');
					li.textContent = item.display_name;
					li.dataset.lat = item.lat;
					li.dataset.lon = item.lon;
					li.addEventListener('click', function () {
						const lat = this.dataset.lat;
						const lon = this.dataset.lon;
						taskLocationInput.value = this.textContent;
						updateLeafletMap(lat, lon);
						sendLocationToServer(lat, lon);
						locationSuggestions.innerHTML = ''; // Clear suggestions
					});
					locationSuggestions.appendChild(li);
				});
			})
			.catch(error => {
				console.error('Error fetching location suggestions:', error);
			});
	}

	// Handle input changes and fetch suggestions
	taskLocationInput.addEventListener('input', function () {
		const query = this.value;
		if (query.length > 2) { // Fetch suggestions only if query is long enough
			fetchLocationSuggestions(query);
		} else {
			locationSuggestions.innerHTML = ''; // Clear suggestions if query is too short
		}
	});
});
