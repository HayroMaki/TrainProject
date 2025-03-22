import {Route, HashRouter as Router, Routes } from 'react-router-dom';

import {Connection} from "./pages/Connection.tsx";
import {Form} from "./pages/form.tsx";
import {Travels} from "./pages/Travels.tsx";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Form/>} />
                <Route path="/travels" element={<Travels/>} />
                <Route path="/" element={<Connection />}/>
            </Routes>
        </Router>
    );
}

export default App;