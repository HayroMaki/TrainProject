import {Route, HashRouter as Router, Routes } from 'react-router-dom';

import {Connection} from "./pages/Connection.tsx";
import {Inscription} from "./pages/Inscription.tsx";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/Connection" element={<Connection />}/>
                <Route path="/Inscription" element={<Inscription />}/>
            </Routes>
        </Router>
    );
}

export default App;