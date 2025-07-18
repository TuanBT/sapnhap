import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Comparison from './pages/Comparison';
import Home from './pages/Home';
import Header from './components/Header';

function App() {
    return (
        <Router>
            <div className="App">
                <Header />

                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/comparison" element={<Comparison />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;