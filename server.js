// import dependencies
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

// import handlers
const dbHandler = require('./controllers/db.js');

const app = express();
const port = 8080;

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// // If you choose not to use handlebars as template engine, you can safely delete the following part and use your own way to render content
// // view engine setup
// app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layouts/'}));
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'hbs');

app.get('/landmarks', dbHandler.getLandmarks);
app.post('/landmarks', dbHandler.createLandmark);
app.post('/landmarks/:id', dbHandler.editLandmark);

// Create controller handlers to handle requests at each endpoint
app.get('/list', function(req, res) {
    res.sendFile(path.join(__dirname + '/views/list.html'));
});
app.get('/admin', function(req, res) {
    res.sendFile(path.join(__dirname + '/views/admin-index.html'));
});
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/views/index.html'));
});

// NOTE: This is the sample server.js code we provided, feel free to change the structures

app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));