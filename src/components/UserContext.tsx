import React, {createContext, useState, useContext, ReactNode} from "react";
import User from "../interfaces/User.tsx";
import Command from "../interfaces/Command.tsx";
import {Option} from "../interfaces/Option.tsx";

// Définition du type pour le contexte User :
interface UserContextType {
    user: User;
    connected: boolean;
    setConnected: (status: boolean) => void;
    setUser: React.Dispatch<React.SetStateAction<User>>;
    setUserCart: (cart: Command[]) => void;
}

const exampleCart: Command[] = [
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

const defaultUser:User = {
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    cart: exampleCart,
    commands: [],
    subscription: null,
    creation_date: "",
    bank_info: {
        first_name: "",
        last_name: "",
        card_number: "",
        expiration_date: "",
    }
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User>(defaultUser);
    const [connected, setConnected] = useState<boolean>(false);

    const setUserCart = (cart : Command[]) => {
        if (user) {
            setUser({
                email: user.email,
                password: user.password,
                first_name: user.first_name,
                last_name: user.last_name,
                cart: cart,
                commands: user.commands,
                subscription: user.subscription,
                creation_date: user.creation_date,
                bank_info: user.bank_info,
            })
        }
    }

    return (
        <UserContext.Provider value={{user, setUser, connected, setConnected, setUserCart}}>
            {children}
        </UserContext.Provider>
    );
};

export const useUserContext = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUserContext doit être utilisé dans un UserProvider");
    }
    return context;
};