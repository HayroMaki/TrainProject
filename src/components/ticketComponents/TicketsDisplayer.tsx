import Ticket from "./Ticket.tsx";
import Command from "../../interfaces/Command.tsx";

interface TicketsDisplayerProps {
    cart: Command[];
    removeOption: (commandIndex: number, option: string) => void;
    removeItem: (commandIndex: number) => void;
}

const TicketsDisplayer: React.FC<TicketsDisplayerProps> = ({ cart, removeOption, removeItem }) => {
    return (
        <div className="cart-items">
            {cart.map((command, index) => (
                <Ticket
                    key={index}
                    command={command}
                    index={index}
                    removeOption={removeOption}
                    removeItem={removeItem}
                />
            ))}
        </div>
    );
};

export default TicketsDisplayer;
