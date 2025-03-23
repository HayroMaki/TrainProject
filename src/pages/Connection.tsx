import React from "react";
import {Link} from "react-router-dom";
import {Header} from "../components/Header.tsx";

export const Connection = () => {

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
    }

    return (
        <>
            <form className="Connection-form" onSubmit={handleSubmit}>
                <h2 className="Connection-form-title">Formulaire de connexion</h2>
                <div className="Connection-form-container">
                    <label className="Connection-form-label" htmlFor="email">Adresse mail</label>
                    <input className="Connection-form-input" type="email" id="email" placeholder="exemple@mail.com" />
                </div>
                <div className="Connection-form-container">
                    <label className="Connection-form-label" htmlFor="password">Mot de passe</label>
                    <input className="Connection-form-input" type="password" id="password" />
                </div>
                <button className="Connection-form-submit" type="submit">Submit</button>
                <span className="Inscription-text">
                    Pas de compte ?<br/>
                    Inscrivez-vous maintenant <Link to="/Inscription" className="Inscription-link">ici</Link>
                </span>
            </form>
        </>
    )
}