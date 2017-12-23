var map;
var markers = [];
var tempMarkers = [];
var polygon = null;

// loading intial locations to map
var locations = [
		{id: '4af5a46af964a520b5fa21e3', title: 'Museum of Modern Art', location: {lat: 40.7614367, lng: -73.9798103}},
		{id: '40abf500f964a52035f31ee3', title: 'Washington Square Park', location: {lat: 40.731, lng: -73.9987213}},
		{id: '4a43bcb7f964a520bba61fe3', title: 'Brooklyn Bridge', location: {lat: 40.7059675, lng: -73.9967072}},
		{id: '4b240a1ff964a520b25f24e3', title: 'Hudson River Park', location: {lat: 40.7330595, lng: -74.0103279}},
		{id: '4a07986bf964a52087731fe3', title: 'The Public Theater', location: {lat: 40.7291501, lng: -73.9920103}},
		{id: '43a48f1bf964a520502c1fe3', title: 'Rock Observation Deck', location: {lat: 40.7590336, lng: -73.9793372}}
	];


// knockout framwork
function Place(location){
	var self =this;
	self.loc = ko.observable(location);
}

function FourSquare(venue, icon){
	var self =this;
	self.fourSq = ko.observable(venue);
	self.icon = icon;
}

function FourSquareImages(photo){
	var self =this;
	self.photo = ko.observable(photo);
}

// viewmodel
function MapViewModel(){
	var self = this;
	self.locations = locations;
	self.curLoc = ko.observable(locations[0].location);
	self.detailsFlag = ko.observable(false);
	self.placesFlag = ko.computed(function(){
		return !self.detailsFlag();
	});
	self.hamFlag = ko.observable(false);
	/*for loading images from foursquare*/
	self.locId = ko.observable("40abf500f964a52035f31ee3");
	self.imgList = ko.observableArray([]);

	self.places = ko.observableArray([]);

	for (var i = 0; i < self.locations.length; i++) {
		self.places.push(new Place(self.locations[i]));
	}

	self.clickHam = function(){
		self.hamFlag(!self.hamFlag());
	}
	/**
	* @description animates the selected marker
	* @param {Place} place
	*/
	self.showMarker = function(place){

		for (var i = 0; i < markers.length; i++) {
			if(self.locations[i].location == place.loc().location)
			{
				//map.setCenter(markers[i].position);
				//markers[i].setAnimation(google.maps.Animation.BOUNCE);
				self.curLoc(place.loc().location);
				self.detailsFlag(true);
				self.filter(place.loc().title);
				self.locId(locations[i].id);
				toggleBounce(markers[i])
				populateInfoWindow(markers[i], new google.maps.InfoWindow());
			}
			else
			{
				markers[i].setAnimation(null);
				//markers[i].setMap(null);
			}
		}
	}


	/**
	* @description display markers after filter
	* @param {Place} place
	*/
	self.showFilteredMarker = function(location){
		for (var i = 0; i < markers.length; i++) {
			if(self.locations[i].location == location)
			{
				markers[i].setMap(map);
			}
		}
	}


	/**
	* @description displays the filtered items
	*/
	self.filter = ko.observable("");
	self.filteredItems = ko.computed(function(){
		var filter = self.filter().toLowerCase();
		console.log("filter: "+filter);
		if(!filter){
			console.log("!filter")
			//show all markers if the filter is blank
			if(map!=null){
				showListings();
			}
			return self.places();
		}
		else{
			hideListings();
			return ko.utils.arrayFilter(self.places(), function(item) {
				//var temp = self.stringStartsWith(item.loc().title.toLowerCase(), filter);
				console.log("yo")
				var temp = item.loc().title.toLowerCase().includes(filter);
				if (temp){
					self.showFilteredMarker(item.loc().location);
				}
				return temp;
        	});
		}
	}, MapViewModel);

	self.koList = ko.observableArray([]);
	self.tagName = ko.observable("");


	/**
	* @description fetch nearby items from foursquare api
	*/
	self.tagVenues = ko.computed(function(){
		//delete all temp markers
		for (var i = 0; i < tempMarkers.length; i++) {
			tempMarkers[i].setMap(null);
		}
		tempMarkers = [];

		self.koList([]);
		var d = new Date();
		$.ajax({
			url: "https://api.foursquare.com/v2/venues/search?v="+ d.getFullYear()+ "" +d.getMonth()+""+d.getDate()+"&ll="+ self.curLoc().lat +","+ self.curLoc().lng +"&query="+self.tagName()+"&intent=checkin&radius=100&client_id=2N1SR4VB0TTXVM2WAHBD2DTRW40KYO3OQKBDJFM0NGDXPCZZ&client_secret=ENYVCAP4IGGRJ5CK3TV3JFCXA43LKBIWS3EZEAM4V2T4DRIK",
			type: 'GET',
			success: function(data){
				var jObj = data.response.venues;
				for (var i = 0; i < jObj.length; i++) {
					var icon = "";
					if (jObj[i].categories[0] != null){
						icon = "" + jObj[i].categories[0].icon.prefix + "32" + jObj[i].categories[0].icon.suffix;
					}
					self.koList.push(new FourSquare(jObj[i], icon));
				}
			},
			error: function(data){
				alert("Foursquare data did not load. Please refresh the page!")
			}
		});

	}, MapViewModel);


	/**
	* @description fetch nearby images from foursquare api
	*/
	self.tagVenuesImages = ko.computed(function(){
		self.imgList([]);
		$.ajax({
			url: "https://api.foursquare.com/v2/venues/"+ self.locId()+"/photos/?client_id=2N1SR4VB0TTXVM2WAHBD2DTRW40KYO3OQKBDJFM0NGDXPCZZ&client_secret=ENYVCAP4IGGRJ5CK3TV3JFCXA43LKBIWS3EZEAM4V2T4DRIK&v=20171016",
			type:'GET',
			success: function(data){
				var images = data.response.photos.items
				console.log(images);
				for (var i = 0; i < images.length; i++) {
					self.imgList.push(new FourSquareImages(images[i]));
				}
			},
			error: function(data) {
				alert('Images from Foursquare API did not load. Please refresh the page.');
			},
		});

	}, MapViewModel);


	/**
	* @description generates map marker
	* @param {Foursquare} fs
	*/
	self.generateMarker = function(fs){
		var mark = fs.fourSq();
		var position = {lat: mark.location.lat, lng: mark.location.lng};
		var title = mark.name + ", " + mark.location.address;
		//console.log(mark.categories.icon.prefix);


		var marker = new google.maps.Marker({
    		position: position,
    		map: map,
    		icon: 'http://maps.google.com/mapfiles/ms/icons/blue-pushpin.png',
    		title: title,
    		draggable: true,
    		animation: google.maps.Animation.DROP
		});

		tempMarkers.push(marker);

		marker.addListener('click', function(){
			//marker.setMap(null);
			clickedMarker(this,1)

		});
	}


	/**
	* @description displays all markers
	*/
	self.showAll = function(){
		self.detailsFlag(false);
		self.koList([]);
		self.filter("");
		showListings();
		self.tagName("");
	}

}
var vm = new MapViewModel();
$(function(){
	ko.applyBindings(vm);
});


