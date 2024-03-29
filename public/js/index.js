// initialize global variables
let map = null;
let locs = [
  {
    title: "Untitled (Lamp/Bear)", 
    artist: "Urs Fischer",
    description: `2005-06. Painted and lacquered cast bronze, 
    acrylic glass, LED lights, stainless steel 
    interior framework. 23' x 21'4" x 24'7". 
    Lent from the Steven and Alexandra Cohen 
    Collection. Installed on Simmons Quad 
    near Ashamu Dance Studio, fall 2016`,
    location: {lat: 41.8265259, lng: -71.4014886},
    files: ['https://i0.wp.com/blognonian.com/wp-content/uploads/2016/10/Blueno.jpg?w=412']
  }
  ];
let infowindow = null;
let markers = [];
let searchString = "";
// end global variables


document.getElementById("mainSearch").addEventListener("input", handleSearch)



function windowContent(idx, expand=false) {
  let loc = locs[idx];
  if (!loc.files) loc.files=[];
  let carousel = `
  <div id="carousel" class="carousel-custom">
    ${(loc.files.length == 1) ? 
      `<div class="carousel-item-single-custom">
      ${((loc.files[0].fileType && loc.files[0].fileType != "image") ?
        `<iframe title="images of this artwork" src=https://storage.googleapis.com/vrview/2.0/embed?image=${loc.files[0].url}></iframe>`:
        `<img src="${loc.files[0].url}" alt="${loc.files[0].label? loc.files[0].label:loc.title}" title="${loc.files[0].label? loc.files[0].label:loc.title}">`)}
      </div>`
    : 
    loc.files.map((file,idx) => 
      `<div class="carousel-item-custom ${(idx==0)?"active":""}">
        ${((file.fileType && file.fileType != "image") ?
          `<iframe title="images of this artwork" src=https://storage.googleapis.com/vrview/2.0/embed?image=${file.url}></iframe>`:
          `<img src="${file.url}" alt="${loc.files[idx].label? loc.files[idx].label:loc.title}" title="${loc.files[idx].label? loc.files[idx].label:loc.title}">`)}
      </div>`
      )}
    
  </div>
  `;

  return `
    ${carousel}
    <div id="locWindow" class="infowindow">
        <div ${expand?`class="mobile-pad"`:""}>
          <h1 class="title">${loc.title}</h1>
          <div>
            <p class="artist">Artist: ${loc.artists}</p>
            <p class="desc hide-mobile">${replaceNewline(loc.description)}</p>
            ${expand?`<p class="desc">${replaceNewline(loc.description)}</p>`:""}
          </div>
        </div>
        ${expand?"":`<button type="button" id="mobile-expand" style="align-self:center;" class="btn btn-secondary show-mobile" onclick=mobileExpand(${idx})>Details</button>`}
      </div>`;
}

function mobileExpand(idx){
  infowindow.close();
  let content = `
  <nav class="navbar navbar-expand-lg navbar-dark" style="background-color: #C00404;">
    <button type="button" id="mobile-close" style="color: white;font-weight:bold;" onclick=mobileClose()>Close</button>
  </nav>
  ${windowContent(idx, true)}
  `;
  document.getElementById('infowindow').innerHTML = content;
  document.getElementById('infowindow').style.background = "white";
  document.getElementById('infowindow').style.opacity = "1";
  document.getElementById('infowindow').style.minHeight = "100%";

  /*bodyScrollLock.enableBodyScroll(document.getElementById('brand'));
  bodyScrollLock.disableBodyScroll(document.getElementById('carousel'));
  bodyScrollLock.disableBodyScroll(document.getElementById('locWindow'));*/
}

function mobileClose(){
  /*bodyScrollLock.enableBodyScroll(document.getElementById('carousel'));
  bodyScrollLock.enableBodyScroll(document.getElementById('locWindow'));*/
  document.getElementById('infowindow').innerHTML = "";
  document.getElementById('infowindow').style.background = "transparent";
  document.getElementById('infowindow').style.opacity = "0";
  document.getElementById('infowindow').style.minHeight = "0";
  //bodyScrollLock.disableBodyScroll(document.getElementById('brand'));
}

