import React, {useState} from "react";

export const Connection = () => {

    const [isInscription, setIsInscription] = useState(false);

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
    }

    return (
        <form className="Connection-form" onSubmit={handleSubmit}>
            <h2 className="Connection-form-title">Formulaire { isInscription ? "d'inscription" : "de connexion" }</h2>
            <div className="Connection-form-container">
                <label className="Connection-form-label" htmlFor="email">Adresse mail</label>
                <input className="Connection-form-input" type="email" id="email" placeholder="exemple@mail.com" />
            </div>
            { isInscription &&
                <div className="Connection-form-container">
                    <label className="Connection-form-label" htmlFor="confirmEmail">Confirmer votre adresse mail</label>
                    <input className="Connection-form-input" type="email" id="confirmEmail" placeholder="exemple@mail.com" />
                </div>
            }
            <div className="Connection-form-container">
                <label className="Connection-form-label" htmlFor="password">Mot de passe</label>
                <input className="Connection-form-input" type="password" id="password" />
            </div>
            <button className="Connection-form-submit" type="submit">Submit</button>
            { isInscription ?
                <span className="Inscription-text">
                    Vous avez un compte ?<br/>
                    Connectez-vous maintenant <span className="Inscription-link" onClick={() => setIsInscription(false)}>ici</span>
                </span> :
                <span className="Inscription-text">
                    Pas de compte ?<br/>
                    Inscrivez-vous maintenant <span className="Inscription-link" onClick={() => setIsInscription(true)}>ici</span>
                </span>
            }
        </form>
    )
}