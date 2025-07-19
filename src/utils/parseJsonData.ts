
import type { SearchItem, CommuneSearchItem, ProvinceSearchItem, DistrictSearchItem, AdministrativeUnit } from '../types/administrative';

// JSON structure from thongtinhanhchinh.json
interface JsonChange {
    id: string;
    oldUnits: AdministrativeUnit[];
    newUnit: AdministrativeUnit;
    document: string;
    type: 'merge' | 'rename' | 'unchanged';
}

interface JsonData {
    metadata: {
        totalChanges: number;
        totalOldUnits: number;
        generatedAt: string;
        version: string;
    };
    changes: JsonChange[];
}

export function parseJsonData(jsonData: JsonData): SearchItem[] {

    const normalizeText = (text: string) => {
        if (!text) return '';
        return text.trim()
            .replace(/\s+/g, ' ')
            .normalize('NFC');
    };

    const searchItems: SearchItem[] = [];
    const provinceChanges = new Map<string, string>();
    const districtChanges = new Map<string, { oldProvince: string; newProvince: string; oldDistrict: string; newDistrict: string }>();

    // First pass: Create commune items and collect unique province/district changes
    jsonData.changes.forEach((change) => {
        const newUnit: AdministrativeUnit = {
            province: normalizeText(change.newUnit.province),
            district: change.newUnit.district,
            ward: normalizeText(change.newUnit.ward)
        };

        const oldUnits: AdministrativeUnit[] = change.oldUnits.map(unit => ({
            province: normalizeText(unit.province) || "∅",
            district: unit.district || "∅",
            ward: normalizeText(unit.ward) || "∅"
        }));

        // Track province changes (chỉ lưu unique changes)
        oldUnits.forEach(oldUnit => {
            if (oldUnit.province !== "∅" && oldUnit.province !== newUnit.province) {
                if (!provinceChanges.has(oldUnit.province)) {
                    provinceChanges.set(oldUnit.province, newUnit.province);
                }
            }
        });

        // Track district changes (chỉ lưu unique changes)
        oldUnits.forEach(oldUnit => {
            if (oldUnit.district !== "∅" && oldUnit.province !== "∅") {
                const oldKey = `${oldUnit.province}|${oldUnit.district}`;
                const newKey = `${newUnit.province}|${newUnit.district}`;

                if (oldKey !== newKey && !districtChanges.has(oldKey)) {
                    districtChanges.set(oldKey, {
                        oldProvince: oldUnit.province,
                        newProvince: newUnit.province,
                        oldDistrict: oldUnit.district,
                        newDistrict: newUnit.district || "—"
                    });
                }
            }
        });

        // Create commune item với searchText đầy đủ
        const allTextParts = [
            newUnit.province,
            newUnit.district,
            newUnit.ward,
            ...oldUnits.map(unit => [unit.province, unit.district, unit.ward].filter(p => p !== "∅").join(' '))
        ].filter(part => part && part.trim());

        const baseSearchText = allTextParts.join(' ');

        const communeItem: CommuneSearchItem = {
            id: change.id,
            name: newUnit.ward,
            level: 'commune',
            newUnit,
            oldUnits,
            document: change.document,
            fullPath: `${newUnit.province} > ${newUnit.district} > ${newUnit.ward}`,
            searchText: baseSearchText
        };

        searchItems.push(communeItem);

    });

    // Second pass: Create unique province items
    let provinceId = 1;
    provinceChanges.forEach((newProvince, oldProvince) => {
        const provinceItem: ProvinceSearchItem = {
            id: `province-${provinceId++}`,
            name: newProvince,
            level: 'province',
            oldProvince,
            newProvince,
            fullPath: `${oldProvince} → ${newProvince}`,
            searchText: `${oldProvince} ${newProvince}`
        };
        searchItems.push(provinceItem);
    });

    // Third pass: Create unique district items
    let districtId = 1;
    districtChanges.forEach((change) => {
        const districtItem: DistrictSearchItem = {
            id: `district-${districtId++}`,
            name: change.newDistrict,
            level: 'district',
            oldProvince: change.oldProvince,
            newProvince: change.newProvince,
            oldDistrict: change.oldDistrict,
            newDistrict: change.newDistrict,
            fullPath: `${change.oldProvince} > ${change.oldDistrict} → ${change.newProvince} > ${change.newDistrict}`,
            searchText: `${change.oldProvince} ${change.oldDistrict} ${change.newProvince} ${change.newDistrict}`
        };
        searchItems.push(districtItem);

    });

    return searchItems;
}

// Function to load data from JSON file
export async function loadSearchData(): Promise<SearchItem[]> {
    try {
        const response = await fetch('/thongtinhanhchinh.min.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const jsonData: JsonData = await response.json();
        return parseJsonData(jsonData);
    } catch (error) {
        console.error('Error loading search data:', error);
        throw error;
    }
}