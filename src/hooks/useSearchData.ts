
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

        // Không có prefix rõ ràng - giữ nguyên query và tìm tất cả
        return { level: 'all', cleanQuery: normalizedQuery };
    }, []);

    // Hàm kiểm tra exact phrase match
    const isExactPhraseMatch = useCallback((query: string, text: string): boolean => {
        const normalizedQuery = normalizeForSearch(query);
        const normalizedText = normalizeForSearch(text);

        // Tạo regex với word boundaries để match chính xác cụm từ
        const regex = new RegExp(`\\b${normalizedQuery.replace(/\s+/g, '\\s+')}\\b`, 'i');
        return regex.test(normalizedText);
    }, []);

    // Improved search function with exact phrase matching
    const search = useCallback((query: string): FlatSearchItem[] => {
        if (!query.trim()) {
            return [];
        }

        const { level: targetLevel, cleanQuery } = detectAdministrativeLevel(query);
        const originalQuery = normalizeForSearch(query);

        if (cleanQuery.length < 1) {
            return [];
        }

        const results: Array<{ item: FlatSearchItem; score: number }> = [];

        // Search through all items
        for (let i = 0; i < data.length; i++) {
            const item = data[i];

            // Nếu có target level cụ thể, chỉ tìm trong cấp đó
            if (targetLevel !== 'all' && item.level !== targetLevel) {
                continue;
            }

            let score = 0;

            // 1. EXACT MATCH toàn bộ query (highest priority)
            if (isExactPhraseMatch(originalQuery, item.normalizedSearchText)) {
                score = 100;
            }
            // 2. EXACT MATCH với clean query (khi có prefix)
            else if (originalQuery !== cleanQuery && isExactPhraseMatch(cleanQuery, item.normalizedSearchText)) {
                score = 95;
            }
            // 3. Đối với commune level, kiểm tra exact match trong từng field
            else if (item.level === 'commune') {
                // Kiểm tra trong newUnit ward
                if (item.newUnit?.ward && isExactPhraseMatch(originalQuery, item.newUnit.ward)) {
                    score = 90;
                }

                // Kiểm tra trong oldUnits ward
                if (score === 0 && item.oldUnits) {
                    for (const oldUnit of item.oldUnits) {
                        if (oldUnit.ward && isExactPhraseMatch(originalQuery, oldUnit.ward)) {
                            score = 85;
                            break;
                        }
                    }
                }
            }
            // 4. Fallback: contains (lowest priority)
            else if (item.normalizedSearchText.includes(cleanQuery)) {
                score = 50; // Giảm điểm thấp hơn để ưu tiên exact match
            }

            // Đặc biệt: Tìm kiếm số (như "3", "1", "2") cần match word boundary
            if (score === 0 && cleanQuery.match(/^\d+$/)) {
                const wordBoundaryRegex = new RegExp(`\\b${cleanQuery}\\b`);
                if (wordBoundaryRegex.test(item.normalizedSearchText)) {
                    score = 60;
                }
            }

            if (score > 0) {
                results.push({ item, score });
            }
        }

        // Sort by score với ưu tiên cao hơn cho exact matches
        const sortedResults = results.sort((a, b) => {
            // Ưu tiên điểm số cao (exact match)
            if (b.score !== a.score) {
                return b.score - a.score;
            }

            // Ưu tiên district và commune hơn province cho query chứa "thanh pho"
            if (cleanQuery.includes('thanh pho')) {
                if (a.item.level === 'district' && b.item.level !== 'district') return -1;
                if (b.item.level === 'district' && a.item.level !== 'district') return 1;
                if (a.item.level === 'commune' && b.item.level === 'province') return -1;
                if (b.item.level === 'commune' && a.item.level === 'province') return 1;
            }

            return a.item.name.localeCompare(b.item.name, 'vi');
        });

        return sortedResults.slice(0, 100).map(result => result.item);
    }, [data, detectAdministrativeLevel, isExactPhraseMatch]);

    return {
        search,
        loading,
        error,
        totalItems: data.length,
        reload: loadData
    };
}