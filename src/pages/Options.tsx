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
    const { cart } = location.state || { cart: [] };
    const [selectedOptionsPerTravel, setSelectedOptionsPerTravel] = useState(() => {
        const initialOptions = {};
        cart.forEach((travel, index: number) => {
            initialOptions[index] = travel.options || [];
        });
        return initialOptions;
    });

    const handleOptionChange = (travelIndex, option: Option) => {
        setSelectedOptionsPerTravel((prev) => {
            const updatedOptions = { ...prev };
            if (updatedOptions[travelIndex].includes(option)) {
                updatedOptions[travelIndex] = updatedOptions[travelIndex].filter((opt: Option) => opt !== option);
            } else {
                updatedOptions[travelIndex] = [...updatedOptions[travelIndex], option];
            }
            return updatedOptions;
        });
    };

    const calculateTotalPrice = (cart, selectedOptionsPerTravel) => {
        return cart.reduce((total, travel, index) => {
            const optionsPrice = (selectedOptionsPerTravel[index] || []).reduce((sum, option) => {
                return sum + optionPrices[option];
            }, 0);
            return total + travel.price + optionsPrice;
        }, 0);
    };

    const handleValidate = () => {
        const updatedCart = cart.map((travel, index: number) => ({
            validated: false, // By default, the command is not valid
            validation_date: null, // No valid date at the start
            options: selectedOptionsPerTravel[index] || [], // Selected options
            travel_info: travel, // Information about the travel
            seat: "" // Empty seat, will be selected later
        }));

        console.log("Updated Cart (Command):", updatedCart); // Debugging
        // Redirect to the seat selection page
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
                    cart.map((travel, index) => (
                        <TravelOptions
                            key={index}
                            travel={travel}
                            selectedOptions={selectedOptionsPerTravel[index] || []}
                            onOptionChange={(option) => handleOptionChange(index, option)}
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