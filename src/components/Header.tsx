
import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../contexts/ThemeContext';

const Header: React.FC = () => {
    const { darkMode, toggleDarkMode } = useTheme();

    return (
        <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                            <img src="/images/logo512.png" alt="Logo" className="w-10 h-10 rounded-lg"/>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                Sáp nhập
                            </h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Đơn vị hành chính Việt Nam 2025
                            </p>
                        </div>
                    </Link>

                    {/* Navigation & Controls */}
                    <div className="flex items-center space-x-1">
                        {/* Dark Mode Toggle */}
                        <div className="ml-4 pl-4 border-l border-gray-200 dark:border-gray-700">
                            <button
                                onClick={toggleDarkMode}
                                className="
                                    p-2 rounded-lg
                                    text-gray-500 hover:text-gray-700
                                    dark:text-gray-400 dark:hover:text-gray-200
                                    hover:bg-gray-100 dark:hover:bg-gray-800
                                    transition-all duration-200
                                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                                    dark:focus:ring-offset-gray-900
                                "
                                title={darkMode ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
                            >
                                <FontAwesomeIcon
                                    icon={darkMode ? faSun : faMoon}
                                    className="text-lg transition-transform duration-200 hover:scale-110"
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;