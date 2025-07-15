import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faLightbulb } from '@fortawesome/free-solid-svg-icons';
import type { SearchFilter } from '../types/search';

interface SearchHeaderProps {
    searchQuery: string;
    searchFilter: SearchFilter;
    onSearchChange: (query: string) => void;
    onFilterChange: (filter: SearchFilter) => void;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({
                                                       searchQuery,
                                                       onSearchChange,
                                                   }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center space-x-2">
                    <FontAwesomeIcon icon={faSearch} className="text-blue-500" />
                    <span>Tìm kiếm sáp nhập hành chính</span>
                </h1>
                <p className="text-gray-600 text-sm">
                    Tra cứu thông tin sáp nhập tỉnh, huyện, xã trên toàn quốc
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Nhập tên đơn vị cũ hoặc mới..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <FontAwesomeIcon icon={faSearch} className="text-gray-400 text-sm" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick guide */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 text-sm text-blue-700">
                    <FontAwesomeIcon icon={faLightbulb} />
                    <span>
                        <strong>Gợi ý:</strong> Có thể tìm theo tên cũ (trước sáp nhập) hoặc tên mới (sau sáp nhập)
                    </span>
                </div>
            </div>
        </div>
    );
};

export default SearchHeader;