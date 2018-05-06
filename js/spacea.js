var backendBaseURL = (location.protocol == "http:" ? "http:" : "https:") + "//spacea.herokuapp.com"
var backendDistinctLocationsHandler = '/locations';
var backendFlightsHandler = '/flights';
var backendSubmitPhotoReportsHandler = '/submitPhotoReport';

var presetLocationsPath = 'assets/tz_export.json';
var presetLocations = []; //Preset location titles
var presetTZTitles = []; //Preset location TZ titles
var presetKeywords = []; //Preset location keywords
var presetFBIds = []; //Preset location FB ids

var selectedLocation;
//var selectedFlightDirection;
var kLatestFlights = "latestFlights"

var daysLookupRange = 4;

var FlightDirectionEnum = {
	departure : 1,
	arrival : 2
}

$(document).ready(function() {
	updateLocationDropdown();
});

//Check location hash to load any locations from sharing
function checkLocationHash() {
	try {
		var hashSplit = decodeURI(location.hash).split('#')
		if (hashSplit.length < 2)
			return false
		var hash = hashSplit[1]
		console.log(hash)
		if (hash.length > 0) { //Check if location hash exists
			if ($.inArray(hash, presetLocations) != -1){ //Check if location is preset location
				setDropdownTitle(hash);
				return true
			} 
		}
	} catch (e) {
		console.log('invalid URI in location.hash ' + location.hash)
	}
	return false
}

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
				presetKeywords.push(element['keywords']);
				presetFBIds.push(element['id']);
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
							if (!checkLocationHash()) {
								//Show some flights for latest flights view
								now = moment(); 
								//updateFlightsView('', FlightDirectionEnum.departure, now, 2)
								setDropdownTitle(kLatestFlights);
							}

							//Start flashing tooltip after setting the initial dropdown value
							flashLocationDropdownTooltip(true);
							
							break;
						default:
							showErrorRetry('Invalid data from server.')
					}
				},
				function(jqXHR, textStatus) { //completion handler
					console.log('completion distinct locations');
				}
			);
		},
		function(jqXHR, textStatus) { //completion handler
			console.log('completion preset locations');
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
					enableDirectionToggleBtnsBasedOnLocation(location)
					setFlightsViewTableState(true);
					break;
				default:
					showErrorRetry('Invalid data from server.')
			}
		},
		function(jqXHR, textStatus) { //completion handler
			console.log('completion');
			console.log(locationDropdownBtn.val())
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

function submitPhotoReport(location, photoSource, comment, errorHandler, successHandler, completionHandler) {
	$.ajax({
		url: backendBaseURL + backendSubmitPhotoReportsHandler,
		type: 'POST',
		data: {
			'location': location,
			'photoSource': photoSource,
			'comment': comment
		},
		dataType: 'json', //auto JSON.parse()
		cache: false,
		success: successHandler,
		error: errorHandler,
		complete: completionHandler
	});
}