// global variables
let locs = [
  {
    title: "Untitled (Lamp/Bear)", 
    artists: "Urs Fischer",
    description: `2005-06. Painted and lacquered cast bronze, acrylic glass, LED lights, stainless steel` + ` 
    interior framework. 23' x 21'4" x 24'7". Lent from the Steven and Alexandra Cohen Collection. ` + 
    `Installed on Simmons Quad near Ashamu Dance Studio, fall 2016`,
    location: {lat: 41.8265259, lng: -71.4014886},
    files: ['https://i0.wp.com/blognonian.com/wp-content/uploads/2016/10/Blueno.jpg?w=412']
  }
  ];
let infowindow = null;
let markers = [];
let showingTempMarker = false;
let tempMarkerID = null;
let map = null;
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

function getCarousel(idx) {
  let loc = locs[idx];
  if (!loc.files) loc.files=[];
  return `
  <div id="carousel" class="carousel slide" data-ride="carousel">
    <ol class="carousel-indicators">
      ${loc.files.map((file,idx) => 
      `<li data-target="#carousel" data-slide-to="${idx}" ${(idx==0)?"class='active'":""}></li>`)}
    </ol>
    <div class="carousel-inner">
      ${loc.files.map((file,idx) => 
        `<div class="carousel-item ${(idx==0)?"active":""}">
          ${(file.is360 ?
            `<iframe class="size-img" src=https://storage.googleapis.com/vrview/2.0/embed?image=${file.url}></iframe>`:
            `<img class="size-img" src="${file.url}">`)}
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
}

function locationWindow(idx) {
  let loc = locs[idx];
  let carousel = getCarousel(idx);
  let content = `<div>
        ${carousel}
        <h1 class="title">${loc.title}</h1>
        <div>
          <p class="artist">Artist(s): ${loc.artists}</p>
          <p class="desc">${replaceNewline(loc.description)}</p>
        </div>
        <button type="button" onclick="editWindow(${idx})">Edit</button>
      </div>`;
  infowindow.setContent(content);
  infowindow.open(map, markers[idx]);
}

function editWindow(idx) {
  let loc = locs[idx];
  let carousel = getCarousel(idx);
  let content = `<div>
        ${carousel}
        <form id="editForm">
          <label for="formFiles">Upload (hold CTRL or SHIFT to select multiple):</label><br>
          <input type="file" id="formFiles" name="files" multiple><br><br>
          <label for="formTitle">Title:</label><br>
          <input type="text" id="formTitle" name="title" value="${loc.title}"><br>
          <label for="formArtist">Artist(s):</label><br>
          <input type="text" id="formArtist" name="artists" value="${loc.artists}"><br>
          <label for="formDescription">Description:</label><br>
          <textarea id="formDescription" name="description" style="width:562px;height:100px;">${loc.description}</textarea><br>
          <button type="button" onclick=locationWindow(${idx})>Cancel</button>
          <button type="button" onclick="onDelete(${idx})">Delete</button>
          <button type="button" onclick="onEdit(${idx})">Save</button>
        </form>
      </div>`;
  infowindow.setContent(content);
  infowindow.open(map, markers[idx]);
}

function createWindow(idx) {
  showingTempMarker= false;
  locs[idx] = {title: "", artist: "", description: "", files: []};
  loc = locs[idx];
  let carousel = getCarousel(idx);
  let content = `<div>
        ${carousel}
        <button type="button">Upload</button>
        <form id="createForm">
          <label for="cFormFiles">Upload (hold CTRL or SHIFT to select multiple):</label><br>
          <input type="file" id="cFormFiles" name="files" multiple><br><br>
          <label for="cFormTitle">Title:</label><br>
          <input type="text" id="cFormTitle" name="title" value="${loc.title}"><br>
          <label for="cFormArtist">Artist:</label><br>
          <input type="text" id="cFormArtist" name="artists" value="${loc.artist}"><br>
          <label for="cFormDescription">Description:</label><br>
          <textarea id="cFormDescription" name="description" style="width:562px;height:100px;">${loc.description}</textarea><br>
          <button type="button" onclick="removeMarker(${idx})">Cancel</button>
          <button type="button" onclick="onCreate(${idx})">Save</button>
        </form>
      </div>`;
  infowindow.setContent(content);
  infowindow.open(map, markers[idx]);
}

function onDelete(idx) {
  let r = confirm("Are you sure you want to delete this landmark? The action can't be undone.");
  if(!r){
    return;
  }
  let loc = locs[idx];
  removeMarker(idx);
  console.log("requesting to delete: " + loc.id);
  fetch(`/landmarks/${loc.id}`, {
    method: 'DELETE'
  })
    .then(response => response.json())
    .then(data => {
      console.log("got something back from delete!");}) // check if good response I guess?
}

