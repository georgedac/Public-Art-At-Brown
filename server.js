// import dependencies
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const multer = require("multer");
const cloudinary = require("cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const expressSession = require('express-session');
const ensureLogin = require('connect-ensure-login');

// import handlers
const dbHandler = require('./controllers/db.js');

// environment variable: cloudinary://748597412478562:tdki5gztC34rwMsQJrk3KyDyVfc@dputr77ta/
cloudinary.config({
    cloud_name: 'dputr77ta',
    api_key: '748597412478562',
    api_secret: 'tdki5gztC34rwMsQJrk3KyDyVfc'
    });
    const storage = cloudinaryStorage({
    cloudinary: cloudinary,
    folder: "demo",
    allowedFormats: ["jpg", "png"],
    // transformation: [{ width: 500, height: 500, crop: "limit" }]
    });
    const parser = multer({ storage: storage });

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// set up auth
passport.use(new LocalStrategy(
    function(username, password, done) {
        console.log("checking creds");
        if(username == "admin" && password == "admin"){
            console.log("checks out");
            return done(null, {id: "1"});
        }
        console.log("nah bad creds");
        return done(null, false);
    }
  ));
  // Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function(user, cb) {
    cb(null, user.id);
  });
  
  passport.deserializeUser(function(id, cb) {
    if(id == "1") {
        return cb(null, {id: "1"});
    } else {
        cb("problem", false);
    }
  });

app.use(expressSession({ secret: 'blueno', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// // If you choose not to use handlebars as template engine, you can safely delete the following part and use your own way to render content
// // view engine setup
// app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layouts/'}));
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'hbs');

app.get('/landmarks', dbHandler.getLandmarks);
app.post('/landmarks', parser.array('files'), dbHandler.createLandmark);
app.put('/landmarks/:id', parser.array('files'), dbHandler.editLandmark);
app.delete('/landmarks/:id', dbHandler.deleteLandmark);

// Create controller handlers to handle requests at each endpoint
app.get('/list', function(req, res) {
    res.sendFile(path.join(__dirname + '/views/list.html'));
});
app.post('/login', 
passport.authenticate('local', { failureRedirect: '/' }),
function(req, res) {
  res.redirect('/admin');
});
app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});
app.get('/admin', 
ensureLogin.ensureLoggedIn(),
function(req, res) {
    res.sendFile(path.join(__dirname + '/views/admin-index.html'));
});
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/views/index.html'));
});

// NOTE: This is the sample server.js code we provided, feel free to change the structures

app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));