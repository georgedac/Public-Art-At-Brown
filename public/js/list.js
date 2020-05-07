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

// Helper functions
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
  // end helper functions (we should probably export these into a separate js doc)

function windowContent(idx, expand=false) {
  let loc = locs[idx];
  if (!loc.files) loc.files=[];
  let carousel = `
  <div id="carousel" class="carousel-custom">
    ${(loc.files.length == 1) ? 
      `<div class="carousel-item-single-custom">
      ${(loc.files[0].is360 ?
        `<iframe title="images of this artwork" src=https://storage.googleapis.com/vrview/2.0/embed?image=${loc.files[0].url}></iframe>`:
        `<img src="${loc.files[0].url}" alt="${loc.title}">`)}
      </div>`
    : 
    loc.files.map((file,idx) => 
      `<div class="carousel-item-custom ${(idx==0)?"active":""}">
        ${(file.is360 ?
          `<iframe title="images of this artwork" src=https://storage.googleapis.com/vrview/2.0/embed?image=${file.url}></iframe>`:
          `<img src="${file.url}" alt="${loc.title}">`)}
      </div>`
      )}
    
  </div>
  `;
  return `<div class="infowindow listItem ${expand?"mobile-pad":""}">
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
    <button type="button" id="mobile-close" style="color: white;font-weight:bold;" onclick=mobileClose(${idx})>Close</button>
  </nav>
  ${windowContent(idx, true)}
  `;
  document.getElementById('markerWrapper' + idx).innerHTML = content;
  document.getElementById('markerWrapper' + idx).style.background = "white";
  document.getElementById('markerWrapper' + idx).style.opacity = "1";
  document.getElementById('markerWrapper' + idx).style.minHeight = "100vh";
  document.getElementById('markerWrapper' + idx).style.position = "fixed"; 
  document.getElementById('markerWrapper' + idx).style.top = "0";
  document.getElementById('markerWrapper' + idx).style.left = "0";
  document.getElementById('markerWrapper' + idx).style.zIndex= "2";
  bodyScrollLock.disableBodyScroll(document.getElementById('markerWrapper' + idx));
}
  
function mobileClose(idx){
  document.getElementById('markerWrapper' + idx).innerHTML = windowContent(idx);
  document.getElementById('markerWrapper' + idx).style.minHeight = "0";
  document.getElementById('markerWrapper' + idx).style.position = "relative"; 
  document.getElementById('markerWrapper' + idx).style.zIndex= "1";
  bodyScrollLock.enableBodyScroll(document.getElementById('markerWrapper' + idx));
}

fetch('/landmarks')
  .then(response => response.json())
  .then(data => {
    console.log(data)
    locs = data;
    markers = locs.map((loc,idx) => {
      let marker = document.createElement("div");
      marker.id = "markerWrapper" + idx;
      marker.innerHTML = windowContent(idx);
      document.getElementById("listView").appendChild(marker);
    })
    return markers
});
