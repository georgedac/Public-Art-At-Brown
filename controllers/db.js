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
    Landmark.find({}, function(err, landmarks) {
        if (err) return console.error(err);
        response.json(landmarks)
    });
}

function createLandmark(request, response){
    // let messages = [{'message': 'hi', 'nickname': 'penguin', 'timestamp': '0'}]
    const id = genId();
    new_lm.id = id;
    const landmark = new Landmark(new_lm
    // {
    //     id: String,
    //     title: String,
    //     artists: String,
    //     description: String,
    //     location: {
    //         lat: Number,
    //         lng: Number
    //     },
    //     files: [{
    //         url: String
    //     }]
    // }
    );
    landmark.save(function(err, data) {
        if (err) return console.error(err);
    });
    // response.redirect('/' + id)
    response.json({'id': id});
}

function editLandmark(request, response){
    // let messages = [{'message': 'hi', 'nickname': 'penguin', 'timestamp': '0'}]
     // need to pass info in (id, new_lm)
    
    Landmark.updateOne({id}, new_lm, { runValidators: true });
    response.json({'ok': 1});
}

module.exports = {
    getLandmarks,
    createLandmark,
    editLandmark
}