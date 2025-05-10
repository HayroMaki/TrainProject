import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { main } from "./mailer.js";

dotenv.config();

const app = express();
const PORT = 5000;
const saltRounds = parseInt(process.env.SALT_ROUNDS);

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
    email: String,
    password: String,
    first_name: String,
    last_name: String,
    cart: Array,
    commands: Array,
    subscription: String,
    creation_date: String,
    bank_info: {
        first_name: String,
        last_name: String,
        card_number: String,
        expiration_date: Date,
    }
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

app.post("/api/checkUser", async (req, res) => {
    try {
        const { email, pwd } = req.body;
        const document = await User.findOne({ email: email }).exec();
        if (!document) {
            res.status(401).send({ message: "Erreur lors de l'authentification" })
            return;
        }
        const value = await bcrypt.compare(pwd, document.password);
        if (value) {

            if (document.bank_info) {
                res.status(200).json({
                    email: document.email,
                    fname: document.first_name,
                    lname: document.last_name,
                    cart: document.cart,
                    commands: document.commands,
                    subscription: document.subscription,
                    creation_date: document.creation_date,
                    bank_info: document.bank_info
                });
            } else {
                res.status(200).json({
                    email: document.email,
                    fname: document.first_name,
                    lname: document.last_name,
                    cart: document.cart,
                    commands: document.commands,
                    subscription: document.subscription,
                    creation_date: document.creation_date,
                    bank_info: {}
                });
            }

        } else {
            res.status(401).json({ message: "Erreur lors de l'authentification"} );
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
})

// Route pour insérer un utilisateur
app.put("/api/insertClient", async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body;
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPwd = await bcrypt.hash(password, salt);
        const cart = [];
        const commands = [];
        const subscription = "";
        const now = new Date().toLocaleDateString();
        const bank_info = {};
        const newUser = new User({
            email: email,
            password: hashedPwd,
            first_name: first_name,
            last_name: last_name,
            cart: cart,
            commands: commands,
            subscription: subscription,
            creation_date: now,
            bank_info: bank_info
        });
        await newUser.save();
        res.status(201).json({ message: "Utilisateur inséré avec succès !" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// insertiOn de trajets
app.post("/api/insertTravels", async (req, res) => {
    try {
        // récupération des données
        const { data } = req.body;
        const { isRoundTrip, departureDate, arrivalDate, departure, arrival } = data;

        // Fonction pour générer des heures
        const generateRandomTime = () => {
            const hours = Math.floor(Math.random() * 24);
            const minutes = Math.floor(Math.random() * 60);
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        };

        // Fonction pour générer une longueur
        const generateRandomLength = () => {
            return Math.floor(Math.random() * 180) + 60; // Entre 1h et 4h
        };

        // Fonction pour insérer des trajets
        const insertTravels = async (departureCity, arrivalCity, date, numberOfTravels) => {
            const travels = [];

            for (let i = 0; i < numberOfTravels; i++) {
                const travel = {
                    train_ref: `TR${Math.floor(Math.random() * 1000)}`, // une référence de train
                    departure: departureCity,
                    arrival: arrivalCity,
                    date: date,
                    time: generateRandomTime(),
                    length: generateRandomLength(),
                    price: Math.floor(Math.random() * 100) + 50 // un prix entre 50 et 100 euros
                };
                travels.push(travel);
            }

            // On verifie si des trajets existent déjà pour une certaine date
            const existingTravels = await Travel.find({
                date: date,
                departure: departureCity,
                arrival: arrivalCity
            });

            if (existingTravels.length > 0) {
                return { success: false, message: `Des trajets existent déjà pour ${departureCity} -> ${arrivalCity} le ${date}.` };
            }

            // On insère ces chemins dans la base de données
            await Travel.insertMany(travels);
            return { success: true, message: `Trajets insérés avec succès pour ${departureCity} -> ${arrivalCity} le ${date}.` };
        };

        // Génération de voyages
        const numberOfTravels = Math.floor(Math.random() * (10 - 3 + 1)) + 3;

        const allerResult = await insertTravels(departure, arrival, departureDate, numberOfTravels);
        if (!allerResult.success) {
            return res.status(400).json({ message: allerResult.message });
        }

        // Génération d'un trajet retour si l'utilisateur choisit un trajet aller/retour
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

// Route pour retrouver des trajets basés sur un certain critère
app.get("/api/getTravels", async (req, res) => {
    try {
        const { departure, arrival, date } = req.query;

        // Construction de la requête de recherche
        const query = {};
        if (departure) query.departure = departure;
        if (arrival) query.arrival = arrival;
        if (date) query.date = date;

        // On retrouve les trajets correspondant et on fait un tri par prix
        let travels = await Travel.find(query).sort({ price: 1 });
        
        // Si aucun trajet n'est trouvé, générer des trajets à la volée
        if (travels.length === 0 && departure && arrival && date) {
            console.log(`Aucun trajet trouvé pour ${departure} -> ${arrival} le ${date}. Génération de trajets...`);
            
            // Fonctions utilitaires pour la génération de trajets aléatoires
            const generateRandomTime = () => {
                const hours = Math.floor(Math.random() * 24);
                const minutes = Math.floor(Math.random() * 60);
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            };

            const generateRandomLength = () => {
                return Math.floor(Math.random() * 180) + 60; // Entre 1h et 4h
            };
            
            // Générer entre 3 et 10 trajets
            const numberOfTravels = Math.floor(Math.random() * (10 - 3 + 1)) + 3;
            const newTravels = [];
            
            for (let i = 0; i < numberOfTravels; i++) {
                const travel = {
                    train_ref: `TR${Math.floor(Math.random() * 1000)}`, // Référence du train
                    departure: departure,
                    arrival: arrival,
                    date: date,
                    time: generateRandomTime(),
                    length: generateRandomLength(),
                    price: Math.floor(Math.random() * 100) + 50 // Prix du billet
                };
                newTravels.push(travel);
            }
            
            // Enregistrer les nouveaux trajets dans la base de données
            await Travel.insertMany(newTravels);
            
            // Récupérer les trajets nouvellement créés
            travels = await Travel.find(query).sort({ price: 1 });
            console.log(`${travels.length} trajets générés et enregistrés pour ${departure} -> ${arrival} le ${date}`);
        }

        res.status(200).json(travels);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route pour envoyer un email de confirmation de billet
app.post("/api/sendTicketConfirmation", async (req, res) => {
    try {
        const { email, command } = req.body;
        
        if (!email || !command) {
            return res.status(400).json({ 
                success: false, 
                message: "L'email et les informations du billet sont requis" 
            });
        }
        
        // Conversion en tableau si c'est un objet unique
        const commands = Array.isArray(command) ? command : [command];
        
        // Envoi de l'email de confirmation avec tous les billets
        const result = await main();
        
        // Mise à jour de la commande dans la base de données si les billets sont associés à un utilisateur
        const userEmail = commands[0].email;
        if (userEmail) {
            // Trouver l'utilisateur
            const user = await User.findOne({ email: userEmail });
            if (user) {
                // Pour chaque billet envoyé, mettre à jour la base de données
                for (const cmd of commands) {
                    // Mise à jour du panier
                    const updatedCart = user.cart.filter(item => 
                        item.travel_info.train_ref !== cmd.travel_info.train_ref || 
                        item.travel_info.date !== cmd.travel_info.date || 
                        item.travel_info.time !== cmd.travel_info.time
                    );
                    
                    // Ajout aux commandes validées
                    user.commands.push({
                        ...cmd,
                        reservation_number: result.messageId
                    });
                    
                    // Mise à jour du panier (supprimer les billets validés)
                    user.cart = updatedCart;
                }
                
                await user.save();
            }
        }
        
        return res.status(200).json({
            success: true,
            messageId: result.messageId
        });
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'email de confirmation:", error);
        return res.status(500).json({
            success: false,
            message: "Erreur lors de l'envoi de l'email de confirmation",
            error: error.message
        });
    }
});

// Démarrage du serveur
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
