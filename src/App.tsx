import {Route, HashRouter as Router, Routes } from 'react-router-dom';

import {UserProvider} from "./components/UserContext.tsx";

// Page component imports
import {Connection} from "./pages/Connection.tsx";
import {Form} from "./pages/form.tsx";
import {Travels} from "./pages/Travels.tsx";
import {Options} from "./pages/Options.tsx";
import Cart from "./pages/Cart.tsx";
import Payment from "./pages/Payment.tsx";
import {Inscription} from "./pages/Inscription.tsx";
import {SeatSelection} from "./pages/SeatSelection.tsx";
import {About} from "./pages/About.tsx";
import {Contact} from "./pages/Contact.tsx";

/**
 * Principal component of the application
 * 
 * Configures the router and gives the user context to the entirety of the application.
 * The Routes define the different navigation paths available in the application.
 * 
 * @returns {JSX.Element} The root component of the application
 */
function App() {
    return (
        <Router>
            <UserProvider>
                <Routes>
                    {/* Route principale pour la page d'accueil */}
                    <Route path="/" element={<Form/>}/>
                    
                    {/* Routes pour la recherche et réservation de trajets */}
                    <Route path="/travels" element={<Travels/>}/>
                    <Route path="/options" element={<Options/>}/>
                    <Route path="/seat-selection" element={<SeatSelection/>}/>
                    
                    {/* Routes pour le panier et le paiement */}
                    <Route path="/cart" element={<Cart/>}/>
                    <Route path="/payment" element={<Payment/>}/>
                    
                    {/* Routes pour la connexion et l'inscription */}
                    <Route path="/connection" element={<Connection/>}/>
                    <Route path="/inscription" element={<Inscription/>}/>
                    
                    {/* Routes pour les pages d'information */}
                    <Route path="/about" element={<About/>}/>
                    <Route path="/contact" element={<Contact/>}/>
                </Routes>
            </UserProvider>
        </Router>
    );
}

export default App;