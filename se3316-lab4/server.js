const Joi = require('joi');
const fs = require('fs');
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

// Add various headers to each request
app.use( (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, PUT, GET, OPTIONS, DELETE');
    res.header("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    next();
});

// Get all available genre names, IDs and parent IDs
app.get('/api/v1/music/genres', (req, res) => {
    let returnObj = [];

    // Loop through all genres and return an array of their info
    fs.createReadStream('storage/lab3-data/genres.csv')
        .pipe(parse({ delimiter: ',', columns: true, ltrim: true }))
        .on('data', (row) => {
            returnObj.push(row);
        })
        .on('error', (error) => {
            res.status(500).send(error.message);
        })
        .on('end', () => {
            res.send(returnObj);
        });
});

// Get the artist details (at least 6 key attributes) given  an artist ID
app.get('/api/v1/music/artists/:id', (req, res) => {
    // Retrieve and verify input parameters
    const schema = Joi.number().required();
    const result = Joi.validate(req.params.id, schema);
    let found = false;

    if (result.error) res.status(400).send(result.error.details[0].message);
    else {
        // Loop through artists and return all details of artist once found
        fs.createReadStream('storage/lab3-data/raw_artists.csv')
            .pipe(parse({ delimiter: ',', columns: true, ltrim: true }))
            .on('data', (row) => {
                if (row['artist_id'] == req.params.id) {
                    res.send(row);
                    found = true;
                }
            })
            .on('error', (error) => {
                res.status(500).send(error.message);
            })
            .on('end', () => {
                if (!found) res.status(404).send('No artist with that ID were found');
            });
    }
});

// Get the first n number of matching track IDs for a given search pattern matching the track title or album
// If the number of matches is less than n, then return all matches
app.get('/api/v1/music/tracks', (req, res) => {
    // Retrieve and verify input parameters
    const trackTitle = req.query['track_title'];
    const albumTitle = req.query['album_title'];
    const genreTitle = req.query['genre_title'];
    const artistName = req.query['artist_name'];
    const limit = req.query['limit'];
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
    let count = 0;
    let returnObj = [];

    if (result.error) res.status(400).send(result.error.details[0].message);
    else {
        // Loop through all tracks and return any matching tracks
        fs.createReadStream('storage/lab3-data/raw_tracks.csv')
            .pipe(parse({ delimiter: ',', columns: true, ltrim: true }))
            .on('data', (row) => {
                if (count < limit &&
                    ((trackTitle && row['track_title'].toLowerCase().includes(trackTitle.toLocaleLowerCase())) ||
                    (albumTitle && row['album_title'].toLowerCase().includes(albumTitle.toLocaleLowerCase())) ||
                    (genreTitle && row['track_genres'].includes(genreTitle)) ||
                    (artistName && row['artist_name'].toLowerCase() == artistName.toLocaleLowerCase()))) {
                    returnObj.push({
                      trackID: row['track_id'],
                      albumId: row['album_id'],
                      albumTitle: row['album_title'],
                      artistName: row['artist_name'],
                      tags: row['tags'],
                      trackDateCreated: row['track_date_created'],
                      trackDateRecorded: row['track_date_recorded'],
                      trackDuration: row['track_duration'],
                      trackGenres: row['track_genres'],
                      trackNumber: row['track_number'],
                      trackTitle: row['track_title'],
                      trackImage: row['track_image_file']
                    });
                    count++;
                }
            })
            .on('error', (error) => {
                res.status(500).send(error.message);
            })
            .on('end', () => {
                if (count == 0) res.status(404).send('No matching tracks found');
                else res.send(returnObj);
            });
    }
});

// Get all the matching artist IDs for a given search pattern matching the artist's name
app.get('/api/v1/music/artists', (req, res) => {
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
});

// Create a new list to save a list of tracks with a given list name
// Return an error if name exists
app.put('/api/v1/music/lists/:listName', async (req, res) => {
    // Retrieve and verify input parameter and body
    let listName = req.params.listName;
    const schema = Joi.string().required().max(25);
    const result = Joi.validate(listName, schema);

    if (result.error) res.status(400).send(result.error.details[0].message);
    else {
        // Check if the list exists, and if it doesn't create it
        if (await storage.getItem(listName)) res.status(400).send('List already exists');
        else {
            await storage.setItem(listName,{"tracks":[]});
            res.send(await storage.getItem(listName));
        }
    }
});

// Save a list of track IDs to a given list name
// Return an error if the list name does not exist
// Replace existing track IDs with new values if the list exists
app.put('/api/v1/music/lists/:listName/tracks', async (req, res) => {
    // Retrieve and verify input parameter and body
    let listName = req.params.listName;
    const schema = { list: Joi.string().required(), body: { tracks: Joi.array().items(Joi.number()).required() } };
    const result = Joi.validate({list: listName, body: req.body}, schema);

    if (result.error) res.status(400).send(result.error.details[0].message);
    else {
        // Check if list exists, and if it does replace the tracklist
        if (!(await storage.getItem(listName))) res.status(404).send('List doesn\'t exists');
        else {
            await storage.setItem(listName, req.body);
            res.send(await storage.getItem(listName));
        }
    }
});

// Get the list of track IDs for a given list
app.get('/api/v1/music/lists/:listName/tracks', async (req, res) => {
    // Retrieve and verify input parameter
    let listName = req.params.listName;
    const schema = Joi.string().required();
    const result = Joi.validate(listName, schema);

    let trackIDs = [];
    let returnList = [];

    if (result.error) res.status(400).send(result.error.details[0].message);
    else {
        // Check if list exists, and if it does return the tracks
        if (!(await storage.getItem(listName))) res.status(404).send('List doesn\'t exists');
        else {
            trackIDs = await storage.getItem(listName);
            // Loop through all tracks and return any matching tracks
            fs.createReadStream('storage/lab3-data/raw_tracks.csv')
              .pipe(parse({ delimiter: ',', columns: true, ltrim: true }))
              .on('data', (row) => {
                if (trackIDs.tracks.includes(parseInt(row['track_id']))) {
                  returnList.push({
                    trackID: row['track_id'],
                    albumId: row['album_id'],
                    albumTitle: row['album_title'],
                    artistName: row['artist_name'],
                    tags: row['tags'],
                    trackDateCreated: row['track_date_created'],
                    trackDateRecorded: row['track_date_recorded'],
                    trackDuration: row['track_duration'],
                    trackGenres: row['track_genres'],
                    trackNumber: row['track_number'],
                    trackTitle: row['track_title'],
                    trackImage: row['track_image_file']
                  });
                }
              })
              .on('error', (error) => {
                res.status(500).send(error.message);
              })
              .on('end', () => {
                res.send(returnList);
              });
        }
    }
});

// Delete a list of tracks with a given name
// Return an error if the given list doesn’t exist
app.delete('/api/v1/music/lists/:listName', async (req, res) => {
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
});

// Get a list of list names, number of tracks that are saved in each list and the total play time of each list
app.get('/api/v1/music/lists', async (req, res) => {

    // Get saved list info
    let entries = {
        keys: await storage.keys(),
        values: await storage.values()
    }
    let returnList = [];


    // Populate return list with default play time value
    for (let i = 0; i < entries.keys.length; i++) {
        returnList.push({
            listName: entries.keys[i],
            trackCount: entries.values[i].tracks.length || 0,
            trackList: entries.values[i].tracks,
            totalPlayTime: 0
        });
    }
    // Loop through all tracks to get track duration
    fs.createReadStream('storage/lab3-data/raw_tracks.csv')
            .pipe(parse({ delimiter: ',', columns: true, ltrim: true }))
            .on('data', (row) => {
                // Check if any list has this specfic track, and update the duration accordingly
                returnList.forEach(list => {
                    if (list.trackList.includes(parseInt(row['track_id']))) {
                        list.totalPlayTime += parseInt(row['track_duration'].split(':')[0] * 60) + parseInt(row['track_duration'].split(':')[1]);
                    }
                })
            })
            .on('end', () => {
                // Send the returnList
                res.send(returnList);
            });
});

// Listen to the specified port
app.listen(port, () => console.log(`Listening on port ${port}...`));
