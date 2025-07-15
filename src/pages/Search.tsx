import React, { useState, useMemo } from 'react';
import { useSearchData } from '../hooks/useSearchData';
import SearchHeader from '../components/SearchHeader';
import SearchResults from '../components/SearchResults';
import Header from '../components/Header';
import type { SearchFilter } from '../types/search';

const Search: React.FC = () => {
    const {search, loading, error } = useSearchData();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFilter, setSearchFilter] = useState<SearchFilter>('all');

    const filteredResults = useMemo(() => {
        const type = searchFilter === 'all' ? undefined : searchFilter;
        return search(searchQuery, type);
    }, [search, searchQuery, searchFilter]);

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
                    searchFilter={searchFilter}
                    onSearchChange={setSearchQuery}
                    onFilterChange={setSearchFilter}
                />

                <SearchResults
                    results={filteredResults}
                    searchQuery={searchQuery}
                />
            </div>
        </div>
    );
};

export default Search;