# Public-Art-At-Brown
Hello! This is a website to display all public art at Brown University.

## Running the project
Getting the project to run locally should be simple: navigate to the folder on the node.js cli, 
then run "npm install" to install all node-modules. After that, run "npm run start" for the website to
begin running on port 8080.

The project is also deployed on heroku at public-art-at-brown.herokuapp.com

## Database structure
let locs: {
    title: string;
    artist: string;
    description: string;
    location: {
        lat: number;
        lng: number;
    };
    files: string[];
}[]

## Authors
Katie Scholl '19 M'20, George Daccache '21
