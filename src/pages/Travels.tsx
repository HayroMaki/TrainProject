import {Component, useEffect, useState} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './../stylesheets/Travels.css';
import Travel from "../interfaces/Travel.tsx";

/**
 * Utility function to format the date
 * @param dateString - The date string to format
 * @returns The formatted date in french (eg. : lundi 1 janvier 2024)
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
 * Utility function to format the date for the API call
 * @param dateString - The date string to format
 * @returns The date in the format YYYY-MM-DD
 */
const formatDateForAPI = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
};

/**
 * Utility function to format a duration in hour and minutes
 * @param minutes - The duration in minutes
 * @returns The formatted duration (eg. : 2h30min)
 */
const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins < 10 ? '0' : ''}${mins}min`;
};

/**
 * Utility function to compute the arrival date
 * @param departureDate - The departure date
 * @param departureTime - The departure time
 * @param duration - The duration of the trip
 * @returns The formatted arrival time
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
 * Component to show the map of trips
 * @param travel - The information of the trip
 * @param onAddToCart - Function to add to the cart
 * @param isReturn - Tells if the trip is return
 * @param isBestDeal - Tells if the trip is the best deal (lowest price)
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
 * Component to show the cart
 * @param cart - The trips of the cart
 * @param onRemoveFromCart - Function to remove a trip from the cart
 * @param onClose - Function to close the cart
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
 * Principal component to show the available trips.
 * This component shows the available one way and round trips,
 * highlights the trip with the best deal and allows the user
 * to add it to their cart.
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
     * Function to add a trip to the cart
     * @param travel - The trip to add
     */
    const addToCart = (travel: Travel) => {
        setCart([...cart, travel]);
        // Adds an animation class
        const cartButton = document.querySelector('.cart-button') as HTMLButtonElement;
        cartButton.classList.add('animate-cart');

        // Deletes the animation after it ends
        setTimeout(() => {
            cartButton.classList.remove('animate-cart');
        }, 500); // Duration of the animation
    };

    /**
     * Function to remove a trip from the cart
     * @param index - Index of the trip to remove
     */
    const removeFromCart = (index: number) => {
        const newCart = cart.filter((_, i) => i !== index);
        setCart(newCart);
    };

    /**
     * Function to confirm the cart
     */
    const handleValidate = () => {
        navigate('/options', { state: { cart } });
    };

    /**
     * Finds the index of the best deal trip
     * @param travelsList - List of trips to analyze
     * @returns The index of the best deal trip
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

    // Fetches the trips according to the form data
    useEffect(() => {
        if (formData) {
            const fetchTravels = async () => {
                try {
                    // Verifies and formats the dates for the API if necessary
                    const departureDate = formData.departureDate.includes('-') 
                        ? formData.departureDate 
                        : formatDateForAPI(formData.departureDate);
                    
                    let arrivalDate = formData.arrivalDate;
                    if (formData.isRoundTrip && formData.arrivalDate) {
                        arrivalDate = formData.arrivalDate.includes('-') 
                            ? formData.arrivalDate 
                            : formatDateForAPI(formData.arrivalDate);
                    }
                    
                    // Log to verify the form's data
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

                    // If it's a round trip, fetch the return trips
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

    // Finds the index of the best deal trip
    const bestDealIndex = findBestDealIndex(travels);
    const bestReturnDealIndex = findBestDealIndex(returnTravels);

    if (loading) {
        return <div className="loading-container"><p>Chargement des trajets...</p></div>;
    }

    return (
        <div className="travels-container">
            {/* Information bar about the trip */}
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

            {/* Cart button */}
            <button className="cart-button" onClick={() => setShowCart(!showCart)}>
                🛒 Panier ({cart.length})
            </button>

            {/* Confirmation button */}
            <button className="validate-button" onClick={handleValidate} disabled={cart.length === 0}>
                Valider
            </button>

            {/* Cart popup */}
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