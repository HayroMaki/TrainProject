import {Route, HashRouter as Router, Routes } from 'react-router-dom';

import {Connection} from "./pages/Connection.tsx";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Connection />}/>
            </Routes>
        </Router>
    );
}

export default App;