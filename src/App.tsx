import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Comparison from './pages/Comparison';
import Home from './pages/Home';
import Header from './components/Header';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
    return (
        <ThemeProvider>
            <Router>
                <div className="App min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                    <Header />

                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/comparison" element={<Comparison />} />
                    </Routes>
                </div>
            </Router>
        </ThemeProvider>
    );
}

export default App;