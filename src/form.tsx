import {useState} from 'react';

function Form() {
    const [isRoundTrip, setIsRoundTrip] = useState(false);

    const handleSimpleTrip = () => {
        setIsRoundTrip(false);
    };

    const handleRoundTrip = () => {
        setIsRoundTrip(true);
    };

    return (
        <form className={"form-container"} onSubmit={event => {
            event.preventDefault();
        }}>
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
                    <input id={"input-departure-date-value"} className={"input-content"} type={"date"} required />
                </div>
                <div id={"input-arrival-container"} className={"input-container"} style={{ display: isRoundTrip ? 'block' : 'none' }}>
                    <p className={"input-label"}>Date de retour :</p>
                    <input id={"input-arrival-date-value"} className={"input-content"} type={"date"} />
                </div>
            </div>
            <div className={"row-container"}>
                <div className={"input-container"}>
                    <p className={"input-label"}>Départ :</p>
                    <input id={"input-departure-value"} className={"input-content"} type={"text"} required />
                </div>
                <div className={"input-container"}>
                    <p className={"input-label"}>Arrivée :</p>
                    <input id={"input-arrival-value"} className={"input-content"} type={"text"} required />
                </div>
            </div>

            <button className={"submit-button"} type={"submit"}>Valider</button>
        </form>
    );
}

export default Form;