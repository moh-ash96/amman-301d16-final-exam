'use strict'
// Application Dependencies
const express = require('express');
const pg = require('pg');
const methodOverride = require('method-override');
const superagent = require('superagent');
const cors = require('cors');

// Environment variables
require('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;

// Express middleware
// Utilize ExpressJS functionality to parse the body of the request
app.use(express.urlencoded({ extended: true }));
// Specify a directory for static resources
app.use(express.static('./public'));

// define our method-override reference
app.use(methodOverride('_method'));

// Set the view engine for server-side templating
app.set('view engine', 'ejs');
// Use app cors


// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);
// app routes here
// -- WRITE YOUR ROUTES HERE --
app.get('/', getHome);
app.post('/add', addToFavorites);
app.get('/favorite-quotes', getFavorites);
app.get('/character/:id', getDetails);
app.put('/character/:id', updateDetails);
app.delete('/character/:id', deleteChar);




// callback functions
// -- WRITE YOUR CALLBACK FUNCTIONS FOR THE ROUTES HERE --
function getHome(req, res) {
    const url = 'https://thesimpsonsquoteapi.glitch.me/quotes?count=10';
    superagent.get(url).set('User-agent', '1.0').then(result => {
        let newQuote = result.body.map(quotes => new Quotes(quotes))
        res.render('main', { results: newQuote });
    })

}

function addToFavorites(req, res) {
    const { character, quote, image, character_direction } = req.body;
    const sql = 'INSERT INTO quotes (quote, character, image, character_direction) VALUES ($1, $2, $3, $4);';
    const values = [quote, character, image, character_direction];
    client.query(sql, values).then(() => {
        res.redirect('/favorite-quotes')
    }).catch(error => (console.log(error)));
}

function getFavorites(req, res) {
    const sql = 'SELECT * FROM quotes;';
    client.query(sql).then(result => {
        res.render('favorites', { results: result.rows })
        // console.log(result.rows[0].image);
    }).catch(error => console.log(error))
}

function getDetails(req, res) {
    const sql = 'SELECT * FROM quotes WHERE id=$1;';
    const id = req.params.id;
    client.query(sql, [id]).then((result) => {
        res.render('details', { results: result.rows });
    })

}

function updateDetails(req, res) {
    const sql = 'UPDATE quotes SET quote=$1 WHERE id=$2;';
    const id = req.params.id;
    const { quote } = req.body;
    const values = [quote, id];
    client.query(sql, values).then(() => {
        res.redirect('/favorite-quotes')
    })
}

function deleteChar(req, res) {
    const id = req.params.id;
    const sql = 'DELETE FROM quotes WHERE id=$1;';
    client.query(sql, [id]).then(() => {
        res.redirect('/favorite-quotes');
    });
}

// helper functions
function Quotes(quotes) {
    this.quote = quotes.quote;
    this.character = quotes.character;
    this.image = quotes.image;
    this.character_direction = quotes.characterDirection;
}
// app start point
client.connect().then(() =>
    app.listen(PORT, () => console.log(`Listening on port: ${PORT}`))
).catch(error => console.log(error));
