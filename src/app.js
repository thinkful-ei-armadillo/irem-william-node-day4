'use strict';

require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const POKEDEX = require('./pokedex.json');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
require('dotenv').config();
const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'dev';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use((req,res,next)=> {
  const authToken = req.get('Authorization');
  if(!authToken || authToken.split(' ')[1] !== process.env.API_KEY){
    return res.status(401).send({error: 'Unauthorized'});
  }
  next();
});

const validTypes = ['Bug', 'Dark', 'Dragon', 'Electric', 'Fairy', 'Fighting', 'Fire', 'Flying', 'Ghost', 'Grass', 'Ground', 'Ice', 'Normal', 'Poison', 'Psychich', 'Rock', 'Steel', 'Water'];
app.get('/pokemon', (req,res) => {
  const {name, type} = req.query;
  let results = POKEDEX.pokemon;
  
  if (name) {
    results = results.filter(pokemon => {
      return pokemon.name.toLowerCase().includes(name.toLowerCase());
    });
  }

  if(type) {
    results = results.filter(pokemon => {
      let types = pokemon.type.map(type => type.toLowerCase());
      return types.includes(type.toLowerCase());
    });

  }
  
  res.send(results);
});

app.get('/types', (req,res) => {
  res.send(validTypes);
});

app.post('/types', (req, res) => {
  const { type } = req.body;
  validTypes.push(type);
  res.status(201).json({type});
});

app.post('/pokemon', (req, res) => {
  const newPokemon = req.body;

  if(!req.body.name){
    return res.status(400).send('You need to provide name');
  }
  
  if(!req.body.type || !req.body.type.includes(validTypes) ){
    return res.status(400).send('You need to provide a valid type');
  }

  const newId = POKEDEX.pokemon.length+1;
  newPokemon.id=parseInt(newId, 10);
  newPokemon.num=`${newId}`;
  POKEDEX.pokemon.push(newPokemon);
  res.status(201).location(`http://localhost:8000/pokemon/${newId}`).json(newPokemon);
});

app.get('/pokemon/:pokemonId', (req, res) => {
  const pokemonId = parseInt(req.params.pokemonId);
  console.log(pokemonId);
  let pokemonObj = POKEDEX.pokemon.filter(poke => poke.id === pokemonId);
  console.log(pokemonObj);
  res.send(pokemonObj);
});


app.delete('/pokemon/:pokemonId', (req, res) => {
  const { pokemonId } = req.params;
  const index = pokemonId-1;
  if (index < 0 || index > POKEDEX.pokemon.length) {
    return res
      .status(404)
      .send('No such Pokemon exists');
  }
  POKEDEX.pokemon.splice(index,1);
  res.send('Deleted!');
});



app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = {error: {message: 'server error'} };
  } else {
    console.error(error);
    response = {message: error.message, error};
  }
  res.status(500).json(response);
});

module.exports = app;
