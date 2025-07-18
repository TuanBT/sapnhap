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

    // Hàm tách loại hình đơn vị và tên
    const parseAdministrativeText = useCallback((text: string): { type: string; name: string } => {
        const normalized = normalizeForSearch(text);

        // Các pattern để tách loại hình
        const patterns = [
            { regex: /^(xa)\s+(.+)$/, type: 'xa' },
            { regex: /^(phuong)\s+(.+)$/, type: 'phuong' },
            { regex: /^(thi tran)\s+(.+)$/, type: 'thi tran' },
            { regex: /^(quan)\s+(.+)$/, type: 'quan' },
            { regex: /^(huyen)\s+(.+)$/, type: 'huyen' },
            { regex: /^(thi xa)\s+(.+)$/, type: 'thi xa' },
            { regex: /^(thanh pho)\s+(.+)$/, type: 'thanh pho' },
            { regex: /^(tinh)\s+(.+)$/, type: 'tinh' }
        ];

        for (const pattern of patterns) {
            const match = normalized.match(pattern.regex);
            if (match) {
                return { type: match[1], name: match[2] };
            }
        }

        return { type: '', name: normalized };
    }, []);

    // Hàm kiểm tra exact match có phân biệt loại hình
    const isExactAdministrativeMatch = useCallback((queryText: string, targetText: string): boolean => {
        const queryParsed = parseAdministrativeText(queryText);
        const targetParsed = parseAdministrativeText(targetText);

        // Nếu query có loại hình cụ thể, phải match chính xác cả loại hình và tên
        if (queryParsed.type) {
            return queryParsed.type === targetParsed.type && queryParsed.name === targetParsed.name;
        }

        // Nếu query không có loại hình, chỉ cần match tên
        return queryParsed.name === targetParsed.name;
    }, [parseAdministrativeText]);

    // Ultra-strict search function
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

            // 1. Kiểm tra exact match với administrative type awareness
            if (item.level === 'commune') {
                // Kiểm tra trong newUnit ward
                if (item.newUnit?.ward && isExactAdministrativeMatch(originalQuery, item.newUnit.ward)) {
                    score = 100;
                }

                // Kiểm tra trong oldUnits ward
                if (score === 0 && item.oldUnits) {
                    for (const oldUnit of item.oldUnits) {
                        if (oldUnit.ward && isExactAdministrativeMatch(originalQuery, oldUnit.ward)) {
                            score = 95;
                            break;
                        }
                    }
                }
            }
            else if (item.level === 'district') {
                if (item.oldDistrict && isExactAdministrativeMatch(originalQuery, item.oldDistrict)) {
                    score = 90;
                }
                else if (item.newDistrict && isExactAdministrativeMatch(originalQuery, item.newDistrict)) {
                    score = 85;
                }
            }
            else if (item.level === 'province') {
                if (item.oldProvince && isExactAdministrativeMatch(originalQuery, item.oldProvince)) {
                    score = 80;
                }
                else if (item.newProvince && isExactAdministrativeMatch(originalQuery, item.newProvince)) {
                    score = 75;
                }
            }

            // 2. Fallback: Exact match trong searchText (cho các trường hợp đặc biệt)
            if (score === 0) {
                // Tạo regex chính xác với word boundary
                const escapedQuery = originalQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`\\b${escapedQuery}\\b`, 'i');

                if (regex.test(item.normalizedSearchText)) {
                    score = 70;
                }
            }

            // 3. Đặc biệt: Tìm kiếm số (như "3", "1", "2")
            if (score === 0 && cleanQuery.match(/^\d+$/)) {
                const wordBoundaryRegex = new RegExp(`\\b${cleanQuery}\\b`);
                if (wordBoundaryRegex.test(item.normalizedSearchText)) {
                    score = 60;
                }
            }

            // CHỈ THÊM VÀO RESULTS NẾU CÓ ĐIỂM SỐ
            if (score > 0) {
                results.push({ item, score });
            }
        }

        // Sort by score
        const sortedResults = results.sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            return a.item.name.localeCompare(b.item.name, 'vi');
        });

        return sortedResults.slice(0, 30).map(result => result.item);
    }, [data, detectAdministrativeLevel, isExactAdministrativeMatch]);

    return {
        search,
        loading,
        error,
        totalItems: data.length,
        reload: loadData
    };
}