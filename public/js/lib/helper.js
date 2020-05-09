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


function toggleForm() {
    let form = document.getElementById("signinForm");
    if (form.style.left == "-300px" || form.style.left == "") {
      form.style.left = "0px";
    } else {
      form.style.left = "-300px";
    }
}