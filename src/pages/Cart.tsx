import React, {useState} from "react";
import TicketsDisplayer from "../components/ticketComponents/TicketsDisplayer";
import Command from "../interfaces/Command";
import "../stylesheets/Cart.css";
import {Option} from "../interfaces/Option.tsx";


const exampleData: Command[] = [
    {
        validated: false,
        validation_date: null,
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
        validated: false,
        validation_date: null,
        options: [Option.PLA_TRA, Option.BAG_SUP, Option.GAR_ANN, Option.PRI_ELE, Option.INF_SMS],
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

const Cart: React.FC = () => {
    const [cart, setCart] = useState<Command[]>(exampleData);

    // delete an option from a ticket
    const removeOption = (commandIndex: number, option: string) => {
        setCart(prevCart => prevCart.map((cmd, i) =>
            i === commandIndex ? {
                ...cmd,
                options: cmd.options.filter(opt => opt !== option)
            } : cmd
        ));
    };

    // delete a ticket
    const removeItem = (commandIndex: number) => {
        setCart(prevCart => prevCart.filter((_, i) => i !== commandIndex));
    };

    return (
        <div className="cart-container">
            <h2>🛒 Mon Panier</h2>
            {cart.length > 0 ? (
                <>
                    <TicketsDisplayer cart={cart} removeOption={removeOption} removeItem={removeItem} />
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