
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

interface SearchHeaderProps {
    onSearch: (query: string) => void;
    totalItems?: number;
    isSearching?: boolean;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({
                                                       onSearch,
                                                       totalItems,
                                                       isSearching = false
                                                   }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            onSearch(searchQuery.trim());
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmit(e);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                    🏛️ Tra cứu thông tin hành chính
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                    Tra cứu phường/xã sau sắp xếp đơn vị hành chính
                </p>
                {totalItems && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Tổng cộng: {totalItems} đơn vị
                    </p>
                )}
            </div>

            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Nhập tên phường/xã cũ hoặc mới để tìm kiếm... (không cần dấu)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isSearching}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!searchQuery.trim() || isSearching}
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSearching ? (
                            <div className="flex items-center space-x-2">
                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                                <span>Đang tìm...</span>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <FontAwesomeIcon icon={faSearch} />
                                <span>Tìm kiếm</span>
                            </div>
                        )}
                    </button>
                </div>
            </form>

            <div className="mt-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    💡 <strong>Tìm kiếm thông minh:</strong> Không phân biệt hoa thường, có hoặc không dấu
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Ví dụ: "ninh kieu", "Ninh Kiều", "ninh kiêu" đều cho kết quả giống nhau
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    ⚡ <strong>Mẹo:</strong> Nhấn Enter hoặc click nút Tìm kiếm để thực hiện tìm kiếm
                </p>
            </div>
        </div>
    );
};

export default SearchHeader;