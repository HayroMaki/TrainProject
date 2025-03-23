import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Form component for handling travel information input.
 */
export const Form = () => {
    const navigate = useNavigate();

    // State variables
    const [isRoundTrip, setIsRoundTrip] = useState(false); // Tracks if the trip is round trip
    const [departureDate, setDepartureDate] = useState(''); // Stores the departure date
    const [arrivalDate, setArrivalDate] = useState(''); // Stores the arrival date (for round trips)
    const [departure, setDeparture] = useState(''); // Stores the departure city
    const [arrival, setArrival] = useState(''); // Stores the arrival city
    const [error, setError] = useState(''); // Stores error messages

    // List of valid cities
    const cities = [
        "Paris", "Lyon", "Marseille", "Toulouse", "Nice", "Nantes",
        "Strasbourg", "Montpellier", "Bordeaux", "Lille", "Rennes"
    ];

    /**
     * Handles the selection of a one-way trip.
     */
    const handleSimpleTrip = () => {
        setIsRoundTrip(false);
    };

    /**
     * Handles the selection of a round trip.
     */
    const handleRoundTrip = () => {
        setIsRoundTrip(true);
    };

    /**
     * Handles form submission.
     * Validates the input data and logs the form data if valid.
     * @param {Event} event - The form submission event.
     */
    const handleSubmit = async (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        const currentDate = new Date();
        const selectedDepartureDate = new Date(departureDate);

        // Validate that the departure date is not in the past
        if (selectedDepartureDate < currentDate) {
            setError('The departure date must be after the current date.');
            return;
        }

        // For round trips, validate that the arrival date is after the departure date
        if (isRoundTrip) {
            const selectedArrivalDate = new Date(arrivalDate);
            if (selectedArrivalDate < selectedDepartureDate) {
                setError("The departure date must be before the arrival date.");
                return;
            }
        }

        // Validate that the selected cities are in the list of valid cities
        if (!cities.includes(departure) || !cities.includes(arrival)) {
            setError('Please select valid cities.');
            return;
        }

        // Clear any previous errors
        setError('');

        // Prepare the form data for submission
        const formData = {
            isRoundTrip,
            departureDate,
            arrivalDate: isRoundTrip ? arrivalDate : null,
            departure,
            arrival,
        };

        // Sending the information to database
        await fetch("http://localhost:5000/api/insertTravels", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: formData }),
        });

        // Navigate to the travels page
        navigate('/travels', { state: { formData } });
    };

    return (
        <form className={"form-container"} onSubmit={handleSubmit}>
            {/* Buttons to select trip type (one-way or round trip) */}
            <div className={"row-container"}>
                <button
                    id={"simple-button"}
                    className={`travel-type-button ${!isRoundTrip ? 'selected' : ''}`}
                    onClick={handleSimpleTrip}
                    type="button"
                >
                    One-way
                </button>
                <button
                    id={"round-trip-button"}
                    className={`travel-type-button ${isRoundTrip ? 'selected' : ''}`}
                    onClick={handleRoundTrip}
                    type="button"
                >
                    Round trip
                </button>
            </div>

            {/* Input fields for departure and arrival dates */}
            <div className={"row-container"}>
                <div className={"input-container"}>
                    <p className={"input-label"}>Departure date:</p>
                    <input
                        id={"input-departure-date-value"}
                        className={"input-content"}
                        type={"date"}
                        required
                        value={departureDate}
                        onChange={(e) => setDepartureDate(e.target.value)}
                    />
                </div>
                {/* Arrival date input is only shown for round trips */}
                <div id={"input-arrival-container"} className={"input-container"} style={{ display: isRoundTrip ? 'block' : 'none' }}>
                    <p className={"input-label"}>Return date:</p>
                    <input
                        id={"input-arrival-date-value"}
                        className={"input-content"}
                        type={"date"}
                        value={arrivalDate}
                        onChange={(e) => setArrivalDate(e.target.value)}
                    />
                </div>
            </div>

            {/* Input fields for departure and arrival cities */}
            <div className={"row-container"}>
                <div className={"input-container"}>
                    <p className={"input-label"}>Departure:</p>
                    <input
                        id={"input-departure-value"}
                        className={"input-content"}
                        type={"text"}
                        required
                        value={departure}
                        onChange={(e) => setDeparture(e.target.value)}
                        list="cities-list"
                    />
                    <datalist id="cities-list">
                        {cities.map((city, index) => (
                            <option key={index} value={city} />
                        ))}
                    </datalist>
                </div>
                <div className={"input-container"}>
                    <p className={"input-label"}>Arrival:</p>
                    <input
                        id={"input-arrival-value"}
                        className={"input-content"}
                        type={"text"}
                        required
                        value={arrival}
                        onChange={(e) => setArrival(e.target.value)}
                        list="cities-list"
                    />
                    <datalist id="cities-list">
                        {cities.map((city, index) => (
                            <option key={index} value={city} />
                        ))}
                    </datalist>
                </div>
            </div>

            {/* Display error messages if any */}
            {error && <p className={"error-message"}>{error}</p>}

            {/* Submit button */}
            <button className={"submit-button"} type={"submit"}>Submit</button>
        </form>
    );
}
