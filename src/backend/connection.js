import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { main } from "./mailer.js";

dotenv.config();

const app = express();
const PORT = process.env.port || 5000;
const saltRounds = parseInt(process.env.SALT_ROUNDS);

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connexion with mongoose
const username = process.env.MY_USERNAME;
const password = process.env.MY_PASSWORD;

const mongoURI = `mongodb+srv://${username}:${password}@jules-renaud-grange.uuold.mongodb.net/swiftrail`;

mongoose.connect(mongoURI, {}).then(() => {
    console.log("Connecté à MongoDB avec Mongoose");
}).catch(err => {
    console.error("Erreur de connexion à MongoDB :", err.message);
});

// Definition of the user model
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

// Definition of the travel model
const travelSchema = new mongoose.Schema({
    train_ref: String,
    departure: String,
    arrival: String,
    date: String,
    time: String,
    length: Number,
    price: Number
});

// Definition of the command model
const commandSchema = new mongoose.Schema({
    email: String,
    reservation_number: String,
    purchase_date: Date,
    commands: Array
});

const User = mongoose.model("User", userSchema);
const Travel = mongoose.model("Travel", travelSchema);
const Command = mongoose.model("Command", commandSchema);

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

// Route to insert a user
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

// Travel insertions
app.post("/api/insertTravels", async (req, res) => {
    try {
        // Fetch data
        const { data } = req.body;
        const { isRoundTrip, departureDate, arrivalDate, departure, arrival } = data;

        // Generate random times
        const generateRandomTime = () => {
            const hours = Math.floor(Math.random() * 24);
            const minutes = Math.floor(Math.random() * 60);
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        };

        // Generate random lengths
        const generateRandomLength = () => {
            return Math.floor(Math.random() * 180) + 60; // Entre 1h et 4h
        };

        // Insert travels
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

            // Verifies if there are existing travels at a certain date
            const existingTravels = await Travel.find({
                date: date,
                departure: departureCity,
                arrival: arrivalCity
            });

            if (existingTravels.length > 0) {
                return { success: false, message: `Des trajets existent déjà pour ${departureCity} -> ${arrivalCity} le ${date}.` };
            }

            // Insert the travels into the database
            await Travel.insertMany(travels);
            return { success: true, message: `Trajets insérés avec succès pour ${departureCity} -> ${arrivalCity} le ${date}.` };
        };

        // Generate travels
        const numberOfTravels = Math.floor(Math.random() * (10 - 3 + 1)) + 3;

        const allerResult = await insertTravels(departure, arrival, departureDate, numberOfTravels);
        if (!allerResult.success) {
            return res.status(400).json({ message: allerResult.message });
        }

        // Generate a return trip if the trip is round
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

// Route to find travels based on certain criterias
app.get("/api/getTravels", async (req, res) => {
    try {
        const { departure, arrival, date } = req.query;

        // Construction of the research request
        const query = {};
        if (departure) query.departure = departure;
        if (arrival) query.arrival = arrival;
        if (date) query.date = date;

        // Find the travels that match and sort by price
        let travels = await Travel.find(query).sort({ price: 1 });
        
        // If no travel was found, generate a new one
        if (travels.length === 0 && departure && arrival && date) {
            console.log(`Aucun trajet trouvé pour ${departure} -> ${arrival} le ${date}. Génération de trajets...`);

            // Generate random times
            const generateRandomTime = () => {
                const hours = Math.floor(Math.random() * 24);
                const minutes = Math.floor(Math.random() * 60);
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            };

            // Generate random lengths
            const generateRandomLength = () => {
                return Math.floor(Math.random() * 180) + 60; // Between 1h and 4h
            };
            
            // Generate between 3 and 10 trips
            const numberOfTravels = Math.floor(Math.random() * (10 - 3 + 1)) + 3;
            const newTravels = [];
            
            for (let i = 0; i < numberOfTravels; i++) {
                const travel = {
                    train_ref: `TR${Math.floor(Math.random() * 1000)}`, // Train reference
                    departure: departure,
                    arrival: arrival,
                    date: date,
                    time: generateRandomTime(),
                    length: generateRandomLength(),
                    price: Math.floor(Math.random() * 100) + 50 // Ticket price
                };
                newTravels.push(travel);
            }
            
            // Insert the new trips to the database
            await Travel.insertMany(newTravels);
            
            // Fetches the newly creates trips
            travels = await Travel.find(query).sort({ price: 1 });
            console.log(`${travels.length} trajets générés et enregistrés pour ${departure} -> ${arrival} le ${date}`);
        }

        res.status(200).json(travels);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to send a ticket confirmation mail
app.post("/api/sendTicketConfirmation", async (req, res) => {
    try {
        const { email, command } = req.body;
        
        if (!email || !command) {
            return res.status(400).json({ 
                success: false, 
                message: "L'email et les informations du billet sont requis" 
            });
        }
        
        // Conversion to an array if necessary
        const commands = Array.isArray(command) ? command : [command];
        
        // Insert the tickets into the command collection even if the user is not connected
        // and get the updated commands with the reservation numbers
        const commandsWithReferences = await processTicketInsertion(email, commands);
        
        // Send the confirmation mail with the commands details including the reservation numbers
        const result = await main(email, commandsWithReferences);
        
        // Updates the commands if it is associated with a user
        const userEmail = commands[0].email;
        if (userEmail) {
            // Find the user
            const user = await User.findOne({ email: userEmail });
            if (user) {
                // For each command, update it in the database
                for (const cmd of commandsWithReferences) {
                    // Updates the cart
                    const updatedCart = user.cart.filter(item => 
                        item.travel_info.train_ref !== cmd.travel_info.train_ref || 
                        item.travel_info.date !== cmd.travel_info.date || 
                        item.travel_info.time !== cmd.travel_info.time
                    );
                    
                    // Add to the confirmed commands
                    user.commands.push(cmd);
                    
                    // Update the cart (deletes the confirmed commands)
                    user.cart = updatedCart;
                }
                
                await user.save();
            }
        }
        
        return res.status(200).json({
            success: true,
            messageId: result.messageId,
            tickets: commandsWithReferences
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

// Function to insert ticket into the database
async function processTicketInsertion(email, commands) {
    try {
        // Compter le nombre de commandes existantes pour générer un numéro simple
        const commandCount = await Command.countDocuments();
        const randomLetters = generateRandomLetters(4);
        
        // Generate a reservation number for the command
        const mainOrderNumber = `SR-${commandCount + 1}-${randomLetters}`;
        
        // Prepare the command data with the reservation numbers
        const updatedCommands = commands.map((cmd, index) => {
            // Generate a unique reservation number for each ticket
            const ticketNumber = `${mainOrderNumber}-${(index + 1).toString().padStart(3, '0')}`;
            
            // Generate a ticket reference (barcode) for each ticket
            const ticketReference = generateTicketReference(ticketNumber, cmd.travel_info);
            
            return {
                ...cmd,
                reservation_number: ticketNumber,
                ticket_reference: ticketReference
            };
        });
        
        // Prepare the command data
        const commandData = {
            email: email,
            reservation_number: mainOrderNumber,
            purchase_date: new Date(),
            commands: updatedCommands
        };
        
        // Insertion into the database
        const newCommand = new Command(commandData);
        await newCommand.save();
        
        console.log(`Command ${mainOrderNumber} inserted successfully for ${email}`);
        
        // Return the updated commands with the reservation numbers
        return updatedCommands;
    } catch (error) {
        console.error("Error inserting tickets:", error);
        
        // Generate a simple reservation number even in case of error
        const fallbackNumber = Date.now().toString().substring(6);
        const randomLetters = generateRandomLetters(4);
        
        // Generate reservation numbers even in case of error
        return commands.map((cmd, index) => {
            const ticketNumber = `SR-ERR-${fallbackNumber}-${randomLetters}-${index + 1}`;
            return {
                ...cmd,
                reservation_number: ticketNumber,
                ticket_reference: generateTicketReference(ticketNumber, cmd.travel_info) || `ERRORREF-${randomLetters}`
            };
        });
    }
}

// Function to generate random letters in uppercase
function generateRandomLetters(length) {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Without the easily confused letters I, O
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// Function to generate a ticket reference (code under the barcode)
function generateTicketReference(reservationNumber, travelInfo) {
    if (!travelInfo) return 'INVALIDTKT';
    
    // Extract the initials of the departure and arrival cities
    const departureInitials = travelInfo.departure.substring(0, 2).toUpperCase();
    const arrivalInitials = travelInfo.arrival.substring(0, 2).toUpperCase();
    
    // Convert the date to a compact format
    const dateComponents = travelInfo.date.split('/');
    const compactDate = dateComponents.join('');
    
    // Take the last 4 characters of the reservation number
    const reservationSuffix = reservationNumber.substring(reservationNumber.length - 4);
    
    // Generate a random verification code
    const verificationCode = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    // Combine all elements to create the reference
    return `${departureInitials}${arrivalInitials}-${compactDate}-${travelInfo.train_ref}-${reservationSuffix}-${verificationCode}`;
}

// Route to get the history of the user's commands
app.get("/api/getUserCommands", async (req, res) => {
    try {
        const { email } = req.query;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "L'email de l'utilisateur est requis"
            });
        }
        
        // Search for the commands for this email
        const userCommands = await Command.find({ email: email }).sort({ purchase_date: -1 });
        
        return res.status(200).json({
            success: true,
            commands: userCommands
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des commandes:", error);
        return res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des commandes",
            error: error.message
        });
    }
});

// Start the server
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
