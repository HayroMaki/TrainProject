import Command from "../../interfaces/Command";
import { Option } from "../../interfaces/Option";

interface TicketProps {
    command: Command;
    index: number;
    removeOption: (commandIndex: number, option: Option) => void;
    removeItem: (commandIndex: number) => void;
}

const Ticket: React.FC<TicketProps> = ({ command, index, removeOption, removeItem }) => {
    return (
        <div className="cart-item">
            <div className="ticket-info">
                <h3>🚆 {command.travel_info.train_ref} - {command.travel_info.departure} → {command.travel_info.arrival}</h3>
                <p><strong>Date :</strong> {command.travel_info.date}</p>
                <p><strong>Heure :</strong> {command.travel_info.time}</p>
                <p><strong>Durée :</strong> {command.travel_info.length} min</p>
                <p><strong>Siège :</strong> {command.seat}</p>
            </div>

            <div className="options-container">
                <strong>Options :</strong>
                {command.options.length > 0 ? (
                    <ul>
                        {command.options.map((option, optIndex) => (
                            <li key={optIndex}>
                                {option}
                                <button
                                    className="remove-option-btn"
                                    onClick={() => removeOption(index, option)}
                                >X</button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Aucune option sélectionnée</p>
                )}
            </div>

            <div className="ticket-actions">
                <p>{command.travel_info.price}€</p>
                <button className="remove-btn" onClick={() => removeItem(index)}>Retirer</button>
            </div>
        </div>
    );
};

export default Ticket;
