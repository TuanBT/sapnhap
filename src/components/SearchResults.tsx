import React, { useState } from 'react';
import type { FlatItem } from '../hooks/useSearchData';
import SimpleSearchResult from './SimpleSearchResult';

interface SearchResultsProps {
    results: FlatItem[];
    searchQuery: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, searchQuery }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const totalPages = Math.ceil(results.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentResults = results.slice(startIndex, endIndex);

    if (results.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <div className="text-gray-300 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Không tìm thấy kết quả
                </h3>
                <p className="text-gray-600">
                    {searchQuery
                        ? `Thử tìm kiếm với từ khóa khác thay vì "${searchQuery}"`
                        : 'Nhập tên tỉnh, huyện, xã để tìm kiếm thông tin sáp nhập'
                    }
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Results header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <span className="text-blue-500 font-semibold">📊 Kết quả:</span>
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                                {results.length} đơn vị
                            </span>
                        </div>
                        {searchQuery && (
                            <div className="text-sm text-gray-500">
                                Tìm kiếm: "<span className="font-medium">{searchQuery}</span>"
                            </div>
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="text-sm text-gray-500">
                            Trang {currentPage} / {totalPages}
                        </div>
                    )}
                </div>
            </div>

            {/* Results list */}
            <div className="space-y-4">
                {currentResults.map((item, index) => (
                    <SimpleSearchResult
                        key={`${item.fullPath}-${index}`}
                        item={item}
                        searchQuery={searchQuery}
                    />
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span>←</span>
                            <span>Trang trước</span>
                        </button>

                        <div className="flex items-center space-x-2">
                            {/* Page numbers */}
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const pageNum = i + 1;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`px-3 py-1 text-sm font-medium rounded-md ${
                                            currentPage === pageNum
                                                ? 'bg-blue-500 text-white'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            {totalPages > 5 && (
                                <>
                                    <span className="text-gray-400">...</span>
                                    <button
                                        onClick={() => setCurrentPage(totalPages)}
                                        className={`px-3 py-1 text-sm font-medium rounded-md ${
                                            currentPage === totalPages
                                                ? 'bg-blue-500 text-white'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        {totalPages}
                                    </button>
                                </>
                            )}
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span>Trang sau</span>
                            <span>→</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchResults;