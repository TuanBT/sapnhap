import React, { useState, useCallback } from 'react';
import { useSearchData } from '../hooks/useSearchData';
import SearchHeader from '../components/SearchHeader';
import SearchResults from '../components/SearchResults';
// Xóa import Header vì đã có trong Home.tsx

const Search: React.FC = () => {
    const { search, loading, error, totalItems } = useSearchData();
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = useCallback(async (query: string) => {
        setIsSearching(true);
        console.log('Starting search for:', query);

        try {
            const startTime = performance.now();
            const searchResults = search(query);
            const endTime = performance.now();

            console.log('Search completed in:', endTime - startTime, 'ms');
            console.log('Results count:', searchResults.length);

            setSearchQuery(query);
            setResults(searchResults);
        } catch (err) {
            console.error('Search error:', err);
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    }, [search]);

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
        <div className="container mx-auto px-4 py-6 max-w-4xl">
            <SearchHeader
                onSearch={handleSearch}
                totalItems={totalItems}
                isSearching={isSearching}
            />

            <SearchResults
                results={results}
                searchQuery={searchQuery}
            />
        </div>
    );
};

export default Search;