import React, {ChangeEvent, useEffect, useState} from "react";
import {NavLink, useNavigate} from "react-router-dom";

export const Inscription = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formValid, setFormValid] = useState({
        fname: true,
        lname: true,
        email: true,
        confirmemail: true,
        password: true,
        confirmpassword: true
    });
    const [errorMessage, setErrorMessage] = useState("");

    const mailRegex = /^[\w.]+@\w+\.\w+/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{12,}$/;

    let fname: HTMLInputElement;
    let lname: HTMLInputElement;
    let email: HTMLInputElement;
    let confirmemail: HTMLInputElement;
    let password: HTMLInputElement;
    let confirmpassword: HTMLInputElement;

    useEffect(() => {
        fname = document.getElementById("fname") as HTMLInputElement;
        lname = document.getElementById("lname") as HTMLInputElement;
        email = document.getElementById("email") as HTMLInputElement;
        confirmemail = document.getElementById("confirmemail") as HTMLInputElement;
        password = document.getElementById("password") as HTMLInputElement;
        confirmpassword = document.getElementById("confirmpassword") as HTMLInputElement;
    })

    // Visual indicators of when the input is correct
    function checkCondition(e:ChangeEvent<HTMLInputElement>, condition: Function, field: string) {
        const isValid = condition(e.target.value);
        setFormValid({...formValid, [field]: isValid});
        
        if (isValid) {
            e.currentTarget.classList.remove('is-invalid')
            e.currentTarget.classList.add('is-valid');
        } else {
            e.currentTarget.classList.add('is-invalid');
            e.currentTarget.classList.remove('is-valid');
        }
    }

    function checkTextInput(e:ChangeEvent<HTMLInputElement>) {
        const value = e.target.value.trim();
        const isValid = value.length > 0;
        const field = e.target.id;
        
        setFormValid({...formValid, [field]: isValid});
        
        if (isValid) {
            e.currentTarget.classList.remove('is-invalid')
            e.currentTarget.classList.add('is-valid');
        } else {
            e.currentTarget.classList.add('is-invalid');
            e.currentTarget.classList.remove('is-valid');
        }
    }

    function emailCondition(value: string) {
        return mailRegex.test(value);
    }

    function confirmemailCondition(value: string) {
        return email.value === value && emailCondition(value);
    }

    function passwordCondition(value: string) {
        return passwordRegex.test(value);
    }

    function confirmpasswordCondition(value: string) {
        return password.value === value && password.value.length > 0;
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErrorMessage("");
        
        // Verifies all of the fields
        const isValid = Object.values(formValid).every(value => value);
        
        if (!isValid) {
            setErrorMessage("Veuillez corriger les erreurs dans le formulaire");
            return;
        }
        
        if (!emailCondition(email.value)) {
            setErrorMessage("Veuillez entrer une adresse email valide");
            return;
        }
        
        if (email.value !== confirmemail.value) {
            setErrorMessage("Les adresses email ne correspondent pas");
            return;
        }
        
        if (!passwordCondition(password.value)) {
            setErrorMessage("Le mot de passe doit contenir au moins 12 caractères, dont une majuscule, une minuscule et un chiffre");
            return;
        }
        
        if (password.value !== confirmpassword.value) {
            setErrorMessage("Les mots de passe ne correspondent pas");
            return;
        }

        const insertUser = async (fname: string, lname: string, mail: string, pwd: string) => {
            try {
                const response = await fetch(`http://localhost:5000/api/insertClient`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        first_name: fname,
                        last_name: lname,
                        email: mail,
                        password: pwd
                    })
                })

                if (response.status === 201) {
                    navigate("/connection")
                } else {
                    setErrorMessage("Une erreur est survenue lors de l'inscription");
                }
            } catch (error) {
                console.log(error);
                setErrorMessage("Une erreur est survenue lors de l'inscription");
            }
        }

        insertUser(fname.value, lname.value, email.value, password.value).then();
    }
    
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    
    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <div className="Connection-form">
            <div className="form-card">
                <div className="form-card-header">
                    <span className="icon">🚄</span>
                    <h2 className="title">Créer un compte</h2>
                    <p className="subtitle">Rejoignez SwiftRail pour profiter de tous nos services</p>
                </div>
                
                {errorMessage && (
                    <div className="validation-error" style={{marginBottom: "1rem", textAlign: "center"}}>
                        {errorMessage}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="Connection-form-label" htmlFor="fname">
                            Prénom <sup className="required">*</sup>
                        </label>
                        <input 
                            className="Connection-form-input" 
                            type="text" 
                            id="fname" 
                            placeholder="Votre prénom" 
                            onChange={checkTextInput}
                            required 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="Connection-form-label" htmlFor="lname">
                            Nom <sup className="required">*</sup>
                        </label>
                        <input 
                            className="Connection-form-input" 
                            type="text" 
                            id="lname" 
                            placeholder="Votre nom" 
                            onChange={checkTextInput}
                            required 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="Connection-form-label" htmlFor="email">
                            Adresse email <sup className="required">*</sup>
                        </label>
                        <input 
                            className="Connection-form-input" 
                            type="email" 
                            id="email" 
                            placeholder="exemple@mail.com"
                            onChange={(e) => checkCondition(e, emailCondition, "email")}
                            required 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="Connection-form-label" htmlFor="confirmemail">
                            Confirmer votre email <sup className="required">*</sup>
                        </label>
                        <input 
                            className="Connection-form-input" 
                            type="email" 
                            id="confirmemail" 
                            placeholder="exemple@mail.com"
                            onChange={(e) => checkCondition(e, confirmemailCondition, "confirmemail")}
                            required 
                        />
                        {!formValid.confirmemail && (
                            <div className="validation-error">Les adresses email doivent correspondre</div>
                        )}
                    </div>
                    
                    <div className="form-group">
                        <label className="Connection-form-label" htmlFor="password">
                            Mot de passe <sup className="required">*</sup>
                        </label>
                        <div style={{position: "relative"}}>
                            <input 
                                className="Connection-form-input" 
                                type={showPassword ? "text" : "password"}
                                id="password" 
                                placeholder="Votre mot de passe" 
                                minLength={12}
                                onChange={(e) => checkCondition(e, passwordCondition, "password")}
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
                    
                    <div className="form-group">
                        <label className="Connection-form-label" htmlFor="confirmpassword">
                            Confirmer votre mot de passe <sup className="required">*</sup>
                        </label>
                        <div style={{position: "relative"}}>
                            <input 
                                className="Connection-form-input" 
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmpassword" 
                                placeholder="Confirmez votre mot de passe" 
                                minLength={12}
                                onChange={(e) => checkCondition(e, confirmpasswordCondition, "confirmpassword")}
                                required 
                            />
                            <span 
                                onClick={toggleConfirmPasswordVisibility} 
                                className="password-toggle"
                            >
                                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                            </span>
                        </div>
                        {!formValid.confirmpassword && (
                            <div className="validation-error">Les mots de passe doivent correspondre</div>
                        )}
                    </div>
                    
                    <button className="Connection-form-submit" type="submit">
                        Créer mon compte
                    </button>
                </form>
                
                <div className="form-divider">ou</div>
                
                <div className="Inscription-text">
                    Vous avez déjà un compte ?
                    <br/>
                    <NavLink to="/Connection" className="Inscription-link">
                        Se connecter maintenant
                    </NavLink>
                </div>
            </div>
        </div>
    )
}