import React, {useEffect} from "react";
import {NavLink, useNavigate} from "react-router-dom";
import {useUserContext} from "../components/UserContext.tsx";
import User from "../interfaces/User.tsx";

export const Connection = () => {

    const { setUser, setConnected } = useUserContext();
    const navigate = useNavigate();

    const mailRegex = /^[\w.]+@\w+\.\w+/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{12,}$/;

    let email: HTMLInputElement;
    let password: HTMLInputElement;

    useEffect(() => {
        email = document.getElementById("email") as HTMLInputElement;
        password = document.getElementById("password") as HTMLInputElement;
    })

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (! mailRegex.test(email.value) ||
        ! passwordRegex.test(password.value)) {
            return;
        }

        const checkUser = async (mail: string, pwd: string) => {
            try {
                const response = await fetch(`http://localhost:5000/api/checkUser`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: mail,
                        pwd: pwd
                    })
                })

                if (response.status === 200) {
                    // Authentificated successfully
                    setConnected(true);
                    const user: User = await response.json();
                    setUser(user);
                    navigate("/");

                } else {
                    // Failed authentification

                }

            } catch (error) {
                console.log(error);
            }
        }

        checkUser(email.value, password.value).then();
    }

    return (
        <form className="Connection-form" onSubmit={handleSubmit}>
            <h2 className="Connection-form-title">Formulaire de connexion</h2>
            <div className="Connection-form-container">
                <label className="Connection-form-label" htmlFor="email">Adresse mail</label>
                <input className="Connection-form-input" type="email" id="email" placeholder="exemple@mail.com" required />
            </div>
            <div className="Connection-form-container">
                <label className="Connection-form-label" htmlFor="password">Mot de passe</label>
                <input className="Connection-form-input" minLength={12} type="password" id="password" required />
            </div>
            <button className="Connection-form-submit" type="submit">Submit</button>
            <span className="Inscription-text">
                Pas de compte ?<br/>
                Inscrivez-vous maintenant <NavLink to="/Inscription" className="Inscription-link">ici</NavLink>
            </span>
        </form>
    )
}