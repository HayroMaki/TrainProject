import {Route, HashRouter as Router, Routes } from 'react-router-dom';

import {UserProvider} from "./components/UserContext.tsx";

import {Connection} from "./pages/Connection.tsx";
import {Form} from "./pages/form.tsx";
import {Travels} from "./pages/Travels.tsx";
import Cart from "./pages/Cart.tsx";

function App() {
    return (
        <UserProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Form/>}/>
                    <Route path="/travels" element={<Travels/>}/>
                    <Route path="/cart" element={<Cart/>}/>
                    <Route path="/" element={<Connection />}/>
                </Routes>
            </Router>
        </UserProvider>
    );
}

export default App;