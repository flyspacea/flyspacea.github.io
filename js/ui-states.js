var locationDropdownBtn;
var locationDropdownMenuHeader;
var directionToggleBtns;
var arrivalToggleButtonLabel;
var departureToggleButtonLabel;

var progressBarRow;
var progressBarText;
var flightsViewTable;
var flightsViewTableHead;
var flightsViewTableBody;

function setUIVariables() {
	locationDropdownBtn = $("#location-dropdown-btn")
	locationDropdownMenuHeader = $("#location-dropdown-menu-header")
	directionToggleBtns = $('#direction-toggle-btn-group > label')
	progressBarRow = $("#progress-bar-row")
	progressBarText = $("#progress-bar-row>div>div>div>span")
	flightsViewTable = $("#flights-view-table")
	flightsViewTableHead = $("#flights-view-table-head")
	flightsViewTableBody = $("#flights-view-table-body")

	arrivalToggleButtonLabel = $("#arrivals-label")
	departureToggleButtonLabel = $("#departures-label")

	addLocationDropdownTooltip()
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

function addLocationDropdownTooltip() {
	locationDropdownMenuHeader.attr("data-toggle", "tooltip").attr("title", "Only listing terminals with flights within 72 hours.").tooltip({
		trigger: 'hover'
	})
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

//Enable toggle buttons for location
function enableDirectionToggleBtnsBasedOnLocation(location) {
	if (location.length == 0)
		return

	//Reenable toggle buttons individually
	arrivalToggleButtonLabel.removeClass('disabled');
	//selectedFlightDirection = FlightDirectionEnum.arrival;

	if ($.inArray(location, presetLocations) != -1){
		departureToggleButtonLabel.removeClass('disabled');
	}
}

function setFlightsViewTableState(enabled) {
	if (enabled) {
		flightsViewTable.removeClass("disabled")
	} else {
		flightsViewTable.addClass("disabled")
	}
}

//Show progress bar with text
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

//Hide progress bar and clear text
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
		function(index, element) {
			element.remove()
		}
	);

	locations.forEach(function(element) {
		$("#location-dropdown-btn-group > .dropdown-menu").append(
			$("<a/>").addClass("dropdown-item" + (presetLocations.indexOf(element) > 0 ? " gray-tint" : "")).attr("href", "#").text(element)
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

	function createFlightRow(flight, rc, location) {
		//Create flight row
		var flightRow = $("<tr/>").addClass("")

		//Add rollcall column
		flightRow.append(
			$("<th/>").addClass("").text(rc.format('HHmm'))
		)

		//Add Origin column IF locatin is blank meaning latest flights view
		if (location.length == 0) {
			flightRow.append(
				$("<td/>").addClass("").text(flight['origin'])
			)
		}

		//Add location column
		flightRow.append(
			$("<td/>").addClass("").text(direction == FlightDirectionEnum.departure ? flight['destination'] : flight['origin'])
		)

		//Add seats column
		var seatText = flight['seatCount'].toString();
		if (flight['seatType'].toUpperCase() == 'T')
			seatText += " Tentative";
		else if (flight['seatType'].toUpperCase() == 'F')
			seatText += " Firm";
		else if (flight['seatType'].toUpperCase() == 'SP')
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

		return flightRow;
	}

	//Remove past flights view data rows
	flightsViewTableHead.empty()
	flightsViewTableBody.empty()

	//Create header row
	var headerRow = $("<tr/>").addClass("")
	headerRow.append(
		$("<th/>").attr("scope", "col").text("Roll Call"),
		location.length == 0 ? $("<th/>").attr("scope", "col").text("Origin") : $("<meta/>"), //only insert origin column if location is blank which indicates latest flights overview
		$("<th/>").attr("scope", "col").text(direction == FlightDirectionEnum.departure ? "Destination" : "Origin"),
		$("<th/>").attr("scope", "col").text("Seats"),
		$("<th/>").attr("scope", "col").text("\u2026") //horizontal ellipsis
	)

	//Add tooltip explaining origin roll call times for arrival view
	if (direction == FlightDirectionEnum.arrival) {
		headerRow.children(":first-child").text("Roll Call ")
		headerRow.children(":first-child").append(
			$("<span/>").addClass("origin-local-header-note").text("\u261b Origin Local Time").attr("data-toggle", "tooltip").attr("title", "Times displayed in origins' timezones and listed in chronological order.").tooltip()
		)
	}
	flightsViewTableHead.append(headerRow);


	var numCols = $("#flights-view-table-head th").length

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
			if (flights[f]['unknownRollCallDate']) {
				f++
				continue;
			}

			//Lookup origin airport location TZ offset
			var airportTZTitle = presetTZTitles[presetLocations.indexOf(flights[f]['origin'])]
			var rc = moment(flights[f]['rollCall'], "YYYY-MM-DDTHH:mm:ssZ").tz(airportTZTitle)
			var tomorrowDate = startDate.clone()
			tomorrowDate.add(1, 'days')

			//Check if flight is for this date range
			if (rc.isBetween(startDate, tomorrowDate, null, '[)')) {
				//Append created row to DOM
				flightsViewTableBody.append(createFlightRow(flights[f], rc, location));

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

		if (flightsFoundForDate == false) {
			var flightRow = $("<tr/>").addClass("")
			flightRow.append(
				$("<td/>").addClass("no-flights").text('No flights found.')
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

	//Now list partial match flights
	f = 0;
	//Determine whether to append partial match table row header
	var partialMatchFound = false;
	while (flights != null && f < flights.length) {
		if (flights[f]['unknownRollCallDate']) {
			if (!partialMatchFound) {
				//Create date row
				var dateRow = $("<tr/>").addClass("flights-view-date-table-row")
				dateRow.append(
					$("<th/>").addClass("").text("Possible flights \u26a0").attr("data-toggle", "tooltip").attr("data-placement", "right").attr("title", "Flights that were found with a low confidence date and time.").tooltip()
				)

				//Add blank <td> row col elements to match number of columns in table
				for (i = 1; i < numCols; i++) {
					dateRow.append(
						$("<td/>")
					)
				}

				//Append created row to DOM
				flightsViewTableBody.append(dateRow);
			}

			partialMatchFound = true;

			//Lookup origin airport location TZ offset
			var airportTZTitle = presetTZTitles[presetLocations.indexOf(flights[f]['origin'])]
			var rc = moment(flights[f]['rollCall'], "YYYY-MM-DDTHH:mm:ssZ").tz(airportTZTitle)

			//Append created row to DOM
			flightsViewTableBody.append(createFlightRow(flights[f], rc, location));

			//Mark counter as found date
			flightsFoundForDate = true;
			f++
		} else {
			f++
			continue;
		}
	}
}