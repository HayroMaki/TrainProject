import React from "react";
import Command from "../interfaces/Command";

interface CartRecapProps {
    cart: Command[];
    onCancel: () => void;
    onConfirm: () => void;
}

const CartRecap: React.FC<CartRecapProps> = ({ cart, onCancel, onConfirm }) => {
    const total = cart.reduce((sum, cmd) => sum + cmd.travel_info.price, 0);

    return (
        <div className="recap-container">
            <h3>Récapitulatif de votre panier</h3>
            {cart.map((command, index) => (
                <div key={index} className="recap-item">
                    <p><strong>{command.travel_info.departure} → {command.travel_info.arrival}</strong></p>
                    <p>Train : {command.travel_info.train_ref}</p>
                    <p>Date : {command.travel_info.date} à {command.travel_info.time}</p>
                    <p>Siège : {command.seat}</p>
                    <p>Options : {command.options.length > 0 ? command.options.join(", ") : "Aucune"}</p>
                    <p>Prix : {command.travel_info.price}€</p>
                    <hr />
                </div>
            ))}
            <h4>Total : {total}€</h4>
            <div className="recap-actions">
                <button className="cancel-btn" onClick={onCancel}>Retour</button>
                <button className="confirm-btn" onClick={onConfirm}>Confirmer</button>
            </div>
        </div>
    );
};

export default CartRecap;
