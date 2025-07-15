
import { useState, useEffect, useMemo, useCallback } from 'react';

// Base interface for all items
export interface BaseItem {
    name: string;
    oldNames: string[];
    type: 'province' | 'district' | 'commune';
}

// Nested data structure interfaces
export interface Commune extends BaseItem {
    type: 'commune';
}

export interface District extends BaseItem {
    type: 'district';
    communes: Commune[];
}

export interface Province extends BaseItem {
    type: 'province';
    districts?: District[];
    communes?: Commune[]; // Direct communes (no districts)
}

export interface NestedData {
    metadata: {
        version: string;
        lastUpdated: string;
        totalProvinces: number;
        totalCommunes: number;
    };
    provinces: Province[];
}

// Flat data structure for search
export interface FlatItem extends BaseItem {
    parentProvince: string;
    parentDistrict?: string;
    mergeRatio: number;
    fullPath: string;
}

export interface SearchData {
    provinces: FlatItem[];
    districts: FlatItem[];
    communes: FlatItem[];
    allItems: FlatItem[];
}

interface UseSearchDataReturn {
    nestedData: NestedData | null;
    searchData: SearchData;
    search: (query: string, type?: string) => FlatItem[];
    loading: boolean;
    error: string | null;
}

// Function to flatten nested data
const flattenData = (nestedData: NestedData): FlatItem[] => {
    const flatItems: FlatItem[] = [];

    nestedData.provinces.forEach(province => {
        // Add province
        flatItems.push({
            name: province.name,
            oldNames: province.oldNames,
            type: 'province',
            parentProvince: province.name,
            mergeRatio: province.oldNames.length,
            fullPath: province.name
        });

        // Handle districts (if they exist)
        if (province.districts) {
            province.districts.forEach(district => {
                // Add district
                flatItems.push({
                    name: district.name,
                    oldNames: district.oldNames,
                    type: 'district',
                    parentProvince: province.name,
                    mergeRatio: district.oldNames.length,
                    fullPath: `${province.name} > ${district.name}`
                });

                // Add communes under district
                district.communes.forEach(commune => {
                    flatItems.push({
                        name: commune.name,
                        oldNames: commune.oldNames,
                        type: 'commune',
                        parentProvince: province.name,
                        parentDistrict: district.name,
                        mergeRatio: commune.oldNames.length,
                        fullPath: `${province.name} > ${district.name} > ${commune.name}`
                    });
                });
            });
        }

        // Handle direct communes (no districts)
        if (province.communes) {
            province.communes.forEach(commune => {
                flatItems.push({
                    name: commune.name,
                    oldNames: commune.oldNames,
                    type: 'commune',
                    parentProvince: province.name,
                    mergeRatio: commune.oldNames.length,
                    fullPath: `${province.name} > ${commune.name}`
                });
            });
        }
    });

    return flatItems;
};

export const useSearchData = (): UseSearchDataReturn => {
    const [nestedData, setNestedData] = useState<NestedData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load nested data
    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetch('/data.json');
                if (!response.ok) throw new Error('Failed to load data.json');
                const data = await response.json();
                setNestedData(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Flatten data for search
    const flatData = useMemo(() => {
        if (!nestedData) return [];
        return flattenData(nestedData);
    }, [nestedData]);

    // Create search data structure
    const searchData = useMemo(() => {
        const provinces = flatData.filter(item => item.type === 'province');
        const districts = flatData.filter(item => item.type === 'district');
        const communes = flatData.filter(item => item.type === 'commune');

        return {
            provinces,
            districts,
            communes,
            allItems: flatData
        };
    }, [flatData]);

    // Search function
    const search = useCallback((query: string, type?: string) => {
        if (!query.trim()) {
            return type ? flatData.filter(item => item.type === type) : flatData;
        }

        const lowerQuery = query.toLowerCase();
        return flatData.filter(item => {
            const matchesType = !type || item.type === type;
            const matchesName = item.name.toLowerCase().includes(lowerQuery);
            const matchesOldNames = item.oldNames.some(name =>
                name.toLowerCase().includes(lowerQuery)
            );
            const matchesFullPath = item.fullPath.toLowerCase().includes(lowerQuery);

            return matchesType && (matchesName || matchesOldNames || matchesFullPath);
        });
    }, [flatData]);

    return {
        nestedData,
        searchData,
        search,
        loading,
        error
    };
};