const Joi = require('joi');
const fs = require('fs');
const mysql = require('mysql');
const { parse } = require('csv-parse');
const express = require('express');
const storage = require('node-persist');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");

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

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'canedhamburgers@gmail.com',
    pass: 'zynropcdfvokqnqg'
  }
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected to DB");
    con.query("CREATE DATABASE music", function (err, result) {
      if (err) {
      } else {
        //console.log("New database created");
      }
    });
});

// Add various headers to each request
app.use( (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, PUT, GET, OPTIONS, DELETE');
    res.header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

    if(req.path !== '/api/v1/login/credentials') {
      let token = req.header('Authorization');
      jwt.verify(token, process.env.JWT_KEY || 'se3316', (err, decoded) => {
        //console.log(decoded);
      });
    }
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

    const schema = Joi.alternatives().try({
        lim: Joi.number().min(1).required(),
        track_title: Joi.string().required(),
        album_title: Joi.string(),
        genre_title: Joi.string(),
        artist_name: Joi.string()
    }, {
        lim: Joi.number().min(1).required(),
        track_title: Joi.string(),
        album_title: Joi.string().required(),
        genre_title: Joi.string(),
        artist_name: Joi.string()
    }, {
        lim: Joi.number().min(1).required(),
        track_title: Joi.string(),
        album_title: Joi.string(),
        genre_title: Joi.string().required(),
        artist_name: Joi.string()
    }, {
        lim: Joi.number().min(1).required(),
        track_title: Joi.string(),
        album_title: Joi.string(),
        genre_title: Joi.string(),
        artist_name: Joi.string().required()
    });

    const result = Joi.validate({lim: limit, track_title: trackTitle, album_title: albumTitle, genre_title: genreTitle, artist_name: artistName}, schema);

    if (result.error) res.status(400).send(result.error.details[0].message);
    else {
    var sql = "SELECT * FROM music.tracks WHERE LOCATE(?, track_title) or LOCATE(?, album_title) or LOCATE(?, track_genres) or LOCATE(?, artist_name) limit ?;";
    con.query(sql,[trackTitle,albumTitle,genreTitle,artistName,lim], function (err, result) {
        if (err) throw err;
        res.send(result);
      });
    }
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
    
    const schema = { limit: Joi.number().required(), name: Joi.string().required() };
    const result = Joi.validate({ limit: limit, name: name }, schema);
    if (result.error) res.status(400).send(result.error.details[0].message);
    else {
    const lim = parseInt(limit);
    var sql = "SELECT * FROM artists WHERE LOCATE(?, artist_name) limit ?;";
    con.query(sql,[name,lim], function (err, result) {
        if (err) {
            res.send (err);
        } else {
            res.send(result);
        }
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
    const schema = Joi.string().required().max(25);
    const result = Joi.validate(listName, schema);
    if (result.error) res.status(400).send(result.error.details[0].message);
    else {
    var sql = "INSERT INTO playlists (listName, trackCount, tracks, totalPlayTime) VALUES ?";
    var values = [[listName,0,'[]','00:00']];
  con.query(sql,[values], function (err, result) {
    if (err) {
        res.send("Playlist already exists!");
    } else {
        res.send("Playlist created");
    }
  });
}
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
    const schema = { list: Joi.string().required(), body: { tracks: Joi.array().items(Joi.number()).required() } };
    const result = Joi.validate({list: listName, body: req.body}, schema);

    if (result.error) res.status(400).send(result.error.details[0].message);
    else {
    var sql = "UPDATE playlists SET trackCount = ? WHERE listName = ?"
    var sql2 = "UPDATE playlists SET tracks = '[?]' WHERE listName = ?"
    var sql3 = "UPDATE playlists " + 
                    "SET totalPlayTime = ("+
                    "SELECT SEC_TO_TIME(SUM(TIME_TO_SEC(track_duration)))"+ 
                    "FROM tracks WHERE track_id IN (?)"+
                    ")" + 
                    "WHERE playlists.listName = ?"
    var sql4 = "DELETE FROM listcontents WHERE listName = ?"
    var sql5 = "INSERT INTO listcontents "+
                    "SELECT * FROM(select listName from playlists where listName = ?) n"+ 
                    "cross join (SELECT * FROM music.tracks WHERE track_id IN (?)) det"
    var count = tracks.length;
    var name = listName;
  con.query(sql+";"+sql2+";"+sql3+";"+sql4+";"+sql5,[count,name,tracks,name, tracks,name,name,name,tracks], function (err, result) {
    if (err) {
        res.send(err)
    } else {
       res.send(req.body);
    }
});
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

// Get the list of track for a given list
app.get('/api/v1/music/lists/:listName/tracks', async (req, res) => {

    // Received Object Structure:
    // N/A

    // Retrieve and verify input parameter
    let listName = req.params.listName;
    const schema = Joi.string().required();
    const result = Joi.validate(listName, schema);

    if (result.error) res.status(400).send(result.error.details[0].message);
    else {
    var sql = "SELECT track_id, album_id, album_title, artist_name, tags, track_date_created, track_date_recorded, "+
     "track_duration, track_genres, track_image_file, track_number, track_title from listcontents where listName = ?";
  con.query(sql,[listName], function (err, result) {
    if (err) {
        res.send("Playlist doesn't exist!");
    } else {
        res.send(result);
    }
  });
}

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
    var sql = "DELETE FROM listcontents WHERE listName = ?"
    var sql2 = "DELETE FROM playlists WHERE listName = ?"
    con.query(sql+";"+sql2,[listName,listName], function (err, result) {
        if (err) {
            res.send(err);
        } else {
            res.send("Playlist deleted");
        }
      });
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

// Validate login attempt
app.post('/api/v1/login/credentials', (req, res) => {

  // Received Object Structure:
  // {
  //    username: string,
  //    password: string
  // }

  const schema = { username: Joi.string().required(), password: Joi.string().required() };
  const result = Joi.validate({ username: req.body.username, password: req.body.password }, schema);

  if (result.error) res.status(400).send(result.error.details[0].message);
  else {
    var sql = `SELECT * FROM music.credentials WHERE (username = '${req.body.username}' OR email = '${req.body.username}') AND password = '${req.body.password}'`;
    con.query(sql, function (err, result) {
      if (err) throw err;
      if (result.length) {
        if (result[0]?.status === 'Deactivated') res.status(400).send("Your account is no longer active, please contact the site administrator");
        else if (result[0]?.status === 'Temp') res.status(400).send("Please verify your account to continue");
        else {
          const token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + (5 * 60 * 60), // 5 hour expiry
            username: result[0]?.username,
            access_level: result[0].access_level
          }, process.env.JWT_KEY || 'se3316');
          res.send({jwt: token});
        }
      }
      else res.status(400).send("Invalid Credentials");
    });
  }

  // Sent Object Structure:
  // access_level: int
});

// Create new account
app.put('/api/v1/login/credentials', async (req, res) => {

  // Received Object Structure:
  // {
  //    username: string,
  //    email: string
  //    password: string
  // }

  const schema = { username: Joi.string().required(), Email: Joi.string().email().required(), password: Joi.string().required() };
  const result = Joi.validate({ username: req.body.username, Email: req.body.email, password: req.body.password }, schema);

  if (result.error) res.status(400).send(result.error.details[0].message);
  else {
    var existsCheck = `SELECT * FROM music.credentials WHERE username = '${req.body.username}' OR email = '${req.body.email}'`;
    con.query(existsCheck, function (err, result) {
      if (err) throw err;
      if (result.length) res.status(400).send('Username or Email already taken');
      else {
        var sql = `INSERT INTO music.credentials (username, email, password, status) VALUES('${req.body.username}', '${req.body.email}', '${req.body.password}', 'Temp')`;
        con.query(sql, async function (err, result) {
          if (err) {
            res.status(500);
            throw err;
          }
          const token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + (5 * 60 * 60), // 5 hour expiry
            username: req.body.username,
            password: req.body.password
          }, process.env.JWT_KEY || 'se3316');

          var mailOptions = {
            from: 'canedhamburgers@gmail.com',
            to: req.body.email,
            subject: 'Verify Email Address for Music App',
            text: `
            Verify your email address using this link:
            ${process.env.BASE_URL || 'http://localhost'}:3000/api/v1/login/credentials/verify/${token}
            `
          };

          transporter.sendMail(mailOptions, (err, info) => {});

          res.send({result: 'Success'});
        });
      }
    });
  }

  // Sent Object Structure:
  // access_level: int
});

app.get('/api/v1/login/credentials/verify/:jwt', async (req, res) => {
  let token = req.params.jwt;
  jwt.verify(token, process.env.JWT_KEY || 'se3316', (err, decoded) => {
    if (err) res.status(500);

    var sql = `UPDATE music.credentials SET status = 'Active' WHERE (username = '${decoded.username}') AND (password = '${decoded.password}');`;
    con.query(sql, function (err, result) {
      if (err) throw err;
      else res.status(200).send('Your credentials have been verified, you can close this page.');
    });
  });
});

app.get('/api/v1/login/credentials/all', async (req, res) => {
  let token = req.header('Authorization');
  jwt.verify(token, process.env.JWT_KEY || 'se3316', (err, decoded) => {
    if (err) res.status(500);
    if (decoded.access_level !== 3) return;

    var sql = `SELECT username, email, status, access_level FROM music.credentials;`;
    con.query(sql, function (err, result) {
      if (err) throw err;
      else {
        res.status(200).send(result);
      }
    });
  });
});

app.post('/api/v1/login/credentials/update', async (req, res) => {
  let token = req.header('Authorization');
  jwt.verify(token, process.env.JWT_KEY || 'se3316', (err, decoded) => {
    if (err) res.status(500);

    if (decoded.access_level !== 3) res.status(401);
    else {
      const schema = { newValue: Joi.string().required(), att: Joi.string().required() };
      const result = Joi.validate({ newValue: req.body.newValue, att: req.body.att }, schema);

      if (result.error) res.status(400).send(result.error.details[0].message);
      else {
        var sql = `UPDATE music.credentials SET ${req.body.att} = '${req.body.newValue}' WHERE (username = '${req.body.user.username}') AND (email = '${req.body.user.email}');`;
        con.query(sql, function (err, result) {
          if (err) throw err;
          else res.status(200);
        });
      }
    }
  });
});

// Listen to the specified port
app.listen(port, () => console.log(`Listening on port ${port}...`));
