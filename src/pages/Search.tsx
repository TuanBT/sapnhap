import React, { useState, useMemo } from 'react';
import { useSearchData } from '../hooks/useSearchData';
import SearchHeader from '../components/SearchHeader';
import SearchResults from '../components/SearchResults';
import SearchStats from '../components/SearchStats';
import Header from '../components/Header';
import type { SearchFilter } from '../types/search';

const Search: React.FC = () => {
    const { searchData, loading, error } = useSearchData();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFilter, setSearchFilter] = useState<SearchFilter>('all');

    const filteredResults = useMemo(() => {
        if (!searchQuery.trim()) {
            return searchFilter === 'all'
                ? searchData.allItems
                : searchData.allItems.filter(item =>
                    searchFilter === 'province' ? item.type === 'province' :
                        searchFilter === 'district' ? item.type === 'district' :
                            item.type === 'commune'
                );
        }

        const query = searchQuery.toLowerCase().trim();
        const filtered = searchData.allItems.filter(item => {
            // Search in item name
            const nameMatch = item.name.toLowerCase().includes(query);

            // Search in original units
            const originalUnitsMatch = item.originalUnits.some(unit =>
                unit.toLowerCase().includes(query)
            );

            // Search in parent province
            const parentMatch = item.parentProvince.toLowerCase().includes(query);

            return nameMatch || originalUnitsMatch || parentMatch;
        });

        // Apply type filter
        if (searchFilter === 'all') {
            return filtered;
        }

        return filtered.filter(item => item.type === searchFilter);
    }, [searchData, searchQuery, searchFilter]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <p className="text-red-600 text-lg">Lỗi: {error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="container mx-auto px-4 py-8">
                <SearchHeader
                    searchQuery={searchQuery}
                    searchFilter={searchFilter}
                    onSearchChange={setSearchQuery}
                    onFilterChange={setSearchFilter}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <SearchResults
                            results={filteredResults}
                            searchQuery={searchQuery}
                        />
                    </div>

                    <div className="lg:col-span-1">
                        <SearchStats searchData={searchData} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Search;