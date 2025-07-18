import { useState, useEffect, useCallback } from 'react';
import { loadSearchData } from '../utils/parseJsonData';
import { normalizeForSearch, createSearchKeywords, calculateSimilarity } from '../utils/searchUtils';
import type { SearchItem, BaseSearchItem } from '../types/administrative';

export interface FlatSearchItem extends BaseSearchItem {
    // Thêm indexed search fields
    searchKeywords: string[];
    normalizedName: string;
    normalizedSearchText: string;
    // Thêm các fields từ SearchItem
    newUnit?: any;
    oldUnits?: any[];
    document?: string;
    oldProvince?: string;
    newProvince?: string;
    oldDistrict?: string;
    newDistrict?: string;
}

export function useSearchData() {
    const [data, setData] = useState<FlatSearchItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const searchItems = await loadSearchData();

            // Tối ưu data với pre-computed search fields
            const flatItems: FlatSearchItem[] = searchItems.map((item: SearchItem) => {
                const allTexts = [
                    item.searchText,
                    item.level === 'commune' ? item.document : ''
                ].join(' ');

                const searchKeywords = createSearchKeywords(allTexts);

                return {
                    ...item,
                    searchKeywords,
                    normalizedName: normalizeForSearch(item.name),
                    normalizedSearchText: normalizeForSearch(item.searchText),
                } as FlatSearchItem;
            });

            setData(flatItems);
        } catch (err) {
            console.error('Error loading data:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const search = useCallback((query: string): FlatSearchItem[] => {
        if (!query.trim()) {
            return [];
        }

        const normalizedQuery = normalizeForSearch(query);
        const queryWords = normalizedQuery.split(' ').filter(word => word.length > 0);

        if (normalizedQuery.length < 2) {
            return [];
        }

        const results: Array<{ item: FlatSearchItem; score: number }> = [];

        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            let maxScore = 0;

            // Check name match
            const nameScore = calculateSimilarity(normalizedQuery, item.normalizedName);
            maxScore = Math.max(maxScore, nameScore);

            // Check search text match
            const searchTextScore = calculateSimilarity(normalizedQuery, item.normalizedSearchText);
            maxScore = Math.max(maxScore, searchTextScore * 0.9);

            // Check với search keywords
            const keywordScore = item.searchKeywords.reduce((best, keyword) => {
                return Math.max(best, calculateSimilarity(normalizedQuery, keyword));
            }, 0);
            maxScore = Math.max(maxScore, keywordScore * 0.8);

            // Multi-word query
            if (queryWords.length > 1) {
                let wordMatches = 0;
                queryWords.forEach(word => {
                    if (item.searchKeywords.some(keyword => keyword.includes(word))) {
                        wordMatches++;
                    }
                });

                if (wordMatches > 0) {
                    const multiWordScore = 60 * (wordMatches / queryWords.length);
                    maxScore = Math.max(maxScore, multiWordScore);
                }
            }

            if (maxScore >= 30) {
                results.push({ item, score: maxScore });
            }
        }

        return results
            .sort((a, b) => {
                if (b.score !== a.score) {
                    return b.score - a.score;
                }
                return a.item.name.localeCompare(b.item.name, 'vi');
            })
            .slice(0, 100)
            .map(result => result.item);
    }, [data]);

    return {
        search,
        loading,
        error,
        totalItems: data.length,
        reload: loadData
    };
}