/*
 * Set dropdown menu text to title
 */
function dropdownItemSelected(title) {
	setDropdownTitle(title);

	setDirectionToggleBtnsState(false);
	if ($.inArray(title, presetLocations)){
		$("#departures-label").removeClass('disabled');
	}

	$("#arrivals-label").removeClass('disabled');
}