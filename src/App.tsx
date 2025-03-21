//import { useState } from "react";

import {Route, HashRouter as Router, Routes } from "react-router-dom";

import Connection from "./pages/Connection.tsx";

function App() {
    return (
        <main>
            <Router>
                <Routes>
                    <Route path="/Connect" element={<Connection/>} />
                </Routes>
            </Router>
        </main>
    )
}

export default App;