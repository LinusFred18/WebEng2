// define options for getting the geo location
var geoOptions = {
    enableHighAccuracy: true,
    timeout: 10000, //ms
    maximumAge: 0   // do not use cached position
  };
  
// geo location information in case of successful retrieval
function geoSuccess(pos) {
  var crd = pos.coords;
  var lon = crd.longitude;
  var lat = crd.latitude;
}

// error handling in case of failed retrieval
// console.log() instead of alert() for running without browser
function geoError(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
  switch (err.code) {
    case err.PERMISSION_DENIED:
      alert('PERMISSION_DENIED: Ohne Deine Positionsdaten können Aktivitäten Dir nicht oder nur ungenau zugeordnet werden.');
      break;
    case err.POSITION_UNAVAILABLE:
      alert('POSITION_UNAVAILABLE: Deine Positionsdaten können nicht ermittelt werden.');
      break;
    case err.TIMEOUT:
      alert('TIMEOUT: Deine Positionsdaten konnten nicht rechtzeitig ermittelt werden.');
      break;
    default:
      alert('UNKNOWN ERROR: Deine Positionsdaten konnten nicht ermittelt werden.');
      break;
  }
  document.writeln("<h3>Deine Positionsdaten können nicht ermittelt werden. Wahrscheinlich hast du die Ermittlung deiner GPS Position im Browser ausgestellt.</h3>");
}

// retrieve geo location 
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(geoSuccess, geoError, geoOptions);
} else {
  alert("ACHTUNG: Geolocation wird von diesem System/Device nicht unterstützt!");
}