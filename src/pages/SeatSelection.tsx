import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUserContext } from '../components/UserContext';
import { SeatSelector } from '../components/SeatSelector';
import '../stylesheets/SeatSelection.css';
import Command from '../interfaces/Command';

export const SeatSelection: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart: contextCart } = location.state || { cart: [] };
  const { setUserCart } = useUserContext();
  
  // État pour stocker les sièges sélectionnés pour chaque voyage
  const [selectedSeats, setSelectedSeats] = useState<Record<number, string>>({});
  // État pour suivre le voyage actuellement affiché
  const [currentTravelIndex, setCurrentTravelIndex] = useState<number>(0);
  // État pour les numéros de voiture (1-7 généralement dans un train)
  const [selectedCar, setSelectedCar] = useState<number>(1);
  
  // Récupère le voyage actuel
  const currentTravel = contextCart[currentTravelIndex];
  
  // Gère la sélection d'un siège
  const handleSeatSelect = (seat: string) => {
    setSelectedSeats(prev => ({
      ...prev,
      [currentTravelIndex]: seat
    }));
  };
  
  // Passe au voyage suivant
  const handleNext = () => {
    if (currentTravelIndex < contextCart.length - 1) {
      setCurrentTravelIndex(currentTravelIndex + 1);
    } else {
      // Si c'est le dernier voyage, finaliser et aller au panier
      finalizeSelection();
    }
  };
  
  // Retourne au voyage précédent
  const handlePrevious = () => {
    if (currentTravelIndex > 0) {
      setCurrentTravelIndex(currentTravelIndex - 1);
    }
  };
  
  // Finalise la sélection et passe à la page suivante
  const finalizeSelection = () => {
    // Vérifie si tous les voyages ont un siège sélectionné
    const allSeatsSelected = contextCart.every((_: Command, index: number) => selectedSeats[index]);
    
    if (!allSeatsSelected) {
      alert("Veuillez sélectionner un siège pour chaque voyage.");
      return;
    }
    
    // Met à jour le panier avec les sièges sélectionnés
    const updatedCart = contextCart.map((travel: Command, index: number) => ({
      ...travel,
      seat: selectedSeats[index]
    }));
    
    setUserCart(updatedCart);
    navigate('/cart', { state: { cart: updatedCart } });
  };
  
  // Si pas de voyages, rediriger vers la page principale
  if (contextCart.length === 0) {
    navigate('/');
    return null;
  }
  
  return (
    <div className="seat-selection-page">
      <header className="seat-selection-header">
        <h1>Choisissez votre place</h1>
        <p>
          Voyage {currentTravelIndex + 1} sur {contextCart.length}: 
          <span className="travel-info">{currentTravel.travel_info.departure} → {currentTravel.travel_info.arrival}</span>
        </p>
      </header>
      
      <div className="travel-details">
        <div className="travel-info-card">
          <div className="travel-icon">🚄</div>
          <div className="travel-details-content">
            <h3>Train {currentTravel.travel_info.train_ref}</h3>
            <p>Départ: {currentTravel.travel_info.date} à {currentTravel.travel_info.time}</p>
            <p>Trajet: {currentTravel.travel_info.length} minutes</p>
          </div>
        </div>
      </div>
      
      <div className="car-selection">
        <h3>Sélectionnez une voiture:</h3>
        <div className="car-buttons">
          {[1, 2, 3, 4, 5, 6, 7].map(carNum => (
            <button
              key={carNum}
              className={`car-button ${selectedCar === carNum ? 'selected' : ''}`}
              onClick={() => setSelectedCar(carNum)}
            >
              {carNum}
            </button>
          ))}
        </div>
      </div>
      
      <div className="seat-selection-container">
        <SeatSelector
          carNumber={selectedCar}
          onSeatSelect={handleSeatSelect}
          initialSelectedSeat={selectedSeats[currentTravelIndex]?.split('-')[1]}
        />
      </div>
      
      <div className="travel-navigation">
        <button 
          className="nav-button previous" 
          onClick={handlePrevious}
          disabled={currentTravelIndex === 0}
        >
          ← Voyage précédent
        </button>
        
        <button className="nav-button next" onClick={handleNext}>
          {currentTravelIndex < contextCart.length - 1 
            ? 'Voyage suivant →' 
            : 'Finaliser →'}
        </button>
      </div>
      
      <div className="progress-indicators">
        {contextCart.map((_: Command, index: number) => (
          <div 
            key={index} 
            className={`progress-dot ${index === currentTravelIndex ? 'active' : ''} ${selectedSeats[index] ? 'completed' : ''}`}
            onClick={() => setCurrentTravelIndex(index)}
          >
            {index + 1}
          </div>
        ))}
      </div>
    </div>
  );
}; 