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
let index = 0;
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
  return `<div class="infowindow listItem ${expand?"mobile-pad":""}">
        <div class="hide-mobile">${carousel}</div>
        ${(loc.files.length > 0)?(expand ? carousel: `<img class="w-100 show-mobile fullscreen" alt="${loc.title}" src=${loc.files[0].url}>`):""}
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
  /*bodyScrollLock.enableBodyScroll(document.getElementById('brand'));*/
  document.getElementById('markerWrapper' + idx).innerHTML = content;
  document.getElementById('markerWrapper' + idx).style.background = "white";
  document.getElementById('markerWrapper' + idx).style.opacity = "1";
  document.getElementById('markerWrapper' + idx).style.minHeight = "100vh";
  document.getElementById('markerWrapper' + idx).style.minWidth = "100vw";
  document.getElementById('markerWrapper' + idx).style.position = "fixed"; 
  document.getElementById('markerWrapper' + idx).style.top = "0";
  document.getElementById('markerWrapper' + idx).style.left = "0";
  document.getElementById('markerWrapper' + idx).style.zIndex= "2";
  /*bodyScrollLock.disableBodyScroll(document.getElementById('markerWrapper' + idx));*/
  index = idx;
  fullsc(x);
}
  
function mobileClose(idx){
  document.getElementById('markerWrapper' + idx).innerHTML = windowContent(idx);
  document.getElementById('markerWrapper' + idx).style.minHeight = "";
  document.getElementById('markerWrapper' + idx).style.position = "relative"; 
  document.getElementById('markerWrapper' + idx).style.zIndex= "1";
  document.getElementById('markerWrapper' + idx).style.minWidth = "";
  /*bodyScrollLock.enableBodyScroll(document.getElementById('markerWrapper' + idx));
  bodyScrollLock.disableBodyScroll(document.getElementById('brand'));*/
}

  /*Media Query style change for markerWrappers*/
  // let x = window.matchMedia("(orientation: landscape)");
  // x.addListener(fullsc); // Attach listener function on state changes
  // function fullsc(x) {
  //   if (x.matches) { // If media query matches
  //     document.getElementById('markerWrapper' + index).style.minWidth = "100vw";
  //   } else {
  //     document.getElementById('markerWrapper' + index).style.removeProperty("min-width");
  //   }
  // }

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

/*bodyScrollLock.disableBodyScroll(document.getElementById('brand'));*/
