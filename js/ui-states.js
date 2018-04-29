var locationDropdownBtn;
var directionToggleBtns;
var progressBarRow; 
var progressBarText;
var flightsViewTable;

function setUIVariables() {
	locationDropdownBtn = $("#location-dropdown-btn")
	directionToggleBtns = $('#direction-toggle-btn-group > label')
	progressBarRow = $("#progress-bar-row")
	progressBarText = $("#progress-bar-row>div>div>div>span")
	flightsViewTable = $("#flights-view-table")
}

function disableAllUI() {
	setUIVariables();

	hideProgressBar();
	setLocationDropdownBtnState(false);
	setDirectionToggleBtnsState(false);
	setFlightsViewTableState(false);
}

function setLocationDropdownBtnState(enabled) {
	if (enabled) {
		locationDropdownBtn.removeClass("disabled")
	} else {
		locationDropdownBtn.addClass("disabled")
	}
}

function setDirectionToggleBtnsState(enabled) {
	if (enabled) {
		directionToggleBtns.removeClass("disabled")
	} else {
		directionToggleBtns.addClass("disabled")
	}
}

function setFlightsViewTableState(enabled) {
	if (enabled) {
		flightsViewTable.removeClass("disabled")
	} else {
		flightsViewTable.addClass("disabled")
	}
}

function showProgressBarWithText(text) {
	if (progressBarRow.is(':animated'))
		progressBarRow.finish();

	if (progressBarRow.css('display') == 'none') 
		progressBarRow.slideDown(400)

	if (text == null) {
		progressBarText.text("")
	} else {
		progressBarText.text(text)
	}
}

function hideProgressBar() {
	if (progressBarRow.is(':animated'))
		progressBarRow.finish();

	if (progressBarRow.css('display') != 'none') 
		progressBarRow.slideUp(400, function() {
			progressBarText.text("");
		});
}

function setDropdownTitle(title) {
	$("#location-dropdown-btn > span").text(title);
}

/*
 * Set location dropdown menu options to locations array.
 * Set dropdown text click handler for each menu option.
 */
function setLocationsInDropdown(locations) {
	$("#location-dropdown-btn-group > .dropdown-menu  > a").each(
		function(index, element){
			element.remove()
		}
	);

	locations.forEach(function(element) {
		$("#location-dropdown-btn-group > .dropdown-menu").append(
			$("<a/>").addClass("dropdown-item").attr("href", "#").text(element)
			.on('click', function(event){
				console.log(event)
				dropdownItemSelected(event.target.text)
			})
		)
	});
	
}