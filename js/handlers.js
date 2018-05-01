/*
 * Set dropdown menu text to title
 */
function dropdownItemSelected(title) {
	selectedLocation = title;

	setDropdownTitle(title);

	//Disable all toggle buttons. 
	setDirectionToggleBtnsState(false);

	//Reenable toggle buttons individually
	enableDirectionToggleBtnsBasedOnLocation(title)
	arrivalToggleButtonLabel.button('toggle');
	//selectedFlightDirection = FlightDirectionEnum.arrival;

	if ($.inArray(title, presetLocations) != -1){
		departureToggleButtonLabel.button('toggle');
		//selectedFlightDirection = FlightDirectionEnum.departure;

		//Trigger direction toggle to update flights view
		directionToggleSelected(FlightDirectionEnum.departure);
	} else {
		directionToggleSelected(FlightDirectionEnum.arrival);
	}
}

/*
 * Get flights list when direction toggle clicked.
 */
function directionToggleSelected(direction) {
	console.log("toggled")
	//Get start of local date before today
	now = moment().startOf('day'); 
	/*
	var now = new Date();
	now.setDate(now.getDate() - 1)
	now.setHours(0, 0, 0, 0);
	*/

	updateFlightsView(selectedLocation, direction, now, daysLookupRange)
}