/**
* @description initialize the map and generates markers
*/
function initMap() {
	var myLatLng = {lat: 40.7413549, lng: -73.99802439999996};

	map = new google.maps.Map(document.getElementById('map'), {
    	zoom: 13,
    	center: myLatLng
	});


	var largeInfowindow = new google.maps.InfoWindow();
	var bounds = new google.maps.LatLngBounds();

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

		markers.push(marker);

		bounds.extend(markers[i].position);

		marker.addListener('click', function(){
			populateInfoWindow(this, largeInfowindow);
			clickedMarker(this,0);
			toggleBounce(this);
		});
	}

	//map.fitBounds(bounds);
	google.maps.event.addDomListener(window, 'resize', function() {
		map.fitBounds(bounds); // `bounds` is a `LatLngBounds` object
	});
}

/**
* @description Displays all the markers on the map
*/
function showListings()
{
	var bounds = new google.maps.LatLngBounds();
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(map);
		bounds.extend(markers[i].position);
	}
	map.fitBounds(bounds);
	/*google.maps.event.addDomListener(window, 'resize', function() {
		map.fitBounds(bounds); // `bounds` is a `LatLngBounds` object
	});*/
}


/**
* @description Hides all markers from the map
*/
function hideListings()
{
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(null);
	}
}


/**
* @description builds a information window with title and streetview
* @param {object} marker
* @param {google.maps.InfoWindow} infowindow
*/
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
				infowindow.setContent('<div><span class="marker_title">' + marker.title + '</span></div><div id="pano"></div>');
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


/**
* @description includes actions performed once a marker is clicked
* @param {object} marker
* @param {number} op
*/

function clickedMarker(marker, op){
	//console.log(marker);
	for (var i = 0; i < markers.length; i++) {
		//markers[i].setAnimation(null);
		vm.detailsFlag(true);
		if (op == 1)
		{
			console.log(marker.title.split(':')[1] );
			window.open('https://www.google.com/maps/search/'+ marker.title +'/@15z', marker.name);
			break;
		}
		else if(markers[i].position == marker.position){
			vm.curLoc(locations[i].location);
			vm.locId(locations[i].id);

			break;
		}
	}
	vm.filter(marker.title);
}

function googleError(){
	alert("Maps api error!")
}

function toggleBounce(marker) {
	/*if (marker.getAnimation() !== null) {
		marker.setAnimation(null);
	} else {
		marker.setAnimation(google.maps.Animation.BOUNCE);
	}*/
	marker.setAnimation(google.maps.Animation.BOUNCE);
};

