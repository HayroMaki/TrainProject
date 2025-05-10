import { NavLink } from "react-router-dom";
import { useUserContext } from "./UserContext.tsx";
import { useState, useEffect, useRef } from "react";

export const Header = () => {
    const { user, connected, setConnected, setUser } = useUserContext();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const handleLogout = () => {
        setConnected(false);
        setUser({
            email: "",
            first_name: "",
            last_name: "",
            cart: [],
            commands: [],
            subscription: "",
            creation_date: "",
            bank_info: {
                first_name: "",
                last_name: "",
                card_number: "",
                expiration_date: "",
            }
        });
        // Fermer le dropdown après déconnexion
        setDropdownOpen(false);
    };

    // Gestionnaire pour fermer le dropdown en cliquant ailleurs
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };

        // Ajouter l'écouteur d'événement seulement si le dropdown est ouvert
        if (dropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        // Nettoyer l'écouteur d'événement
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownOpen]);

    return (
        <header className="App-header">
            <div className="header-container">
                <NavLink to={"/"} className="App-header-logo">
                    <span className="logo-icon">🚄</span>
                    <span className="logo-text">SWIFTRAIL</span>
                </NavLink>
                
                <nav className="header-nav">
                    <NavLink to={"/"} className="nav-link" end>Accueil</NavLink>
                    <NavLink to={"/travels"} className="nav-link">Trajets</NavLink>
                    <NavLink to={"/about"} className="nav-link">À propos</NavLink>
                    <NavLink to={"/contact"} className="nav-link">Contact</NavLink>
                    <NavLink to={"/cart"} className="nav-link cart-nav-link">
                        <i className="nav-icon">🛒</i>
                        <span>Mon panier</span>
                    </NavLink>
                </nav>
                
                <div className="header-actions">
                    {!connected ? (
                        <NavLink to={"/connection"} className="App-header-button login-button">
                            <i className="button-icon">👤</i>
                            <span>Se connecter</span>
                        </NavLink>
                    ) : (
                        <div 
                            className={`user-dropdown ${dropdownOpen ? 'open' : ''}`} 
                            ref={dropdownRef}
                        >
                            <button 
                                className="user-button" 
                                onClick={toggleDropdown}
                            >
                                <i className="button-icon">👤</i>
                                <span>{user.first_name || 'Mon compte'}</span>
                                <i style={{ marginLeft: '0.25rem', fontSize: '0.8rem' }}>▼</i>
                            </button>
                            
                            <div className="dropdown-content">
                                <div className="dropdown-header">
                                    <div className="user-fullname">
                                        {user.first_name} {user.last_name}
                                    </div>
                                    <div className="user-email">{user.email}</div>
                                </div>
                                
                                <div className="dropdown-menu">
                                    <NavLink to="/profile" className="dropdown-item">
                                        <span className="dropdown-item-icon">👤</span>
                                        Mon profil
                                    </NavLink>
                                    
                                    <NavLink to="/commands" className="dropdown-item">
                                        <span className="dropdown-item-icon">🧾</span>
                                        Mes commandes
                                    </NavLink>
                                    
                                    {user.subscription && (
                                        <NavLink to="/subscription" className="dropdown-item">
                                            <span className="dropdown-item-icon">🎫</span>
                                            Mon abonnement
                                        </NavLink>
                                    )}
                                    
                                    <div className="dropdown-divider"></div>
                                    
                                    <button 
                                        className="dropdown-item dropdown-logout"
                                        onClick={handleLogout}
                                    >
                                        <span className="dropdown-item-icon">🚪</span>
                                        Se déconnecter
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}