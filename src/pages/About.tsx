import React from "react";
import "../stylesheets/About.css";

/**
 * Composant de la page "À propos"
 * 
 * Cette page présente l'entreprise SwiftRail, sa mission, son équipe,
 * ses valeurs et sa vision pour l'avenir.
 * 
 * @returns {JSX.Element} Le composant de la page À propos
 */
export const About = () => {
    return (
        <div className="about-page">
            <main className="about-container">
                {/* Section d'en-tête avec titre et slogan */}
                <section className="hero-section">
                    <h1>À propos de SwiftRail</h1>
                    <p className="tagline">Voyagez rapidement, confortablement et durablement</p>
                </section>
                
                {/* Section présentant la mission de l'entreprise */}
                <section className="about-section">
                    <h2>Notre Mission</h2>
                    <p>
                        Chez SwiftRail, nous croyons que les voyages en train devraient être simples, 
                        accessibles et respectueux de l'environnement. Notre mission est de transformer 
                        l'expérience de réservation de billets de train en la rendant aussi fluide et 
                        agréable que le voyage lui-même.
                    </p>
                    <p>
                        Fondée récemment, notre entreprise s'engage à révolutionner le transport 
                        ferroviaire en France et au-delà, en proposant une plateforme moderne, 
                        intuitive et centrée sur les besoins des voyageurs.
                    </p>
                </section>
                
                {/* Section présentant l'équipe de direction */}
                <section className="team-section">
                    <h2>Notre Équipe</h2>
                    <p className="team-intro">
                        SwiftRail est porté par une équipe dynamique et passionnée de professionnels dédiés 
                        à l'amélioration constante de nos services.
                    </p>
                    
                    <div className="team-members">
                        {/* Carte du Directeur Général */}
                        <div className="team-member">
                            <div className="member-avatar">👨‍💼</div>
                            <h3>Jules Renaud-Grange</h3>
                            <p className="member-role">Directeur Général</p>
                            <p className="member-description">
                                Visionnaire et stratège, Jules guide l'entreprise vers un avenir 
                                prometteur avec sa passion pour l'innovation et le transport durable.
                            </p>
                        </div>
                        
                        {/* Carte du Responsable des Opérations */}
                        <div className="team-member">
                            <div className="member-avatar">👨‍💻</div>
                            <h3>Martial Carcelès</h3>
                            <p className="member-role">Superviseur & Responsable des Opérations</p>
                            <p className="member-description">
                                Expert en logistique et en gestion opérationnelle, Martial veille 
                                au bon fonctionnement quotidien de tous nos services.
                            </p>
                        </div>
                        
                        {/* Carte du Responsable RH & Trésorerie */}
                        <div className="team-member">
                            <div className="member-avatar">👨‍💼</div>
                            <h3>Loic Rakotoniary</h3>
                            <p className="member-role">Responsable RH & Trésorerie</p>
                            <p className="member-description">
                                Gardien de notre culture d'entreprise et de nos finances, Loic assure 
                                la croissance saine et durable de SwiftRail.
                            </p>
                        </div>
                        
                        {/* Carte du Responsable Technique */}
                        <div className="team-member">
                            <div className="member-avatar">👨‍💻</div>
                            <h3>Jeremy Zheng</h3>
                            <p className="member-role">Responsable Technique</p>
                            <p className="member-description">
                                Architecte de notre plateforme technologique, Jeremy dirige l'innovation 
                                technique et l'amélioration continue de notre site.
                            </p>
                        </div>
                    </div>
                </section>
                
                {/* Section présentant les valeurs de l'entreprise */}
                <section className="values-section">
                    <h2>Nos Valeurs</h2>
                    <div className="values-grid">
                        {/* Carte de la valeur Simplicité */}
                        <div className="value-item">
                            <h3>Simplicité</h3>
                            <p>Nous simplifions chaque étape du processus de réservation.</p>
                        </div>
                        
                        {/* Carte de la valeur Accessibilité */}
                        <div className="value-item">
                            <h3>Accessibilité</h3>
                            <p>Nous rendons les voyages en train accessibles à tous.</p>
                        </div>
                        
                        {/* Carte de la valeur Durabilité */}
                        <div className="value-item">
                            <h3>Durabilité</h3>
                            <p>Nous encourageons un mode de transport respectueux de l'environnement.</p>
                        </div>
                        
                        {/* Carte de la valeur Innovation */}
                        <div className="value-item">
                            <h3>Innovation</h3>
                            <p>Nous repoussons constamment les limites pour améliorer l'expérience utilisateur.</p>
                        </div>
                    </div>
                </section>
                
                {/* Section présentant la vision d'avenir */}
                <section className="future-section">
                    <h2>Notre Vision</h2>
                    <p>
                        SwiftRail aspire à devenir le leader incontesté de la réservation de billets de train 
                        en ligne, en offrant la meilleure expérience utilisateur possible et en favorisant 
                        une mobilité plus durable et accessible.
                    </p>
                    <p>
                        Nous travaillons sans relâche pour étendre notre réseau, améliorer nos services et 
                        rendre chaque voyage aussi agréable que la destination elle-même.
                    </p>
                </section>
            </main>
            
            {/* Pied de page avec copyright */}
            <footer className="about-footer">
                <p>© 2024 SwiftRail - Tous droits réservés</p>
            </footer>
        </div>
    );
};

export default About; 