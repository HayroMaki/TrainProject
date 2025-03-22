import {Route, HashRouter as Router, Routes } from 'react-router-dom';

import Cart from "./pages/Cart.tsx";
import Form from "./pages/form.tsx";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Form/>}/>
                <Route path="/cart" element={<Cart/>}/>
            </Routes>
        </Router>
    );
}

export default App;