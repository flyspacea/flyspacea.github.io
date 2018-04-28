var backendBaseURL = "http://spacea.herokuapp.com"
var backendDistinctLocationsHandler = '/locations';
var backendFlightsHandler = '/flights';

var presetLocationsPath = 'assets/terminals.json';

$(document).ready(function() {
	//disableAllUI()
	
});

function updateLocationDropdown() {

	//disableAllUI();

	getDistinctLocations(
		function(jqXHR, textStatus, errorThrown) {
			console.log(textStatus);
		},
		function(data, textStatus, jqXHR) {
			console.log(data['status']);
			switch(data['status']) {
				case 0:

				default:
					console.log(data)
			}
		},
		function() {
			console.log('completion')
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