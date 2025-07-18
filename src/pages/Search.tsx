import React, { useState, useMemo } from 'react';
import { useSearchData } from '../hooks/useSearchData';
import { useDebounce } from '../hooks/useDebounce';
import SearchHeader from '../components/SearchHeader';
import SearchResults from '../components/SearchResults';
import Header from '../components/Header';

const Search: React.FC = () => {
    const { search, loading, error, totalItems } = useSearchData();
    const [searchQuery, setSearchQuery] = useState('');

    // Debounce search query để tránh search liên tục
    const debouncedSearchQuery = useDebounce(searchQuery, 200);

    const filteredResults = useMemo(() => {
        return search(debouncedSearchQuery);
    }, [search, debouncedSearchQuery]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-4xl mb-4">⚠️</div>
                    <p className="text-red-600">Lỗi: {error}</p>
                    <p className="text-sm text-gray-500 mt-2">
                        Vui lòng đảm bảo file thongtinhanhchinh.json có trong thư mục public
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="container mx-auto px-4 py-6 max-w-4xl">
                <SearchHeader
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    totalItems={totalItems}
                />

                <SearchResults
                    results={filteredResults}
                    searchQuery={debouncedSearchQuery}
                />
            </div>
        </div>
    );
};

export default Search;