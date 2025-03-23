import {Route, HashRouter as Router, Routes } from 'react-router-dom';

import {UserProvider} from "./components/UserContext.tsx";

import {Connection} from "./pages/Connection.tsx";
import {Inscription} from "./pages/Inscription.tsx";
import {Form} from "./pages/form.tsx";
import {Travels} from "./pages/Travels.tsx";
import {Options} from "./pages/Options.tsx";
import Cart from "./pages/Cart.tsx";
import Payment from "./pages/Payment.tsx";

function App() {
    return (
        <Router>
            <UserProvider>
                <Routes>
                    <Route path="/" element={<Form/>}/>
                    <Route path="/travels" element={<Travels/>}/>
                    <Route path="/cart" element={<Cart/>}/>
                    <Route path="/payment" element={<Payment/>}/>
                    <Route path="/connection" element={<Connection/>}/>
                    <Route path="/inscription" element={<Inscription/>}/>
                    <Route path="/options" element={<Options/>}/>
                </Routes>
            </UserProvider>
        </Router>
    );
}

export default App;