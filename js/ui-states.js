var locationDropdownBtn;
var directionToggleBtns;
var arrivalToggleButtonLabel;
var departureToggleButtonLabel;

var progressBarRow; 
var progressBarText;
var flightsViewTable;
var flightsViewTableBody;

function setUIVariables() {
	locationDropdownBtn = $("#location-dropdown-btn")
	directionToggleBtns = $('#direction-toggle-btn-group > label')
	progressBarRow = $("#progress-bar-row")
	progressBarText = $("#progress-bar-row>div>div>div>span")
	flightsViewTable = $("#flights-view-table")
	flightsViewTableBody = $("#flights-view-table-body")

	arrivalToggleButtonLabel = $("#arrivals-label")
	departureToggleButtonLabel = $("#departures-label")

	setupToggleHandlers()
}

function setupToggleHandlers() {
	departureToggleButtonLabel.off('click');
	arrivalToggleButtonLabel.off('click');

	departureToggleButtonLabel.on('click', function(event) {
		if (!departureToggleButtonLabel.hasClass('disabled'))
			directionToggleSelected(FlightDirectionEnum.departure);
	});
	arrivalToggleButtonLabel.on('click', function(event) {
		if (!arrivalToggleButtonLabel.hasClass('disabled'))
			directionToggleSelected(FlightDirectionEnum.arrival);
	});
	
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
	//Remove past location dropdown menu items
	$("#location-dropdown-btn-group > .dropdown-menu  > a").each(
		function(index, element){
			element.remove()
		}
	);

	locations.forEach(function(element) {
		$("#location-dropdown-btn-group > .dropdown-menu").append(
			$("<a/>").addClass("dropdown-item").attr("href", "#").text(element)
			.on('click', function(event) {
				dropdownItemSelected(event.target.text)
			})
		)
	});
}

/*
 * Set flights view table rows to flights array data.
 * Assume flights array is ordered by date.
 * startDate must be start of day. startDate is mutated in this method.
 */
function setFlightsViewData(flights, location, direction, startDate, durationDays) {
	//Remove past flights view data rows
	flightsViewTableBody.empty()

	var numCols = $("#flights-view-table thead th").length

	//Default to UTC time if selected airport has unknown TZ
	var selectedAirportTZTitle;
	var selectedAirportIndex = presetLocations.indexOf(location)
	if (selectedAirportIndex > 0) {
		selectedAirportTZTitle = presetTZTitles[selectedAirportIndex]
	} else {
		selectedAirportTZTitle = "Etc/UTC";
	}
	startDate.tz(selectedAirportTZTitle).startOf('day');

	var f = 0;
	for (d = 0; d < durationDays; d++) {
		//Create date row
		var dateRow = $("<tr/>").addClass("flights-view-date-table-row")
		dateRow.append(
			$("<th/>").addClass("").text(startDate.format('DD MMM YYYY'))
		)

		//Add blank <td> row col elements to match number of columns in table
		for (i = 1; i < numCols; i++) {
			dateRow.append(
				$("<td/>")
			)
		}

		//Append created row to DOM
		flightsViewTableBody.append(dateRow);

		//Counter to check to insert "no flights found" row
		var flightsFoundForDate = false;
		
		//Add rows for flights for that 24hr day
		while (flights != null && f < flights.length) {
			//Lookup origin airport location TZ offset
			var airportTZTitle = presetTZTitles[presetLocations.indexOf(flights[f]['origin'])]

			var rc = moment(flights[f]['rollCall'], "YYYY-MM-DDTHH:mm:ssZ").tz(airportTZTitle)
			var tomorrowDate = startDate.clone()
			tomorrowDate.add(1, 'days')

			//Check if flight is for this date range
			if (rc.isBetween(startDate, tomorrowDate, null, '[)')) {
				//Create flight row
				var flightRow = $("<tr/>").addClass("")

				//Add rollcall column
				flightRow.append(
					$("<th/>").addClass("").text(rc.format('HHmm'))
				)

				//Add location column
				flightRow.append(
					$("<td/>").addClass("").text(direction == FlightDirectionEnum.departure ? flights[f]['destination'] : flights[f]['origin'])
				)

				//Add seats column
				var seatText = flights[f]['seatCount'].toString();
				if (flights[f]['seatType'] == 'T')
					seatText += " Tentative";
				else if (flights[f]['seatType'] == 'F')
					seatText += " Firm";
				else if (flights[f]['seatType'] == 'SP')
					seatText = "Pending";
				else
					seatText = "N/A";

				flightRow.append(
					$("<td/>").addClass("").text(seatText)
				)

				//Add source column
				flightRow.append(
					$("<td/>").addClass("").text("")
				)

				//Append created row to DOM
				flightsViewTableBody.append(flightRow);

				//Mark counter as found date
				flightsFoundForDate = true;

				//Increment flights array counter
				f++;
			} else {
				//If flight not in current loop date, break and move onto next date.
				//Assume flights in chronological order
				break;
			}
		}

		console.log(flightsFoundForDate)

		if (flightsFoundForDate == false) {
			var flightRow = $("<tr/>").addClass("")
			flightRow.append(
				$("<td/>").addClass("").text('No flights found.')
			)

			//Add blank <td> row col elements to match number of columns in table
			for (i = 1; i < numCols; i++) {
				flightRow.append(
					$("<td/>")
				)
			}

			//Append created row to DOM
			flightsViewTableBody.append(flightRow);
		}

		//Step to next day for loop
		startDate.add(1, 'days');
	}
}