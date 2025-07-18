
import { useState, useEffect, useCallback } from 'react';
import { loadSearchData } from '../utils/parseData';

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
    searchTerms: string[];
    newWardLower: string;
    oldWardsLower: string[];
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
                const searchTerms = [
                    item.newUnit.province,
                    item.newUnit.ward,
                    ...item.oldUnits.map(unit => `${unit.province} ${unit.district} ${unit.ward}`)
                ];

                return {
                    ...item,
                    searchTerms,
                    newWardLower: item.newUnit.ward.toLowerCase(),
                    oldWardsLower: item.oldUnits.map(unit => unit.ward.toLowerCase()),
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

    // Tối ưu search với early returns và pre-computed values
    const search = useCallback((query: string): FlatItem[] => {
        if (!query.trim()) {
            return [];
        }

        const lowerQuery = query.toLowerCase().trim();
        const results: FlatItem[] = [];

        // Sử dụng for loop thay vì filter cho performance tốt hơn
        for (let i = 0; i < data.length; i++) {
            const item = data[i];

            // Quick check với pre-computed fields
            if (item.newWardLower.includes(lowerQuery) ||
                item.oldWardsLower.some(ward => ward.includes(lowerQuery)) ||
                item.searchText.toLowerCase().includes(lowerQuery)) {
                results.push(item);
            }
        }

        // Tối ưu sorting
        return results.sort((a, b) => {
            // Exact match có priority cao nhất
            if (a.newWardLower === lowerQuery) return -1;
            if (b.newWardLower === lowerQuery) return 1;

            // Starts with có priority cao
            const aStartsWith = a.newWardLower.startsWith(lowerQuery);
            const bStartsWith = b.newWardLower.startsWith(lowerQuery);

            if (aStartsWith && !bStartsWith) return -1;
            if (!aStartsWith && bStartsWith) return 1;

            // Tên đơn vị mới match
            const aNameMatch = a.newWardLower.includes(lowerQuery);
            const bNameMatch = b.newWardLower.includes(lowerQuery);

            if (aNameMatch && !bNameMatch) return -1;
            if (!aNameMatch && bNameMatch) return 1;

            // Tên đơn vị cũ match
            const aOldMatch = a.oldWardsLower.some(ward => ward.includes(lowerQuery));
            const bOldMatch = b.oldWardsLower.some(ward => ward.includes(lowerQuery));

            if (aOldMatch && !bOldMatch) return -1;
            if (!aOldMatch && bOldMatch) return 1;

            return a.newUnit.ward.localeCompare(b.newUnit.ward);
        });
    }, [data]);

    return {
        search,
        loading,
        error,
        totalItems: data.length,
        reload: loadData
    };
}