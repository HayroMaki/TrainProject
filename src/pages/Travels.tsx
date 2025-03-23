import {Component, useEffect, useState} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './../stylesheets/Travels.css';
import Travel from "../interfaces/Travel.tsx";

// Utility function to format date
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
};

// Utility function to format duration in xxhxxmin format
const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins < 10 ? '0' : ''}${mins}min`;
};

// Utility function to calculate arrival time
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

// Component to display a single travel card
class TravelCard extends Component<{ travel: Travel, onAddToCart: (travel: Travel) => void }> {
    render() {
        const {travel, onAddToCart} = this.props;
        return (
            <div className="travel-card">
                <h3>Train Ref: {travel.train_ref}</h3>
                <p><strong>Ville de départ :</strong> {travel.departure}</p>
                <p><strong>Ville d'arrivée :</strong> {travel.arrival}</p>
                <p><strong>Départ :</strong> {formatDate(travel.date)} at {travel.time}</p>
                <p><strong>Arrivée :</strong> {calculateArrivalTime(travel.date, travel.time, travel.length)}</p>
                <p><strong>Durée :</strong> {formatDuration(travel.length)}</p>
                <p><strong>Prix :</strong> {travel.price} €</p>
                <button onClick={() => onAddToCart(travel)}>+ Ajouter au panier</button>
            </div>
        );
    }
}

// Component to display the cart
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
                                <span>{item.train_ref} - {item.departure} to {item.arrival}</span>
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

// Main Travels component
export const Travels = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const formData = location.state?.formData;
    const [travels, setTravels] = useState([]);
    const [returnTravels, setReturnTravels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState<Travel[]>([]);
    const [showCart, setShowCart] = useState(false);

    // Function to add a travel to the cart
    const addToCart = (travel: Travel) => {
        setCart([...cart, travel]);
        // Add animation class
        const cartButton = document.querySelector('.cart-button') as HTMLButtonElement;
        cartButton.classList.add('animate-cart');

        // Remove the class after the animation
        setTimeout(() => {
            cartButton.classList.remove('animate-cart');
        }, 500); // Animation duration in milliseconds
    };

    // Function to remove a travel from the cart
    const removeFromCart = (index: number) => {
        const newCart = cart.filter((_, i) => i !== index);
        setCart(newCart);
    };

    const handleValidate = () => {
        navigate('/options', { state: { cart } });
    };

    // Fetch travels based on form data
    useEffect(() => {
        if (formData) {
            const fetchTravels = async () => {
                try {
                    const queryParams = new URLSearchParams({
                        departure: formData.departure,
                        arrival: formData.arrival,
                        date: formData.departureDate
                    }).toString();

                    const response = await fetch(`http://localhost:5000/api/getTravels?${queryParams}`);
                    const data = await response.json();
                    setTravels(data);

                    // If it's a round trip, fetch return travels
                    if (formData.isRoundTrip && formData.arrivalDate) {
                        const returnQueryParams = new URLSearchParams({
                            departure: formData.arrival,
                            arrival: formData.departure,
                            date: formData.arrivalDate
                        }).toString();

                        const returnResponse = await fetch(`http://localhost:5000/api/getTravels?${returnQueryParams}`);
                        const returnData = await returnResponse.json();
                        setReturnTravels(returnData);
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

    if (loading) {
        return <p>Chargement...</p>;
    }

    return (
        <div className="travels-container">
            {/* Cart button */}
            <button className="cart-button" onClick={() => setShowCart(!showCart)}>
                🛒 Panier ({cart.length})
            </button>

            {/* Valider button */}
            <button className="validate-button" onClick={handleValidate}>
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
                                />
                            ))}
                        </div>
                    ) : (
                        <p>Pas de trajets trouvés.</p>
                    )}

                    {formData.isRoundTrip && returnTravels.length > 0 && (
                        <div className="return-travels">
                            <h2>Trajets retours disponibles</h2>
                            <div className="travels-grid">
                                {returnTravels.map((travel, index) => (
                                    <TravelCard
                                        key={index}
                                        travel={travel}
                                        onAddToCart={addToCart}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <p>Pas de trajets disponibles</p>
            )}
        </div>
    );
};