function onEdit(idx) {
  // ftitle, artist, description
  // TODO upload (files)
  // TODO allow people to move markers? show current location w/ lng/lat?
  let formData = new FormData(document.getElementById('editForm'));
  const loc = locs[idx];
  let message = {
    'title': document.getElementById('formTitle').value,
    'artists': document.getElementById('formArtist').value,
    'description': document.getElementById('formDescription').value
  }
  console.log("requesting edit");
  console.log(message);
  locs[idx].title = message.title;
  locs[idx].artists = message.artists;
  locs[idx].description = message.description;
  markers[idx].setTitle(message.title); // might need to refresh
  fetch(`/landmarks/${loc.id}`, {
    method: 'PUT',
    body: formData,
  })
    .then(response => response.json())
    .then(data => {
      console.log("got data back from edit!");
      // update with new_files
      console.log(data['new_files']);
      Array.prototype.push.apply(locs[idx].files, data['new_files']);
      // TODO force refresh??
    })
  locationWindow(idx);
}

function onCreate(idx) {
  let formData = new FormData(document.getElementById('editForm'));
  console.log(document.getElementById('cFormTitle').value);
  console.log(document.getElementById('cFormArtist').value);
  console.log(document.getElementById('cFormDescription').value);
  let message = {
    'title': document.getElementById('cFormTitle').value,
    'artists': document.getElementById('cFormArtist').value,
    'description': document.getElementById('cFormDescription').value,
    'location': {
      'lat': markers[idx].getPosition().lat(),
      'lng': markers[idx].getPosition().lng() // unclear if these are strings or what
    },
    'files': []
  }

  // update local storage
  locs[idx].title = message.title;
  locs[idx].artists = message.artists;
  locs[idx].description = message.description;
  locs[idx].location = message.location;
  locs[idx].files = message.files;

  // create non-temporary marker to handle click events
  let marker = new google.maps.Marker({
    position: markers[idx].getPosition(), 
    title: message.title, 
    map: map
  });
  marker.addListener('click', function() {
    infowindow.setContent(locationWindow(idx));
    infowindow.open(map, marker);
  });
  removeMarker(idx);
  markers[idx] = marker;

  console.log("requesting create");
  console.log(message);
  fetch(`/landmarks`, {
    method: 'POST',
    body: formData,
  })
    .then(response => response.json())
    .then(data => {
      console.log("got an id back from create! id:" + data.id);
      locs[idx].id = data.id;
      // locs[idx].files.push(...data['new_files']);
      console.log(data['new_files']);
      Array.prototype.push.apply(locs[idx].files, data['new_files']);
      // TODO force refresh??
    })
}

function placeMarker(location) {
      let marker = new google.maps.Marker({
          position: location, 
          map: map
      });
      markers.push(marker);
}

function removeMarker(idx) {
  markers[idx].setMap(null); // maybe should actually remove but yay indexing
  console.log("removed marker");
}

function initializeLandmarks() {
  fetch('/landmarks')
    .then(response => response.json())
    .then(data => {
      console.log(data)
      locs = data;
      markers = locs.map((loc,idx) => {
        let marker = new google.maps.Marker({
          position: loc.location, 
          title: loc.title,
          map: map});
        marker.addListener('click', function() {
          locationWindow(idx);
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
        //  {
        //    featureType: "road",
        //    elementType: "geometry.fill",
        //    stylers: [{color: "#fdf4dd"}]
        //  },
        //  {
        //    featureType: "road",
        //    elementType: "geometry.stroke",
        //    stylers: [{color: "#b8bdc8"}]
        //  },
        //  {
        //    featureType: "road",
        //    elementType: "labels.icon",
        //    stylers: [{visibility: "off"}]
        //  },
        //  {
        //    featureType: "road.local",
        //    elementType: "geometry.stroke",
        //    stylers: [{weight: 0.5}]
        //  },
        //  {
        //    elementType: "labels.text.stroke",
        //    stylers: [{visibility: "off"}]
        //    }
       ]
    });

  infowindow = new google.maps.InfoWindow();
  // center the view
  var marker = new google.maps.Marker({position: providence, map: map});
  marker.setVisible(false);
  initializeLandmarks();
  
  // set up click to create
  google.maps.event.addListener(map, 'click', function(event) {
    if(showingTempMarker){
      removeMarker(tempMarkerID);
    }
    idx = markers.length;
    placeMarker(event.latLng);
    showingTempMarker = true;
    tempMarkerID = idx;
    let content = `
  <button type="button" onclick="removeMarker(${idx})">Remove</button>
  `;
    markers[idx].addListener('click', function() {
      infowindow.setContent(content);
      infowindow.open(map, this);
    });
    infowindow.setContent(`
  <button type="button" onclick="createWindow(${idx})">Add New</button>
  `);
    infowindow.open(map, markers[idx]);
  });
  // workaround for cleaning up old markers when clicking elsewhere
  setInterval(function (){
    if(!infowindow.getMap() && showingTempMarker){
      removeMarker(tempMarkerID);
      showingTempMarker = false;
    }
  }, 1000);
}