
var map;
	// Create a new blank array for all the listing markers.
var markers = [];
var infowindow;

	// Locations to show on map
var locationsArray = [
    {title: 'FreeStyle Clothing Exchange', location: {lat: 38.574239, lng: -121.479242}},
    {title: 'Cheap Thrills', location: {lat: 38.575194, lng: -121.484330}},
    {title: 'FrenchCuff Consignment Shop', location: {lat: 38.574838, lng: -121.472123}},
    {title: 'Vintage YSJ', location: {lat: 38.580012, lng: -121.490854}},
    {title: 'Lost Treasures', location: {lat: 38.584001, lng: -121.485347}},
    {title: 'FRINGE', location: {lat: 38.560518, lng: -121.485156}}
];

	// Function to initialize Google map.
function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    var styles = [
    {
        "featureType": "landscape",
        "stylers": [
            {
                "hue": "#FFBB00"
            },
            {
                "saturation": 43.400000000000006
            },
            {
                "lightness": 37.599999999999994
            },
            {
                "gamma": 1
            }
        ]
    },
    {
        "featureType": "road.highway",
        "stylers": [
            {
                "hue": "#FFC200"
            },
            {
                "saturation": -61.8
            },
            {
                "lightness": 45.599999999999994
            },
            {
                "gamma": 1
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "stylers": [
            {
                "hue": "#FF0300"
            },
            {
                "saturation": -100
            },
            {
                "lightness": 51.19999999999999
            },
            {
                "gamma": 1
            }
        ]
    },
    {
        "featureType": "road.local",
        "stylers": [
            {
                "hue": "#FF0300"
            },
            {
                "saturation": -100
            },
            {
                "lightness": 52
            },
            {
                "gamma": 1
            }
        ]
    },
    {
        "featureType": "water",
        "stylers": [
            {
                "hue": "#0078FF"
            },
            {
                "saturation": -13.200000000000003
            },
            {
                "lightness": 2.4000000000000057
            },
            {
                "gamma": 1
            }
        ]
    },
    {
        "featureType": "poi",
        "stylers": [
            {
                "hue": "#00FF6A"
            },
            {
                "saturation": -1.0989010989011234
            },
            {
                "lightness": 11.200000000000017
            },
            {
                "gamma": 1
            }
        ]
    }
];
    map = new google.maps.Map(document.getElementById('map'), {
	    center: {lat: 38.576587, lng: -121.493245},
    	zoom: 13,
    	styles: styles
    });

    // Resize the map for responsive design.
    google.maps.event.addDomListener(window, "resize", function() {
      var center = map.getCenter();
      google.maps.event.trigger(map, "resize");
      map.setCenter(center);
    });
    
}

function Location(data){
	var self = this;
	console.log(data);
	self.name = data.name;
	self.lat = data.location.coordinate.latitude;
	self.lng = data.location.coordinate.longitude;
	self.phone = data.phone;
	self.img_url = data.image_url;
	self.rating = data.rating;
	self.rating_img = data.rating_img_url_small;
	self.addr1 = data.location.display_address[0];
	self.addr2 = data.location.display_address[1];
	self.category = data.categories[0][0];
	self.snippet = data.snippet_text;
	self.review_url = data.url;


    var largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();
   		 

        // The following group uses the location array to create an array of markers on initialize.
    for (var i = 0; i < data.length; i++) {
          // Get the position from the location array.
        var position = data[i].location;
        var title = data[i].title;
          // Create a marker per location, and put into markers array.
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i
        });
          // Push the marker to our array of markers.
        markers.push(marker);
          // Create an onclick event to open an infowindow at each marker.
        marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
            toggleBounce(this);
        });
       
        bounds.extend(markers[i].position);
    }
}

	// Populate info windows for markers
function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        infowindow.marker = marker;
        infowindow.setContent('<div>' + marker.title + '</div>');
        infowindow.open(map, marker);
          
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function(){
            infowindow.setMarker = null;
        });
    }
}


	// This function will loop through the markers array and display them all.
