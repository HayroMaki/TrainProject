import React, { useState } from "react";

import TicketsDisplayer from "../components/ticketComponents/TicketsDisplayer";
import CartRecap from "../components/CartRecap.tsx";
import { useUserContext } from "../components/UserContext.tsx";
import { Option } from "../interfaces/Option.tsx";

import "../stylesheets/Cart.css";
import { useNavigate } from "react-router-dom";

// Prix des options pour le calcul des prix
const optionPrices = {
    [Option.PLA_TRA]: 3,
    [Option.PRI_ELE]: 2,
    [Option.BAG_SUP]: 5,
    [Option.INF_SMS]: 1,
    [Option.GAR_ANN]: 2.9
};

const Cart: React.FC = () => {
    const { user, setUserCart } = useUserContext();
    const [showRecap, setShowRecap] = useState(false);
    const navigate = useNavigate();

    // Calcul du prix total du panier
    const calculateTotalPrice = () => {
        return user.cart.reduce((total, cmd) => {
            // Prix de base du billet
            let itemPrice = cmd.travel_info.price;
            
            // Ajouter le prix de chaque option
            cmd.options.forEach(option => {
                itemPrice += optionPrices[option] || 0;
            });
            
            return total + itemPrice;
        }, 0);
    };

    // Supprimer une option d'un billet
    const removeOption = (commandIndex: number, option: string) => {
        setUserCart(user.cart.map((cmd, i) =>
            i === commandIndex ? {
                ...cmd,
                options: cmd.options.filter(opt => opt !== option)
            } : cmd
        ));
    };

    // Supprimer un billet entier
    const removeItem = (commandIndex: number) => {
        setUserCart(user.cart.filter((_, i) => i !== commandIndex));
    };

    // Confirmation du panier puis paiement
    const handleConfirm = () => {
        console.log("Réservation confirmée !");
        navigate("/payment");
    };

    return (
        <div className="cart-container">
            <h2>🛒 Mon Panier</h2>
            {user.cart.length > 0 ? (
                <>
                    {!showRecap ? (
                        <>
                            <TicketsDisplayer
                                cart={user.cart}
                                removeOption={removeOption}
                                removeItem={removeItem}
                            />
                            <div className="validate-container">
                                <button className="validate-btn" onClick={() => setShowRecap(true)}>
                                    Valider le Panier
                                    <span className="total-amount">{calculateTotalPrice().toFixed(2)}€</span>
                                </button>
                            </div>
                        </>
                    ) : (
                        <CartRecap
                            cart={user.cart}
                            onCancel={() => setShowRecap(false)}
                            onConfirm={handleConfirm}
                        />
                    )}
                </>
            ) : (
                <div className="empty-cart-message">
                    <div className="empty-cart-icon">🚄</div>
                    <h3>Votre panier est vide</h3>
                    <p>Ajoutez des trajets pour commencer votre voyage</p>
                    <button className="back-to-search-btn" onClick={() => navigate('/')}>
                        Rechercher des trajets
                    </button>
                </div>
            )}
        </div>
    );
};

export default Cart;
