import React, { useState, useEffect } from 'react';
import "../stylesheets/payment.css";
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../components/UserContext';

const apiBase = location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://" + location.hostname;

// Simple interfaces
interface PersonalInfo {
    civility: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    confirmEmail: string;
}

interface PaymentDetails {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
}

// Interface for the example trips
interface TravelInfo {
    departure: string;
    arrival: string;
    date: string;
    time: string;
    price: number;
}

interface CartItem {
    travel_info: TravelInfo;
    options: string[];
}

// Price of the options
const optionPrices: {[key: string]: number} = {
    "PLA_TRA": 3,
    "PRI_ELE": 2,
    "BAG_SUP": 5,
    "INF_SMS": 1,
    "GAR_ANN": 2.9
};

const PaymentComponent: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useUserContext();
    
    const [activeStep, setActiveStep] = useState<number>(1);
    const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
        civility: 'M',
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        confirmEmail: ''
    });
    
    const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: ''
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [loginForm, setLoginForm] = useState<{ username: string, password: string }>({
        username: '',
        password: ''
    });
    const [showLoginForm, setShowLoginForm] = useState<boolean>(false);
    const [promoApplied, setPromoApplied] = useState<boolean>(false);
    const [promoCode, setPromoCode] = useState<string>('');
    const [receiveNewsletter, setReceiveNewsletter] = useState<boolean>(false);
    
    // Verify if the cart is empty and redirect if necessary
    useEffect(() => {
        if (!user.cart || user.cart.length === 0) {
            console.warn("Le panier est vide, redirection vers la page du panier");
            navigate('/cart');
        }
    }, [user.cart, navigate]);

    // Apply automatically the promotion code when the user logs in
    useEffect(() => {
        if (isLoggedIn) {
            setPromoCode('SWIFTRAIL10');
            setPromoApplied(true);
        }
    }, [isLoggedIn]);
    
    // Identify the type of the trips
    const identifyJourneyType = () => {
        if (!user.cart || user.cart.length <= 1) return { oneway: user.cart || [], return: [] };
        
        const journeys: { [key: string]: CartItem[] } = {
            oneway: [],
            return: []
        };

        // Array to store the processed trips
        const processedIndexes: number[] = [];
        
        for (let i = 0; i < user.cart.length; i++) {
            if (processedIndexes.includes(i)) continue;
            
            const currentJourney = user.cart[i];
            let hasReturn = false;
            
            // Search for a potential return trip
            for (let j = i + 1; j < user.cart.length; j++) {
                if (processedIndexes.includes(j)) continue;
                
                const potentialReturn = user.cart[j];
                
                // If the departure potential trip is the current trip's arrival and
                // if the arrival potential trip is the current trip's departure,
                if (potentialReturn.travel_info.departure === currentJourney.travel_info.arrival && 
                    potentialReturn.travel_info.arrival === currentJourney.travel_info.departure) {
                    
                    // Found a round trip
                    journeys.oneway.push(currentJourney);
                    journeys.return.push(potentialReturn);
                    
                    processedIndexes.push(i, j);
                    hasReturn = true;
                    break;
                }
            }
            
            // If no return trip was found, it is a one way trip
            if (!hasReturn && !processedIndexes.includes(i)) {
                journeys.oneway.push(currentJourney);
                processedIndexes.push(i);
            }
        }
        
        return journeys;
    };
    
    // Details of the price to show
    const getPriceDetails = () => {
        const details = {
            basePriceTotal: 0,
            optionsTotal: 0,
            discount: isLoggedIn && promoApplied ? 10 : 0,
            grandTotal: 0
        };
        
        if (user.cart && user.cart.length > 0) {
            user.cart.forEach(item => {
                // Total of the base prices
                details.basePriceTotal += item.travel_info.price;
                
                // Total of the option prices
                if (item.options && item.options.length > 0) {
                    const itemOptionsPrice = item.options.reduce((sum, opt) => {
                        return sum + (optionPrices[opt] || 0);
                    }, 0);
                    details.optionsTotal += itemOptionsPrice;
                }
            });
        }
        
        details.grandTotal = details.basePriceTotal + details.optionsTotal - details.discount;
        
        return {
            ...details,
            basePriceTotal: details.basePriceTotal.toFixed(2),
            optionsTotal: details.optionsTotal.toFixed(2),
            grandTotal: details.grandTotal.toFixed(2)
        };
    };
    
    const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setPersonalInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleLoginFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLoginForm(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate a succesful connection
        setIsLoggedIn(true);
        setShowLoginForm(false);
        // Automatically fill in the stored information
        setPersonalInfo(prev => ({
            ...prev,
            firstName: "Jean",
            lastName: "Dupont",
            email: loginForm.username,
            confirmEmail: loginForm.username
        }));
    };
    
    const handlePromoCodeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (promoCode === "SWIFTRAIL10" && isLoggedIn) {
            setPromoApplied(true);
        } else {
            setErrors(prev => ({
                ...prev,
                promoCode: "Code promo invalide ou vous devez être connecté"
            }));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        // Automatically format the card number
        if (name === 'cardNumber') {
            const sanitizedValue = value.replace(/\D/g, '').slice(0, 16);
            
            // Add a space every 4 characters
            const formattedValue = sanitizedValue.replace(/(\d{4})(?=\d)/g, '$1 ');
            
            setPaymentDetails(prevDetails => ({
                ...prevDetails,
                [name]: formattedValue
            }));
            return;
        }
        
        // Format the expiration date
        if (name === 'expiryDate') {
            const sanitizedValue = value.replace(/\D/g, '').slice(0, 4);
            
            if (sanitizedValue.length > 2) {
                const formattedValue = `${sanitizedValue.slice(0, 2)}/${sanitizedValue.slice(2)}`;
                setPaymentDetails(prevDetails => ({
                    ...prevDetails,
                    [name]: formattedValue
                }));
            } else {
                setPaymentDetails(prevDetails => ({
                    ...prevDetails,
                    [name]: sanitizedValue
                }));
            }
            return;
        }
        
        // Format the CVV (3 numbers max)
        if (name === 'cvv') {
            const sanitizedValue = value.replace(/\D/g, '').slice(0, 3);
            setPaymentDetails(prevDetails => ({
                ...prevDetails,
                [name]: sanitizedValue
            }));
            return;
        }
        
        // Format the phone number
        if (name === 'phone') {
            const sanitizedValue = value.replace(/\D/g, '').slice(0, 10);
            const formattedValue = sanitizedValue.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
            setPersonalInfo(prev => ({
                ...prev,
                [name]: formattedValue
            }));
            return;
        }
        
        if (name === 'cardholderName') {
        setPaymentDetails(prevDetails => ({
            ...prevDetails,
            [name]: value
        }));
        }
    };

    const validatePersonalInfo = (): boolean => {
        const newErrors: { [key: string]: string } = {};
        
        if (!personalInfo.firstName.trim()) {
            newErrors.firstName = "Le prénom est requis";
        }
        
        if (!personalInfo.lastName.trim()) {
            newErrors.lastName = "Le nom est requis";
        }
        
        if (!personalInfo.phone.trim() || personalInfo.phone.replace(/\s/g, '').length < 10) {
            newErrors.phone = "Numéro de téléphone invalide";
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(personalInfo.email)) {
            newErrors.email = "Adresse email invalide";
        }
        
        if (personalInfo.email !== personalInfo.confirmEmail) {
            newErrors.confirmEmail = "Les adresses email ne correspondent pas";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateCardNumber = (cardNumber: string): boolean => {
        const cardNumberRegex = /^[\d ]{19}$/;
        return cardNumberRegex.test(cardNumber);
    };

    const validateExpiryDate = (expiryDate: string): boolean => {
        const expiryDateRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
        if (!expiryDateRegex.test(expiryDate)) return false;

        const [month, year] = expiryDate.split('/');
        const currentYear = new Date().getFullYear() % 100; // Get last two digits of the year
        const currentMonth = new Date().getMonth() + 1; // Months are 0-indexed in JavaScript

        if (parseInt(year) < currentYear) return false;
        return !(parseInt(year) === currentYear && parseInt(month) < currentMonth);
    };

    const validateCVV = (cvv: string): boolean => {
        const cvvRegex = /^\d{3}$/;
        return cvvRegex.test(cvv);
    };

    const validateCardholderName = (name: string): boolean => {
        return name.trim().length >= 3;
    };

    const validatePaymentDetails = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!validateCardNumber(paymentDetails.cardNumber)) {
            newErrors.cardNumber = 'Veuillez saisir un numéro de carte valide à 16 chiffres.';
        }

        if (!validateExpiryDate(paymentDetails.expiryDate)) {
            newErrors.expiryDate = 'Format MM/YY requis et date non expirée.';
        }

        if (!validateCVV(paymentDetails.cvv)) {
            newErrors.cvv = 'Le CVV doit contenir 3 chiffres.';
        }

        if (!validateCardholderName(paymentDetails.cardholderName)) {
            newErrors.cardholderName = 'Veuillez saisir le nom du titulaire de la carte.';
        }

            setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleNextStep = () => {
        if (activeStep === 1) {
            if (validatePersonalInfo()) {
                setActiveStep(2);
                setErrors({});
            }
        }
    };
    
    const handlePrevStep = () => {
        if (activeStep === 2) {
            setActiveStep(1);
            setErrors({});
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!validatePaymentDetails()) {
            return;
        }

        // If every Input is valid, proceed to payment :
        setIsProcessing(true);
        
        // Function to process the payment and send emails
        const processPayment = async () => {
            try {
                // Verify if the user has commands in their cart
                if (user.cart && user.cart.length > 0) {
                    // Prepare all the commands with seats
                    const commandsWithSeats = user.cart.map(item => ({
                        ...item,
                        validated: true,
                        validation_date: new Date().toISOString(),
                        // If seat doesn't exist, generate a random one
                        seat: item.seat || `${Math.floor(Math.random() * 10) + 1}-${Math.floor(Math.random() * 60) + 1}${String.fromCharCode(65 + Math.floor(Math.random() * 6))}`
                    }));
                    
                    // Send a single mail with all the commands
                    try {
                        const response = await fetch(`${apiBase}/api/sendTicketConfirmation`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                email: personalInfo.email,
                                command: commandsWithSeats // Send all the commands together
                            }),
                        });
                        
                        // Verify if the response is ok
                        if (!response.ok) {
                            const errorText = await response.text();
                            let errorJson;
                            try {
                                errorJson = JSON.parse(errorText);
                                console.error("Erreur lors de l'envoi de l'email:", errorJson.error || errorJson.message || "Erreur serveur");
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            } catch (e) {
                                console.error(`Erreur serveur: ${errorText}`);
                            }
                        } else {
                            const result = await response.json();
                            console.log('Email envoyé avec succès:', result);
                            
                            // Update the commands in the database if the user is connected
                            if (user.email) {
                                // Les mises à jour de la base de données seront gérées côté serveur
                                console.log('Utilisateur connecté, mise à jour des commandes...');
                            }
                        }
                    } catch (error) {
                        console.error("Erreur lors de l'envoi de l'email:", error);
                    }
                }
                
                // Logs for debugging
                console.log('Paiement réussi!');
                console.log('Informations personnelles:', personalInfo);
                console.log('Détails de paiement:', paymentDetails);
                console.log('Réduction appliquée:', promoApplied ? '10€' : 'Aucune');
                console.log('Email envoyé à:', personalInfo.email);
                
                // Redirect towards the home page
                navigate('/');
            } catch (error) {
                console.error("Erreur lors du traitement du paiement:", error);
                setIsProcessing(false);
            }
        };
        
        // Wait 2 seconds simulate the payment process
        setTimeout(() => {
            processPayment();
        }, 2000);
        
        setErrors({});
    };

    // Determine the type of the card depending on the starting numbers
    const getCardType = (cardNumber: string): string => {
        const cleanNumber = cardNumber.replace(/\D/g, '');
        
        if (!cleanNumber) return '';
        
        // Détection simplifiée des types de carte
        if (cleanNumber.startsWith('4')) return '💳 Visa';
        if (/^5[1-5]/.test(cleanNumber)) return '💳 MasterCard';
        if (/^3[47]/.test(cleanNumber)) return '💳 American Express';
        
        return '💳';
    };

    return (
        <div className="payment-container">
            <div className="payment-stepper">
                <div className={`stepper-step ${activeStep === 1 ? 'active' : ''} ${activeStep > 1 ? 'completed' : ''}`}>
                    <div className="step-number">1</div>
                    <div className="step-label">Informations personnelles</div>
                </div>
                <div className="stepper-line"></div>
                <div className={`stepper-step ${activeStep === 2 ? 'active' : ''}`}>
                    <div className="step-number">2</div>
                    <div className="step-label">Paiement</div>
                </div>
            </div>
            
            <div className="payment-content">
                <div className="payment-summary">
                    <div className="summary-header">
                        <h3>Récapitulatif</h3>
                    </div>
                    <div className="summary-content">
                        {user.cart && user.cart.length > 0 ? (
                            <>
                                <ul className="summary-items">
                                    {(() => {
                                        const journeys = identifyJourneyType();
                                        
                                        return (
                                            <>
                                                {journeys.oneway.map((item, index) => {
                                                    // Search for a return trip
                                                    const returnTicket = journeys.return && journeys.return.length > 0 
                                                        ? journeys.return.find(
                                                            r => r.travel_info.departure === item.travel_info.arrival && 
                                                               r.travel_info.arrival === item.travel_info.departure
                                                          )
                                                        : undefined;
                                                    
                                                    return (
                                                        <li key={`oneway-${index}`} className="summary-item">
                                                            <div className="summary-item-type">
                                                                {returnTicket ? "Aller" : "Aller simple"}
                                                            </div>
                                                            <div className="summary-item-journey">
                                                                {item.travel_info.departure} → {item.travel_info.arrival}
                                                            </div>
                                                            <div className="summary-item-details">
                                                                <span>{item.travel_info.date} • {item.travel_info.time}</span>
                                                            </div>
                                                            <div className="summary-item-price">
                                                                {item.travel_info.price.toFixed(2)}€
                                                            </div>
                                                            {item.options && item.options.length > 0 && (
                                                                <div className="summary-item-options">
                                                                    + Options: {item.options.reduce((sum, opt) => sum + (optionPrices[opt] || 0), 0).toFixed(2)}€
                                                                </div>
                                                            )}
                                                            
                                                            {/* Show the return trip below if it exists */}
                                                            {returnTicket && (
                                                                <div className="return-ticket">
                                                                    <div className="summary-item-type return-type">Retour</div>
                                                                    <div className="summary-item-journey">
                                                                        {returnTicket.travel_info.departure} → {returnTicket.travel_info.arrival}
                                                                    </div>
                                                                    <div className="summary-item-details">
                                                                        <span>{returnTicket.travel_info.date} • {returnTicket.travel_info.time}</span>
                                                                    </div>
                                                                    <div className="summary-item-price">
                                                                        {returnTicket.travel_info.price.toFixed(2)}€
                                                                    </div>
                                                                    {returnTicket.options && returnTicket.options.length > 0 && (
                                                                        <div className="summary-item-options">
                                                                            + Options: {returnTicket.options.reduce((sum, opt) => sum + (optionPrices[opt] || 0), 0).toFixed(2)}€
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </li>
                                                    );
                                                })}
                                                
                                                {/* Show the return trips that didn't have an associated one way trip */}
                                                {journeys.return && journeys.return.length > 0 && journeys.return
                                                    .filter(r => !journeys.oneway.some(
                                                        o => o.travel_info.departure === r.travel_info.arrival && 
                                                             o.travel_info.arrival === r.travel_info.departure))
                                                    .map((item, index) => (
                                                        <li key={`return-${index}`} className="summary-item">
                                                            <div className="summary-item-type return-type">
                                                                Retour seul
                                                            </div>
                                                            <div className="summary-item-journey">
                                                                {item.travel_info.departure} → {item.travel_info.arrival}
                                                            </div>
                                                            <div className="summary-item-details">
                                                                <span>{item.travel_info.date} • {item.travel_info.time}</span>
                                                            </div>
                                                            <div className="summary-item-price">
                                                                {item.travel_info.price.toFixed(2)}€
                                                            </div>
                                                            {item.options && item.options.length > 0 && (
                                                                <div className="summary-item-options">
                                                                    + Options: {item.options.reduce((sum, opt) => sum + (optionPrices[opt] || 0), 0).toFixed(2)}€
                                                                </div>
                                                            )}
                                                        </li>
                                                    ))
                                                }
                                            </>
                                        );
                                    })()}
                                </ul>
                                
                                <div className="summary-total">
                                    <div className="summary-subtotal">
                                        <span>Prix des billets</span>
                                        <span>{getPriceDetails().basePriceTotal}€</span>
                                    </div>
                                    
                                    {parseFloat(getPriceDetails().optionsTotal) > 0 && (
                                        <div className="summary-options">
                                            <span>Options</span>
                                            <span>+{getPriceDetails().optionsTotal}€</span>
                                        </div>
                                    )}
                                    
                                    <div className="summary-subtotal summary-with-options">
                                        <span>Sous-total</span>
                                        <span>{(parseFloat(getPriceDetails().basePriceTotal) + parseFloat(getPriceDetails().optionsTotal)).toFixed(2)}€</span>
                                    </div>
                                    
                                    {promoApplied && (
                                        <div className="summary-discount">
                                            <span>Réduction adhérent</span>
                                            <span>-10.00€</span>
                                        </div>
                                    )}
                                    <div className="summary-final-total">
                                        <span>Total</span>
                                        <span>{getPriceDetails().grandTotal}€</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="no-items">Panier vide</div>
                        )}
                    </div>
                </div>
                
                {activeStep === 1 && (
                    <div className="payment-form-container">
                        <div className="form-header">
                            <h2>Vos informations</h2>
                            
                            {!isLoggedIn ? (
                                <div className="login-prompt">
                                    <p>Vous êtes adhérent SwiftRail ?</p>
                                    <button 
                                        type="button" 
                                        className="login-toggle-btn"
                                        onClick={() => setShowLoginForm(!showLoginForm)}
                                    >
                                        Se connecter
                                    </button>
                                </div>
                            ) : (
                                <div className="user-logged-in">
                                    <span className="logged-badge">Connecté en tant qu'adhérent</span>
                                    <button 
                                        type="button" 
                                        className="logout-btn"
                                        onClick={() => {
                                            setIsLoggedIn(false);
                                            setPromoApplied(false);
                                        }}
                                    >
                                        Déconnexion
                                    </button>
                                </div>
                            )}
                            
                            {showLoginForm && !isLoggedIn && (
                                <div className="login-form">
                                    <form onSubmit={handleLoginSubmit}>
                                        <div className="form-group">
                                            <label htmlFor="username">Email</label>
                                            <input
                                                type="email"
                                                id="username"
                                                name="username"
                                                value={loginForm.username}
                                                onChange={handleLoginFormChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="password">Mot de passe</label>
                                            <input
                                                type="password"
                                                id="password"
                                                name="password"
                                                value={loginForm.password}
                                                onChange={handleLoginFormChange}
                                                required
                                            />
                                        </div>
                                        <div className="login-actions">
                                            <button type="submit" className="login-btn">Connexion</button>
                                            <button 
                                                type="button" 
                                                className="login-cancel-btn"
                                                onClick={() => setShowLoginForm(false)}
                                            >
                                                Annuler
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                        
                        <form className="personal-info-form">
                            <div className="form-row">
                                <div className="form-group civility-group">
                                    <label htmlFor="civility">Civilité</label>
                                    <select 
                                        id="civility" 
                                        name="civility"
                                        value={personalInfo.civility}
                                        onChange={handlePersonalInfoChange}
                                    >
                                        <option value="M">M.</option>
                                        <option value="Mme">Mme</option>
                                    </select>
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="lastName">Nom*</label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={personalInfo.lastName}
                                        onChange={handlePersonalInfoChange}
                                        className={errors.lastName ? 'error' : ''}
                                        required
                                    />
                                    {errors.lastName && (
                                        <div className="error-message">{errors.lastName}</div>
                                    )}
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="firstName">Prénom*</label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={personalInfo.firstName}
                                        onChange={handlePersonalInfoChange}
                                        className={errors.firstName ? 'error' : ''}
                                        required
                                    />
                                    {errors.firstName && (
                                        <div className="error-message">{errors.firstName}</div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="phone">Téléphone*</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={personalInfo.phone}
                                    onChange={handleChange}
                                    className={errors.phone ? 'error' : ''}
                                    placeholder="06 12 34 56 78"
                                    required
                                />
                                {errors.phone && (
                                    <div className="error-message">{errors.phone}</div>
                                )}
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="email">Email*</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={personalInfo.email}
                                    onChange={handlePersonalInfoChange}
                                    className={errors.email ? 'error' : ''}
                                    required
                                />
                                {errors.email && (
                                    <div className="error-message">{errors.email}</div>
                                )}
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="confirmEmail">Confirmer l'email*</label>
                                <input
                                    type="email"
                                    id="confirmEmail"
                                    name="confirmEmail"
                                    value={personalInfo.confirmEmail}
                                    onChange={handlePersonalInfoChange}
                                    className={errors.confirmEmail ? 'error' : ''}
                                    required
                                />
                                {errors.confirmEmail && (
                                    <div className="error-message">{errors.confirmEmail}</div>
                                )}
                            </div>
                            
                            <div className="form-check">
                                <input
                                    type="checkbox"
                                    id="receiveNewsletter"
                                    name="receiveNewsletter"
                                    checked={receiveNewsletter}
                                    onChange={() => setReceiveNewsletter(!receiveNewsletter)}
                                />
                                <label htmlFor="receiveNewsletter">
                                    Recevoir les offres et actualités de SwiftRail par email
                                </label>
                            </div>
                            
                            {isLoggedIn && !promoApplied && (
                                <div className="promo-section">
                                    <h4>Code de réduction adhérent</h4>
                                    <form onSubmit={handlePromoCodeSubmit} className="promo-form">
                                        <input
                                            type="text"
                                            placeholder="Entrez votre code"
                                            value={promoCode}
                                            onChange={(e) => setPromoCode(e.target.value)}
                                            className={errors.promoCode ? 'error' : ''}
                                        />
                                        <button type="submit" className="promo-btn">Appliquer</button>
                                    </form>
                                    {errors.promoCode && (
                                        <div className="error-message">{errors.promoCode}</div>
                                    )}
                                </div>
                            )}
                            
                            {promoApplied && (
                                <div className="promo-applied">
                                    <span>Code promo appliqué : -10€</span>
                                    <button 
                                        type="button" 
                                        className="remove-promo-btn"
                                        onClick={() => setPromoApplied(false)}
                                    >
                                        Retirer
                                    </button>
                                </div>
                            )}
                            
                            <div className="form-actions">
                                <button 
                                    type="button" 
                                    className="next-step-btn"
                                    onClick={handleNextStep}
                                >
                                    Continuer vers le paiement
                                </button>
                            </div>
                        </form>
                    </div>
                )}
                
                {activeStep === 2 && (
            <form onSubmit={handleSubmit} className="payment-form">
                <h2>Paiement sécurisé</h2>
                        
                        <div className="payment-section">
                            <label htmlFor="cardholderName">Nom du titulaire</label>
                            <input
                                type="text"
                                id="cardholderName"
                                name="cardholderName"
                                value={paymentDetails.cardholderName}
                                onChange={handleChange}
                                className={errors.cardholderName ? 'error' : ''}
                                required
                                placeholder="Ex: Jean Dupont"
                            />
                            {errors.cardholderName && (
                                <div className="error-message">{errors.cardholderName}</div>
                            )}
                        </div>
                        
                        <div className="payment-section">
                            <label htmlFor="cardNumber">Numéro de carte</label>
                    <input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        value={paymentDetails.cardNumber}
                        onChange={handleChange}
                                className={errors.cardNumber ? 'error' : ''}
                        required
                                placeholder="1234 5678 9012 3456"
                    />
                            {getCardType(paymentDetails.cardNumber) && (
                                <div className="card-icon">{getCardType(paymentDetails.cardNumber)}</div>
                            )}
                            {errors.cardNumber && (
                                <div className="error-message">{errors.cardNumber}</div>
                            )}
                </div>
                        
                        <div className="expiry-cvv-container">
                            <div className="expiry-container payment-section">
                                <label htmlFor="expiryDate">Date d'expiration</label>
                    <input
                        type="text"
                        id="expiryDate"
                        name="expiryDate"
                        value={paymentDetails.expiryDate}
                        onChange={handleChange}
                                    className={errors.expiryDate ? 'error' : ''}
                        required
                                    placeholder="MM/YY"
                    />
                                {errors.expiryDate && (
                                    <div className="error-message">{errors.expiryDate}</div>
                                )}
                </div>
                            
                            <div className="cvv-container payment-section">
                                <label htmlFor="cvv">CVV</label>
                    <input
                        type="text"
                        id="cvv"
                        name="cvv"
                        value={paymentDetails.cvv}
                        onChange={handleChange}
                                    className={errors.cvv ? 'error' : ''}
                        required
                                    placeholder="123"
                    />
                                {errors.cvv && (
                                    <div className="error-message">{errors.cvv}</div>
                                )}
                            </div>
                        </div>
                        
                        <div className="form-actions payment-actions">
                            <button 
                                type="button" 
                                className="back-btn"
                                onClick={handlePrevStep}
                            >
                                Retour
                            </button>
                            
                            <button 
                                type="submit" 
                                className="payment-button"
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Traitement en cours...' : `Payer ${getPriceDetails().grandTotal}€`}
                            </button>
                        </div>
                        
                        <div className="payment-methods">
                            <img src="https://cdn-icons-png.flaticon.com/512/196/196578.png" alt="Visa" className="payment-method" />
                            <img src="https://cdn-icons-png.flaticon.com/512/196/196561.png" alt="MasterCard" className="payment-method" />
                            <img src="https://cdn-icons-png.flaticon.com/512/196/196539.png" alt="American Express" className="payment-method" />
                            <img src="https://cdn-icons-png.flaticon.com/512/217/217445.png" alt="PayPal" className="payment-method" />
                        </div>
                        
                        <div className="secure-badge">
                            <i>🔒</i>
                            <span>Vos informations de paiement sont cryptées et sécurisées</span>
                        </div>
                        
                        <div className="ticket-info">
                            <p>Un email contenant vos billets au format PDF sera envoyé à <strong>{personalInfo.email}</strong> après validation du paiement.</p>
                </div>
            </form>
                )}
            </div>
        </div>
    );
};

export default PaymentComponent;