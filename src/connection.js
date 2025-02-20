const mongoose = require('mongoose');
const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

const uri = 'mongodb://localhost:27017/Exo'

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(err => console.error('Erreur de connexion à MongoDB : ', err));

const userSchema = new mongoose.Schema({
    nom: String,
    age: Number
});

const User = mongoose.model('User', userSchema);