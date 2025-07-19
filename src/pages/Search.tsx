import React, { useState, useCallback } from 'react';
import { useSearchData } from '../hooks/useSearchData';
import SearchHeader from '../components/search/SearchHeader.tsx';
import SearchResults from '../components/search/SearchResults.tsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const Search: React.FC = () => {
    const { search, loading, error, totalItems } = useSearchData();
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = useCallback(async (query: string) => {
        setIsSearching(true);

        try {
            const searchResults = search(query);

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
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <FontAwesomeIcon
                        icon={faSpinner}
                        className="text-4xl text-blue-500 animate-spin mb-4"
                    />
                    <p className="text-gray-600 dark:text-gray-300">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <FontAwesomeIcon
                        icon={faExclamationTriangle}
                        className="text-4xl text-red-500 mb-4"
                    />
                    <p className="text-red-600 dark:text-red-400">Lỗi: {error}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
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