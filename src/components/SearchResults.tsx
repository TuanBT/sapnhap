import React, { useState } from 'react';
import type { SearchItem } from '../hooks/useSearchData';
import SearchResultCard from './SearchResultCard';

interface SearchResultsProps {
    results: SearchItem[];
    searchQuery: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, searchQuery }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const totalPages = Math.ceil(results.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentResults = results.slice(startIndex, endIndex);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'province': return '🏛️';
            case 'district': return '🏢';
            case 'commune': return '🏘️';
            default: return '📍';
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'province': return 'Tỉnh/Thành phố';
            case 'district': return 'Huyện/Quận';
            case 'commune': return 'Xã/Phường';
            default: return 'Khác';
        }
    };

    if (results.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Không tìm thấy kết quả
                </h3>
                <p className="text-gray-600">
                    {searchQuery
                        ? `Không tìm thấy kết quả cho "${searchQuery}"`
                        : 'Hãy nhập từ khóa để tìm kiếm'
                    }
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-lg p-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Kết quả tìm kiếm
                    </h2>
                    <div className="text-sm text-gray-600">
                        Tìm thấy {results.length} kết quả
                        {searchQuery && ` cho "${searchQuery}"`}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {currentResults.map((item) => (
                    <SearchResultCard
                        key={item.id}
                        item={item}
                        searchQuery={searchQuery}
                        icon={getTypeIcon(item.type)}
                        typeLabel={getTypeLabel(item.type)}
                    />
                ))}
            </div>

            {totalPages > 1 && (
                <div className="bg-white rounded-lg shadow-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Hiển thị {startIndex + 1} - {Math.min(endIndex, results.length)} của {results.length} kết quả
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Trước
                            </button>

                            <div className="flex space-x-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const page = i + 1;
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`px-3 py-1 rounded-md text-sm font-medium ${
                                                currentPage === page
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchResults;