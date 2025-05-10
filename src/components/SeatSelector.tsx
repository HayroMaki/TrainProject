import React, { useState, useEffect } from 'react';
import '../stylesheets/SeatSelector.css';

interface SeatSelectorProps {
  carNumber: number;
  onSeatSelect: (seat: string) => void;
  initialSelectedSeat?: string;
}

export const SeatSelector: React.FC<SeatSelectorProps> = ({ carNumber, onSeatSelect, initialSelectedSeat }) => {
  // State to follow the selected seat
  const [selectedSeat, setSelectedSeat] = useState<string | null>(initialSelectedSeat || null);
  
  // State for the already occupied seats
  const [occupiedSeats, setOccupiedSeats] = useState<string[]>([]);
  
  // Generate random occupied seats on load
  useEffect(() => {
    // Simulate random seats (around 30%)
    const generateOccupiedSeats = () => {
      const occupied: string[] = [];
      const rows = 16;
      const seatsPerRow = 4;
      const totalSeats = rows * seatsPerRow;
      const occupiedCount = Math.floor(totalSeats * 0.3);
      
      for (let i = 0; i < occupiedCount; i++) {
        const row = Math.floor(Math.random() * rows) + 1;
        const seat = String.fromCharCode(65 + Math.floor(Math.random() * 4)); // A, B, C ou D
        const seatId = `${row}${seat}`;
        
        if (!occupied.includes(seatId)) {
          occupied.push(seatId);
        }
      }
      
      return occupied;
    };
    
    setOccupiedSeats(generateOccupiedSeats());
  }, [carNumber]);
  
  // Seat selection handler
  const handleSeatClick = (seatId: string) => {
    if (occupiedSeats.includes(seatId)) {
      return; // Siège déjà occupé
    }
    
    setSelectedSeat(seatId);
    onSeatSelect(`${carNumber}-${seatId}`);
  };
  
  // Seat rendering
  const renderSeats = () => {
    const rows = [];
    
    for (let rowNum = 1; rowNum <= 16; rowNum++) {
      const rowSeats = [];
      
      // Seat A (left window)
      rowSeats.push(
        <div 
          key={`${rowNum}A`} 
          className={`seat window-seat ${selectedSeat === `${rowNum}A` ? 'selected' : ''} ${occupiedSeats.includes(`${rowNum}A`) ? 'occupied' : ''}`}
          onClick={() => handleSeatClick(`${rowNum}A`)}
          title={`Siège ${rowNum}A`}
        >
          <span className="seat-label">{rowNum}A</span>
        </div>
      );
      
      // Seat B (left corridor)
      rowSeats.push(
        <div 
          key={`${rowNum}B`} 
          className={`seat aisle-seat ${selectedSeat === `${rowNum}B` ? 'selected' : ''} ${occupiedSeats.includes(`${rowNum}B`) ? 'occupied' : ''}`}
          onClick={() => handleSeatClick(`${rowNum}B`)}
          title={`Siège ${rowNum}B`}
        >
          <span className="seat-label">{rowNum}B</span>
        </div>
      );
      
      // Middle corridor
      rowSeats.push(<div key={`aisle-${rowNum}`} className="aisle"></div>);
      
      // Seat C (right corridor)
      rowSeats.push(
        <div 
          key={`${rowNum}C`} 
          className={`seat aisle-seat ${selectedSeat === `${rowNum}C` ? 'selected' : ''} ${occupiedSeats.includes(`${rowNum}C`) ? 'occupied' : ''}`}
          onClick={() => handleSeatClick(`${rowNum}C`)}
          title={`Siège ${rowNum}C`}
        >
          <span className="seat-label">{rowNum}C</span>
        </div>
      );
      
      // Seat D (right window)
      rowSeats.push(
        <div 
          key={`${rowNum}D`} 
          className={`seat window-seat ${selectedSeat === `${rowNum}D` ? 'selected' : ''} ${occupiedSeats.includes(`${rowNum}D`) ? 'occupied' : ''}`}
          onClick={() => handleSeatClick(`${rowNum}D`)}
          title={`Siège ${rowNum}D`}
        >
          <span className="seat-label">{rowNum}D</span>
        </div>
      );
      
      rows.push(
        <div key={`row-${rowNum}`} className="seat-row">
          <div className="row-number">{rowNum}</div>
          <div className="row-seats">{rowSeats}</div>
        </div>
      );
    }
    
    return rows;
  };
  
  return (
    <div className="seat-selector">
      <div className="car-info">
        <h3>Voiture {carNumber}</h3>
        <div className="legend">
          <div className="legend-item">
            <div className="seat-sample available"></div>
            <span>Disponible</span>
          </div>
          <div className="legend-item">
            <div className="seat-sample selected"></div>
            <span>Sélectionné</span>
          </div>
          <div className="legend-item">
            <div className="seat-sample occupied"></div>
            <span>Occupé</span>
          </div>
        </div>
      </div>
      
      <div className="car-container">
        <div className="car-front">
          <div className="locomotive-icon">🚂</div>
        </div>
        
        <div className="seats-container">
          {renderSeats()}
        </div>
        
        <div className="car-back"></div>
      </div>
      
      <div className="seat-selection-info">
        {selectedSeat ? (
          <p>Siège sélectionné: <strong>Voiture {carNumber}, Place {selectedSeat}</strong></p>
        ) : (
          <p>Aucun siège sélectionné. Cliquez sur un siège pour le sélectionner.</p>
        )}
      </div>
    </div>
  );
}; 