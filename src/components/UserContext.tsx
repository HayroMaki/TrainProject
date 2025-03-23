import React, {createContext, useState, useContext, ReactNode} from "react";
import User from "../interfaces/User.tsx";
import Command from "../interfaces/Command.tsx";
import {Option} from "../interfaces/Option.tsx";
import {Header} from "./Header.tsx";

// Définition du type pour le contexte User :
interface UserContextType {
    user: User;
    connected: boolean;
    setConnected: (status: boolean) => void;
    setUser: React.Dispatch<React.SetStateAction<User>>;
    setUserCart: (cart: Command[]) => void;
}

const defaultUser:User = {
    email: "",
    first_name: "",
    last_name: "",
    cart: [],
    commands: [],
    subscription: "",
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
    const [connected, setConnected] = useState<boolean>(true);

    const setUserCart = (cart: Command[]) => {
        setUser(prevUser => ({
            ...prevUser,
            cart: cart,
        }));
    };

    return (
        <UserContext.Provider value={{user, setUser, connected, setConnected, setUserCart}}>
            <Header/>
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