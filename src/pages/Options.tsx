import { useState, Component } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './../stylesheets/Options.css';
import Travel from "../interfaces/Travel.tsx";
import { Option } from "../interfaces/Option.tsx";

// Price for each options
const optionPrices = {
    [Option.PLA_TRA]: 3,
    [Option.PRI_ELE]: 2,
    [Option.BAG_SUP]: 5,
    [Option.INF_SMS]: 1,
    [Option.GAR_ANN]: 2.9
};

// Component to display options for a single travel
class TravelOptions extends Component<{ travel: Travel, selectedOptions: Option[], onOptionChange: (option: Option) => void }> {
    render() {
        const { travel, selectedOptions, onOptionChange } = this.props;
        return (
            <div className="travel-options-card">
                <h3>Options pour {travel.departure} → {travel.arrival}</h3>
                <p>Train {travel.train_ref} • Départ le {travel.date} à {travel.time}</p>
                <div className="options-column">
                    {Object.values(Option).map((option) => (
                        <div key={option} className="option-item">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={selectedOptions.includes(option)}
                                    onChange={() => onOptionChange(option)}
                                />
                                <span className="option-label">
                                    {option} <span className="option-price">+{optionPrices[option]} €</span>
                                </span>
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}

// Main Options component
export const Options = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { cart } = location.state as { cart: Travel[] } || { cart: [] as Travel[] };
    
    const [selectedOptionsPerTravel, setSelectedOptionsPerTravel] = useState<Record<number, Option[]>>(() => {
        const initialOptions: Record<number, Option[]> = {};
        cart.forEach((_: Travel, index: number) => {
            initialOptions[index] = [];
        });
        return initialOptions;
    }); 

    const handleOptionChange = (travelIndex: number, option: Option): void => {
        setSelectedOptionsPerTravel((prev: Record<number, Option[]>) => {
            const updatedOptions: Record<number, Option[]> = { ...prev };
            if (updatedOptions[travelIndex]?.includes(option)) {
                updatedOptions[travelIndex] = updatedOptions[travelIndex].filter((opt: Option) => opt !== option);
            } else {
                updatedOptions[travelIndex] = [...(updatedOptions[travelIndex] || []), option];
            }
            return updatedOptions;
        });
    };

    const calculateTotalPrice = (cart: Travel[], selectedOptionsPerTravel: Record<number, Option[]>): number => {
        return cart.reduce((total: number, travel: Travel, index: number) => {
            const optionsPrice = (selectedOptionsPerTravel[index] || []).reduce((sum: number, option: Option) => {
                return sum + optionPrices[option];
            }, 0);
            return total + travel.price + optionsPrice;
        }, 0);
    };

    const handleValidate = (): void => {
        const updatedCart = cart.map((travel: Travel, index: number) => ({
            validated: false,
            validation_date: null,
            options: selectedOptionsPerTravel[index] || [],
            travel_info: travel,
            seat: ""
        }));

        console.log("Updated Cart (Command):", updatedCart);
        navigate('/seat-selection', { state: { cart: updatedCart } });
    };

    return (
        <div className="options-page">
            <header className="options-header">
                <h1>Personnalisez votre voyage</h1>
                <p>Ajoutez des options pour rendre votre trajet plus confortable.</p>
            </header>

            <div className="options-list">
                {cart.length > 0 ? (
                    cart.map((travel: Travel, index: number) => (
                        <TravelOptions
                            key={index}
                            travel={travel}
                            selectedOptions={selectedOptionsPerTravel[index] || []}
                            onOptionChange={(option: Option) => handleOptionChange(index, option)}
                        />
                    ))
                ) : (
                    <p className="empty-cart-message">Aucun trajet dans le panier.</p>
                )}
            </div>

            {cart.length > 0 && (
                <div className="options-footer">
                    <button className="validate-button" onClick={handleValidate}>
                        Continuer
                        <div className="total-price">
                            Total: {calculateTotalPrice(cart, selectedOptionsPerTravel).toFixed(2)} €
                        </div>
                    </button>
                </div>
            )}
        </div>
    );
};
