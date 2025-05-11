import React, {useEffect, useState} from "react";
import {NavLink, useNavigate} from "react-router-dom";
import {useUserContext} from "../components/UserContext.tsx";
import User from "../interfaces/User.tsx";

export const Connection = () => {
    const { setUser, setConnected } = useUserContext();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const mailRegex = /^[\w.]+@\w+\.\w+/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{12,}$/;

    const apiBase = location.hostname === "localhost"
        ? "http://localhost:5000"
        : "https://" + location.hostname;

    let email: HTMLInputElement;
    let password: HTMLInputElement;

    // Retrieve the containers for the inputs
    useEffect(() => {
        email = document.getElementById("email") as HTMLInputElement;
        password = document.getElementById("password") as HTMLInputElement;
    })

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        // Reset the error message
        setErrorMessage("");
        
        if (!mailRegex.test(email.value)) {
            setErrorMessage("Veuillez entrer une adresse email valide");
            return;
        }
        
        if (!passwordRegex.test(password.value)) {
            setErrorMessage("Le mot de passe doit contenir au moins 12 caractères, dont une majuscule, une minuscule et un chiffre");
            return;
        }

        // Check if the user exists
        const checkUser = async (mail: string, pwd: string) => {
            try {
                const response = await fetch(`${apiBase}/api/checkUser`, {
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
                    setErrorMessage("Email ou mot de passe incorrect");
                }
            } catch (error) {
                console.log(error);
                setErrorMessage("Une erreur est survenue lors de la connexion");
            }
        }

        checkUser(email.value, password.value).then();
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="Connection-form">
            <div className="form-card">
                <div className="form-card-header">
                    <span className="icon">🚄</span>
                    <h2 className="title">Connexion à votre compte</h2>
                    <p className="subtitle">Entrez vos identifiants pour accéder à votre compte</p>
                </div>
                
                {errorMessage && (
                    <div className="validation-error" style={{marginBottom: "1rem", textAlign: "center"}}>
                        {errorMessage}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="Connection-form-label" htmlFor="email">
                            Adresse email
                        </label>
                        <input 
                            className="Connection-form-input" 
                            type="email" 
                            id="email" 
                            placeholder="exemple@mail.com" 
                            required
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="Connection-form-label" htmlFor="password">
                            Mot de passe
                        </label>
                        <div style={{position: "relative"}}>
                            <input 
                                className="Connection-form-input" 
                                type={showPassword ? "text" : "password"}
                                id="password" 
                                placeholder="Votre mot de passe" 
                                minLength={12} 
                                required
                            />
                            <span 
                                onClick={togglePasswordVisibility} 
                                className="password-toggle"
                            >
                                {showPassword ? "👁️" : "👁️‍🗨️"}
                            </span>
                        </div>
                        <div className="input-hint">
                            Minimum 12 caractères, avec majuscule, minuscule et chiffre
                        </div>
                    </div>
                    
                    <button className="Connection-form-submit" type="submit">
                        Se connecter
                    </button>
                </form>
                
                <div className="form-divider">ou</div>
                
                <div className="Inscription-text">
                    Pas encore de compte ?
                    <br/>
                    <NavLink to="/Inscription" className="Inscription-link">
                        Créer un compte maintenant
                    </NavLink>
                </div>
            </div>
        </div>
    )
}