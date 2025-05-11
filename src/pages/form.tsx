import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Form component for handling travel information input.
 */
export const Form = () => {
    const navigate = useNavigate();

    // Carrousel reference
    const sliderRef = useRef<HTMLDivElement>(null);

    // State variables
    const [isRoundTrip, setIsRoundTrip] = useState(false); // Tracks if the trip is round trip
    const [departureDate, setDepartureDate] = useState(''); // Stores the departure date
    const [arrivalDate, setArrivalDate] = useState(''); // Stores the arrival date (for round trips)
    const [departure, setDeparture] = useState(''); // Stores the departure city
    const [arrival, setArrival] = useState(''); // Stores the arrival city
    const [error, setError] = useState(''); // Stores error messages
    const [activeCarouselIndex, setActiveCarouselIndex] = useState(0); // État pour le carrousel
    const [slidesPerView, setSlidesPerView] = useState(3); // Nombre de slides par vue
    const [failedImages, setFailedImages] = useState<Record<number, boolean>>({}); // Pour gérer les images qui échouent

    // Fallback image
    const fallbackImage = "https://images.unsplash.com/photo-1513805549689-48b5fb3b77fb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80";
    
    // Handler for the image errors
    const handleImageError = (index: number) => {
        setFailedImages({...failedImages, [index]: true});
    };

    // List of valid cities
    const cities = [
        "Paris", "Lyon", "Marseille", "Toulouse", "Nice", "Nantes",
        "Strasbourg", "Montpellier", "Bordeaux", "Lille", "Rennes"
    ];

    // Popular destinations with images
    const popularDestinations = [
        { 
            from: "Paris", 
            to: "Marseille", 
            price: "39", 
            image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80",
            description: "De la capitale vers la cité phocéenne"
        },
        { 
            from: "Lyon", 
            to: "Paris", 
            price: "29", 
            image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80",
            description: "Découvrez la ville lumière"
        },
        { 
            from: "Paris", 
            to: "Bordeaux", 
            price: "35", 
            image: "https://images.unsplash.com/photo-1581245308298-049844d6f232?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80",
            description: "Explorez la capitale viticole"
        },
        { 
            from: "Nice", 
            to: "Strasbourg", 
            price: "59", 
            image: "https://images.unsplash.com/photo-1543349689-ec20e01308bf?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80",
            description: "Du sud au nord, une aventure unique"
        },
        { 
            from: "Paris", 
            to: "Nice", 
            price: "45", 
            image: "https://images.unsplash.com/photo-1533614767967-f9825b106cba?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80",
            description: "De la ville à la plage"
        },
        { 
            from: "Bordeaux", 
            to: "Lyon", 
            price: "33", 
            image: "https://images.unsplash.com/photo-1544877742-77e31fb26fe7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80",
            description: "Entre gastronomie et vin"
        },
        { 
            from: "Toulouse", 
            to: "Lille", 
            price: "52", 
            image: "https://images.unsplash.com/photo-1603468620905-8de7d86b781e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80",
            description: "Du sud au nord de la France"
        },
        { 
            from: "Strasbourg", 
            to: "Nantes", 
            price: "48", 
            image: "https://images.unsplash.com/photo-1595244426552-e399f81619c2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80",
            description: "Tradition alsacienne et air marin"
        }
    ];

    // Testimonials
    const testimonials = [
        {
            name: "Sophie Martin",
            comment: "Un service exceptionnel, voyage très confortable et ponctuel. Je recommande !",
            avatar: "https://randomuser.me/api/portraits/women/32.jpg",
            rating: 5
        },
        {
            name: "Thomas Dubois",
            comment: "Facile à réserver, prix compétitifs et personnel très attentionné durant tout le trajet.",
            avatar: "https://randomuser.me/api/portraits/men/44.jpg",
            rating: 4
        },
        {
            name: "Émilie Blanc",
            comment: "Je voyage régulièrement pour le travail et SwiftRail est devenu mon premier choix.",
            avatar: "https://randomuser.me/api/portraits/women/68.jpg",
            rating: 5
        }
    ];

    // Compute the visible slides depending on the width
    useEffect(() => {
        const calculateSlidesPerView = () => {
            if (window.innerWidth < 768) {
                setSlidesPerView(1);
            } else if (window.innerWidth < 1024) {
                setSlidesPerView(2);
            } else {
                setSlidesPerView(3);
            }
        };
        
        calculateSlidesPerView();
        window.addEventListener('resize', calculateSlidesPerView);
        
        // Auto-scroll the carrousel every 5 seconds
        const autoScrollInterval = setInterval(() => {
            if (sliderRef.current) {
                const slider = sliderRef.current;
                const totalSlides = Math.ceil(popularDestinations.length / slidesPerView);
                
                // Go to the next slide or the first one
                const nextIndex = (activeCarouselIndex + 1) % totalSlides;
                slider.scrollTo({ 
                    left: nextIndex * slider.clientWidth, 
                    behavior: 'smooth' 
                });
                setActiveCarouselIndex(nextIndex);
            }
        }, 5000);
        
        return () => {
            window.removeEventListener('resize', calculateSlidesPerView);
            clearInterval(autoScrollInterval);
        };
    }, [activeCarouselIndex, popularDestinations.length, slidesPerView]);

    /**
     * Handles the selection of a one-way trip.
     */
    const handleSimpleTrip = () => {
        setIsRoundTrip(false);
    };

    /**
     * Handles the selection of a round trip.
     */
    const handleRoundTrip = () => {
        setIsRoundTrip(true);
    };

    /**
     * Handles form submission.
     * Validates the input data and logs the form data if valid.
     * @param {Event} event - The form submission event.
     */
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const currentDate = new Date();
        const selectedDepartureDate = new Date(departureDate);

        // Validate that the departure date is not in the past
        if (selectedDepartureDate < currentDate) {
            setError('La date de départ doit être postérieure à la date actuelle.');
            return;
        }

        // For round trips, validate that the arrival date is after the departure date
        if (isRoundTrip) {
            const selectedArrivalDate = new Date(arrivalDate);
            if (selectedArrivalDate < selectedDepartureDate) {
                setError("La date de retour doit être postérieure à la date de départ.");
                return;
            }
        }

        // Validate that the selected cities are in the list of valid cities
        if (!cities.includes(departure) || !cities.includes(arrival)) {
            setError('Veuillez sélectionner des villes valides.');
            return;
        }

        // Clear any previous errors
        setError('');

        // Prepare the form data for submission
        const formData = {
            isRoundTrip,
            departureDate,
            arrivalDate: isRoundTrip ? arrivalDate : null,
            departure,
            arrival,
        };

        // Sending the information to database
        await fetch(`${location.hostname}/api/insertTravels`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: formData }),
        });

        // Navigate to the travels page
        navigate('/travels', { state: { formData } });
    };

    // Function to handle quick destination selection
    const handleQuickDestinationSelect = (from: string, to: string) => {
        setDeparture(from);
        setArrival(to);
        // Scroll to search form
        document.querySelector('.search-form-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    // Generate star rating component
    const StarRating = ({ rating }: { rating: number }) => {
        return (
            <div className="star-rating">
                {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < rating ? "star filled" : "star"}>★</span>
                ))}
            </div>
        );
    };

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1>Voyagez à travers la France en toute simplicité</h1>
                    <p>Des trajets confortables, ponctuels et économiques</p>
                    <button className="cta-button" onClick={() => document.querySelector('.search-form-section')?.scrollIntoView({ behavior: 'smooth' })}>
                        Réserver maintenant
                    </button>
                </div>
            </section>

            {/* Search Form Section */}
            <section className="search-form-section">
                <div className="section-header">
                    <h2>Trouvez votre prochain voyage</h2>
                    <p>Entrez vos informations pour découvrir nos meilleurs trajets</p>
                </div>

                <form className="form-container" onSubmit={handleSubmit}>
            {/* Buttons to select trip type (one-way or round trip) */}
                    <div className="row-container">
                <button
                            id="simple-button"
                    className={`travel-type-button ${!isRoundTrip ? 'selected' : ''}`}
                    onClick={handleSimpleTrip}
                    type="button"
                >
                            Aller simple
                </button>
                <button
                            id="round-trip-button"
                    className={`travel-type-button ${isRoundTrip ? 'selected' : ''}`}
                    onClick={handleRoundTrip}
                    type="button"
                >
                            Aller-retour
                </button>
            </div>

            {/* Input fields for departure and arrival dates */}
                    <div className="row-container">
                        <div className="input-container">
                            <p className="input-label">Date de départ:</p>
                    <input
                                id="input-departure-date-value"
                                className="input-content"
                                type="date"
                        required
                        value={departureDate}
                        onChange={(e) => setDepartureDate(e.target.value)}
                    />
                </div>
                {/* Arrival date input is only shown for round trips */}
                        <div id="input-arrival-container" className="input-container" style={{ display: isRoundTrip ? 'block' : 'none' }}>
                            <p className="input-label">Date de retour:</p>
                    <input
                                id="input-arrival-date-value"
                                className="input-content"
                                type="date"
                        value={arrivalDate}
                        onChange={(e) => setArrivalDate(e.target.value)}
                    />
                </div>
            </div>

            {/* Input fields for departure and arrival cities */}
                    <div className="row-container">
                        <div className="input-container">
                            <p className="input-label">Départ:</p>
                    <input
                                id="input-departure-value"
                                className="input-content"
                                type="text"
                        required
                        value={departure}
                        onChange={(e) => setDeparture(e.target.value)}
                        list="cities-list"
                                placeholder="Ville de départ"
                    />
                    <datalist id="cities-list">
                        {cities.map((city, index) => (
                            <option key={index} value={city} />
                        ))}
                    </datalist>
                </div>
                        <div className="input-container">
                            <p className="input-label">Arrivée:</p>
                    <input
                                id="input-arrival-value"
                                className="input-content"
                                type="text"
                        required
                        value={arrival}
                        onChange={(e) => setArrival(e.target.value)}
                        list="cities-list"
                                placeholder="Ville d'arrivée"
                    />
                </div>
            </div>

            {/* Display error messages if any */}
                    {error && <p className="error-message">{error}</p>}

            {/* Submit button */}
                    <button className="submit-button" type="submit">Rechercher</button>
        </form>
            </section>

            {/* Benefits Section */}
            <section className="benefits-section">
                <div className="section-header">
                    <h2>Pourquoi choisir SwiftRail ?</h2>
                    <p>Nous nous engageons à vous offrir une expérience de voyage exceptionnelle</p>
                </div>
                
                <div className="benefits-grid">
                    <div className="benefit-card">
                        <div className="benefit-icon">🎫</div>
                        <h3>Billets à prix imbattables</h3>
                        <p>Des tarifs compétitifs et transparents, sans frais cachés ni mauvaises surprises.</p>
                    </div>
                    
                    <div className="benefit-card">
                        <div className="benefit-icon">⏱️</div>
                        <h3>Ponctualité garantie</h3>
                        <p>Nos trains respectent les horaires. Votre temps est précieux, nous le savons.</p>
                    </div>
                    
                    <div className="benefit-card">
                        <div className="benefit-icon">🌱</div>
                        <h3>Écologique</h3>
                        <p>Voyagez en réduisant votre empreinte carbone. Le train, c'est 30x moins d'émissions que l'avion.</p>
                    </div>
                    
                    <div className="benefit-card">
                        <div className="benefit-icon">🛋️</div>
                        <h3>Confort optimal</h3>
                        <p>Sièges spacieux, prises électriques et WiFi gratuit pour un voyage agréable.</p>
                    </div>
                </div>
            </section>

            {/* Popular Destinations Section */}
            <section className="destinations-section">
                <div className="section-header">
                    <h2>Destinations populaires</h2>
                    <p>Inspirez-vous pour votre prochain voyage</p>
                </div>
                
                <div className="destinations-carousel">
                    <button className="carousel-nav carousel-prev" onClick={(e) => {
                        e.preventDefault();
                        const carousel = sliderRef.current;
                        if (carousel) {
                            const newPosition = Math.max(carousel.scrollLeft - carousel.clientWidth, 0);
                            carousel.scrollTo({ left: newPosition, behavior: 'smooth' });
                            setActiveCarouselIndex(Math.floor(newPosition / carousel.clientWidth));
                        }
                    }}>❮</button>
                    
                    <div 
                        className="destinations-slider" 
                        ref={sliderRef}
                        onScroll={(e) => {
                            const carousel = e.currentTarget;
                            const index = Math.round(carousel.scrollLeft / carousel.clientWidth);
                            if (index !== activeCarouselIndex) {
                                setActiveCarouselIndex(index);
                            }
                        }}
                    >
                        {popularDestinations.map((destination, index) => (
                            <div key={index} className="destination-card">
                                <div 
                                    className="destination-card-background" 
                                    style={{ 
                                        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5)), url(${failedImages[index] ? fallbackImage : destination.image})` 
                                    }}
                                >
                                    <img 
                                        src={destination.image} 
                                        alt="" 
                                        style={{ display: 'none' }} 
                                        onError={() => handleImageError(index)}
                                    />
                                    <div className="destination-content">
                                        <h3>{destination.from} → {destination.to}</h3>
                                        <p>{destination.description}</p>
                                        <div className="destination-price">À partir de <span>{destination.price}€</span></div>
                                        <button 
                                            className="destination-button"
                                            onClick={() => handleQuickDestinationSelect(destination.from, destination.to)}
                                        >
                                            Réserver
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <button className="carousel-nav carousel-next" onClick={(e) => {
                        e.preventDefault();
                        const carousel = sliderRef.current;
                        if (carousel) {
                            const newPosition = Math.min(
                                carousel.scrollLeft + carousel.clientWidth, 
                                carousel.scrollWidth - carousel.clientWidth
                            );
                            carousel.scrollTo({ left: newPosition, behavior: 'smooth' });
                            setActiveCarouselIndex(Math.floor(newPosition / carousel.clientWidth));
                        }
                    }}>❯</button>
                </div>
                
                <div className="carousel-dots">
                    {Array.from({ length: Math.ceil(popularDestinations.length / slidesPerView) }).map((_, index) => (
                        <button 
                            key={index} 
                            className={`carousel-dot ${activeCarouselIndex === index ? 'active' : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                const carousel = sliderRef.current;
                                if (carousel) {
                                    carousel.scrollTo({ 
                                        left: index * carousel.clientWidth, 
                                        behavior: 'smooth' 
                                    });
                                    setActiveCarouselIndex(index);
                                }
                            }}
                        ></button>
                    ))}
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="testimonials-section">
                <div className="section-header">
                    <h2>Ce que nos clients disent</h2>
                    <p>Des milliers de voyageurs satisfaits</p>
                </div>
                
                <div className="testimonials-grid">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="testimonial-card">
                            <div className="testimonial-avatar">
                                <img src={testimonial.avatar} alt={testimonial.name} />
                            </div>
                            <div className="testimonial-content">
                                <StarRating rating={testimonial.rating} />
                                <p className="testimonial-text">"{testimonial.comment}"</p>
                                <p className="testimonial-name">{testimonial.name}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Call to Action Section */}
            <section className="cta-section">
                <div className="cta-content">
                    <h2>Prêt à explorer la France ?</h2>
                    <p>Réservez dès maintenant et profitez d'une expérience de voyage inoubliable</p>
                    <button className="cta-button" onClick={() => document.querySelector('.search-form-section')?.scrollIntoView({ behavior: 'smooth' })}>
                        Commencer l'aventure
                    </button>
                </div>
            </section>
        </div>
    );
};
