import { useState, useEffect, useCallback } from 'react';
import { createSearchIndex } from '../utils';
import type {SearchIndex, SearchResult, VietnamData} from "../types";

interface SearchSectionProps {
    onSearch: (query: string) => SearchResult[];
    onProvinceSelect: (provinceName: string) => void;
    selectedProvince: string | null;
    relatedProvinces: string[];
    searchIndex: SearchIndex | null;
    vietnamData: VietnamData | null;
}

export function SearchSection({
                                  onProvinceSelect,
                                  selectedProvince,
                                  searchIndex,
                                  vietnamData
                              }: SearchSectionProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [localSearchIndex, setLocalSearchIndex] = useState<SearchIndex | null>(null);

    useEffect(() => {
        if (vietnamData && !localSearchIndex) {
            const index = createSearchIndex(vietnamData);
            setLocalSearchIndex(index);
        }
    }, [vietnamData, localSearchIndex]);

    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);

        if (query.length < 2) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        const index = searchIndex || localSearchIndex;
        if (!index) return;

        const results = [];
        const queryLower = query.toLowerCase();

        // Search in oldToNew
        for (const [oldName, searchResultsArray] of Object.entries(index.oldToNew)) {
            if (oldName.toLowerCase().includes(queryLower)) {
                results.push(...searchResultsArray);
            }
        }

        // Search in newToOld
        for (const [newName, searchResult] of Object.entries(index.newToOld)) {
            if (newName.toLowerCase().includes(queryLower)) {
                results.push(searchResult);
            }
        }

        // Search in provinces
        for (const [provinceName] of Object.entries(index.provinces)) {
            if (provinceName.toLowerCase().includes(queryLower)) {
                results.push({
                    province: provinceName,
                    newName: provinceName,
                    isProvince: true,
                    oldNames: []
                });
            }
        }

        setSearchResults(results.slice(0, 10)); // Limit results
        setShowSearchResults(true);
    }, [searchIndex, localSearchIndex]);

    const handleResultClick = useCallback((result: SearchResult) => {
        if (result.isProvince) {
            onProvinceSelect(result.province);
        } else {
            onProvinceSelect(result.province);
        }
        setShowSearchResults(false);
        setSearchQuery('');
    }, [onProvinceSelect]);

    const handleProvinceClick = useCallback((provinceName: string) => {
        onProvinceSelect(provinceName);
    }, [onProvinceSelect]);

    const getProvincesList = useCallback(() => {
        const index = searchIndex || localSearchIndex;
        if (!index) return [];

        return Object.keys(index.provinces).sort();
    }, [searchIndex, localSearchIndex]);

    const getProvinceInfo = useCallback((provinceName: string) => {
        const index = searchIndex || localSearchIndex;
        if (!index || !index.provinces[provinceName]) return null;

        return index.provinces[provinceName];
    }, [searchIndex, localSearchIndex]);

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Search Provinces</h2>

            {/* Search Input */}
            <div className="relative mb-6">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search for old or new province names..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {searchResults.map((result, index) => (
                            <div
                                key={index}
                                onClick={() => handleResultClick(result)}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                            >
                                <div className="font-medium text-blue-600">
                                    {result.newName}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Province: {result.province}
                                </div>
                                {result.oldNames && result.oldNames.length > 0 && (
                                    <div className="text-sm text-gray-500">
                                        Old names: {result.oldNames.map((oldName: string, idx: number) => (
                                        <span key={idx}>
                                            {oldName}
                                            {idx < result.oldNames!.length - 1 ? ', ' : ''}
                                        </span>
                                    ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Provinces List */}
            <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">All Provinces</h3>
                <div className="max-h-40 overflow-y-auto">
                    {getProvincesList().map((provinceName) => (
                        <div
                            key={provinceName}
                            onClick={() => handleProvinceClick(provinceName)}
                            className={`px-3 py-2 rounded cursor-pointer mb-1 ${
                                selectedProvince === provinceName
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                        >
                            {provinceName}
                        </div>
                    ))}
                </div>
            </div>

            {/* Province Details */}
            {selectedProvince && (
                <div className="border-t pt-4">
                    <h3 className="text-lg font-medium mb-3">
                        {selectedProvince} Details
                    </h3>

                    {(() => {
                        const provinceInfo = getProvinceInfo(selectedProvince);

                        if (provinceInfo) {
                            return (
                                <div className="space-y-3">
                                    <div className="text-sm text-gray-600">
                                        <strong>Total Units:</strong> {provinceInfo.units}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <strong>Total Old Units:</strong> {provinceInfo.totalOldUnits}
                                    </div>

                                    <div className="max-h-40 overflow-y-auto">
                                        <h4 className="font-medium mb-2">Units:</h4>
                                        {provinceInfo.unitsList.map((unit: { newName: string; oldNames: string[] }, index: number) => (
                                            <div key={index} className="mb-2 p-2 bg-gray-50 rounded">
                                                <div className="font-medium text-sm">
                                                    {unit.newName}
                                                </div>
                                                {unit.oldNames.length > 0 && (
                                                    <div className="text-xs text-gray-600 mt-1">
                                                        From: {unit.oldNames.map((oldName: string, idx: number) => (
                                                        <span key={idx}>
                                                            {oldName}
                                                            {idx < unit.oldNames.length - 1 ? ', ' : ''}
                                                        </span>
                                                    ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div className="text-sm text-gray-600">
                                No details available for this province.
                            </div>
                        );
                    })()}
                </div>
            )}
        </div>
    );
}