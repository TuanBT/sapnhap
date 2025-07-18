import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

const Header: React.FC = () => {
    const { darkMode, toggleDarkMode } = useTheme();

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-md transition-colors duration-200">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-4">
                    <Link to="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        Vietnam Map
                    </Link>
                    <div className="flex items-center space-x-4">
                        <Link
                            to="/"
                            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            Trang chính
                        </Link>
                        <Link
                            to="/comparison"
                            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            So sánh
                        </Link>
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            aria-label="Toggle dark mode"
                        >
                            <FontAwesomeIcon icon={darkMode ? faSun : faMoon} />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Header;