function haversine_distance(mk1, pos) {
  // https://cloud.google.com/blog/products/maps-platform/how-calculate-distances-map-maps-javascript-api
  var R = 3958.8; // Radius of the Earth in miles
  var rlat1 = mk1.position.lat() * (Math.PI/180); // Convert degrees to radians
  var rlat2 = pos.lat * (Math.PI/180); // Convert degrees to radians
  var difflat = rlat2-rlat1; // Radian difference (latitudes)
  var difflon = (pos.lng-mk1.position.lng()) * (Math.PI/180); // Radian difference (longitudes)

  var d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat/2)*Math.sin(difflat/2)+Math.cos(rlat1)*Math.cos(rlat2)*Math.sin(difflon/2)*Math.sin(difflon/2)));
  return d;
}

function initializeLandmarks() {
  fetch('/landmarks')
    .then(response => response.json())
    .then(data => {
      console.log(data)
      locs = data;
      let icons = {
        url: "images/marker1.png"
      };
      markers = locs.map((loc,idx) => {
        let marker = new google.maps.Marker({
          position: loc.location, 
          title: loc.title,
          icon: icons,
          map: map});
        marker.addListener('click', function() {
          infowindow.setContent(windowContent(idx));
          infowindow.open(map, marker);
          // bodyScrollLock.disableBodyScroll(document.getElementById('locWindow'));
        });
        return marker;
      })
    });
}

function initMap() {
  var providence = {lat: 41.826, lng: -71.404};
  map = new google.maps.Map(
      document.getElementById('map'), {
        zoom: 16,
        center: providence,
        styles: [
       {
        featureType: 'poi.business',
        stylers: [{visibility: 'off'}]
       },
       {
        featureType: "landscape.man_made",
        elementType: "geometry.fill",
        stylers: [{color: "#fdf4dd"}]
      },
      {
        featureType: "landscape.man_made",
        elementType: "geometry.stroke",
        stylers: [{color: "#b8bdc8"},
          {visibility: "on"},
          {weight: 0.5}]
      },
      {
        featureType: "poi.business",
        stylers: [{visibility: "off"}]
      },
      {
        featureType: "poi.park",
        elementType: "geometry.fill",
        stylers: [{color: "#e4ecd9"}]
      },
      {
        featureType: "poi.park",
        elementType: "labels.text",
        stylers: [{visibility: "off"}]
      },
      {
        featureType: "poi.school",
        elementType: "geometry.fill",
        stylers: [{color: "#e4ecd9"}]
      },
      {
        featureType: "poi.sports_complex",
        elementType: "geometry.fill",
        stylers: [{color: "#e4ecd9"}]
      }
    //   {
    //     featureType: "road",
    //     elementType: "geometry.fill",
    //     stylers: [{color: "#fdf4dd"}]
    //   },
    //   {
    //     featureType: "road",
    //     elementType: "geometry.stroke",
    //     stylers: [{color: "#b8bdc8"}]
    //   },
    //   {
    //     featureType: "road",
    //     elementType: "labels.icon",
    //     stylers: [{visibility: "off"}]
    //   },
    //   {
    //     featureType: "road.local",
    //     elementType: "geometry.stroke",
    //     stylers: [{weight: 0.5}]
    //   },
    //   {
    //     elementType: "labels.text.stroke",
    //     stylers: [{visibility: "off"}]
    //     }
    ]
  });
  infowindow = new google.maps.InfoWindow();


  // Default center on campus
  let currentloc = new google.maps.Marker({
    clickable: false,
    icon: 'https://i.stack.imgur.com/VpVF8.png',
    shadow: null,
    zIndex: 999,
    animation: google.maps.Animation.DROP,
    map: map
  });
  currentloc.setVisible(false);

  // If user's location is close to campus, center on that
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      const pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      if (haversine_distance(currentloc, pos) < 0.6) {
      // less than 0.6mi away from campus: center at their location
        currentloc.setPosition(pos);
        map.setCenter(pos);
      }
    }, function() {
      handleLocationError(true, infowindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infowindow, map.getCenter());
  }

  function handleLocationError(browserHasGeolocation, infowindow, pos) {
  // infowindow.setPosition(pos);
  // infowindow.setContent(browserHasGeolocation ?
  //                 'Error: The Geolocation service failed.' :
  //                 'Error: Your browser doesn\'t support geolocation.');
  // infowindow.open(map);
  }

  // put markers on map
  initializeLandmarks();

  
}
// make scrolling on mobile happy
// bodyScrollLock.disableBodyScroll(document.getElementById('brand'));