import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSpinner } from '@fortawesome/free-solid-svg-icons';

interface SearchHeaderProps {
    onSearch: (query: string) => void;
    totalItems: number;
    isSearching: boolean;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({ onSearch, isSearching }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            onSearch(searchQuery.trim());
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto px-2 md:px-4 mb-6">
            <div
                className={`
                    relative flex items-center bg-white dark:bg-gray-800 
                    border-1 rounded-full shadow-lg transition-all duration-200
                    ${isFocused
                    ? 'border-gray-300 dark:border-gray-600 shadow-xl'
                    : 'border-gray-200 dark:border-gray-700'
                }
                `}
            >
                {/* Search Icon */}
                <div className="absolute left-6 md:left-8 flex items-center pointer-events-none">
                    {isSearching ? (
                        <FontAwesomeIcon
                            icon={faSpinner}
                            className="text-gray-400 animate-spin w-5 h-5"
                        />
                    ) : (
                        <FontAwesomeIcon
                            icon={faSearch}
                            className="text-gray-400 w-5 h-5"
                        />
                    )}
                </div>

                {/* Input Field */}
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Nhập tên đơn vị hành chính bất kỳ..."
                    className="w-full pl-16 md:pl-20 pr-20 py-4 md:py-5 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-base md:text-lg disabled:cursor-not-allowed"
                    disabled={isSearching}
                />

                {/* Submit Button - Tròn như ChatGPT */}
                <button
                    type="submit"
                    disabled={!searchQuery.trim() || isSearching}
                    className="absolute right-3 w-10 h-10 md:w-12 md:h-12 bg-black dark:bg-white text-white dark:text-black rounded-full font-medium transition-all duration-200 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:text-gray-500 disabled:cursor-not-allowed hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center justify-center"
                >
                    {isSearching ? (
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin w-4 h-4" />
                    ) : (
                        <FontAwesomeIcon icon={faSearch} className="w-4 h-4" />
                    )}
                </button>
            </div>
        </form>
    );
};

export default SearchHeader;