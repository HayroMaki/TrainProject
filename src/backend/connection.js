import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Pour traiter les requêtes JSON

// Connexion MongoDB
const username = process.env.MY_USERNAME;
const password = process.env.MY_PASSWORD;

const client = new MongoClient(`mongodb+srv://${username}:${password}@jules-renaud-grange.uuold.mongodb.net/`);
await client.connect();
const db = client.db("swiftrail");

// Route pour insérer un utilisateur
app.post("/api/insertClient", async (req, res) => {
    try {
        const { name, age } = req.body;
        await db.collection("users").insertOne({ name, age });
        res.status(201).json({ message: "Utilisateur inséré !" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Démarrage du serveur
app.listen(PORT, () => console.log(`Serveur démarré`));
