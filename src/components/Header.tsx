
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMap, faSearch, faChartLine, faMoon, faSun } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../contexts/ThemeContext';

const Header: React.FC = () => {
    const location = useLocation();
    const { darkMode, toggleDarkMode } = useTheme();

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        {
            path: '/',
            label: 'So sánh bản đồ',
            icon: faMap,
            description: 'Xem bản đồ trước và sau sáp nhập'
        },
        {
            path: '/search',
            label: 'Tìm kiếm',
            icon: faSearch,
            description: 'Tìm kiếm thông tin đơn vị hành chính'
        },
        {
            path: '/insights',
            label: 'Thống kê',
            icon: faChartLine,
            description: 'Xem thống kê và phân tích dữ liệu'
        }
    ];

    return (
        <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <FontAwesomeIcon icon={faMap} className="text-white text-lg" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                Sắp nhập DVHC
                            </h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Đơn vị hành chính Việt Nam
                            </p>
                        </div>
                    </Link>

                    {/* Navigation & Controls */}
                    <div className="flex items-center space-x-1">
                        {/* Navigation */}
                        <nav className="flex space-x-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`
                                        relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
                                        flex items-center space-x-2 group
                                        ${isActive(item.path)
                                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }
                                    `}
                                    title={item.description}
                                >
                                    <FontAwesomeIcon
                                        icon={item.icon}
                                        className={`text-sm ${isActive(item.path) ? 'text-blue-600 dark:text-blue-400' : ''}`}
                                    />
                                    <span className="hidden sm:inline">{item.label}</span>

                                    {/* Active indicator */}
                                    {isActive(item.path) && (
                                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
                                    )}
                                </Link>
                            ))}
                        </nav>

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