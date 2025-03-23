import React from "react";
import {Link} from "react-router-dom";
import {Header} from "../components/Header.tsx";

export const Inscription = () => {

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
    }

    return (
        <>
            <Header user={null} />
            <form className="Connection-form" onSubmit={handleSubmit}>
                <h2 className="Connection-form-title">Formulaire d'inscription</h2>
                <div className="Connection-form-container">
                    <label className="Connection-form-label" htmlFor="email">Adresse mail</label>
                    <input className="Connection-form-input" type="email" id="email" placeholder="exemple@mail.com" />
                </div>
                <div className="Connection-form-container">
                    <label className="Connection-form-label" htmlFor="confirmEmail">Confirmer votre adresse mail</label>
                    <input className="Connection-form-input" type="email" id="confirmEmail" placeholder="exemple@mail.com" />
                </div>
                <div className="Connection-form-container">
                    <label className="Connection-form-label" htmlFor="password">Mot de passe</label>
                    <input className="Connection-form-input" type="password" id="password" />
                </div>
                <button className="Connection-form-submit" type="submit">Submit</button>
                <span className="Inscription-text">
                Vous avez un compte ?<br/>
                Connectez-vous maintenant <Link to="/Connection" className="Inscription-link">ici</Link>
            </span>
            </form>
        </>
    )
}