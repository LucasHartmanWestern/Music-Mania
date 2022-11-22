const Joi = require('joi');
const fs = require('fs');
const mysql = require('mysql');
const { parse } = require('csv-parse');
const express = require('express');
const storage = require('node-persist');

const app = express(); // Call express function to get Express type object
app.use (express.json()); // Add middleware to enable json parsing
const port = process.env.PORT || 3000; // Specify port or use 3000 by default

 // Initialize storage
(async () => {
    await storage.init({dir: 'storage/music/'})
})();

var con = mysql.createConnection({
    host: "localhost",
    user: "user",
    password: "listener",
    database: "music",
    multipleStatements : true
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    con.query("CREATE DATABASE music", function (err, result) {
      if (err) {
        console.log("Database already created");
      } else {
        console.log("New database created");
      }
    });
});

// Add various headers to each request
app.use( (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, PUT, GET, OPTIONS, DELETE');
    res.header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    next();
});

// Get all available genre names, IDs and parent IDs
app.get('/api/v1/music/genres', (req, res) => {

    // Received Object Structure:
    // N/A

    var sql = "SELECT * FROM music.genres";
    con.query(sql, function (err, result) {
        if (err) throw err;
        res.send(result);
      });

    // Sent Object Structure:
    // [
    //   ...
    //   {
    //      "genre_id": int,
    //      "#tracks": int,
    //      "parent": int,
    //      "title": string,
    //      "top_level": int
    //    }
    //   ...
    // ]
});

// Get the first n number of matching track IDs for a given search pattern matching the track title or album
// If the number of matches is less than n, then return all matches
app.get('/api/v1/music/tracks', (req, res) => {

    // Received Object Structure:
    // N/A

    // Retrieve and verify input parameters
    const trackTitle = req.query['track_title'];
    const albumTitle = req.query['album_title'];
    const genreTitle = req.query['genre_title'];
    const artistName = req.query['artist_name'];
    const limit = req.query['limit'];

    const lim = parseInt(limit);
    var sql = "SELECT * FROM music.tracks WHERE LOCATE(?, track_title) or LOCATE(?, album_title) or LOCATE(?, track_genres) or LOCATE(?, artist_name) limit ?;";
    con.query(sql,[trackTitle,albumTitle,genreTitle,artistName,lim], function (err, result) {
        if (err) throw err;
        res.send(result);
      });
    // Sent Object Structure:
    // [
    //   ...
    //   {
    //     "trackID": int,
    //     "albumId": int,
    //     "albumTitle": string,
    //     "artistName": string,
    //     "tags": string,
    //     "trackDateCreated": "MM/DD/YYYY HH:MM",
    //     "trackDateRecorded": "MM/DD/YYYY",
    //     "trackDuration": "MM:SS",
    //     "trackGenres": string,
    //     "trackNumber": int,
    //     "trackTitle": string,
    //     "trackImage": string (URL)
    //   }
    //   ...
    // ]
});

// Get all the matching artist IDs for a given search pattern matching the artist's name
app.get('/api/v1/music/artists', (req, res) => {

    // Received Object Structure:
    // N/A

    // Retrieve and verify input parameters
    const name = req.query['name'];
    const limit = req.query['limit'];
    let returnObj = [];
    const schema = { limit: Joi.number().required(), name: Joi.string().required() };
    const result = Joi.validate({ limit: limit, name: name }, schema);

    if (result.error) res.status(400).send(result.error.details[0].message);
    else {
        let counter = 0;
        // Loop through artist list and return the artists found
        fs.createReadStream('storage/lab3-data/raw_artists.csv')
            .pipe(parse({ delimiter: ',', columns: true, ltrim: true }))
            .on('data', (row) => {
                if (row['artist_name'].toLowerCase().includes(name.toLocaleLowerCase()) && counter <= limit) {
                    returnObj.push(row);
                    counter++;
                }
            })
            .on('error', (error) => {
                res.status(500).send(error.message);
            })
            .on('end', () => {
                if (!returnObj.length) res.status(404).send('No matching artists found');
                else res.send(returnObj);
            });
    }

    // Sent Object Structure:
    // [
    //   ...
    //   {
    //     "artist_id": int,
    //     "artist_active_year_begin": string,
    //     "artist_active_year_end": string,
    //     "artist_associated_labels": string,
    //     "artist_bio": string,
    //     "artist_comments": string,
    //     "artist_contact": string,
    //     "artist_date_created": "MM/DD/YYYY HH:MM:SS AM/PM",
    //     "artist_donation_url": string,
    //     "artist_favorites": string,
    //     "artist_flattr_name": string,
    //     "artist_handle": string,
    //     "artist_image_file": string (url),
    //     "artist_images": string,
    //     "artist_latitude": string,
    //     "artist_location": string,
    //     "artist_longitude": string,
    //     "artist_members": string,
    //     "artist_name": string,
    //     "artist_paypal_name": string,
    //     "artist_related_projects": string,
    //     "artist_url": string (url),
    //     "artist_website": string,
    //     "artist_wikipedia_page": string,
    //     "tags": string
    //   }
    //   ...
    // ]
});

