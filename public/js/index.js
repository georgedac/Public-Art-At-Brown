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

function replaceNewline(input) {
  return input.replace(/(\r\n|\n|\r)/gm, '<br/>'); // String.fromCharCode(13, 10)
}

function objectContains(obj, string) {
    return Object.keys(obj).some(k => (
      (!['location', 'files', 'id'].includes(k)) && (!k.startsWith('_')) && 
      obj[k].toLowerCase().includes(string.toLowerCase())
      ));
}

const handleSearch = event => {
    searchString = event.target.value.trim().toLowerCase()
    locs.forEach((loc, idx) => {
        if(markers[idx].getMap){
            markers[idx].setVisible(objectContains(loc, searchString));
        }
    });
}
document.getElementById("mainSearch").addEventListener("input", handleSearch)

function windowContent(idx, expand=false) {
  let loc = locs[idx];
  if (!loc.files) loc.files=[];
  let carousel = `
  <div id="carousel" class="carousel slide" data-ride="carousel">
    <ol class="carousel-indicators">
      ${loc.files.map((file,idx) => 
      `<li data-target="#carousel" data-slide-to="${idx}" ${(idx==0)?"class='active'":""}></li>`)}
    </ol>
    <div class="carousel-inner">
      ${loc.files.map((file,idx) => 
        `<div class="carousel-item ${(idx==0)?"active":""}">
          ${(file.is360 ?
            `<iframe class="size-img" title="images of this artwork" src=https://storage.googleapis.com/vrview/2.0/embed?image=${file.url}></iframe>`:
            `<img class="size-img" src="${file.url}" alt="${loc.title}">`)}
        </div>`
        )}
    </div>
    <a class="carousel-control-prev" href="#carousel" role="button" data-slide="prev">
      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
      <span class="sr-only">Previous</span>
    </a>
    <a class="carousel-control-next" href="#carousel" role="button" data-slide="next">
      <span class="carousel-control-next-icon" aria-hidden="true"></span>
      <span class="sr-only">Next</span>
    </a>
  </div>
  `;
  return `<div id="locWindow" class="infowindow ${expand?"mobile-pad":""}">
        <div class="hide-mobile">${carousel}</div>
        ${(loc.files.length > 0)?(expand ? carousel: `<img class="w-100 show-mobile" alt="${loc.title}" src=${loc.files[0].url}>`):""}
        <h1 class="title">${loc.title}</h1>
        <div>
          <p class="artist">Artist: ${loc.artists}</p>
          <p class="desc hide-mobile">${replaceNewline(loc.description)}</p>
          ${expand?`<p class="desc">${replaceNewline(loc.description)}</p>`:""}
        </div>
        ${expand?"":`<button type="button" id="mobile-expand" style="align-self:center;" class="btn btn-secondary show-mobile" onclick=mobileExpand(${idx})>Details</button>`}
      </div>`;
}

function mobileExpand(idx){
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

  bodyScrollLock.enableBodyScroll(document.getElementById('brand'));
  bodyScrollLock.disableBodyScroll(document.getElementById('locWindow'));
}

function mobileClose(){
  infowindow.close();
  bodyScrollLock.enableBodyScroll(document.getElementById('locWindow'));
  document.getElementById('infowindow').innerHTML = "";
  document.getElementById('infowindow').style.background = "transparent";
  document.getElementById('infowindow').style.opacity = "0";
  document.getElementById('infowindow').style.minHeight = "0";
  bodyScrollLock.disableBodyScroll(document.getElementById('brand'));
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

/* THIS IS JUST TO SHOW BOTH TYPES OF MARKERS I MADE, DELETE LATER*/
  new google.maps.Marker({
    position: providence, 
    icon: 'images/marker2.png',
    map: map});

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
bodyScrollLock.disableBodyScroll(document.getElementById('brand'));