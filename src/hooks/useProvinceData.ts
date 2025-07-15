
import { useState, useEffect } from 'react';

interface ProvinceData {
    [key: string]: string;
}

interface MergeInfo {
    [key: string]: {
        name: string;
        originalProvinces: string[];
        description: string;
    };
}

export interface UseProvinceDataReturn {
    provinces: ProvinceData | null;
    provincesMerged: ProvinceData | null;
    provinceMapping: { [key: string]: string } | null;
    mergeInfo: MergeInfo | null;
    loading: boolean;
    error: string | null;
}

export function useProvinceData(): UseProvinceDataReturn {
    const [provinces, setProvinces] = useState<ProvinceData | null>(null);
    const [provincesMerged, setProvincesMerged] = useState<ProvinceData | null>(null);
    const [provinceMapping, setProvinceMapping] = useState<{ [key: string]: string } | null>(null);
    const [mergeInfo, setMergeInfo] = useState<MergeInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Load tất cả file JSON
                const [provincesRes, provincesMergedRes, provinceMappingRes, mergeInfoRes] = await Promise.all([
                    fetch('/provinces.json'),
                    fetch('/provinces-merged.json'),
                    fetch('/province-mapping.json'),
                    fetch('/merge-info.json')
                ]);

                if (!provincesRes.ok) throw new Error('Failed to load provinces.json');
                if (!provincesMergedRes.ok) throw new Error('Failed to load provinces-merged.json');
                if (!provinceMappingRes.ok) throw new Error('Failed to load province-mapping.json');
                if (!mergeInfoRes.ok) throw new Error('Failed to load merge-info.json');

                const [provincesData, provincesMergedData, provinceMappingData, mergeInfoData] = await Promise.all([
                    provincesRes.json(),
                    provincesMergedRes.json(),
                    provinceMappingRes.json(),
                    mergeInfoRes.json()
                ]);

                setProvinces(provincesData);
                setProvincesMerged(provincesMergedData);
                setProvinceMapping(provinceMappingData);
                setMergeInfo(mergeInfoData);

            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load data');
                console.error('Error loading data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    return {
        provinces,
        provincesMerged,
        provinceMapping,
        mergeInfo,
        loading,
        error
    };
}