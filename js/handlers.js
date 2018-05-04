/*
 * Set dropdown menu text to title
 */
function dropdownItemSelected(title) {

	//Set terminal fb page link as needed
	var link = 'https://facebook.com/flyspacea'
	var terminalIndex = $.inArray(title, presetLocations)
	terminalFBPageTitle.text('Fly Space-A')
	if (terminalIndex > -1) {
		if (presetFBIds[terminalIndex].length > 0) {
			link = 'https://facebook.com/' + presetFBIds[terminalIndex]
			terminalFBPageTitle.text('Terminal')
		}
	}
	terminalFBPageBtn.off('click');
	terminalFBPageBtn.on('click', function() {
		window.open(link,'_blank');
	});

	/*
	//Set dropdown displayed title if this method was called programmatically
	if (locationDropdownBtn.val() != title) {
		setDropdownTitle(title);
		return //stop this function. setDropdownTitle() will trigger this function again
	}
	*/


	//Check if title is special case for latest flights option
	//Set title var appropriatly for REST call
	if (title == kLatestFlights)
		title = '';

	//Disable all toggle buttons. 
	setDirectionToggleBtnsState(false);

	//Reenable toggle buttons individually
	enableDirectionToggleBtnsBasedOnLocation(title)
	arrivalToggleButtonLabel.button('toggle');
	//selectedFlightDirection = FlightDirectionEnum.arrival;

	if (title.length == 0 || $.inArray(title, presetLocations) != -1){
		departureToggleButtonLabel.button('toggle');
		//selectedFlightDirection = FlightDirectionEnum.departure;

		//Trigger direction toggle to update flights view
		directionToggleSelected(FlightDirectionEnum.departure, title);
	} else {
		directionToggleSelected(FlightDirectionEnum.arrival, title);
	}

	//Set url hash to location for user sharing
	location.hash = title
}

/*
 * Get flights list when direction toggle clicked.
 */
function directionToggleSelected(direction, location) {
	var daysDuration = daysLookupRange;
	//Get start of local date before today
	var now = moment().startOf('day'); 

	//If location is '' for latest flights, lookup only two days into future
	if (location.length == 0) {
		daysDuration = 2;
		now = moment();
	}

	
	updateFlightsView(location, direction, now, daysDuration)
}