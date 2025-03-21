import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connexion à MongoDB avec Mongoose
const username = process.env.MY_USERNAME;
const password = process.env.MY_PASSWORD;

const mongoURI = `mongodb+srv://${username}:${password}@jules-renaud-grange.uuold.mongodb.net/test`;

mongoose.connect(mongoURI, {}).then(() => {
    console.log("Connecté à MongoDB avec Mongoose");
}).catch(err => {
    console.error("Erreur de connexion à MongoDB :", err.message);
});

// Définition du modèle utilisateur
const userSchema = new mongoose.Schema({
    name: String,
    age: Number
});

const User = mongoose.model("User", userSchema);

// Route pour insérer un utilisateur
app.post("/api/insertClient", async (req, res) => {
    try {
        const { name, age } = req.body;
        const newUser = new User({ name, age });
        await newUser.save();
        res.status(201).json({ message: "Utilisateur inséré avec succès !" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Démarrage du serveur
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
