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

// app.post('/api/images', parser.array('files'), (req, res) => {
//     console.log(req.file) // to see what is returned to you
//     const image = {};
//     image.url = req.files.url;
//     image.id = req.files.public_id;
//     Image.create(image) // save image information in database
//       .then(newImage => res.json(newImage))
//       .catch(err => console.log(err));
//   });

function createLandmark(request, response){
    const id = genId();
    let new_lm = request.body;
    console.log(request.files);
    new_lm.files = request.files.map(file => ({
        url: file.url,
        id: file.public_id,
        is360: false
    }))
    new_lm.id = id;
    console.log("create request: " + id);
    console.log(new_lm);
    const landmark = new Landmark(new_lm);
    landmark.save(function(err, data) {
        if (err) return console.error(err);
        console.log(data);
        console.log("edited a thing");
    });
    // response.redirect('/' + id)
    response.json({
        'id': id,
        'new_files': new_lm.files
    });
}

function editLandmark(request, response){
    let id = request.params.id;
    let new_lm = request.body;
    console.log(request.files);
    let new_files = request.files.map(file => ({
        url: file.url, // might need to be string?
        id: file.public_id,
        is360: false
    }));
    // TODO need to be able to remove previous files

    console.log("edit request: " + id);
    console.log(new_lm);
    
    Landmark.updateOne({"id": id}, {
        $push: { files: { $each: new_files } }, // might need to be string?
        $set: new_lm,
      }, { runValidators: true }, function(err, data) {
        if (err) return console.error(err);
        console.log(data);
        console.log("updated a thing");
      });
    response.json({'new_files': new_files}); // ....????
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