import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

interface SearchHeaderProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    totalItems?: number;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({
                                                       searchQuery,
                                                       onSearchChange,
                                                       totalItems
                                                   }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    🏛️ Tra cứu thông tin hành chính
                </h1>
                <p className="text-gray-600">
                    Tra cứu phường/xã sau sắp xếp đơn vị hành chính
                </p>
                {totalItems && (
                    <p className="text-sm text-gray-500 mt-2">
                        Tổng cộng: {totalItems} đơn vị
                    </p>
                )}
            </div>

            <div className="relative max-w-2xl mx-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                </div>
                <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập tên phường/xã cũ hoặc mới để tìm kiếm... (không cần dấu)"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                    💡 <strong>Tìm kiếm thông minh:</strong> Không phân biệt hoa thường, có hoặc không dấu
                </p>
                <p className="text-xs text-gray-400 mt-1">
                    Ví dụ: "ninh kieu", "Ninh Kiều", "ninh kiêu" đều cho kết quả giống nhau
                </p>
            </div>
        </div>
    );
};

export default SearchHeader;