var backendBaseURL = "https://spacea.herokuapp.com"
var backendDistinctLocationsHandler = '/locations';
var backendFlightsHandler = '/flights';

var presetLocationsPath = 'assets/tz_export.json';
var presetLocations = []; //Preset location titles
var presetTZTitles = []; //Preset location TZ titles

var selectedLocation;
//var selectedFlightDirection;

var daysLookupRange = 4;

var FlightDirectionEnum = {
	departure : 1,
	arrival : 2
}

$(document).ready(function() {
	updateLocationDropdown();
});

function updateError(title, callback) {
	showProgressBarWithText(title);
	$('#loading-bar').addClass('bg-danger');
	window.setTimeout(function() {
		$('#loading-bar').removeClass('bg-danger');
	}, 5000);
	window.setTimeout(callback, 5000);
	console.log("update")
}

function updateLocationDropdown() {
	disableAllUI();
	showProgressBarWithText('Getting stored locations.');

	function showErrorRetry(errorText) {
		updateError("Couldn't get location list. Status: " + errorText + " Retrying...", updateLocationDropdown)
	}

	getPresetLocations(
		function(jqXHR, textStatus, errorThrown) { //error handler
			showErrorRetry(textStatus + ' ' + errorThrown)
		},
		function(data, textStatus, jqXHR) { //success handler
			data.forEach(function(element) {
				presetLocations.push(element['title']);
				presetTZTitles.push(element['tzTitle']);
			});

			getDistinctLocations(moment().startOf('day'), daysLookupRange,
				function(jqXHR, textStatus, errorThrown) { //error handler
					showErrorRetry(textStatus + ' ' + errorThrown)
				},
				function(data, textStatus, jqXHR) { //success handler
					console.log(data);
					switch(data['status']) {
						case 0:
							if ('locations' in data) {
								setLocationsInDropdown(data['locations']);
							} else {
								console.log('no locations flights on server');
								showErrorRetry('Invalid data from server. Server Status ' + data['status'])
							}

							hideProgressBar();
							setLocationDropdownBtnState(true);
							setDropdownTitle('Latest Flights');
							break;
						default:
							showErrorRetry('Invalid data from server.')
					}
				},
				function(jqXHR, textStatus) { //completion handler
					console.log('completion');
				}
			);
		},
		function(jqXHR, textStatus) { //completion handler
			console.log('completion');
		}
	);
}

function getPresetLocations(errorHandler, successHandler, completionHandler) {
	$.ajax({
		url: presetLocationsPath,
		type: 'GET',
		dataType: 'json', //auto JSON.parse()
		cache: false,
		success: successHandler,
		error: errorHandler,
		complete: completionHandler
	});
}

function getDistinctLocations(startDate, durationDays, errorHandler, successHandler, completionHandler) {
	$.ajax({
		url: backendBaseURL + backendDistinctLocationsHandler,
		type: 'GET',
		data: {
			//toISOString() auto converts to zero UTC offset
			'startTime': startDate.toISOString().split('.')[0]+"Z",
			'durationDays': durationDays
		},
		dataType: 'json', //auto JSON.parse()
		cache: false,
		success: successHandler,
		error: errorHandler,
		complete: completionHandler
	});
}

//Start point for updating flights view.
//Start date is computer local time
function updateFlightsView(location, direction, startDate, durationDays) {
	disableAllUI();
	showProgressBarWithText('Getting flights.');

	function showErrorRetry(errorText) {
		updateError("Couldn't get flights. Status: " + errorText + " Retrying...", function() {
			updateFlightsView(location, direction, startDate, durationDays)
		});
	}

	getFlights(location, direction, startDate, durationDays,
		function(jqXHR, textStatus, errorThrown) { //error handler
			showErrorRetry(textStatus + ' ' + errorThrown)
		},
		function(data, textStatus, jqXHR) { //success handler
			console.log(data)
			switch(data['status']) {

				case 0:
					if ('flights' in data) {
						setFlightsViewData(data['flights'], location, direction, startDate, durationDays);
					} else {
						console.log('no locations flights on server');
						showErrorRetry('Invalid data from server. Server Status ' + data['status'])
					}

					hideProgressBar();
					setLocationDropdownBtnState(true);
					setDirectionToggleBtnsState(true);
					setFlightsViewTableState(true);
					break;
				default:
					showErrorRetry('Invalid data from server.')
			}
		},
		function(jqXHR, textStatus) { //completion handler
			console.log('completion');
		}
	);
}

function getFlights(location, direction, startDate, durationDays, errorHandler, successHandler, completionHandler) {
	$.ajax({
		url: backendBaseURL + backendFlightsHandler,
		type: 'POST',
		data: {
			'origin': direction == FlightDirectionEnum.departure ? location : '',
			'destination': direction == FlightDirectionEnum.arrival ? location : '',
			//toISOString() auto converts to zero UTC offset
			'startTime': startDate.toISOString().split('.')[0]+"Z",
			'durationDays': durationDays
		},
		dataType: 'json', //auto JSON.parse()
		cache: false,
		success: successHandler,
		error: errorHandler,
		complete: completionHandler
	});
}