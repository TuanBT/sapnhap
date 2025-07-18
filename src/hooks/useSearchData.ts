import { useState, useEffect, useCallback } from 'react';

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

interface RawDataItem {
    newProvince: string;
    newWard: string;
    oldProvince: string;
    oldDistrict: string;
    oldWard: string;
    document: string;
}

export function useSearchData() {
    const [data, setData] = useState<FlatItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/thongtinhanhchinh.txt');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const textContent = await response.text();
            const parsedData = parseAdminData(textContent);
            setData(parsedData);
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

function parseAdminData(tsvContent: string): FlatItem[] {
    const lines = tsvContent.trim().split('\n');

    // Skip header if exists
    const dataLines = lines.slice(1);

    const rawData: RawDataItem[] = dataLines.map((line, index) => {
        const cols = line.split('\t');
        if (cols.length < 6) {
            console.warn(`Line ${index + 2} has insufficient columns:`, cols);
            return null;
        }

        return {
            newProvince: cols[0]?.trim() || '',
            newWard: cols[1]?.trim() || '',
            oldProvince: cols[2]?.trim() || '',
            oldDistrict: cols[3]?.trim() || '',
            oldWard: cols[4]?.trim() || '',
            document: cols[5]?.trim() || ''
        };
    }).filter((item): item is RawDataItem => item !== null);

    console.log(`Parsed ${rawData.length} records`);

    // Group by new ward
    const groupedData = new Map<string, {
        newProvince: string;
        newWard: string;
        oldUnits: RawDataItem[];
        documents: string[];
    }>();

    rawData.forEach(item => {
        const key = `${item.newProvince}|${item.newWard}`;

        if (!groupedData.has(key)) {
            groupedData.set(key, {
                newProvince: item.newProvince,
                newWard: item.newWard,
                oldUnits: [],
                documents: []
            });
        }

        const group = groupedData.get(key)!;
        group.oldUnits.push(item);

        // Add document if not already present
        if (item.document && !group.documents.includes(item.document)) {
            group.documents.push(item.document);
        }
    });

    // Convert to FlatItem[]
    const searchItems: FlatItem[] = Array.from(groupedData.entries()).map(([, group], index) => {
        const newUnit: AdministrativeUnit = {
            province: group.newProvince,
            district: "-", // Em dash để thể hiện không có cấp này
            ward: group.newWard
        };

        const oldUnits: AdministrativeUnit[] = group.oldUnits.map(item => ({
            province: item.oldProvince || "∅",
            district: item.oldDistrict || "∅",
            ward: item.oldWard || "∅"
        }));

        // Create search text for better searching
        const searchText = [
            group.newProvince,
            group.newWard,
            ...oldUnits.map(unit => `${unit.province} ${unit.district} ${unit.ward}`)
        ].join(' ');

        const fullPath = `${group.newProvince} > ${group.newWard}`;

        return {
            id: `ward_${index}`,
            name: group.newWard,
            type: 'commune',
            newUnit,
            oldUnits,
            document: group.documents.join(' | '),
            fullPath,
            searchText
        };
    });

    console.log(`Generated ${searchItems.length} search items`);
    return searchItems;
}