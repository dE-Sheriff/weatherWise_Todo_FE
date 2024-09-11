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
			// Sample events data, replace with your own
			{ title: 'Meeting', start: '2024-09-10T10:00:00' },
			{ title: 'Lunch', start: '2024-09-12T12:00:00' }
		]
	});

	calendar.render();

	function handleDateSelection(dateStr) {
		if (!startDateInput.value) {
			startDateInput.value = dateStr;
			clearHighlights(); // Clear previous highlights
			highlightDate(dateStr, dateStr); // Highlight only the start date
		} else if (!endDateInput.value) {
			endDateInput.value = dateStr;
			highlightDate(startDateInput.value, dateStr); // Highlight the range from start to end date
		} else {
			// Reset and start again
			startDateInput.value = dateStr;
			endDateInput.value = '';
			clearHighlights();
			highlightDate(dateStr, dateStr);
		}
	}

	function highlightDate(start, end) {
		let startDate = new Date(start);
		let endDate = new Date(end);
		let currentDate = startDate;

		while (currentDate <= endDate) {
			calendar.addEvent({
				start: currentDate.toISOString().split('T')[0], // Format date as YYYY-MM-DD
				allDay: true,
				display: 'background',
				backgroundColor: 'red' // Change color as needed
			});
			currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
		}
	}

	function clearHighlights() {
		calendar.getEvents().forEach(event => {
			if (event.display === 'background') {
				event.remove();
			}
		});
	}
});
