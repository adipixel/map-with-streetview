var map;
var markers = [];
var polygon = null;
var locations = [
		{title: 'Park Ave Penthouse', location: {lat: 40.7713024, lng: -73.9632393}},
		{title: 'Chelsea Loft', location: {lat: 40.7444883, lng: -73.9949465}},
		{title: 'Union Square Open Floor Plan', location: {lat: 40.7347062, lng: -73.9895759}},
		{title: 'East Village Hip Studio', location: {lat: 40.7281777, lng: -73.984377}},
		{title: 'TriBeCa Artsy Bachelor Pad', location: {lat: 40.7195264, lng: -74.0089934}},
		{title: 'Chinatown Homey Space', location: {lat: 40.7180628, lng: -73.9961237}}
	];


/*knockout framwork*/
function Place(location){
	var self =this;
	self.loc = ko.observable(location);
}
/*viewmodel*/
function MapViewModel(){
	var self = this;
	self.locations = locations;

	self.places = ko.observableArray([]);
	for (var i = 0; i < self.locations.length; i++) {
		self.places.push(new Place(self.locations[i]));
	}

	self.showMarker = function(place){
		for (var i = 0; i < markers.length; i++) {
			if(self.locations[i].location == place.loc().location)
			{
				markers[i].setMap(map);
				map.setCenter(markers[i].position);
			}
			else
			{
				markers[i].setMap(null);
			}
		}
	}
	self.showFilteredMarker = function(location){
		for (var i = 0; i < markers.length; i++) {

			if(self.locations[i].location == location)
			{
				markers[i].setMap(map);
			}
		}
	}

	self.stringStartsWith = function (string, startsWith) {
		string = string || "";
		if (startsWith.length > string.length)
			return false;
		return string.substring(0, startsWith.length) === startsWith;
	};

	self.filter = ko.observable('');
	self.filteredItems = ko.computed(function(){
		var filter = self.filter().toLowerCase();
		console.log(filter);
		if(!filter){
			return self.places();
		}
		else{
			hideListings();
			return ko.utils.arrayFilter(self.places(), function(item) {
				var temp =self.stringStartsWith(item.loc().title.toLowerCase(), filter);
				if (temp){
					self.showFilteredMarker(item.loc().location);	
				}
				return temp;
        	});
		}
	}, MapViewModel);

}

ko.applyBindings(new MapViewModel());







 /*MAP*/
function initMap() {

	var myLatLng = {lat: 40.7413549, lng: -73.99802439999996};

	map = new google.maps.Map(document.getElementById('map'), {
    	zoom: 13,
    	center: myLatLng
	});



	var largeInfowindow = new 	google.maps.InfoWindow();
	var bounds = new google.maps.LatLngBounds();

	//drawing manager
	var drawingManager = new google.maps.drawing.DrawingManager({
		drawingMode: google.maps.drawing.OverlayType.POLYGON,
		drawingControl: true,
		drawingControlOptions: {
			position: google.maps.ControlPosition.TOP_LEFT,
			drawingModes: [
			google.maps.drawing.OverlayType.POLYGON
			]
		}
	});




	for(var i =0; i < locations.length; i++)
	{
		var position = locations[i].location;
		var title = locations[i].title;

		var marker = new google.maps.Marker({
    		position: position,
    		map: map,
    		title: title,
    		draggable: true,
    		animation: google.maps.Animation.DROP,
    		id: i
		});
		//markers[i].setMap(map);
		markers.push(marker);

		bounds.extend(markers[i].position);

		marker.addListener('click', function(){
			populateInfoWindow(this, largeInfowindow);
		});		
	}

	map.fitBounds(bounds);

	document.getElementById('show-listings').addEventListener('click', showListings);
	document.getElementById('hide-listings').addEventListener('click', hideListings);
	document.getElementById('toggle-drawing').addEventListener('click', function(){
		toggleDrawing(drawingManager);
	});

	document.getElementById('zoom-to-area').addEventListener('click', function(){
		zoomToArea();
	});

	
	drawingManager.addListener('overlaycomplete', function(event){
		if(polygon)
		{
			polygon.setMap(null);
			hideListings();
		}
		//pointer back to hand
		drawingManager.setDrawingMode(null);
		polygon = event.overlay;
		polygon.setEditable(true);

		searchWithinPolygon();

		polygon.getPath().addListener('set_at', searchWithinPolygon);
		polygon.getPath().addListener('insert_at', searchWithinPolygon);


	});

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

function toggleDrawing(drawingManager)
{
	if (drawingManager.map) {
		drawingManager.setMap(null);

		if(polygon)
		{
			polygon.setMap(null);
		}
	}
	else{
		drawingManager.setMap(map);
	}
}

function searchWithinPolygon()
{
	for (var i = 0; i < markers.length; i++) {
		if(google.maps.geometry.poly.containsLocation(markers[i].position, polygon))
		{
			markers[i].setMap(map);
		}
		else
		{
			markers[i].setMap(null);
		}
	}

	computeAreaOfPolygon();
}

function computeAreaOfPolygon()
{
	var area = google.maps.geometry.spherical.computeArea(polygon.getPath());
	//alert("Area: "+area);
	document.getElementById('area').innerHTML += "Area of selected polygon: <b>"+area.toFixed(2)+ "</b> sq meters ";
}


function zoomToArea()
{
	var geocoder = new google.maps.Geocoder();

	var address = document.getElementById('zoom-to-area-text').value;
	if(address == '')
	{
		window.alert("You must enter an address!");
	}
	else
	{
		geocoder.geocode(
		{
		address: address,
		componentRestrictions: {locality:'New York'}
		},
		function(results, status){
			if(status == google.maps.GeocoderStatus.OK)
			{
				map.setCenter(results[0].geometry.location);
				map.setZoom(15);
				window.alert(results[0].formatted_address +"\n"+results[0].geometry.location);
			}
			else
			{
				window.alert("We could not find the location, try entering a more specific place.");
			}
		}
		);
	}
}

