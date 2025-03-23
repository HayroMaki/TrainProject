import React, {ChangeEvent, useEffect} from "react";
import {NavLink, useNavigate} from "react-router-dom";

export const Inscription = () => {

    const navigate = useNavigate();

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

    Array.from(document.querySelectorAll('input')).forEach( (input) => {
        if (input.id === "password" || input.id === "email" || input.id === "confirmemail" || input.id === "confirmpassword") return;
        input.addEventListener('input', function () {
            if (this.value === "") {
                this.classList.remove('is-valid');
                return;
            }
            this.classList.add('is-valid');
        })
    });

    // Visual indicators of when the input is correct
    function checkCondition(e:ChangeEvent<HTMLInputElement>, condition: Function) {
        if (condition(e.target.value)) {
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
        return email.value === value;
    }

    function passwordCondition(value: string) {
        return passwordRegex.test(value);
    }

    function confirmpasswordCondition(value: string) {
        return password.value === value;
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (! emailCondition(email.value) ||
            ! confirmemailCondition(confirmemail.value) ||
            ! passwordCondition(password.value) ||
            ! confirmpasswordCondition(confirmpassword.value)) {
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

                }

            } catch (error) {
                console.log(error);
            }
        }

        insertUser(fname.value, lname.value, email.value, password.value).then();
    }

    return (
        <form className="Connection-form" onSubmit={handleSubmit}>
            <h2 className="Connection-form-title">Formulaire d'inscription</h2>
            <div className="Connection-form-container">
                <label className="Connection-form-label" htmlFor="fname">Prénom <sup className="required">*</sup></label>
                <input className="Connection-form-input" type="text" id="fname" placeholder="Jean-Pierre" required />
            </div>
            <div className="Connection-form-container">
                <label className="Connection-form-label" htmlFor="lname">Nom <sup className="required">*</sup></label>
                <input className="Connection-form-input" type="text" id="lname" placeholder="Caillou" required />
            </div>
            <div className="Connection-form-container">
                <label className="Connection-form-label" htmlFor="email">Adresse mail <sup className="required">*</sup></label>
                <input className="Connection-form-input" onChange={(e) => checkCondition(e, emailCondition)}
                       type="email" id="email" placeholder="exemple@mail.com" required />
            </div>
            <div className="Connection-form-container">
                <label className="Connection-form-label" htmlFor="confirmEmail">Confirmer votre adresse mail <sup className="required">*</sup></label>
                <input className="Connection-form-input" onChange={(e) => checkCondition(e, confirmemailCondition)}
                       type="email" id="confirmemail" placeholder="exemple@mail.com" required />
            </div>
            <div className="Connection-form-container">
                <label className="Connection-form-label" htmlFor="password">Mot de passe <sup className="required">*</sup></label>
                <input className="Connection-form-input" onChange={(e) => checkCondition(e, passwordCondition)}
                       type="password" id="password" minLength={12} required />
            </div>
            <div className="Connection-form-container">
                <label className="Connection-form-label" htmlFor="confirmpassword">Confirmer votre mot de passe <sup className="required">*</sup></label>
                <input className="Connection-form-input" onChange={(e) => checkCondition(e, confirmpasswordCondition)}
                       type="password" id="confirmpassword" minLength={12} required />
            </div>
            <button className="Connection-form-submit" type="submit">Submit</button>
            <span className="Inscription-text">
                Vous avez un compte ?<br/>
                Connectez-vous maintenant <NavLink to="/Connection" className="Inscription-link">ici</NavLink>
            </span>
        </form>
    )
}