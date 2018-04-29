var backendBaseURL = "http://spacea.herokuapp.com"
var backendDistinctLocationsHandler = '/locations';
var backendFlightsHandler = '/flights';

var presetLocationsPath = 'assets/terminals.json';
var presetLocations = [];

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
			});

			getDistinctLocations(
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

function getDistinctLocations(errorHandler, successHandler, completionHandler) {
	$.ajax({
		url: backendBaseURL + backendDistinctLocationsHandler,
		type: 'GET',
		/*
		data: {
			'editorID': editorID,
			'authToken': authToken,
			'fileUUID': fileUUID,
			'type': type,
			'typeData': typeData
		},
		*/
		dataType: 'json', //auto JSON.parse()
		cache: false,
		success: successHandler,
		error: errorHandler,
		complete: completionHandler
	});
}