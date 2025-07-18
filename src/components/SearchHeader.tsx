import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSpinner, faDatabase } from '@fortawesome/free-solid-svg-icons';

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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                        <FontAwesomeIcon icon={faSearch} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Tìm kiếm thông tin
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Tìm kiếm các đơn vị hành chính đã được sắp xếp, sáp nhập
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <FontAwesomeIcon icon={faDatabase} />
                    <span>{totalItems.toLocaleString()} đơn vị</span>
                </div>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSubmit} className="relative">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
                        placeholder="Nhập tên tỉnh, thành phố, quận, huyện, phường, xã..."
                        className="
                            w-full pl-10 pr-4 py-3
                            border border-gray-300 dark:border-gray-600
                            rounded-lg
                            bg-white dark:bg-gray-700
                            text-gray-900 dark:text-white
                            placeholder-gray-500 dark:placeholder-gray-400
                            focus:ring-2 focus:ring-blue-500 focus:border-transparent
                            transition-all duration-200
                        "
                        disabled={isSearching}
                    />
                </div>
                <button
                    type="submit"
                    disabled={!searchQuery.trim() || isSearching}
                    className="
                        absolute right-2 top-2 bottom-2
                        px-4 py-1
                        bg-blue-600 hover:bg-blue-700
                        disabled:bg-gray-400
                        text-white
                        rounded-md
                        font-medium text-sm
                        transition-all duration-200
                        disabled:cursor-not-allowed
                    "
                >
                    {isSearching ? 'Đang tìm...' : 'Tìm kiếm'}
                </button>
            </form>

            {/* Quick tips */}
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-3 mb-3">
                    <FontAwesomeIcon
                        icon={faSearch}
                        className="text-blue-500 dark:text-blue-400"
                    />
                    <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Mẹo tìm kiếm
                    </h3>
                </div>

                <div className="space-y-2 text-xs text-blue-700 dark:text-blue-300">
                    <div className="flex items-center space-x-2">
                        <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                        <span>Có thể tìm theo tên cũ hoặc tên mới</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                        <span>Gõ được có dấu hoặc không dấu</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                        <span>Chỉ cần nhập tên không cần loại đơn vị</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchHeader;