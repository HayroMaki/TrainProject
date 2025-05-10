import "../stylesheets/About.css";

/**
 * Component of the "About" page
 *
 * This page presents the company SwiftRail, its mission, team,
 * values and vision for its future
 * 
 * @returns {JSX.Element} The component of the page "About"
 */
export const About = () => {
    return (
        <div className="about-page">
            <main className="about-container">
                {/* Header with title and catchphrase */}
                <section className="hero-section">
                    <h1>À propos de SwiftRail</h1>
                    <p className="tagline">Voyagez rapidement, confortablement et durablement</p>
                </section>
                
                {/* Section to present the mission of the company */}
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
                
                {/* Section presenting the team */}
                <section className="team-section">
                    <h2>Notre Équipe</h2>
                    <p className="team-intro">
                        SwiftRail est porté par une équipe dynamique et passionnée de professionnels dédiés 
                        à l'amélioration constante de nos services.
                    </p>
                    
                    <div className="team-members">
                        {/* Card for the General Director */}
                        <div className="team-member">
                            <div className="member-avatar">👨‍💼</div>
                            <h3>Jules Renaud-Grange</h3>
                            <p className="member-role">Directeur Général</p>
                            <p className="member-description">
                                Visionnaire et stratège, Jules guide l'entreprise vers un avenir 
                                prometteur avec sa passion pour l'innovation et le transport durable.
                            </p>
                        </div>
                        
                        {/* Card for the Operations Manager */}
                        <div className="team-member">
                            <div className="member-avatar">👨‍💻</div>
                            <h3>Martial Carcelès</h3>
                            <p className="member-role">Superviseur & Responsable des Opérations</p>
                            <p className="member-description">
                                Expert en logistique et en gestion opérationnelle, Martial veille 
                                au bon fonctionnement quotidien de tous nos services.
                            </p>
                        </div>
                        
                        {/* Card for the Human Resources */}
                        <div className="team-member">
                            <div className="member-avatar">👨‍💼</div>
                            <h3>Loic Rakotoniary</h3>
                            <p className="member-role">Responsable RH & Trésorerie</p>
                            <p className="member-description">
                                Gardien de notre culture d'entreprise et de nos finances, Loic assure 
                                la croissance saine et durable de SwiftRail.
                            </p>
                        </div>
                        
                        {/* Card for the Technical Manager */}
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
                
                {/* Section presenting the values of the company */}
                <section className="values-section">
                    <h2>Nos Valeurs</h2>
                    <div className="values-grid">
                        {/* Card for simplicity */}
                        <div className="value-item">
                            <h3>Simplicité</h3>
                            <p>Nous simplifions chaque étape du processus de réservation.</p>
                        </div>
                        
                        {/* Card for accessibility */}
                        <div className="value-item">
                            <h3>Accessibilité</h3>
                            <p>Nous rendons les voyages en train accessibles à tous.</p>
                        </div>
                        
                        {/* Card for durability */}
                        <div className="value-item">
                            <h3>Durabilité</h3>
                            <p>Nous encourageons un mode de transport respectueux de l'environnement.</p>
                        </div>
                        
                        {/* Card for innovation */}
                        <div className="value-item">
                            <h3>Innovation</h3>
                            <p>Nous repoussons constamment les limites pour améliorer l'expérience utilisateur.</p>
                        </div>
                    </div>
                </section>
                
                {/* Section presenting the company's future */}
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
            
            {/* Footer with copyright */}
            <footer className="about-footer">
                <p>© 2024 SwiftRail - Tous droits réservés</p>
            </footer>
        </div>
    );
};

export default About; 