import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Map from './pages/Map.tsx';
import Home from './pages/Home';
import Header from './components/Header';
import Footer from './components/Footer';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
    return (
        <ThemeProvider>
            <Router>
                <div className="App min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex flex-col">
                    <Header />

                    <main className="flex-grow">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/comparison" element={<Map />} />
                        </Routes>
                    </main>

                    <Footer />
                </div>
            </Router>
        </ThemeProvider>
    );
}

export default App;