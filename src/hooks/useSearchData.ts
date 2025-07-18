import { useState, useEffect, useCallback } from 'react';
import { loadSearchData } from '../utils/parseData';
import { normalizeForSearch, createSearchKeywords, calculateSimilarity } from '../utils/searchUtils';

export interface AdministrativeUnit {
    province: string;
    district: string;
    ward: string;
}

export interface FlatItem {
    id: string;
    name: string;
    type: 'commune';
    newUnit: AdministrativeUnit;
    oldUnits: AdministrativeUnit[];
    document: string;
    fullPath: string;
    searchText: string;
    // Thêm indexed search fields
    searchKeywords: string[];
    normalizedNewWard: string;
    normalizedOldWards: string[];
    normalizedProvince: string;
}

export function useSearchData() {
    const [data, setData] = useState<FlatItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const searchItems = await loadSearchData();

            // Tối ưu data với pre-computed search fields
            const flatItems: FlatItem[] = searchItems.map(item => {
                // Tạo search keywords từ tất cả các trường
                const allTexts = [
                    item.newUnit.province,
                    item.newUnit.ward,
                    ...item.oldUnits.map(unit => `${unit.province} ${unit.district} ${unit.ward}`),
                    item.document
                ].join(' ');

                const searchKeywords = createSearchKeywords(allTexts);

                return {
                    ...item,
                    searchKeywords,
                    normalizedNewWard: normalizeForSearch(item.newUnit.ward),
                    normalizedOldWards: item.oldUnits.map(unit => normalizeForSearch(unit.ward)),
                    normalizedProvince: normalizeForSearch(item.newUnit.province),
                };
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

    // Tối ưu search với fuzzy matching
    const search = useCallback((query: string): FlatItem[] => {
        if (!query.trim()) {
            return [];
        }

        const normalizedQuery = normalizeForSearch(query);
        const queryWords = normalizedQuery.split(' ').filter(word => word.length > 0);

        // Nếu query quá ngắn, yêu cầu ít nhất 2 ký tự
        if (normalizedQuery.length < 2) {
            return [];
        }

        const results: Array<{ item: FlatItem; score: number }> = [];

        // Sử dụng for loop cho performance tốt hơn
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            let maxScore = 0;

            // Check exact và fuzzy match với new ward
            const newWardScore = calculateSimilarity(normalizedQuery, item.normalizedNewWard);
            maxScore = Math.max(maxScore, newWardScore);

            // Check với old ward
            item.normalizedOldWards.forEach(oldWard => {
                const oldWardScore = calculateSimilarity(normalizedQuery, oldWard);
                maxScore = Math.max(maxScore, oldWardScore);
            });

            // Check với province
            const provinceScore = calculateSimilarity(normalizedQuery, item.normalizedProvince);
            maxScore = Math.max(maxScore, provinceScore * 0.8); // Giảm trọng số cho province

            // Check với search keywords
            const keywordScore = item.searchKeywords.reduce((best, keyword) => {
                return Math.max(best, calculateSimilarity(normalizedQuery, keyword));
            }, 0);
            maxScore = Math.max(maxScore, keywordScore * 0.9);

            // Check multi-word query
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

            // Chỉ lấy kết quả có score >= 30
            if (maxScore >= 30) {
                results.push({ item, score: maxScore });
            }
        }

        // Sort theo score giảm dần
        return results
            .sort((a, b) => {
                if (b.score !== a.score) {
                    return b.score - a.score;
                }
                // Nếu score bằng nhau, sort theo tên
                return a.item.newUnit.ward.localeCompare(b.item.newUnit.ward, 'vi');
            })
            .slice(0, 100) // Giới hạn 100 kết quả
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