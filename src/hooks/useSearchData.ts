
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

    // Thông tin mới (sau sắp xếp)
    newUnit: AdministrativeUnit;

    // Thông tin cũ (trước sắp xếp)
    oldUnits: AdministrativeUnit[];

    // Metadata
    document: string;
    fullPath: string;
    searchText: string; // Để tìm kiếm
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
            // Convert SearchItem[] to FlatItem[] if needed
            const flatItems: FlatItem[] = searchItems.map(item => ({
                ...item,
                // Add any additional transformations if needed
            }));

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

    const search = useCallback((query: string): FlatItem[] => {
        if (!query.trim()) {
            return [];
        }

        const lowerQuery = query.toLowerCase().trim();
        const results = data.filter(item => {
            return item.searchText.toLowerCase().includes(lowerQuery);
        });

        // Sắp xếp kết quả theo độ liên quan
        return results.sort((a, b) => {
            // Ưu tiên tên đơn vị mới
            const aNameMatch = a.newUnit.ward.toLowerCase().includes(lowerQuery);
            const bNameMatch = b.newUnit.ward.toLowerCase().includes(lowerQuery);

            if (aNameMatch && !bNameMatch) return -1;
            if (!aNameMatch && bNameMatch) return 1;

            // Ưu tiên tên đơn vị cũ
            const aOldMatch = a.oldUnits.some(unit =>
                unit.ward.toLowerCase().includes(lowerQuery)
            );
            const bOldMatch = b.oldUnits.some(unit =>
                unit.ward.toLowerCase().includes(lowerQuery)
            );

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