function showListings() {
    var bounds = new google.maps.LatLngBounds();
        // Extend the boundaries of the map for each marker and display the marker
        for (var i = 0; i < markers.length; i++) {
          markers[i].setMap(map);
          bounds.extend(markers[i].position);
        }
        map.fitBounds(bounds);
}
	// Bounce marker three times on click
function toggleBounce(marker) {
  	if (marker.getAnimation() !== null) {
    	marker.setAnimation(null);
  	} else {
    	marker.setAnimation(google.maps.Animation.BOUNCE);
    	setTimeout(function() {
          	marker.setAnimation(null);
        }, 2100);
  	}
}
   
	// Sets up view model using KO.
function MapViewModel() {
	var self = this;

	self.address = ko.observable("Sacramento,CA");
   	self.locationListArray = ko.observableArray();
   	self.geocoder = new google.maps.Geocoder();
   	self.query = ko.observable('');
    
    self.showList = function() {
    	showListings();
    };
  

    self.listOfLocations = function() {
		if (self.locationListArray().length !== 0) { //  Set the locationListArray to empty new searches.
        	self.locationListArray().length = 0;
    }

   		 self.getYelpData(self.address()); // Call to Yelp API. 
	};

	self.searchFilter = ko.computed(function() {

    var filter = self.query().toLowerCase();
    if (!filter) {
      self.locationListArray().forEach(function(mk) {
        mk.marker.setVisible(true);
      });
      return self.locationListArray();
    } else {
      return ko.utils.arrayFilter(self.locationListArray(), function(loc) {
        for (var i = 0; i < self.locationListArray().length; i++) {
          if (self.locationListArray()[i].marker.title.toLowerCase().indexOf(filter) !== -1) {
            self.locationListArray()[i].marker.setVisible(true);
          } else {
            self.locationListArray()[i].marker.setVisible(false);
          }
        }
        return loc.name.toLowerCase().indexOf(self.query().toLowerCase()) >= 0;
      });
    }
  });

	// Launch Yelp API Ajax request with inputted address.
	self.getYelpData = function(address) {
   
    function nonce_generate() {
      	return (Math.floor(Math.random() * 1e12).toString());
    }
	    var yelp_url = 'http://api.yelp.com/v2/search';
	    var parameters = {
	      oauth_consumer_key: '1E7rRv_WqdoZVqcAFKIaSw',
	      oauth_token: 'kUmSRxUoIwSNN1BDJywaYAucS14WoBF-',
	      oauth_nonce: nonce_generate(),
	      oauth_timestamp: Math.floor(Date.now() / 1000),
	      oauth_signature_method: 'HMAC-SHA1',
	      oauth_version: '1.0',
	      callback: 'cb',
	      location: address,
	      term: 'active',
	      category_filter: 'restaurants',
	      limit: 25
	    };

	    var consumer_secret = 'yg3m0_K0BEsGVyo0U5qxhwmBXr0';
	    var token_secret = 'PEH5kbem8hYFpmFVEcYhWdu9jyQ';
	    var encodedSignature = oauthSignature.generate('GET', yelp_url, parameters,
	      consumer_secret, token_secret);
	    parameters.oauth_signature = encodedSignature;
	    $.ajax({
	      url: yelp_url,
	      data: parameters,
	      cache: true,
	      dataType: 'jsonp',
	      jsonpCallback: 'cb',
	      success: function(results) {

	        //	Set the map with result.
	        map = new google.maps.Map(document.getElementById('map'), {
	          center: {
	            lat: results.region.center.latitude,
	            lng: results.region.center.longitude
	          },
	          zoom: 15
	        });

	        for (var i = 0; i < results.businesses.length; i++) {
	          //	Push location details into locationListArray.
	          self.locationListArray.push(new Location(results.businesses[i]));
	        }

	      }
	    })
	      .fail(function() {
	        console.log("Data could not be retrieved from Yelp API");
	      });

  };

}



	// Initialize map and bind MVVM using KO.
function startApp() {
	initMap();
	var viewModel = new MapViewModel();
	ko.applyBindings(viewModel);
	viewModel.listOfLocations();
}

function googleError() {
  alert("Error Loading Google Map");
}
    