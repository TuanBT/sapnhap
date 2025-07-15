import { useState, useEffect, useMemo } from 'react';

export interface SearchItem {
    id: string;
    name: string;
    type: 'province' | 'district' | 'commune';
    parentProvince: string;
    parentDistrict?: string;
    originalUnits: string[];
    mergeRatio: number;
}

export interface SearchData {
    provinces: SearchItem[];
    districts: SearchItem[];
    communes: SearchItem[];
    allItems: SearchItem[];
}

interface UseSearchDataReturn {
    searchData: SearchData;
    loading: boolean;
    error: string | null;
}

export const useSearchData = (): UseSearchDataReturn => {
    const [rawData, setRawData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetch('/data.json');
                if (!response.ok) throw new Error('Failed to load data.json');
                const data = await response.json();
                setRawData(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const searchData = useMemo(() => {
        if (!rawData) {
            return {
                provinces: [],
                districts: [],
                communes: [],
                allItems: []
            };
        }

        const provinces: SearchItem[] = [];
        const districts: SearchItem[] = [];
        const communes: SearchItem[] = [];

        // Process data from tinh_moi structure
        Object.entries(rawData.tinh_moi).forEach(([provinceName, provinceData]: [string, any]) => {
            const provinceDistricts: SearchItem[] = [];
            const provinceCommunes: SearchItem[] = [];

            // Process each district/commune in the province
            Object.entries(provinceData).forEach(([unitName, unitData]: [string, any]) => {
                const originalUnits = unitData.tu_xa_cu || [];
                const mergeRatio = originalUnits.length;

                // Determine if this is a district or commune based on name prefix
                const isDistrict = unitName.startsWith('Huyện ') ||
                    unitName.startsWith('Quận ') ||
                    unitName.startsWith('Thành phố ') ||
                    unitName.startsWith('Thị xã ');

                const item: SearchItem = {
                    id: `${provinceName}-${unitName}`,
                    name: unitName,
                    type: isDistrict ? 'district' : 'commune',
                    parentProvince: provinceName,
                    originalUnits,
                    mergeRatio
                };

                if (isDistrict) {
                    provinceDistricts.push(item);
                } else {
                    provinceCommunes.push(item);
                }
            });

            // Create province item
            const totalOriginalUnits = [...provinceDistricts, ...provinceCommunes]
                .reduce((acc, item) => acc + item.originalUnits.length, 0);
            const totalNewUnits = provinceDistricts.length + provinceCommunes.length;

            provinces.push({
                id: provinceName,
                name: provinceName,
                type: 'province',
                parentProvince: provinceName,
                originalUnits: [], // Will be populated from merge-info if needed
                mergeRatio: totalOriginalUnits / totalNewUnits
            });

            districts.push(...provinceDistricts);
            communes.push(...provinceCommunes);
        });

        const allItems = [...provinces, ...districts, ...communes];

        return {
            provinces,
            districts,
            communes,
            allItems
        };
    }, [rawData]);

    return {
        searchData,
        loading,
        error
    };
};