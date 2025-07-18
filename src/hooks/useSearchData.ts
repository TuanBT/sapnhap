
import { useState, useEffect, useCallback } from 'react';
import { loadSearchData } from '../utils/parseJsonData';
import { normalizeForSearch } from '../utils/searchUtils';
import type { SearchItem, BaseSearchItem } from '../types/administrative';

export interface FlatSearchItem extends BaseSearchItem {
    // Simplified search fields
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
                const normalizedSearchText = normalizeForSearch(item.searchText);

                return {
                    ...item,
                    normalizedSearchText,
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

    // Detect level from query - CHỈ KHI CÓ PREFIX RÕ RÀNG Ở ĐẦU
    const detectAdministrativeLevel = useCallback((query: string): { level: 'province' | 'district' | 'commune' | 'all', cleanQuery: string } => {
        const normalizedQuery = normalizeForSearch(query);

        // CHỈ detect level khi có prefix rõ ràng ở đầu VÀ theo sau là khoảng trắng
        if (normalizedQuery.match(/^tinh\s+/)) {
            const cleanQuery = normalizedQuery.replace(/^tinh\s+/, '');
            return { level: 'province', cleanQuery };
        }

        if (normalizedQuery.match(/^(quan|huyen|thi xa)\s+/)) {
            const cleanQuery = normalizedQuery.replace(/^(quan|huyen|thi xa)\s+/, '');
            return { level: 'district', cleanQuery };
        }

        if (normalizedQuery.match(/^(xa|phuong|thi tran)\s+/)) {
            const cleanQuery = normalizedQuery.replace(/^(xa|phuong|thi tran)\s+/, '');
            return { level: 'commune', cleanQuery };
        }

        // KHÔNG detect "thanh pho" vì nó có thể là:
        // - "Thành phố Hà Nội" (cấp tỉnh)
        // - "Thành phố Tuy Hòa" (cấp huyện)
        // Để tránh nhầm lẫn, không detect level và tìm tất cả

        // Không có prefix rõ ràng - giữ nguyên query và tìm tất cả
        return { level: 'all', cleanQuery: normalizedQuery };
    }, []);

    // Simplified search function
    const search = useCallback((query: string): FlatSearchItem[] => {
        if (!query.trim()) {
            return [];
        }

        const { level: targetLevel, cleanQuery } = detectAdministrativeLevel(query);

        // Giảm minimum length xuống 1 để cho phép tìm "3", "1", "2" etc.
        if (cleanQuery.length < 1) {
            return [];
        }

        const results: Array<{ item: FlatSearchItem; score: number }> = [];

        // Simple linear search
        for (let i = 0; i < data.length; i++) {
            const item = data[i];

            // Nếu có target level cụ thể, chỉ tìm trong cấp đó
            if (targetLevel !== 'all' && item.level !== targetLevel) {
                continue;
            }

            let score = 0;

            // Check exact match
            if (item.normalizedSearchText === cleanQuery) {
                score = 100;
            }
            // Check contains
            else if (item.normalizedSearchText.includes(cleanQuery)) {
                score = 90;
            }
            // Check starts with
            else if (item.normalizedSearchText.startsWith(cleanQuery)) {
                score = 85;
            }

            // Đặc biệt: Tìm kiếm số (như "3", "1", "2") cần match word boundary
            if (cleanQuery.match(/^\d+$/)) {
                const wordBoundaryRegex = new RegExp(`\\b${cleanQuery}\\b`);
                if (wordBoundaryRegex.test(item.normalizedSearchText)) {
                    score = Math.max(score, 85);
                }
            }

            if (score > 0) {
                results.push({ item, score });
            }
        }

        // Sort by score và prioritize theo level
        const sortedResults = results.sort((a, b) => {
            // Ưu tiên district và commune hơn province cho query chứa "thanh pho"
            if (cleanQuery.includes('thanh pho')) {
                if (a.item.level === 'district' && b.item.level !== 'district') return -1;
                if (b.item.level === 'district' && a.item.level !== 'district') return 1;
                if (a.item.level === 'commune' && b.item.level === 'province') return -1;
                if (b.item.level === 'commune' && a.item.level === 'province') return 1;
            }

            if (b.score !== a.score) {
                return b.score - a.score;
            }
            return a.item.name.localeCompare(b.item.name, 'vi');
        });

        return sortedResults.slice(0, 100).map(result => result.item);
    }, [data, detectAdministrativeLevel]);

    return {
        search,
        loading,
        error,
        totalItems: data.length,
        reload: loadData
    };
}