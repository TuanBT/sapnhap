import React from 'react';
import type { SearchFilter } from '../types/search';

interface SearchHeaderProps {
    searchQuery: string;
    searchFilter: SearchFilter;
    onSearchChange: (query: string) => void;
    onFilterChange: (filter: SearchFilter) => void;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({
                                                       searchQuery,
                                                       searchFilter,
                                                       onSearchChange,
                                                       onFilterChange
                                                   }) => {
    return (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    🔍 Tìm kiếm thông tin sáp nhập hành chính
                </h1>
                <p className="text-gray-600">
                    Tìm kiếm thông tin trước và sau sáp nhập các đơn vị hành chính
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Nhập tên tỉnh, huyện, xã cũ hoặc mới..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="text-gray-400 text-xl">🔍</span>
                        </div>
                    </div>
                </div>

                <div className="md:w-48">
                    <select
                        value={searchFilter}
                        onChange={(e) => onFilterChange(e.target.value as SearchFilter)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">Tất cả</option>
                        <option value="province">Tỉnh/Thành phố</option>
                        <option value="district">Huyện/Quận</option>
                        <option value="commune">Xã/Phường</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default SearchHeader;