import React from "react";
import Command from "../../interfaces/Command.tsx";

interface TicketProps {
    command: Command;
    index: number;
    removeOption: (commandIndex: number, option: string) => void;
    removeItem: (commandIndex: number) => void;
}

const Ticket: React.FC<TicketProps> = ({ command, index, removeOption, removeItem }) => {
    return (
        <div className="cart-item">
            {/* ticket's info */}
            <div className="ticket-info">
                <h3>🚆 {command.travel_info.train_ref} - {command.travel_info.departure} → {command.travel_info.arrival}</h3>
                <p><strong>Départ :</strong> {command.travel_info.departure_date} à {command.travel_info.departure_time}</p>
                <p><strong>Arrivée :</strong> {command.travel_info.arrival_date} à {command.travel_info.arrival_time}</p>
                <p><strong>Siège :</strong> {command.travel_info.seat}</p>
            </div>

            {/* options */}
            <div className="options-container">
                <strong>Options :</strong>
                {command.options.length > 0 ? (
                    <ul>
                        {command.options.map((option, optIndex) => (
                            <li key={optIndex}>
                                {option}
                                <button className="remove-option-btn" onClick={() => removeOption(index, option)}>X</button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Aucune option sélectionnée</p>
                )}
            </div>

            {/* price */}
            <div className="ticket-actions">
                <p>{command.travel_info.price}€</p>
                <button className="remove-btn" onClick={() => removeItem(index)}>Retirer</button>
            </div>
        </div>
    );
};

export default Ticket;
