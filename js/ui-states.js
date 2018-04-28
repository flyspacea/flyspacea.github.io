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
	locationDropdownBtn.addClass("disabled")
	directionToggleBtns.addClass("disabled")
	if (progressBarRow.css('display') != 'none') //Only animate hide if progress bar is not hidden
		progressBarRow.slideUp(400)
	flightsViewTable.addClass("disabled")
}

function showProgressBarWithText(text) {
	if (progressBarRow.css('display') == 'none') 
		progressBarRow.slideDown(400)

	if (text == null) {
		progressBarText.text("")
	} else {
		progressBarText.text(text)
	}
}

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