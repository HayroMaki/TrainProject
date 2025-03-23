import React from "react";
import Command from "../interfaces/Command";
import "../stylesheets/Resa.css";
import { Option } from "../interfaces/Option";

const validatedCommands: Command[] = [
    {
        validated: true,
        validation_date: "2025-04-05",
        options: [Option.PLA_TRA, Option.BAG_SUP],
        seat: "12A",
        travel_info: {
            train_ref: "TGV123",
            departure: "Paris Gare de Lyon",
            arrival: "Lyon Part-Dieu",
            date: "2025-04-10",
            time: "10:00",
            length: 270,
            price: 45
        }
    },
    {
        validated: true,
        validation_date: "2025-04-05",
        options: [],
        seat: "8C",
        travel_info: {
            train_ref: "TGV5678",
            departure: "Lyon Part-Dieu",
            arrival: "Paris Gare de Lyon",
            date: "2025-04-15",
            time: "10:00",
            length: 150,
            price: 49
        }
    }
];

const Reservations: React.FC = () => {
    return (
        <div className="resa-container">
            <h2>Mes Réservations</h2>
            {validatedCommands.length > 0 ? (
                <div className="resa-items">
                    {validatedCommands.map((command, index) => (
                        <div key={index} className="resa-item">
                            <span className="validation-date">
                                Réservé le : {command.validation_date}
                            </span>

                            <div className="ticket-info">
                                <h3>🚆 {command.travel_info.train_ref} - {command.travel_info.departure} → {command.travel_info.arrival}</h3>
                                <p><strong>Date :</strong> {command.travel_info.date}</p>
                                <p><strong>Heure :</strong> {command.travel_info.time}</p>
                                <p><strong>Durée :</strong> {command.travel_info.length} min</p>
                                <p><strong>Siège :</strong> {command.seat}</p>
                            </div>

                            <div className="options-container">
                                <strong>Options sélectionnées :</strong>
                                {command.options.length > 0 ? (
                                    <ul>
                                        {command.options.map((option, idx) => (
                                            <li key={idx}>{option}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>Aucune option</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p>Vous n'avez aucune réservation.</p>
            )}
        </div>
    );
};

export default Reservations;
