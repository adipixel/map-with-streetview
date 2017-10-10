var map;
var markers = [];

function initMap() {

	var myLatLng = {lat: 40.7413549, lng: -73.99802439999996};

	map = new google.maps.Map(document.getElementById('map'), {
    	zoom: 13,
    	center: myLatLng
	});

	

	var locations = [
		{title: 'Park Ave Penthouse', location: {lat: 40.7713024, lng: -73.9632393}},
		{title: 'Chelsea Loft', location: {lat: 40.7444883, lng: -73.9949465}},
		{title: 'Union Square Open Floor Plan', location: {lat: 40.7347062, lng: -73.9895759}},
		{title: 'East Village Hip Studio', location: {lat: 40.7281777, lng: -73.984377}},
		{title: 'TriBeCa Artsy Bachelor Pad', location: {lat: 40.7195264, lng: -74.0089934}},
		{title: 'Chinatown Homey Space', location: {lat: 40.7180628, lng: -73.9961237}}
	];

	var largeInfowindow = new 	google.maps.InfoWindow();
	//var bounds = new google.maps.LatLngBounds();

	for(var i =0; i < locations.length; i++)
	{
		var position = locations[i].location;
		var title = locations[i].title;

		var marker = new google.maps.Marker({
    		position: position,
    		//map: map,
    		title: title,
    		draggable: true,
    		animation: google.maps.Animation.DROP,
    		id: i
		});

		markers.push(marker);

		//bounds.extend(markers[i].position);

		marker.addListener('click', function(){
			populateInfoWindow(this, largeInfowindow);
		});		
	}

	//map.fitBounds(bounds);

	document.getElementById('show-listings').addEventListener('click', showListings);
	document.getElementById('hide-listings').addEventListener('click', hideListings);
	
}

function showListings()
{
	var bounds = new google.maps.LatLngBounds();
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(map);
		bounds.extend(markers[i].position);
	}
	map.fitBounds(bounds);
}

function hideListings()
{
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(null);
	}
}

function populateInfoWindow(marker, infowindow)
	{
		if(infowindow.marker != marker)
		{
			infowindow.marker = marker;
			infowindow.setContent('');
			//infowindow.open(map, marker);

			infowindow.addListener('closeclick', function(){
				infowindow.marker = null;
			});

			var streetViewService = new google.maps.StreetViewService();
			var radius = 50;


			function getStreetView(data, status)
			{
				if(status == google.maps.StreetViewStatus.OK)
				{
					var nearStreetViewLocation = data.location.latLng;
					var heading = google.maps.geometry.spherical.computeHeading(
                nearStreetViewLocation, marker.position);
					infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
					var panoramaOptions = {
						position: nearStreetViewLocation,
						pov: {
							heading: heading,
							pitch: 30
						}
					}

					var panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'), panoramaOptions);

				}
				else
				{
					infowindow.setContent('<div>' + marker.title + '</div><div>No Street View found </div>'); 
				}
			}


			streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
			infowindow.open(map, marker);
		}
	}



