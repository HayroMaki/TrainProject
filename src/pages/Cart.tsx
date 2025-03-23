import React from "react";

import TicketsDisplayer from "../components/ticketComponents/TicketsDisplayer";
import {useUserContext} from "../components/UserContext.tsx";

import "../stylesheets/Cart.css";

const Cart: React.FC = () => {
    const {user, setUserCart} = useUserContext();

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

    return (
        <div className="cart-container">
            <h2>🛒 Mon Panier</h2>
            {user.cart.length > 0 ? (
                <>
                    <TicketsDisplayer cart={user.cart} removeOption={removeOption} removeItem={removeItem} />
                    <div className="validate-container">
                        <button className="validate-btn">Valider le Panier</button>
                    </div>
                </>
            ) : (
                <p>Votre panier est vide.</p>
            )}
        </div>
    );
};

export default Cart;