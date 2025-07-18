
import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
    return (
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
    );
};

export default Header;