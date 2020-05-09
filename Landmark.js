const mongoose = require('mongoose');

const db = mongoose.connection;

db.on('error', console.error); // log any errors that occur

// bind a function to perform when the database has been opened
db.once('open', function() {
    // perform any queries here, more on this later
    console.log("Connected to DB!");
});

// process is a global object referring to the system process running this
// code, when you press CTRL-C to stop Node, this closes the connection
process.on('SIGINT', function() {
    mongoose.connection.close(function () {
        console.log('DB connection closed by Node process ending');
        process.exit(0);
    });
});
const url = 'mongodb+srv://dbUser:webapps@cluster0-w0tlw.mongodb.net/test?retryWrites=true&w=majority';
mongoose.connect(url, {useNewUrlParser: true});
const landmarkSchema = new mongoose.Schema({
    id: String,
    title: String,
    artists: String,
    description: String,
    location: {
        lat: Number,
        lng: Number
    },
    files: [{
        url: String,
        id: String,
        listID: String,
        fileType: {
            type: String,
            enum: ['image', 'video', 'audio', 'vr'],
            default: 'image'
        },
        label: String
    }]
});
    
const Landmark = mongoose.model('Landmark', landmarkSchema);

module.exports = Landmark;
