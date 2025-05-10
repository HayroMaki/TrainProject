import React, { useState } from "react";
import "../stylesheets/Contact.css";

/**
 * Component of the "Contact" page
 * 
 * This page allows users to contact the SwiftRail team with a form,
 * show their contact informations, and present a section with a FAQ.
 * 
 * @returns {JSX.Element} The component of the "Contact" page
 */
export const Contact = () => {
    // State to store the data of the form
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });
    
    // State to handle the submission of the form
    const [formStatus, setFormStatus] = useState({
        submitted: false,
        error: false,
        message: ""
    });
    
    /**
     * Handle the modifications of the form
     * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>} e - Change events
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };
    
    /**
     * Handle the submission of the form
     * @param {React.FormEvent} e - Submission event
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Basic verifications of the necessary data
        if (!formData.name || !formData.email || !formData.message) {
            setFormStatus({
                submitted: true,
                error: true,
                message: "Veuillez remplir tous les champs obligatoires."
            });
            return;
        }
        
        // Simulate an API call to send the message
        setTimeout(() => {
            setFormStatus({
                submitted: true,
                error: false,
                message: "Votre message a été envoyé avec succès. Notre équipe vous contactera rapidement."
            });
            // Reset the form after submission
            setFormData({
                name: "",
                email: "",
                subject: "",
                message: ""
            });
        }, 1000);
    };
    
    return (
        <div className="contact-page">
            <main className="contact-container">
                {/* Header with title and catchphrase */}
                <section className="contact-header">
                    <h1>Contactez-nous</h1>
                    <p className="contact-intro">
                        Vous avez une question, une suggestion ou besoin d'assistance ? 
                        Notre équipe est à votre écoute et vous répondra dans les plus brefs délais.
                    </p>
                </section>
                
                <div className="contact-content">
                    {/* Section with the contact form */}
                    <section className="contact-form-section">
                        <h2>Envoyez-nous un message</h2>
                        
                        {/* Show the status message after submission */}
                        {formStatus.submitted && (
                            <div className={`form-status ${formStatus.error ? 'error' : 'success'}`}>
                                {formStatus.message}
                            </div>
                        )}
                        
                        {/* Contact form */}
                        <form className="contact-form" onSubmit={handleSubmit}>
                            {/* Name field */}
                            <div className="form-group">
                                <label htmlFor="name">Nom complet <span className="required">*</span></label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Votre nom et prénom"
                                    required
                                />
                            </div>
                            
                            {/* Email field */}
                            <div className="form-group">
                                <label htmlFor="email">Email <span className="required">*</span></label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="votre.email@exemple.com"
                                    required
                                />
                            </div>
                            
                            {/* Dropdown for the subject */}
                            <div className="form-group">
                                <label htmlFor="subject">Sujet</label>
                                <select
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                >
                                    <option value="">Sélectionnez un sujet</option>
                                    <option value="question">Question générale</option>
                                    <option value="reservation">Problème de réservation</option>
                                    <option value="suggestion">Suggestion</option>
                                    <option value="partnership">Partenariat</option>
                                    <option value="other">Autre</option>
                                </select>
                            </div>
                            
                            {/* Text area for the message */}
                            <div className="form-group">
                                <label htmlFor="message">Message <span className="required">*</span></label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Votre message ici..."
                                    rows={6}
                                    required
                                ></textarea>
                            </div>
                            
                            {/* Submit button */}
                            <button type="submit" className="submit-button">
                                Envoyer le message
                            </button>
                        </form>
                    </section>
                    
                    {/* Section avec les informations de contact */}
                    <section className="contact-info-section">
                        <h2>Informations de contact</h2>
                        
                        <div className="contact-info">
                            {/* Adresse postale */}
                            <div className="contact-method">
                                <div className="contact-icon">📍</div>
                                <div className="contact-details">
                                    <h3>Adresse</h3>
                                    <p>123 Avenue des Trains<br />75001 Paris, France</p>
                                </div>
                            </div>
                            
                            {/* Numéro de téléphone */}
                            <div className="contact-method">
                                <div className="contact-icon">📞</div>
                                <div className="contact-details">
                                    <h3>Téléphone</h3>
                                    <p>+33 (0)1 23 45 67 89</p>
                                    <p className="hours">Lun-Ven: 9h-18h</p>
                                </div>
                            </div>
                            
                            {/* Adresses email */}
                            <div className="contact-method">
                                <div className="contact-icon">✉️</div>
                                <div className="contact-details">
                                    <h3>Email</h3>
                                    <p>contact@swiftrail.com</p>
                                    <p>support@swiftrail.com</p>
                                </div>
                            </div>
                            
                            {/* Liens vers les réseaux sociaux */}
                            <div className="contact-method">
                                <div className="contact-icon">🌐</div>
                                <div className="contact-details">
                                    <h3>Réseaux sociaux</h3>
                                    <div className="social-links">
                                        <a href="#" className="social-link">Facebook</a>
                                        <a href="#" className="social-link">Twitter</a>
                                        <a href="#" className="social-link">Instagram</a>
                                        <a href="#" className="social-link">LinkedIn</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
                
                {/* Section FAQ (Questions fréquemment posées) */}
                <section className="faq-section">
                    <h2>Questions fréquentes</h2>
                    
                    <div className="faq-items">
                        {/* Question sur la modification de réservation */}
                        <div className="faq-item">
                            <h3>Comment modifier ma réservation ?</h3>
                            <p>
                                Vous pouvez modifier votre réservation jusqu'à 24h avant le départ en vous 
                                connectant à votre compte et en accédant à la section "Mes commandes".
                            </p>
                        </div>
                        
                        {/* Question sur la politique d'annulation */}
                        <div className="faq-item">
                            <h3>Quelle est la politique d'annulation ?</h3>
                            <p>
                                Les billets sont remboursables à 100% jusqu'à 7 jours avant le départ, et à 
                                50% jusqu'à 24h avant. Aucun remboursement n'est possible moins de 24h avant.
                            </p>
                        </div>
                        
                        {/* Question sur les factures */}
                        <div className="faq-item">
                            <h3>Comment obtenir une facture ?</h3>
                            <p>
                                Vous pouvez télécharger votre facture directement depuis votre espace personnel 
                                dans la section "Mes commandes" en cliquant sur la commande concernée.
                            </p>
                        </div>
                        
                        {/* Question sur les retards de train */}
                        <div className="faq-item">
                            <h3>Comment faire si mon train est en retard ?</h3>
                            <p>
                                En cas de retard supérieur à 30 minutes, vous êtes éligible à une compensation. 
                                Contactez notre service client avec votre numéro de réservation.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
            
            {/* Pied de page avec copyright */}
            <footer className="contact-footer">
                <p>© 2024 SwiftRail - Tous droits réservés</p>
            </footer>
        </div>
    );
};

export default Contact; 