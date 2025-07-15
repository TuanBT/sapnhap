import { useState, useEffect } from 'react';

interface ProvinceData {
    [key: string]: string;
}

interface MergeInfo {
    [key: string]: {
        name: string;
        originalProvinces: string[];
        description?: string;
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
                const [provincesRes, provincesMergedRes, mergeInfoRes] = await Promise.all([
                    fetch('/provinces.json'),
                    fetch('/provinces-merged.json'),
                    fetch('/merge-info.json')
                ]);

                if (!provincesRes.ok) throw new Error('Failed to load provinces.json');
                if (!provincesMergedRes.ok) throw new Error('Failed to load provinces-merged.json');
                if (!mergeInfoRes.ok) throw new Error('Failed to load merge-info.json');

                const [provincesData, provincesMergedData, mergeInfoData] = await Promise.all([
                    provincesRes.json(),
                    provincesMergedRes.json(),
                    mergeInfoRes.json()
                ]);

                // Tạo mapping từ merge-info
                const generatedMapping: { [key: string]: string } = {};

                // Với mỗi tỉnh sau sáp nhập, tìm các tỉnh gốc và map chúng
                Object.entries(mergeInfoData).forEach(([mergedId, info]) => {
                    // Type assertion để TypeScript biết structure của info
                    const mergeInfo = info as { name: string; originalProvinces: string[]; description?: string };
                    const originalProvinces = mergeInfo.originalProvinces;

                    // Tìm ID của các tỉnh gốc trong provinces.json
                    Object.entries(provincesData as { [key: string]: string }).forEach(([provinceId, provinceName]) => {
                        // Kiểm tra xem tỉnh này có trong danh sách originalProvinces không
                        if (originalProvinces.includes(provinceName)) {
                            generatedMapping[provinceId] = mergedId;
                        }
                    });
                });

                console.log('Generated mapping:', generatedMapping);
                console.log('Provinces:', provincesData);
                console.log('Provinces merged:', provincesMergedData);
                console.log('Merge info:', mergeInfoData);

                setProvinces(provincesData);
                setProvincesMerged(provincesMergedData);
                setProvinceMapping(generatedMapping);
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