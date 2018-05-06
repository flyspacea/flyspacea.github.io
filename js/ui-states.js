var locationDropdownBtn;
var flashLocationDropdownTooltipStatus = false;
var locationDropdownMenuHeader;
var directionToggleBtns;
var arrivalToggleButtonLabel;
var departureToggleButtonLabel;

var progressBarRow;
var progressBarText;
var flightsViewTable;
var flightsViewTableHead;
var flightsViewTableBody;

var photoReportModal;

var terminalFBPageBtn;
var terminalFBPageTitle;
var emailTemplateBtn;
var emailTemplateModal;

function setUIVariables() {
	locationDropdownBtn = $("#location-dropdown-btn")
	//Uncomment for bootstrap dropdown menu
	//locationDropdownMenuHeader = $("#location-dropdown-menu-header")
	directionToggleBtns = $('#direction-toggle-btn-group > label')
	progressBarRow = $("#progress-bar-row")
	progressBarText = $("#progress-bar-row>div>div>div>span")
	flightsViewTable = $("#flights-view-table")
	flightsViewTableHead = $("#flights-view-table-head")
	flightsViewTableBody = $("#flights-view-table-body")

	arrivalToggleButtonLabel = $("#arrivals-label")
	departureToggleButtonLabel = $("#departures-label")

	photoReportModal = $('#photoReportModal')

	terminalFBPageBtn = $('#terminal-facebook-page-btn')
	terminalFBPageTitle = $('#terminal-facebook-page-title')
	emailTemplateBtn = $('#email-template-btn')
	emailTemplateModal = $('#emailTemplateModal')


	//Uncomment for bootstrap dropdown menu
	//addLocationDropdownTooltip()
	setupLocationDropdownSelectHandler()
	setupToggleHandlers()
	setupPhotoReportModal()

	setEmailTemplateLinkAndModal()
}

//For bootstrap-select menu
function setupLocationDropdownSelectHandler() {
	locationDropdownBtn.off('changed.bs.select');

	locationDropdownBtn.on('changed.bs.select', function(event) {
		dropdownItemSelected(locationDropdownBtn.val())
		flashLocationDropdownTooltip(false);
	});

	/*
	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
	  
	}
	*/
	//Set mobile picker for smaller screens
	if (screen.width < 650)
		locationDropdownBtn.selectpicker('mobile');
}

function setupToggleHandlers() {
	departureToggleButtonLabel.off('click');
	arrivalToggleButtonLabel.off('click');

	departureToggleButtonLabel.on('click', function(event) {
		if (!departureToggleButtonLabel.hasClass('disabled'))
			directionToggleSelected(FlightDirectionEnum.departure, locationDropdownBtn.val());
	});
	arrivalToggleButtonLabel.on('click', function(event) {
		if (!arrivalToggleButtonLabel.hasClass('disabled'))
			directionToggleSelected(FlightDirectionEnum.arrival, locationDropdownBtn.val());
	});

}

function setupPhotoReportModal() {
	photoReportModal.off('show.bs.modal');

	//Handle showing modal and event handlers for actions
	photoReportModal.on('show.bs.modal', function (event) {
	  var button = $(event.relatedTarget) 
	  var photoLocation = button.data('location')
	  var photoSource = button.data('photoSource') 
	  
	  var modal = $(this)
	  //modal.find('.modal-title').text('New message to ' + recipient)
	  //modal.find('.modal-body input').val(recipient)

	  //Add handler for textarea to enable submit button when typed in
	  //Initially disable submit button
	  //https://stackoverflow.com/questions/11338592/how-can-i-bind-to-the-change-event-of-a-textarea-in-jquery
	  modal.find('#reportSubmit').prop('disabled', true)
	  modal.find('#message-text').off('input selectionchange propertychange');
	  modal.find('#message-text').on('input selectionchange propertychange', function() {
	  	modal.find('#reportSubmit').prop('disabled', this.value.length === 0)
	  });

	  modal.find('#reportSubmit').off('click');
		modal.find('#reportSubmit').on('click', function(event) {
			modal.find('#reportSubmit').addClass('disabled');
			modal.find('#reportSubmit').text('Sending');

			submitPhotoReport(photoLocation, photoSource, modal.find('#message-text').val(), 
				function(jqXHR, textStatus, errorThrown) { //error handler
					alert("Could not submit report. Issue: " + textStatus + errorThrown);
				},
				function(data, textStatus, jqXHR) { //success handler
					console.log(data)
					switch(data['status']) {
						case 0:
							modal.modal('hide')
							break;
						default:
							alert("Could not submit report. Server issues. " + data['error'])
					}
				},
				function(jqXHR, textStatus) { //completion handler
					console.log('completion');
					modal.find('#reportSubmit').removeClass('disabled');
					modal.find('#reportSubmit').text('Submit');
				}
			);
		});
	});
}

