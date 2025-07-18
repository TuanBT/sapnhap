export interface AdministrativeUnit {
    province: string;
    district: string;
    ward: string;
}

export interface SearchItem {
    id: string;
    name: string;
    type: 'commune';
    newUnit: AdministrativeUnit;
    oldUnits: AdministrativeUnit[];
    document: string;
    fullPath: string;
    searchText: string;
}

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

    const searchItems: SearchItem[] = jsonData.changes.map((change) => {
        // Normalize text helper function - KHÔNG bỏ prefix hành chính
        const normalizeText = (text: string) => {
            if (!text) return '';
            return text.trim()
                .replace(/\s+/g, ' ')  // Multiple spaces to single space
                .normalize('NFC');     // Normalize unicode
        };

        // Create new unit - giữ nguyên prefix
        const newUnit: AdministrativeUnit = {
            province: normalizeText(change.newUnit.province),
            district: change.newUnit.district,
            ward: normalizeText(change.newUnit.ward)
        };

        // Create old units - giữ nguyên prefix
        const oldUnits: AdministrativeUnit[] = change.oldUnits.map(unit => ({
            province: normalizeText(unit.province) || "∅",
            district: unit.district || "∅",
            ward: normalizeText(unit.ward) || "∅"
        }));

        // Create search text for better searching
        const searchText = [
            newUnit.province,
            newUnit.ward,
            ...oldUnits.map(unit => `${unit.province} ${unit.district} ${unit.ward}`)
        ].join(' ');

        const fullPath = `${newUnit.province} > ${newUnit.ward}`;

        return {
            id: change.id,
            name: newUnit.ward,
            type: 'commune',
            newUnit,
            oldUnits,
            document: change.document,
            fullPath,
            searchText
        };
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

// Legacy function for backward compatibility (if needed)
export function parseAdminData(): SearchItem[] {
    // This function can be removed if no longer needed
    console.warn('parseAdminData is deprecated. Use parseJsonData instead.');
    return [];
}