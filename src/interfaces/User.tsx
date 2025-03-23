import Command from "./Command.tsx";

export default interface User {
    email: string;
    first_name: string;
    last_name: string;
    cart: Command[];
    commands: Command[];
    subscription: string;
    creation_date: string;
    bank_info: {
        first_name: string;
        last_name: string;
        card_number: string;
        expiration_date: string;
    }
}