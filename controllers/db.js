// app.get('/landmarks', mongoHandler.getLandmarks);
// app.post('/landmarks', mongoHandler.createLandmark);
// app.post('/landmarks/:id', mongoHandler.editLandmark);

const Landmark = require('../Landmark.js');

function genId() {
    // make a list of legal characters
    // we're intentionally excluding 0, O, I, and 1 for readability
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    let result = '';
    for (let i = 0; i < 6; i++)
        result += chars[(Math.floor(Math.random() * chars.length))];

    return result;
}

function getLandmarks(request, response) {
    console.log("get request");
    Landmark.find({}, function(err, landmarks) {
        if (err) return console.error(err);
        console.log(landmarks);
        response.json(landmarks)
    });
}

function createLandmark(request, response){
    const id = genId();
    let new_lm = request.body;
    new_lm.id = id;
    console.log("create request: " + id);
    console.log(new_lm);
    const landmark = new Landmark(new_lm);
    landmark.save(function(err, data) {
        if (err) return console.error(err);
    });
    // response.redirect('/' + id)
    response.json({'id': id});
}

function editLandmark(request, response){
    let id = request.params.id;
    let new_lm = request.body;
    console.log("edit request: " + id);
    console.log(new_lm);
    
    Landmark.updateOne({"id": id}, new_lm, { runValidators: true });
    response.json({'ok': 1}); // ....????
}

function deleteLandmark(request, response){
    let id = request.params.id;
    console.log("delete request: " + id);
    Landmark.deleteOne({"id": id}, function (err) {
        if (err) return console.error(err);
        // deleted at most one document
        console.log("deleted a thing");
      });
    response.json({'ok': 1});
}

module.exports = {
    getLandmarks,
    createLandmark,
    editLandmark,
    deleteLandmark
}