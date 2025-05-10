import {Component, useEffect, useState} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './../stylesheets/Travels.css';
import Travel from "../interfaces/Travel.tsx";

/**
 * Fonction utilitaire pour formater une date
 * @param dateString - La chaîne de date à formater
 * @returns La date formatée en français (ex: lundi 1 janvier 2024)
 */
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
};

/**
 * Fonction utilitaire pour formater une date pour les requêtes API (YYYY-MM-DD)
 * @param dateString - La chaîne de date à formater
 * @returns La date au format YYYY-MM-DD
 */
const formatDateForAPI = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
};

/**
 * Fonction utilitaire pour formater une durée en heures et minutes
 * @param minutes - La durée en minutes
 * @returns La durée formatée (ex: 2h30min)
 */
const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins < 10 ? '0' : ''}${mins}min`;
};

/**
 * Fonction utilitaire pour calculer l'heure d'arrivée
 * @param departureDate - La date de départ
 * @param departureTime - L'heure de départ
 * @param duration - La durée du trajet en minutes
 * @returns L'heure d'arrivée formatée
 */
const calculateArrivalTime = (departureDate: string, departureTime: string, duration: number) => {
    const [hours, minutes] = departureTime.split(':');
    const departureDateTime = new Date(departureDate);
    departureDateTime.setHours(parseInt(hours, 10));
    departureDateTime.setMinutes(parseInt(minutes, 10));

    const arrivalDateTime = new Date(departureDateTime.getTime() + duration * 60000);

    return new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(arrivalDateTime);
};

/**
 * Composant pour afficher une carte de voyage individuelle
 * @param travel - Les informations du trajet
 * @param onAddToCart - Fonction pour ajouter au panier
 * @param isReturn - Indique s'il s'agit d'un trajet retour
 * @param isBestDeal - Indique s'il s'agit du meilleur prix (bon plan)
 */
class TravelCard extends Component<{ 
    travel: Travel, 
    onAddToCart: (travel: Travel) => void, 
    isReturn?: boolean, 
    isBestDeal?: boolean 
}> {
    render() {
        const {travel, onAddToCart, isReturn, isBestDeal} = this.props;
        return (
            <div className={`travel-card ${isReturn ? 'return-card' : ''} ${isBestDeal ? 'best-deal-card' : ''}`}>
                {isReturn && <div className="return-badge">Trajet retour</div>}
                {isBestDeal && <div className="best-deal-badge">Meilleur prix</div>}
                <h3>Train Ref: {travel.train_ref}</h3>
                <p><strong>Ville de départ :</strong> {travel.departure}</p>
                <p><strong>Ville d'arrivée :</strong> {travel.arrival}</p>
                <p><strong>Départ :</strong> {formatDate(travel.date)} at {travel.time}</p>
                <p><strong>Arrivée :</strong> {calculateArrivalTime(travel.date, travel.time, travel.length)}</p>
                <p><strong>Durée :</strong> {formatDuration(travel.length)}</p>
                <p className={`price ${isBestDeal ? 'best-deal-price' : ''}`}>
                    <strong>Prix :</strong> {travel.price} €
                </p>
                <button onClick={() => onAddToCart(travel)}>
                    + Ajouter au panier
                </button>
            </div>
        );
    }
}

/**
 * Composant pour afficher le panier
 * @param cart - Les trajets dans le panier
 * @param onRemoveFromCart - Fonction pour retirer un trajet du panier
 * @param onClose - Fonction pour fermer le panier
 */
class Cart extends Component<{ cart: Travel[], onRemoveFromCart: (index: number) => void, onClose: () => void }> {
    render() {
        const {cart, onRemoveFromCart, onClose} = this.props;
        return (
            <div className="cart-popup">
                <h3>Votre panier</h3>
                {cart.length > 0 ? (
                    <ul>
                        {cart.map((item, index) => (
                            <li key={index}>
                                <span>{item.train_ref} - {item.departure} → {item.arrival}</span>
                                <button onClick={() => onRemoveFromCart(index)}>🗑️</button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Votre panier est vide</p>
                )}
                <button onClick={onClose}>Fermer</button>
            </div>
        );
    }
}

/**
 * Composant principal d'affichage des trajets disponibles
 * Ce composant affiche les trajets aller et retour disponibles,
 * met en évidence le trajet avec le meilleur prix (bon plan),
 * et permet à l'utilisateur d'ajouter des trajets à son panier.
 */
export const Travels = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const formData = location.state?.formData;
    const [travels, setTravels] = useState<Travel[]>([]);
    const [returnTravels, setReturnTravels] = useState<Travel[]>([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState<Travel[]>([]);
    const [showCart, setShowCart] = useState(false);

    /**
     * Fonction pour ajouter un trajet au panier
     * @param travel - Le trajet à ajouter au panier
     */
    const addToCart = (travel: Travel) => {
        setCart([...cart, travel]);
        // Ajoute une classe d'animation
        const cartButton = document.querySelector('.cart-button') as HTMLButtonElement;
        cartButton.classList.add('animate-cart');

        // Supprime la classe après l'animation
        setTimeout(() => {
            cartButton.classList.remove('animate-cart');
        }, 500); // Durée de l'animation en millisecondes
    };

    /**
     * Fonction pour retirer un trajet du panier
     * @param index - L'index du trajet à retirer
     */
    const removeFromCart = (index: number) => {
        const newCart = cart.filter((_, i) => i !== index);
        setCart(newCart);
    };

    /**
     * Fonction pour valider le panier et passer à l'étape suivante
     */
    const handleValidate = () => {
        navigate('/options', { state: { cart } });
    };

    /**
     * Trouve l'index du trajet avec le prix le plus bas
     * @param travelsList - Liste des trajets à analyser
     * @returns L'index du trajet le moins cher
     */
    const findBestDealIndex = (travelsList: Travel[]) => {
        if (travelsList.length === 0) return -1;
        
        let bestDealIndex = 0;
        let lowestPrice = travelsList[0].price;
        
        for (let i = 1; i < travelsList.length; i++) {
            if (travelsList[i].price < lowestPrice) {
                lowestPrice = travelsList[i].price;
                bestDealIndex = i;
            }
        }
        
        return bestDealIndex;
    };

    // Récupère les trajets en fonction des données du formulaire
    useEffect(() => {
        if (formData) {
            const fetchTravels = async () => {
                try {
                    // Vérifie et formate les dates pour l'API si nécessaire
                    const departureDate = formData.departureDate.includes('-') 
                        ? formData.departureDate 
                        : formatDateForAPI(formData.departureDate);
                    
                    let arrivalDate = formData.arrivalDate;
                    if (formData.isRoundTrip && formData.arrivalDate) {
                        arrivalDate = formData.arrivalDate.includes('-') 
                            ? formData.arrivalDate 
                            : formatDateForAPI(formData.arrivalDate);
                    }
                    
                    // Log pour vérifier les données du formulaire
                    console.log("Form data:", {
                        ...formData,
                        departureDate,
                        arrivalDate
                    });
                    
                    const queryParams = new URLSearchParams({
                        departure: formData.departure,
                        arrival: formData.arrival,
                        date: departureDate
                    }).toString();

                    const response = await fetch(`http://localhost:5000/api/getTravels?${queryParams}`);
                    const data = await response.json();
                    setTravels(data);
                    console.log("Aller travels:", data);

                    // Si c'est un aller-retour, récupère les trajets retour
                    if (formData.isRoundTrip && arrivalDate) {
                        const returnQueryParams = new URLSearchParams({
                            departure: formData.arrival,
                            arrival: formData.departure,
                            date: arrivalDate
                        }).toString();

                        console.log("Return query params:", returnQueryParams);

                        const returnResponse = await fetch(`http://localhost:5000/api/getTravels?${returnQueryParams}`);
                        const returnData = await returnResponse.json();
                        setReturnTravels(returnData);
                        console.log("Return travels:", returnData);
                    }
                } catch (error) {
                    console.error("Error fetching travels:", error);
                } finally {
                    setLoading(false);
                }
            };

            fetchTravels();
        } else {
            setLoading(false);
        }
    }, [formData]);

    // Trouve les index des trajets avec les meilleurs prix
    const bestDealIndex = findBestDealIndex(travels);
    const bestReturnDealIndex = findBestDealIndex(returnTravels);

    if (loading) {
        return <div className="loading-container"><p>Chargement des trajets...</p></div>;
    }

    return (
        <div className="travels-container">
            {/* Barre d'informations sur le trajet */}
            {formData && (
                <div className="trip-info-bar">
                    <div className="trip-route">
                        <span className="trip-city departure">{formData.departure}</span>
                        <span className="trip-arrow">→</span>
                        <span className="trip-city arrival">{formData.arrival}</span>
                    </div>
                    <div className="trip-date">
                        {formData.departureDate && <span>{formatDate(formData.departureDate)}</span>}
                        {formData.isRoundTrip && formData.arrivalDate && (
                            <>
                                <span className="date-separator">|</span>
                                <span>Retour le {formatDate(formData.arrivalDate)}</span>
                            </>
                        )}
                    </div>
                    <div className="trip-type">
                        {formData.isRoundTrip ? "Aller-retour" : "Aller simple"}
                    </div>
                </div>
            )}

            {/* Bouton du panier */}
            <button className="cart-button" onClick={() => setShowCart(!showCart)}>
                🛒 Panier ({cart.length})
            </button>

            {/* Bouton de validation */}
            <button className="validate-button" onClick={handleValidate} disabled={cart.length === 0}>
                Valider
            </button>

            {/* Popup du panier */}
            {showCart && (
                <Cart
                    cart={cart}
                    onRemoveFromCart={removeFromCart}
                    onClose={() => setShowCart(false)}
                />
            )}

            {formData ? (
                <div className="search-details">
                    <h2>Trajets disponibles</h2>
                    {travels.length > 0 ? (
                        <div className="travels-grid">
                            {travels.map((travel, index) => (
                                <TravelCard
                                    key={index}
                                    travel={travel}
                                    onAddToCart={addToCart}
                                    isReturn={false}
                                    isBestDeal={index === bestDealIndex}
                                />
                            ))}
                        </div>
                    ) : (
                        <p>Pas de trajets trouvés.</p>
                    )}

                    {formData.isRoundTrip && (
                        <div className="return-travels">
                            <h2>Trajets retours disponibles</h2>
                            {returnTravels.length > 0 ? (
                            <div className="travels-grid">
                                {returnTravels.map((travel, index) => (
                                    <TravelCard
                                        key={index}
                                        travel={travel}
                                        onAddToCart={addToCart}
                                        isReturn={true}
                                        isBestDeal={index === bestReturnDealIndex}
                                    />
                                ))}
                            </div>
                            ) : (
                                <p>Chargement des trajets retour...</p>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <p>Pas de trajets disponibles</p>
            )}
        </div>
    );
};