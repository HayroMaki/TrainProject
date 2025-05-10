// Ticket.tsx
import React from "react";
import Command from "../../interfaces/Command.tsx";
import { Option } from "../../interfaces/Option.tsx";

// Price of the options
const optionPrices = {
    [Option.PLA_TRA]: 3,
    [Option.PRI_ELE]: 2,
    [Option.BAG_SUP]: 5,
    [Option.INF_SMS]: 1,
    [Option.GAR_ANN]: 2.9
};

// Format the duration
export const goodDuree = (duree: number): string => {
    const heures = Math.floor(duree / 60);
    const minutes = duree % 60;
    return `${heures}h${minutes.toString().padStart(2, '0')}`;
};

interface TicketProps {
    command: Command;
    index: number;
    removeOption: (commandIndex: number, option: string) => void;
    removeItem: (commandIndex: number) => void;
}

const Ticket: React.FC<TicketProps> = ({ command, index, removeOption, removeItem }) => {
    // Computes the base price and their options
    const basePrice = command.travel_info.price;
    const optionsPrice = command.options.reduce((total, option) => {
        return total + (optionPrices[option] || 0);
    }, 0);
    const totalPrice = basePrice + optionsPrice;

    // Extract the car number and the seat
    const extractSeatInfo = (seatString: string) => {
        // If the seat follows the correct format (eg. : "2-5A"), extract the car and the seat
        if (seatString && seatString.includes('-')) {
            const [carNumber, seatNumber] = seatString.split('-');
            return { car: carNumber, seat: seatNumber };
        }
        // Otherwise, use the existing format for backward compatibility
        return { car: Math.floor(Math.random() * 9) + 1, seat: seatString };
    };

    const seatInfo = extractSeatInfo(command.seat);

    // Generate a CSS class for the train type
    const getTrainTypeClass = (trainRef: string) => {
        if (trainRef.startsWith("TGV")) return "train-tgv";
        if (trainRef.startsWith("TER")) return "train-ter";
        if (trainRef.startsWith("INT")) return "train-intercity";
        return "train-other";
    };

    return (
        <div className="train-ticket">
            <div className="ticket-header">
                <div className="ticket-company">
                    <div className="company-logo-container">
                        <span className="company-logo">🚄</span>
                    </div>
                    <span className="company-name">SwiftRail</span>
                </div>
                <div className={`train-type ${getTrainTypeClass(command.travel_info.train_ref)}`}>
                    {command.travel_info.train_ref}
                </div>
            </div>
            
            <div className="ticket-body">
                <div className="ticket-journey">
                    <div className="journey-points">
                        <div className="departure-point">
                            <div className="city">{command.travel_info.departure}</div>
                            <div className="time">{command.travel_info.time}</div>
                            <div className="date">{command.travel_info.date}</div>
                        </div>
                        
                        <div className="journey-line">
                            <div className="journey-duration">{goodDuree(command.travel_info.length)}</div>
                        </div>
                        
                        <div className="arrival-point">
                            <div className="city">{command.travel_info.arrival}</div>
                            <div className="time">
                                {(() => {
                                    // Calcule l'heure d'arrivée approximative
                                    const [hours, minutes] = command.travel_info.time.split(':').map(Number);
                                    const totalMinutes = hours * 60 + minutes + command.travel_info.length;
                                    const arrivalHours = Math.floor(totalMinutes / 60) % 24;
                                    const arrivalMinutes = totalMinutes % 60;
                                    return `${arrivalHours.toString().padStart(2, '0')}:${arrivalMinutes.toString().padStart(2, '0')}`;
                                })()}
                            </div>
                        </div>
                    </div>
                    
                    <div className="passenger-details">
                        <div className="seat-info">
                            <span className="label">Siège</span>
                            <span className="value">{seatInfo.seat}</span>
                        </div>
                        <div className="class-info">
                            <span className="label">Classe</span>
                            <span className="value">2</span>
                        </div>
                        <div className="car-info">
                            <span className="label">Voiture</span>
                            <span className="value">{seatInfo.car}</span>
                        </div>
                    </div>
                </div>

                <div className="ticket-options">
                    <h4>Options & Services</h4>
                    {command.options.length > 0 ? (
                        <ul className="options-list">
                            {command.options.map((option, optIndex) => (
                                <li key={optIndex} className="option-item">
                                    <span className="option-name">{option}</span>
                                    <span className="option-price">+{optionPrices[option]}€</span>
                                    <button
                                        className="remove-option-btn"
                                        onClick={() => removeOption(index, option)}
                                        title="Supprimer cette option"
                                    >
                                        ×
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="no-options">Aucune option sélectionnée</p>
                    )}
                </div>
            </div>
            
            <div className="ticket-footer">
                <div className="price-breakdown">
                    <div className="base-price">
                        <span className="label">Tarif de base</span>
                        <span className="value">{basePrice.toFixed(2)}€</span>
                    </div>
                    {optionsPrice > 0 && (
                        <div className="options-price">
                            <span className="label">Options</span>
                            <span className="value">+{optionsPrice.toFixed(2)}€</span>
                        </div>
                    )}
                    <div className="total-price">
                        <span className="label">Total</span>
                        <span className="value">{totalPrice.toFixed(2)}€</span>
                </div>
            </div>

            <div className="ticket-actions">
                    <button className="remove-ticket-btn" onClick={() => removeItem(index)}>
                        Supprimer ce billet
                    </button>
                </div>
            </div>
            
            <div className="ticket-barcode">
                <div className="barcode-graphic"></div>
                <div className="ticket-ref">Ref: {Math.random().toString(36).substring(2, 10).toUpperCase()}</div>
            </div>
        </div>
    );
};

export default Ticket;
