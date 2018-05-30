var disclaimerKey = 'disclaimerShown'

function hideDisclaimer() {
	$('.disclaimer').hide();
  localStorage.setItem(disclaimerKey, true);
  updateLocationDropdown();
}

function showDisclaimer() {
	$('.disclaimer').show();
}

function setupDisclaimer(forceShow) {
	$('#disclaimer-btn').off('click');
	$('#disclaimer-btn').on('click', hideDisclaimer);
  $('#disclaimer-btn').focus();

  if (!localStorage.getItem(disclaimerKey) || forceShow) {
  	showDisclaimer();
  	return true;
  }

  return false;
}