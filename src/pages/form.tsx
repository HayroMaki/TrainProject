import { useState } from 'react';

function Form() {
    const [isRoundTrip, setIsRoundTrip] = useState(false);
    const [departureDate, setDepartureDate] = useState('');
    const [arrivalDate, setArrivalDate] = useState('');
    const [departure, setDeparture] = useState('');
    const [arrival, setArrival] = useState('');

    const handleSimpleTrip = () => {
        setIsRoundTrip(false);
    };

    const handleRoundTrip = () => {
        setIsRoundTrip(true);
    };

    const handleSubmit = (event: { preventDefault: () => void; }) => {
        event.preventDefault();

        const formData = {
            isRoundTrip,
            departureDate,
            arrivalDate: isRoundTrip ? arrivalDate : null,
            departure,
            arrival,
        };

        console.log(formData);

        // const response = await fetch("http://localhost:5000/api/insertClient", {
        //     method: "POST",
        //     headers: { "Content-Type": "application/json" },
        //     body: JSON.stringify({ name: name, age: age }),
        // });
    };

    return (
        <form className={"form-container"} onSubmit={handleSubmit}>
            <div className={"row-container"}>
                <button
                    id={"simple-button"}
                    className={`travel-type-button ${!isRoundTrip ? 'selected' : ''}`}
                    onClick={handleSimpleTrip}
                    type="button"
                >
                    Aller simple
                </button>
                <button
                    id={"round-trip-button"}
                    className={`travel-type-button ${isRoundTrip ? 'selected' : ''}`}
                    onClick={handleRoundTrip}
                    type="button"
                >
                    Aller retour
                </button>
            </div>
            <div className={"row-container"}>
                <div className={"input-container"}>
                    <p className={"input-label"}>Date de départ :</p>
                    <input
                        id={"input-departure-date-value"}
                        className={"input-content"}
                        type={"date"}
                        required
                        value={departureDate}
                        onChange={(e) => setDepartureDate(e.target.value)}
                    />
                </div>
                <div id={"input-arrival-container"} className={"input-container"} style={{ display: isRoundTrip ? 'block' : 'none' }}>
                    <p className={"input-label"}>Date de retour :</p>
                    <input
                        id={"input-arrival-date-value"}
                        className={"input-content"}
                        type={"date"}
                        value={arrivalDate}
                        onChange={(e) => setArrivalDate(e.target.value)}
                    />
                </div>
            </div>
            <div className={"row-container"}>
                <div className={"input-container"}>
                    <p className={"input-label"}>Départ :</p>
                    <input
                        id={"input-departure-value"}
                        className={"input-content"}
                        type={"text"}
                        required
                        value={departure}
                        onChange={(e) => setDeparture(e.target.value)}
                    />
                </div>
                <div className={"input-container"}>
                    <p className={"input-label"}>Arrivée :</p>
                    <input
                        id={"input-arrival-value"}
                        className={"input-content"}
                        type={"text"}
                        required
                        value={arrival}
                        onChange={(e) => setArrival(e.target.value)}
                    />
                </div>
            </div>

            <button className={"submit-button"} type={"submit"}>Valider</button>
        </form>
    );
}

export default Form;