// Create a new list to save a list of tracks with a given list name
// Return an error if name exists
app.put('/api/v1/music/lists/:listName', async (req, res) => {

    // Received Object Structure:
    // tracks: []

    // Retrieve and verify input parameter and body
    let listName = req.params.listName;
    var sql = "INSERT INTO playlists (listName, trackCount, tracks, totalPlayTime) VALUES ?";
    var values = [[listName,0,'[]','00:00:00']];
  con.query(sql,[values], function (err, result) {
    if (err) {
        res.send("Playlist already exists!");
    } else {
        res.send("Playlist created");
    }
  });

    // Sent Object Structure:
    // {"tracks":[]}
});

// Save a list of track IDs to a given list name
// Return an error if the list name does not exist
// Replace existing track IDs with new values if the list exists
app.put('/api/v1/music/lists/:listName/tracks', async (req, res) => {

    // Received Object Structure:
    // {
    //    tracks : [
    //      ...
    //      int
    //      ...
    //    ]
    // }

    // Retrieve and verify input parameter and body
    let listName = req.params.listName;
    const {tracks} = req.body;
    var sql = "UPDATE playlists SET trackCount = ? WHERE listName = ?"
    var sql2 = "UPDATE playlists SET tracks = '[?]' WHERE listName = ?"
    var sql3 = "UPDATE playlists " + 
                    "SET totalPlayTime = ("+
                    "SELECT SEC_TO_TIME(SUM(TIME_TO_SEC(track_duration)))"+ 
                    "FROM tracks WHERE track_id IN (?)"+
                    ")" + 
                    "WHERE playlists.listName = ?"
    var count = tracks.length;
    var name = listName;
  con.query(sql+";"+sql2+";"+sql3,[count,name,tracks,name, tracks,name,name], function (err, result) {
    if (err) {
        res.send(err)
    } else {
       res.send(req.body);
    }
});
    

    // Sent Object Structure:
    // {
    //    "tracks" : [
    //      ...
    //      int
    //      ...
    //    ]
    // }
});

// Get the list of track for a given list
app.get('/api/v1/music/lists/:listName/tracks', async (req, res) => {

    // Received Object Structure:
    // N/A

    // Retrieve and verify input parameter
    let listName = req.params.listName;
    const schema = Joi.string().required();
    const result = Joi.validate(listName, schema);

    let trackIDs = [];
    let returnList = [];
    var sql = "SELECT tracks FROM playlists WHERE listName = ?";
  con.query(sql,[listName], function (err, result) {
    if (err) {
        res.send("Playlist doesn't exist!");
    } else {
        res.send(result);
    }
  });


    // Sent Object Structure:
    // [
    //   ...
    //   {
    //      "trackID": int,
    //      "albumId": int,
    //      "albumTitle": string,
    //      "artistName": string,
    //      "tags": string,
    //      "trackDateCreated": "MM/DD/YYYY HH:MM",
    //      "trackDateRecorded": "MM/DD/YYYY HH:MM",
    //      "trackDuration": "MM:SS",
    //      "trackGenres": string,
    //      "trackNumber": int,
    //      "trackTitle": string,
    //      "trackImage": string (url)
    //   }
    //   ...
    // ]
});

// Delete a list of tracks with a given name
// Return an error if the given list doesn’t exist
app.delete('/api/v1/music/lists/:listName', async (req, res) => {

    // Received Object Structure:
    // N/A

    // Retrieve and verify input parameter
    let listName = req.params.listName;
    const schema = Joi.string().required();
    const result = Joi.validate(listName, schema);

    if (result.error) res.status(400).send(result.error.details[0].message);
    else {
        // Check that list exisits, and if it does delete it
        if (!(await storage.getItem(listName))) res.status(404).send('List doesn\'t exists');
        else {
            const deletedVal = await storage.getItem(listName);
            await storage.removeItem(listName);
            res.send(deletedVal);
        }
    }

    // Sent Object Structure:
    // {
    //    "tracks" : [
    //      ...
    //      int
    //      ...
    //    ]
    // }
});

// Get a list of list names, number of tracks that are saved in each list and the total play time of each list
app.get('/api/v1/music/lists', async (req, res) => {

    // Received Object Structure:
    // N/A

    // Get saved list info
    var sql = "SELECT * FROM playlists";
  con.query(sql, function (err, result) {
    if (err) {
        res.send("Playlist doesn't exist!");
    } else {
        res.send(result);
    }
  });

    // Sent Object Structure:
    // [
    //   ...
    //   {
    //     "listName": string,
    //     "trackCount": int,
    //     "trackList": [
    //        ...
    //        int
    //        ...
    //      ],
    //     "totalPlayTime": int
    //   }
    //   ...
    // ]
});

// Listen to the specified port
app.listen(port, () => console.log(`Listening on port ${port}...`));
