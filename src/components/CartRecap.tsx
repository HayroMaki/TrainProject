import React from "react";
import Command from "../interfaces/Command.tsx";
import { Option } from "../interfaces/Option.tsx";

// Prix des options pour le calcul des prix
const optionPrices = {
    [Option.PLA_TRA]: 3,
    [Option.PRI_ELE]: 2,
    [Option.BAG_SUP]: 5,
    [Option.INF_SMS]: 1,
    [Option.GAR_ANN]: 2.9
};

interface CartRecapProps {
    cart: Command[];
    onCancel: () => void;
    onConfirm: () => void;
}

const CartRecap: React.FC<CartRecapProps> = ({ cart, onCancel, onConfirm }) => {
    // Calcul du prix total avec les options
    const calculateItemTotal = (cmd: Command) => {
        const basePrice = cmd.travel_info.price;
        const optionsPrice = cmd.options.reduce((sum, option) => {
            return sum + (optionPrices[option] || 0);
        }, 0);
        return basePrice + optionsPrice;
    };

    // Calcul du total du panier
    const total = cart.reduce((sum, cmd) => sum + calculateItemTotal(cmd), 0);

    return (
        <div className="recap-container">
            <h3>Récapitulatif de votre commande</h3>
            
            {cart.map((command, index) => {
                const itemTotal = calculateItemTotal(command);
                
                return (
                <div key={index} className="recap-item">
                        <div className="recap-header">
                            <h4 className="recap-journey">{command.travel_info.departure} → {command.travel_info.arrival}</h4>
                            <div className="recap-train-ref">{command.travel_info.train_ref}</div>
                        </div>
                        
                        <div className="recap-details">
                            <div className="recap-detail">
                                <span className="detail-label">Date</span>
                                <span className="detail-value">{command.travel_info.date}</span>
                            </div>
                            <div className="recap-detail">
                                <span className="detail-label">Heure</span>
                                <span className="detail-value">{command.travel_info.time}</span>
                            </div>
                            <div className="recap-detail">
                                <span className="detail-label">Siège</span>
                                <span className="detail-value">{command.seat}</span>
                            </div>
                </div>
                        
                        <div className="recap-options">
                            <span className="options-label">Options</span>
                            {command.options.length > 0 ? (
                                <ul className="options-list">
                                    {command.options.map((option, optIndex) => (
                                        <li key={optIndex} className="option-item">
                                            <span className="option-name">{option}</span>
                                            <span className="option-price">+{optionPrices[option]}€</span>
                                        </li>
            ))}
                                </ul>
                            ) : (
                                <span className="no-options">Aucune option</span>
                            )}
                        </div>
                        
                        <div className="recap-item-price">
                            <div className="base-price">
                                <span className="price-label">Prix de base</span>
                                <span className="price-value">{command.travel_info.price.toFixed(2)}€</span>
                            </div>
                            {command.options.length > 0 && (
                                <div className="options-price">
                                    <span className="price-label">Options</span>
                                    <span className="price-value">+{(itemTotal - command.travel_info.price).toFixed(2)}€</span>
                                </div>
                            )}
                            <div className="item-total">
                                <span className="price-label">Total billet</span>
                                <span className="price-value">{itemTotal.toFixed(2)}€</span>
                            </div>
                        </div>
                    </div>
                );
            })}
            
            <div className="recap-total">
                <div className="total-label">Total à payer</div>
                <div className="total-value">{total.toFixed(2)}€</div>
            </div>
            
            <div className="recap-actions">
                <button className="cancel-btn" onClick={onCancel}>Retour au panier</button>
                <button className="confirm-btn" onClick={onConfirm}>Procéder au paiement</button>
            </div>
        </div>
    );
};

export default CartRecap;
