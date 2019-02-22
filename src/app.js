'use strict';

require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const POKEDEX = require('./pokedex.json')
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
require('dotenv').config();
const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use((req,res,next)=> {
  const authToken = req.get('Authorization');
  if(!authToken || authToken.split(' ')[1] !== process.env.API_KEY){
    return res.status(401).send({error: 'Unauthorized'});
  }
  next();
});

const validTypes = [`Bug`, `Dark`, `Dragon`, `Electric`, `Fairy`, `Fighting`, `Fire`, `Flying`, `Ghost`, `Grass`, `Ground`, `Ice`, `Normal`, `Poison`, `Psychich`, `Rock`, `Steel`, `Water`];

app.get('/pokemon', (req,res) => {
  const {name, type} = req.query;
  let results = POKEDEX.pokemon;
  
  if (name) {
    results = results.filter(pokemon => {
      return pokemon.name.toLowerCase().includes(name.toLowerCase())
    });
  }

  if(type) {
    results = results.filter(pokemon => {
      let types = pokemon.type.map(type => type.toLowerCase());
      return types.includes(type.toLowerCase());
    });

  }
  
  res.send(results)
})

app.get('/types', (req,res) => {
  res.send(validTypes);
})

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = {error: {message: 'server error'} }
  } else {
    console.error(error);
    response = {message: error.message, error}
  }
  res.status(500).json(response);
})

module.exports = app;