//Setup email template link and modal
function setEmailTemplateLinkAndModal() {
	emailTemplateBtn.off('click');
	emailTemplateBtn.on('click', function() {
	});

	emailTemplateModal.off('show.bs.modal');

	//Handle showing modal and event handlers for actions
	emailTemplateModal.on('show.bs.modal', function (event) {
	  var button = $(event.relatedTarget) 
	  
	  var modal = $(this)
	  //modal.find('.modal-title').text('New message to ' + recipient)
	  //modal.find('.modal-body input').val(recipient)

	  //Add handler for textarea to enable submit button when typed in
	  //Initially disable submit button
	  //https://stackoverflow.com/questions/11338592/how-can-i-bind-to-the-change-event-of-a-textarea-in-jquery
	  modal.find('#message-text').text(emailTemplate);
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
	/*
	//Uncomment for bootstrap dropdown menu
	if (enabled) {
		locationDropdownBtn.removeClass("disabled")
	} else {
		locationDropdownBtn.addClass("disabled")
	}
	*/

	if (enabled) {
		locationDropdownBtn.prop('disabled', false);
		locationDropdownBtn.selectpicker('refresh');
		locationDropdownBtn.selectpicker('setStyle', 'btn-primary');
	} else {
		locationDropdownBtn.prop('disabled', true);
		locationDropdownBtn.selectpicker('refresh');
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

function flashLocationDropdownTooltip(enable) {
	if (enable) {
		flashLocationDropdownTooltipStatus = true
		locationDropdownBtn.tooltip('show');
		window.setTimeout(function() {
			locationDropdownBtn.tooltip('hide');
			//Set timeout to reflash
			window.setTimeout(function() {
				if (flashLocationDropdownTooltipStatus == true)
					flashLocationDropdownTooltip(true)
				else
					locationDropdownBtn.tooltip('hide')
			}, 3000);
		}, 1000);
	} else {
		flashLocationDropdownTooltipStatus = false
		locationDropdownBtn.tooltip('hide')
	}
}

/*
 * Entry point for any programmatic flight location changes if you want dropdown menu text to match the set location. 
 * Else call dropdownItemSelected()
 */

function setDropdownTitle(title) {
	/*
	//For bootstrap dropdown menu
	$("#location-dropdown-btn > span").text(title);
	*/
	locationDropdownBtn.selectpicker('val', title)
}


/*
 * Set location dropdown menu options to locations array.
 * Set dropdown text click handler for each menu option.
 */
function setLocationsInDropdown(locations) {
	/*
	//For bootstrap dropdown menu
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
	*/

	//Clear bootstrap-select picker
	locationDropdownBtn.empty();

	locationDropdownBtn.append(
		$("<option/>").val(kLatestFlights).text("Latest Flights")
	);


	var optgrp = $("<optgroup/>").attr("label", "72 HR flight locations ");

	locations.forEach(function(element) {

		var locationOpt = $("<option/>").val(element).text(element);

		//If location is in preset location list, show indicator for departure flight
		//Create title string from end first.
		locationOpt.text('\u00a0\ud83d\udeec ' + locationOpt.text()) //Add arriving plane
		if (presetLocations.indexOf(element) > -1) {
			locationOpt.text('\ud83d\udeeb' + locationOpt.text()) //Add departing plane

			//Set item keywords for live search
			var keywordListString;
			presetKeywords[presetLocations.indexOf(element)].forEach(function(element) {
				keywordListString += element + ' ';
			});
			locationOpt.attr('data-tokens', keywordListString) 
		} else {
			locationOpt.text('\ud83d\udeab' + locationOpt.text()) //Add no entry sign
		}

		optgrp.append(
			locationOpt
		);
	});

	locationDropdownBtn.append(optgrp);
	locationDropdownBtn.selectpicker('render');

	//update variable references and add tooltip to dropdown menu header
	setUIVariables(); 

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
			seatText += " T";
		else if (flight['seatType'].toUpperCase() == 'F')
			seatText += " F";
		else if (flight['seatType'].toUpperCase() == 'SP')
			seatText = "SP";
		else
			seatText = "N/A";

		flightRow.append(
			$("<td/>").addClass("").text(seatText)
		)

		var photoURL = 'https://www.facebook.com/' + flight['photoSource'];

		//Add source column
		flightRow.append(
			$("<td/>").addClass("source-row").append(
				$("<div/>").addClass("btn-group").attr("role", "group").attr("aria-label", "Flight options").append(
					$("<button/>").attr('type', 'button').addClass("btn btn-primary").attr('title', 'View Facebook Source Image').attr('target', 'popup')
					.attr('onclick', 'window.open(\'' + photoURL + '\',\'popup\',\'width=1000,height=800\'); return false;')
					.attr('href', photoURL)
					.text('\ud83d\udd0d'),
				$("<button/>").attr('type', 'button')
					.addClass('btn btn-warning')
					.attr('title', 'Submit Flight Data Report')
					.attr('data-toggle', 'modal')
					.attr('data-target', '#photoReportModal')
					.attr('data-location', location.length > 0 ? location : flight['origin'])
					.attr('data-photoSource', flight['photoSource'])
					.text('\ud83d\udee0')
				)
			)
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
		$("<th/>").attr("scope", "col").html("Seats&nbsp;<sup>[?]</sup>").attr("data-toggle", "tooltip").attr("data-html", "true").attr("title", 'T = Tentative<br/>F = Firm<br/>SP = Seats Pending.').tooltip(),
		$("<th/>").attr("scope", "col").html("Source&nbsp;<sup>[?]</sup>").attr("data-toggle", "tooltip").attr("data-html", "true").attr("title", '\ud83d\udd0d&nbsp;Flight source images.<br/>Source images may no longer be online depending on when terminal pages are updated.').tooltip()
	)

	//Add tooltip explaining origin roll call times for arrival view or latest flights view
	if (direction == FlightDirectionEnum.arrival || location.length == 0) {
		headerRow.children(":first-child").text("Roll Call ")
		headerRow.children(":first-child").append(
			$("<span/>").addClass("origin-local-header-note").html(" Special&nbsp;Ordering&nbsp;<sup>[?]</sup>").attr("data-toggle", "tooltip").attr("data-html", "true").attr("title", '\ud83d\udccd&nbsp;Dates grouped by local timezone. <span style="font-style:italic;">' + moment().tz(moment.tz.guess()).format('z ZZ') + '</span></br>\ud83c\udf10&nbsp;Roll Call times displayed in origins\' timezones.</br>\u23f0&nbsp;Flights listed in chronological order.').tooltip()
		)
	}
	flightsViewTableHead.append(headerRow);


	var numCols = $("#flights-view-table-head th").length

	//Display dates by  selected airport TZ or comoputer local TZ
	var selectedAirportTZTitle;
	var selectedAirportIndex = presetLocations.indexOf(location)
	if (selectedAirportIndex > 0) {
		selectedAirportTZTitle = presetTZTitles[selectedAirportIndex]
		startDate.tz(selectedAirportTZTitle)
	} 
	startDate.startOf('day');

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
					$("<th/>").addClass("").html("Possible flights&nbsp;<sup style=\"font-size: .5em\">[?]</sup>").attr("data-toggle", "tooltip").attr("data-placement", "right").attr("title", "Flights that were found with a low confidence date and time.").tooltip()
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