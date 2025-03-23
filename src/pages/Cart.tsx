import React, { useState } from "react";

import TicketsDisplayer from "../components/ticketComponents/TicketsDisplayer";
import CartRecap from "../components/CartRecap.tsx";
import { useUserContext } from "../components/UserContext.tsx";

import "../stylesheets/Cart.css";
import {useNavigate} from "react-router-dom";

const Cart: React.FC = () => {
    const { user, setUserCart } = useUserContext();
    const [showRecap, setShowRecap] = useState(false);
    const navigate = useNavigate();

    // delete an option from a ticket
    const removeOption = (commandIndex: number, option: string) => {
        setUserCart(user.cart.map((cmd, i) =>
            i === commandIndex ? {
                ...cmd,
                options: cmd.options.filter(opt => opt !== option)
            } : cmd
        ));
    };

    // delete a ticket
    const removeItem = (commandIndex: number) => {
        setUserCart(user.cart.filter((_, i) => i !== commandIndex));
    };

    // confirmation the cart and then pay
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
                <p>Votre panier est vide.</p>
            )}
        </div>
    );
};

export default Cart;
