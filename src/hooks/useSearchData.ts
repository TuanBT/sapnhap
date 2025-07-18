import { useState, useEffect, useCallback } from 'react';
import { loadSearchData } from '../utils/parseJsonData';
import { normalizeForSearch } from '../utils/searchUtils';
import type { SearchItem, BaseSearchItem } from '../types/administrative';

export interface FlatSearchItem extends BaseSearchItem {
    normalizedSearchText: string;
    originalSearchText: string;
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

            const flatItems: FlatSearchItem[] = searchItems.map((item: SearchItem) => {
                const normalizedSearchText = normalizeForSearch(item.searchText);
                const originalSearchText = item.searchText.toLowerCase().trim();

                return {
                    ...item,
                    normalizedSearchText,
                    originalSearchText,
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

    const calculateAccentScore = useCallback((query: string, target: string): number => {
        const queryLower = query.toLowerCase().trim();
        const targetLower = target.toLowerCase().trim();

        if (queryLower === targetLower) {
            return 100;
        }

        const queryWords = queryLower.split(/\s+/);
        const targetWords = targetLower.split(/\s+/);

        let totalScore = 0;
        let matchedWords = 0;

        for (const queryWord of queryWords) {
            let bestWordScore = 0;

            for (const targetWord of targetWords) {
                if (queryWord === targetWord) {
                    bestWordScore = 100;
                    break;
                }
                else if (targetWord.includes(queryWord)) {
                    bestWordScore = Math.max(bestWordScore, 95);
                }
                else if (normalizeForSearch(queryWord) === normalizeForSearch(targetWord)) {
                    bestWordScore = Math.max(bestWordScore, 70);
                }
                else if (normalizeForSearch(targetWord).includes(normalizeForSearch(queryWord))) {
                    bestWordScore = Math.max(bestWordScore, 50);
                }
            }

            if (bestWordScore > 0) {
                totalScore += bestWordScore;
                matchedWords++;
            }
        }

        return matchedWords > 0 ? Math.round(totalScore / queryWords.length) : 0;
    }, []);

    const detectAdministrativeLevel = useCallback((query: string): { level: 'province' | 'district' | 'commune' | 'all', cleanQuery: string } => {
        const normalizedQuery = normalizeForSearch(query);

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

        return { level: 'all', cleanQuery: normalizedQuery };
    }, []);

    const parseAdministrativeText = useCallback((text: string): { type: string; name: string; originalText: string } => {
        const originalText = text.toLowerCase().trim();
        const normalized = normalizeForSearch(text);

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
                return { type: match[1], name: match[2], originalText };
            }
        }

        return { type: '', name: normalized, originalText };
    }, []);

    const isExactAdministrativeMatch = useCallback((queryText: string, targetText: string): boolean => {
        const queryParsed = parseAdministrativeText(queryText);
        const targetParsed = parseAdministrativeText(targetText);

        if (queryParsed.type) {
            return queryParsed.type === targetParsed.type && queryParsed.name === targetParsed.name;
        } else {
            return queryParsed.name === targetParsed.name;
        }
    }, [parseAdministrativeText]);

    const isExactAccentMatch = useCallback((queryText: string, targetText: string): boolean => {
        const queryLower = queryText.toLowerCase().trim();
        const targetLower = targetText.toLowerCase().trim();

        const queryParsed = parseAdministrativeText(queryText);
        const targetParsed = parseAdministrativeText(targetText);

        if (queryParsed.type) {
            return queryParsed.originalText === targetParsed.originalText;
        } else {
            return queryLower === targetLower;
        }
    }, [parseAdministrativeText]);

    const calculatePriorityTier = useCallback((query: string, target: string): number => {
        const queryLower = query.toLowerCase().trim();
        const targetLower = target.toLowerCase().trim();

        // Tier 1: Perfect exact match (100)
        if (queryLower === targetLower) {
            return 100;
        }

        // Tier 2: Contains exact query with accents (90)
        if (targetLower.includes(queryLower)) {
            return 90;
        }

        // Tier 3: Normalized match (70)
        if (normalizeForSearch(queryLower) === normalizeForSearch(targetLower)) {
            return 70;
        }

        // Tier 4: Normalized contains (50)
        if (normalizeForSearch(targetLower).includes(normalizeForSearch(queryLower))) {
            return 50;
        }

        return 0;
    }, []);

    const search = useCallback((query: string): FlatSearchItem[] => {
        if (!query.trim()) {
            return [];
        }

        const { level: targetLevel, cleanQuery } = detectAdministrativeLevel(query);
        const originalQuery = normalizeForSearch(query);

        if (cleanQuery.length < 1) {
            return [];
        }

        const results: Array<{
            item: FlatSearchItem;
            score: number;
            accentScore: number;
            priorityTier: number;
            matchedTarget: string
        }> = [];

        for (let i = 0; i < data.length; i++) {
            const item = data[i];

            if (targetLevel !== 'all' && item.level !== targetLevel) {
                continue;
            }

            let score = 0;
            let accentScore = 0;
            let priorityTier = 0;
            let matchedTarget = '';

            if (item.level === 'commune') {
                if (item.newUnit?.ward && isExactAdministrativeMatch(query, item.newUnit.ward)) {
                    score = 100;
                    matchedTarget = item.newUnit.ward;
                    priorityTier = calculatePriorityTier(query, item.newUnit.ward);
                    accentScore = isExactAccentMatch(query, item.newUnit.ward) ? 100 : 70;
                }

                if (score === 0 && item.oldUnits) {
                    for (const oldUnit of item.oldUnits) {
                        if (oldUnit.ward && isExactAdministrativeMatch(query, oldUnit.ward)) {
                            score = 95;
                            matchedTarget = oldUnit.ward;
                            priorityTier = calculatePriorityTier(query, oldUnit.ward);
                            accentScore = isExactAccentMatch(query, oldUnit.ward) ? 100 : 70;
                            break;
                        }
                    }
                }
            }
            else if (item.level === 'district') {
                if (item.oldDistrict && isExactAdministrativeMatch(query, item.oldDistrict)) {
                    score = 90;
                    matchedTarget = item.oldDistrict;
                    priorityTier = calculatePriorityTier(query, item.oldDistrict);
                    accentScore = isExactAccentMatch(query, item.oldDistrict) ? 100 : 70;
                }
                else if (item.newDistrict && isExactAdministrativeMatch(query, item.newDistrict)) {
                    score = 85;
                    matchedTarget = item.newDistrict;
                    priorityTier = calculatePriorityTier(query, item.newDistrict);
                    accentScore = isExactAccentMatch(query, item.newDistrict) ? 100 : 70;
                }
            }
            else if (item.level === 'province') {
                if (item.oldProvince && isExactAdministrativeMatch(query, item.oldProvince)) {
                    score = 80;
                    matchedTarget = item.oldProvince;
                    priorityTier = calculatePriorityTier(query, item.oldProvince);
                    accentScore = isExactAccentMatch(query, item.oldProvince) ? 100 : 70;
                }
                else if (item.newProvince && isExactAdministrativeMatch(query, item.newProvince)) {
                    score = 75;
                    matchedTarget = item.newProvince;
                    priorityTier = calculatePriorityTier(query, item.newProvince);
                    accentScore = isExactAccentMatch(query, item.newProvince) ? 100 : 70;
                }
            }

            if (score === 0) {
                const escapedQuery = originalQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`\\b${escapedQuery}\\b`, 'i');

                if (regex.test(item.normalizedSearchText)) {
                    score = 70;
                    accentScore = calculateAccentScore(query, item.originalSearchText);
                    priorityTier = 40;
                }
            }

            if (score === 0 && cleanQuery.match(/^\d+$/)) {
                const wordBoundaryRegex = new RegExp(`\\b${cleanQuery}\\b`);
                if (wordBoundaryRegex.test(item.normalizedSearchText)) {
                    score = 60;
                    accentScore = 50;
                    priorityTier = 30;
                }
            }

            if (score > 0) {
                results.push({ item, score, accentScore, priorityTier, matchedTarget });
            }
        }

        // Sort by priority tier first, then score, then accent score, then name
        const sortedResults = results.sort((a, b) => {
            if (b.priorityTier !== a.priorityTier) {
                return b.priorityTier - a.priorityTier;
            }

            if (b.score !== a.score) {
                return b.score - a.score;
            }

            if (b.accentScore !== a.accentScore) {
                return b.accentScore - a.accentScore;
            }

            return a.item.name.localeCompare(b.item.name, 'vi');
        });

        return sortedResults.slice(0, 30).map(result => result.item);
    }, [data, detectAdministrativeLevel, isExactAdministrativeMatch, isExactAccentMatch, calculatePriorityTier, calculateAccentScore]);

    return {
        search,
        loading,
        error,
        totalItems: data.length,
        reload: loadData
    };
}