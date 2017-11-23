/*knockout framwork*/
function FourSquare(venue){
	var self =this;
	self.fourSq = ko.observable(venue);
}
/*viewmodel*/
function MapViewModel(){
	var self = this;

	var listOfItems = [{"name": "Aditya", "age": 25}];
	
	self.koList = ko.observableArray([]);

/*	$.get("https://api.foursquare.com/v2/venues/search?v=20171016&ll=40.7713024,-73.9632393&intent=checkin&radius=1000&client_id=2N1SR4VB0TTXVM2WAHBD2DTRW40KYO3OQKBDJFM0NGDXPCZZ&client_secret=ENYVCAP4IGGRJ5CK3TV3JFCXA43LKBIWS3EZEAM4V2T4DRIK", function(data){
		var jObj = data.response.venues;
		for (var i = 0; i < jObj.length; i++) {
			self.koList.push(new FourSquare(jObj[i]));
		}
		console.log(jObj);
	});*/



	self.tagName = ko.observable("");
	self.tagVenues = ko.computed(function(){
		self.koList([]);
		$.get("https://api.foursquare.com/v2/venues/search?v=20171016&ll=40.7713024,-73.9632393&query="+self.tagName()+"&intent=checkin&radius=1000&client_id=2N1SR4VB0TTXVM2WAHBD2DTRW40KYO3OQKBDJFM0NGDXPCZZ&client_secret=ENYVCAP4IGGRJ5CK3TV3JFCXA43LKBIWS3EZEAM4V2T4DRIK", function(data){
			var jObj = data.response.venues;
			for (var i = 0; i < jObj.length; i++) {
				self.koList.push(new FourSquare(jObj[i]));
			}
			console.log(jObj);
		});
	}, MapViewModel);


	self.generateMarker = function(fs){
		alert(fs.fourSq().name);
	}

}
var vm = new MapViewModel();
ko.applyBindings(vm);
