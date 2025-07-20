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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            onSearch(searchQuery.trim());
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto px-2 md:px-4 mb-6">
            <div className="absolute inset-y-0 left-6 md:left-8 flex items-center pointer-events-none">
                {isSearching ? (
                    <FontAwesomeIcon
                        icon={faSpinner}
                        className="text-gray-400 animate-spin"
                    />
                ) : (
                    <FontAwesomeIcon
                        icon={faSearch}
                        className="text-gray-400"
                    />
                )}
            </div>
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập tên đơn vị hành chính bất kỳ..."
                className="w-full pl-12 pr-28 py-3 md:py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all duration-200 text-base md:text-lg"
                disabled={isSearching}
            />
            <button
                type="submit"
                disabled={!searchQuery.trim() || isSearching}
                className="absolute right-6 md:right-8 top-1.5 bottom-1.5 px-6 md:px-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-2xl font-medium text-sm md:text-base transition-all duration-200 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
                {isSearching ? (
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                ) : (
                    <>
                        <span className="hidden md:inline">Tìm kiếm</span>
                        <span className="md:hidden">
                            <FontAwesomeIcon icon={faSearch} />
                        </span>
                    </>
                )}
            </button>
        </form>
    );
};

export default SearchHeader;