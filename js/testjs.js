/*knockout framwork*/
function FourSquare(venue){
	var self =this;
	self.fourSq = ko.observable(venue);
}
function FourSquareImages(photo){
	var self =this;
	self.photo = ko.observable(photo);
}
function FourSquareCategories(category){
	var self =this;
	self.category = ko.observable(category);
}
/*viewmodel*/
function MapViewModel(){
	var self = this;

	self.locId = ko.observable("596bfadc0d2be741e42748b7");

	self.koList = ko.observableArray([]);
	self.imgList = ko.observableArray([]);
	self.venueList = ko.observableArray([]);

/*	$.get("https://api.foursquare.com/v2/venues/search?v=20171016&ll=40.7713024,-73.9632393&intent=checkin&radius=1000&client_id=2N1SR4VB0TTXVM2WAHBD2DTRW40KYO3OQKBDJFM0NGDXPCZZ&client_secret=ENYVCAP4IGGRJ5CK3TV3JFCXA43LKBIWS3EZEAM4V2T4DRIK", function(data){
		var jObj = data.response.venues;
		for (var i = 0; i < jObj.length; i++) {
			self.koList.push(new FourSquare(jObj[i]));
		}
		console.log(jObj);
	});

	$.get("https://api.foursquare.com/v2/venues/596bfadc0d2be741e42748b7/photos/?client_id=2N1SR4VB0TTXVM2WAHBD2DTRW40KYO3OQKBDJFM0NGDXPCZZ&client_secret=ENYVCAP4IGGRJ5CK3TV3JFCXA43LKBIWS3EZEAM4V2T4DRIK&v=20171016", function(data){
		var images = data.response.photos.items
		console.log(images);
		for (var i = 0; i < images.length; i++) {
			self.imgList.push(new FourSquareImages(images[i]));
		}
	});
*/
	self.selectedCategory =ko.observable({name:"aditya"})
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
		alert(fs.fourSq().id);
		self.locId(fs.fourSq().id)
	}


	self.tagVenuesImages = ko.computed(function(){
		self.imgList([]);
		$.get("https://api.foursquare.com/v2/venues/"+ self.locId()+"/photos/?client_id=2N1SR4VB0TTXVM2WAHBD2DTRW40KYO3OQKBDJFM0NGDXPCZZ&client_secret=ENYVCAP4IGGRJ5CK3TV3JFCXA43LKBIWS3EZEAM4V2T4DRIK&v=20171016", function(data){
			var images = data.response.photos.items
			console.log(images);
			for (var i = 0; i < images.length; i++) {
				self.imgList.push(new FourSquareImages(images[i]));
			}
		});
	}, MapViewModel);

	$.get("https://api.foursquare.com/v2/venues/categories?client_id=2N1SR4VB0TTXVM2WAHBD2DTRW40KYO3OQKBDJFM0NGDXPCZZ&client_secret=ENYVCAP4IGGRJ5CK3TV3JFCXA43LKBIWS3EZEAM4V2T4DRIK&v=20171016", function(data){
		var categories = data.response.categories
		for (var i = 0; i < categories.length; i++) {
			self.venueList.push(new FourSquareCategories(categories[i]));
		}
	});

	self.updateCategory = ko.computed(function(){
		console.log(self.selectedCategory().id)
	});
}
var vm = new MapViewModel();
ko.applyBindings(vm);


