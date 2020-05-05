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
let listView = document.getElementById("listView");
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
  return `<div class="infowindow listItem ${expand?"mobile-pad":""}">
        <div class="hide-mobile">${carousel}</div>
        ${(loc.files.length > 0)?(expand ? carousel: `<img class="w-100 show-mobile" src=${loc.files[0].url}>`):""}
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
  bodyScrollLock.disableBodyScroll(document.getElementById('infowindow'));
}
  
function mobileClose(){
  infowindow.close();
  listView.innerHTML = "";
  listView.style.background = "transparent";
  listView.style.opacity = "0";
  listView.style.minHeight = "0";
  bodyScrollLock.enableBodyScroll(listView);
}

fetch('/landmarks')
  .then(response => response.json())
  .then(data => {
    console.log(data)
    locs = data;
    markers = locs.map((loc,idx) => {
        listView.innerHTML += windowContent(idx);
    })
    return markers
});
