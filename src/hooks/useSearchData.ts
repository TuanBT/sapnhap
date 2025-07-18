
import { useState, useEffect, useCallback } from 'react';
import { loadSearchData } from '../utils/parseJsonData';
import { normalizeForSearch, createSearchKeywords } from '../utils/searchUtils';
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

    // Phát hiện cấp hành chính từ query và loại bỏ từ khóa cấp
    const detectAdministrativeLevel = useCallback((query: string): { level: 'province' | 'district' | 'commune' | 'all', cleanQuery: string } => {
        const normalizedQuery = normalizeForSearch(query);

        // Từ khóa cấp tỉnh/thành phố
        const provinceKeywords = ['tinh', 'thanh pho', 'tp'];

        // Từ khóa cấp quận/huyện
        const districtKeywords = ['quan', 'huyen', 'thi xa'];

        // Từ khóa cấp xã/phường
        const communeKeywords = ['xa', 'phuong', 'thi tran'];

        // Kiểm tra và loại bỏ từ khóa cấp tỉnh
        for (const keyword of provinceKeywords) {
            if (normalizedQuery.includes(keyword)) {
                const cleanQuery = normalizedQuery.replace(new RegExp(`\\b${keyword}\\b`, 'g'), '').trim().replace(/\s+/g, ' ');
                return { level: 'province', cleanQuery };
            }
        }

        // Kiểm tra và loại bỏ từ khóa cấp huyện
        for (const keyword of districtKeywords) {
            if (normalizedQuery.includes(keyword)) {
                const cleanQuery = normalizedQuery.replace(new RegExp(`\\b${keyword}\\b`, 'g'), '').trim().replace(/\s+/g, ' ');
                return { level: 'district', cleanQuery };
            }
        }

        // Kiểm tra và loại bỏ từ khóa cấp xã
        for (const keyword of communeKeywords) {
            if (normalizedQuery.includes(keyword)) {
                const cleanQuery = normalizedQuery.replace(new RegExp(`\\b${keyword}\\b`, 'g'), '').trim().replace(/\s+/g, ' ');
                return { level: 'commune', cleanQuery };
            }
        }

        return { level: 'all', cleanQuery: normalizedQuery };
    }, []);

    // Tính điểm tương đồng cụm từ chính xác - CHỈ TÌM CỤM TỪ LIÊN TIẾP
    const calculateExactPhraseScore = useCallback((query: string, text: string): number => {
        const normalizedQuery = normalizeForSearch(query);
        const normalizedText = normalizeForSearch(text);

        // Exact match toàn bộ cụm từ
        if (normalizedText === normalizedQuery) return 100;

        // Chứa toàn bộ cụm từ (exact phrase)
        if (normalizedText.includes(normalizedQuery)) return 90;

        // Bắt đầu bằng cụm từ
        if (normalizedText.startsWith(normalizedQuery)) return 85;

        // Kết thúc bằng cụm từ
        if (normalizedText.endsWith(normalizedQuery)) return 80;

        // Tách từ và kiểm tra match liên tiếp CHÍNH XÁC
        const queryWords = normalizedQuery.split(' ').filter(w => w.length > 0);
        const textWords = normalizedText.split(' ').filter(w => w.length > 0);

        if (queryWords.length === 1) {
            // Tìm từ đơn
            const queryWord = queryWords[0];
            for (const textWord of textWords) {
                if (textWord === queryWord) return 75;
                if (textWord.includes(queryWord) && queryWord.length >= 3) return 70;
            }
        } else {
            // Tìm cụm từ nhiều từ - PHẢI LIÊN TIẾP VÀ CHÍNH XÁC
            for (let i = 0; i <= textWords.length - queryWords.length; i++) {
                let exactMatches = 0;
                let partialMatches = 0;

                // Kiểm tra từng từ trong cụm
                for (let j = 0; j < queryWords.length; j++) {
                    const queryWord = queryWords[j];
                    const textWord = textWords[i + j];

                    if (textWord === queryWord) {
                        exactMatches++;
                    } else if (textWord && textWord.includes(queryWord) && queryWord.length >= 3) {
                        partialMatches++;
                    } else if (textWord && queryWord.includes(textWord) && textWord.length >= 3) {
                        partialMatches += 0.5;
                    } else {
                        // Nếu không match, break luôn vì cần cụm liên tiếp
                        break;
                    }
                }

                // Chỉ chấp nhận nếu tất cả từ đều match
                if (exactMatches === queryWords.length) {
                    return 75; // Perfect consecutive match
                }
                if (exactMatches + partialMatches >= queryWords.length && exactMatches >= queryWords.length * 0.7) {
                    return 70; // Good consecutive match with some partial
                }
            }
        }

        return 0; // Không tìm thấy cụm từ liên tiếp
    }, []);

    const search = useCallback((query: string): FlatSearchItem[] => {
        if (!query.trim()) {
            return [];
        }

        // Phát hiện cấp hành chính và lấy query sạch
        const { level: targetLevel, cleanQuery } = detectAdministrativeLevel(query);

        if (cleanQuery.length < 2) {
            return [];
        }

        const results: Array<{ item: FlatSearchItem; score: number }> = [];

        for (let i = 0; i < data.length; i++) {
            const item = data[i];

            // Nếu có target level cụ thể, chỉ tìm trong cấp đó
            if (targetLevel !== 'all' && item.level !== targetLevel) {
                continue;
            }

            let maxScore = 0;

            // Tìm trong search text (chính xác nhất)
            const searchTextScore = calculateExactPhraseScore(cleanQuery, item.normalizedSearchText);
            maxScore = Math.max(maxScore, searchTextScore);

            // Tìm trong tên (ưu tiên thứ hai)
            const nameScore = calculateExactPhraseScore(cleanQuery, item.normalizedName);
            maxScore = Math.max(maxScore, nameScore * 0.95);

            // Tìm trong keywords (ưu tiên thấp nhất) - CHỈ TÌM EXACT PHRASE
            const keywordScore = item.searchKeywords.reduce((best, keyword) => {
                return Math.max(best, calculateExactPhraseScore(cleanQuery, keyword));
            }, 0);
            maxScore = Math.max(maxScore, keywordScore * 0.8);

            // Chỉ lấy kết quả có điểm cao (tương đồng thực sự)
            if (maxScore >= 65) {
                results.push({ item, score: maxScore });
            }
        }

        // Sort và prioritize results
        const sortedResults = results.sort((a, b) => {
            // Nếu có target level, ưu tiên cấp đó
            if (targetLevel !== 'all') {
                if (a.item.level === targetLevel && b.item.level !== targetLevel) return -1;
                if (b.item.level === targetLevel && a.item.level !== targetLevel) return 1;
            }

            // Sort by score (cao nhất trước)
            if (b.score !== a.score) {
                return b.score - a.score;
            }

            return a.item.name.localeCompare(b.item.name, 'vi');
        });

        // Limit results based on target level
        const maxResults = targetLevel !== 'all' ? 15 : 30;

        return sortedResults
            .slice(0, maxResults)
            .map(result => result.item);
    }, [data, detectAdministrativeLevel, calculateExactPhraseScore]);

    return {
        search,
        loading,
        error,
        totalItems: data.length,
        reload: loadData
    };
}