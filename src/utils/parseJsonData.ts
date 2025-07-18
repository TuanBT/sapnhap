import type { SearchItem, CommuneSearchItem, AdministrativeUnit } from '../types/administrative';

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
    console.log(`Loading ${jsonData.metadata.totalChanges} changes from JSON`);

    const searchItems: SearchItem[] = jsonData.changes.map((change): SearchItem => {
        const normalizeText = (text: string) => {
            if (!text) return '';
            return text.trim()
                .replace(/\s+/g, ' ')
                .normalize('NFC');
        };

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

        const baseSearchText = [
            newUnit.province,
            newUnit.ward,
            ...oldUnits.map(unit => `${unit.province} ${unit.district} ${unit.ward}`)
        ].join(' ');

        // Always return CommuneSearchItem for now since current data is commune-level
        const communeItem: CommuneSearchItem = {
            id: change.id,
            name: newUnit.ward,
            level: 'commune',
            newUnit,
            oldUnits,
            document: change.document,
            fullPath: `${newUnit.province} > ${newUnit.ward}`,
            searchText: baseSearchText
        };

        return communeItem;
    });

    console.log(`Generated ${searchItems.length} search items`);
    return searchItems;
}

// Function to load data from JSON file
export async function loadSearchData(): Promise<SearchItem[]> {
    try {
        const response = await fetch('/thongtinhanhchinh.json');
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