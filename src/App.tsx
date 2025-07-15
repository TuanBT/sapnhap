import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Comparison from './pages/Comparison';
import Home from './pages/Home';
import Search from "./pages/Search.tsx"; // Trang chính hiện tại

function App() {
    return (
        <Router>
            <div className="App">
                {/* Navigation */}
                <nav className="bg-white shadow-md">
                    <div className="container mx-auto px-4">
                        <div className="flex justify-between items-center py-4">
                            <Link to="/" className="text-xl font-bold text-blue-600">
                                Vietnam Map
                            </Link>
                            <div className="flex space-x-4">
                                <Link
                                    to="/"
                                    className="text-gray-700 hover:text-blue-600 transition-colors"
                                >
                                    Trang chính
                                </Link>
                                <Link
                                    to="/comparison"
                                    className="text-gray-700 hover:text-blue-600 transition-colors"
                                >
                                    So sánh
                                </Link>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Routes */}
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/comparison" element={<Comparison />} />
                    <Route path="/search" element={<Search />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;