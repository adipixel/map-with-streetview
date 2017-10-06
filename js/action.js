// TODO: Create a map variable
var map;

// TODO: Complete the following function to initialize the map
function initMap() {
  var myLatLng = {lat: 40.7413549, lng: -73.99802439999996};

  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: myLatLng
  });

  var marker = new google.maps.Marker({
    position: myLatLng,
    map: map,
    title: 'Google\'s New York City Office',
    draggable: true,
    animation: google.maps.Animation.DROP
  });
	marker.addListener('click', toggleBounce);
}

function toggleBounce() {
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
  }
}