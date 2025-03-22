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

const mongoURI = `mongodb+srv://${username}:${password}@jules-renaud-grange.uuold.mongodb.net/swiftrail`;

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

// travel model
const travelSchema = new mongoose.Schema({
    train_ref: String,
    departure: String,
    arrival: String,
    date: String,
    time: String,
    length: Number,
    price: Number
})

const User = mongoose.model("User", userSchema);
const Travel = mongoose.model("Travel", travelSchema);

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

app.post("/api/insertTravels", async (req, res) => {
    try {
        const { data } = req.body;
        const { isRoundTrip, departureDate, arrivalDate, departure, arrival } = data;

        // Fonction pour générer une heure aléatoire
        const generateRandomTime = () => {
            const hours = Math.floor(Math.random() * 24);
            const minutes = Math.floor(Math.random() * 60);
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        };

        // Fonction pour générer une durée aléatoire (en minutes)
        const generateRandomLength = () => {
            return Math.floor(Math.random() * 180) + 60; // Entre 1h et 4h
        };

        // Fonction pour insérer des trajets
        const insertTravels = async (departureCity, arrivalCity, date, numberOfTravels) => {
            const travels = [];

            for (let i = 0; i < numberOfTravels; i++) {
                const travel = {
                    train_ref: `TR${Math.floor(Math.random() * 1000)}`, // Référence aléatoire du train
                    departure: departureCity,
                    arrival: arrivalCity,
                    date: date,
                    time: generateRandomTime(),
                    length: generateRandomLength(),
                    price: Math.floor(Math.random() * 100) + 50 // Prix aléatoire entre 50 et 150
                };
                travels.push(travel);
            }

            // Vérifier si des trajets existent déjà pour cette date et ces villes
            const existingTravels = await Travel.find({
                date: date,
                departure: departureCity,
                arrival: arrivalCity
            });

            if (existingTravels.length > 0) {
                return { success: false, message: `Des trajets existent déjà pour ${departureCity} -> ${arrivalCity} le ${date}.` };
            }

            // Insérer les trajets dans la base de données
            await Travel.insertMany(travels);
            return { success: true, message: `Trajets insérés avec succès pour ${departureCity} -> ${arrivalCity} le ${date}.` };
        };

        // Générer les trajets aller
        const numberOfTravels = Math.floor(Math.random() * (10 - 3 + 1)) + 3;

        const allerResult = await insertTravels(departure, arrival, departureDate, numberOfTravels);
        if (!allerResult.success) {
            return res.status(400).json({ message: allerResult.message });
        }

        // Générer les trajets retour si isRoundTrip est true
        if (isRoundTrip) {
            const numberOfTravels = Math.floor(Math.random() * (10 - 3 + 1)) + 3;
            const returnDate = arrivalDate || departureDate; // Si arrivalDate est null, utiliser departureDate
            const retourResult = await insertTravels(arrival, departure, returnDate, numberOfTravels);
            if (!retourResult.success) {
                return res.status(400).json({ message: retourResult.message });
            }
        }

        res.status(201).json({ message: "Trajets insérés avec succès !" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Démarrage du serveur
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
