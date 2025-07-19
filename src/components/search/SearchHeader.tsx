
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSpinner } from '@fortawesome/free-solid-svg-icons';

interface SearchHeaderProps {
    onSearch: (query: string) => void;
    totalItems: number;
    isSearching: boolean;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({ onSearch, totalItems, isSearching }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            onSearch(searchQuery.trim());
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-2 md:px-4 mb-6">
            {/* Main Search Card - Minimalist */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">

                {/* Header - Minimal và clean */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-2xl flex items-center justify-center">
                                <FontAwesomeIcon icon={faSearch} className="text-gray-600 dark:text-gray-400" />
                            </div>
                            <div>
                                <h1 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">Tìm kiếm</h1>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    {totalItems.toLocaleString()} đơn vị hành chính
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Form - Minimal và focus */}
                <div className="p-4 md:p-6">
                    <form onSubmit={handleSubmit} className="relative">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
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
                                className="
                                    w-full pl-12 pr-24 py-4 md:py-5
                                    border border-gray-300 dark:border-gray-600
                                    rounded-2xl
                                    bg-white dark:bg-gray-800
                                    text-gray-900 dark:text-white
                                    placeholder-gray-500 dark:placeholder-gray-400
                                    focus:border-gray-900 dark:focus:border-gray-300
                                    focus:ring-2 focus:ring-gray-100 dark:focus:ring-gray-800
                                    transition-all duration-200
                                    text-base md:text-lg
                                "
                                disabled={isSearching}
                            />
                            <button
                                type="submit"
                                disabled={!searchQuery.trim() || isSearching}
                                className="
                                    absolute right-2 top-2 bottom-2
                                    px-4 md:px-6
                                    bg-gray-900 dark:bg-gray-100
                                    hover:bg-gray-800 dark:hover:bg-gray-200
                                    disabled:bg-gray-400 dark:disabled:bg-gray-600
                                    text-white dark:text-gray-900
                                    rounded-xl
                                    font-medium text-sm md:text-base
                                    transition-all duration-200
                                    disabled:cursor-not-allowed
                                "
                            >
                                {isSearching ? (
                                    <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                                ) : (
                                    <span className="hidden md:inline">Tìm kiếm</span>
                                )}
                                <span className="md:hidden">
                                    <FontAwesomeIcon icon={faSearch} />
                                </span>
                            </button>
                        </div>
                    </form>

                </div>
            </div>
        </div>
    );
};

export default SearchHeader;