import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

const Header: React.FC = () => {
    const { darkMode, toggleDarkMode } = useTheme();

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-3">
                    <Link to="/" className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Sáp Nhập
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
        </nav>
    );
};

export default Header;