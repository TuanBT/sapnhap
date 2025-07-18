interface AdminData {
    newProvince: string;
    newWard: string;
    oldProvince: string;
    oldDistrict: string;
    oldWard: string;
    document: string;
}

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

export function parseAdminData(tsvContent: string): SearchItem[] {
    const lines = tsvContent.trim().split('\n');

    // Skip header if exists
    const dataLines = lines.slice(1);

    const rawData: AdminData[] = dataLines.map((line, index) => {
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
    }).filter((item): item is AdminData => item !== null);

    console.log(`Parsed ${rawData.length} records`);

    // Group by new ward
    const groupedData = new Map<string, {
        newProvince: string;
        newWard: string;
        oldUnits: AdminData[];
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

    // Convert to SearchItem[]
    const searchItems: SearchItem[] = Array.from(groupedData.entries()).map(([, group], index) => {
        // Extract district from new ward name or use placeholder
        const newDistrict = extractDistrictFromContext(group.newWard, group.newProvince) || "[Cần bổ sung]";

        const newUnit: AdministrativeUnit = {
            province: group.newProvince,
            district: newDistrict,
            ward: group.newWard
        };

        const oldUnits: AdministrativeUnit[] = group.oldUnits.map(item => ({
            province: item.oldProvince || "[Không rõ]",
            district: item.oldDistrict || "[Không rõ]",
            ward: item.oldWard || "[Không rõ]"
        }));

        // Create search text for better searching
        const searchText = [
            group.newProvince,
            newDistrict,
            group.newWard,
            ...oldUnits.map(unit => `${unit.province} ${unit.district} ${unit.ward}`)
        ].join(' ');

        const fullPath = `${group.newProvince} > ${newDistrict} > ${group.newWard}`;

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

// Helper function to extract district from context
function extractDistrictFromContext(wardName: string, provinceName: string): string {
    // This is a simplified approach - in real implementation, you might need
    // to use a lookup table or more sophisticated parsing

    // Try to extract from ward name patterns
    const patterns = [
        /quận\s+([^,]+)/i,
        /huyện\s+([^,]+)/i,
        /thị\s+xã\s+([^,]+)/i,
        /thành\s+phố\s+([^,]+)/i
    ];

    for (const pattern of patterns) {
        const match = wardName.match(pattern);
        if (match) {
            return match[1].trim();
        }
    }

    // Default fallback
    return "[Cần bổ sung huyện]";
}

// Function to generate JSON file (optional - for development)
export function generateSearchDataJson(searchItems: SearchItem[]): string {
    const jsonData = {
        metadata: {
            version: "1.0",
            lastUpdated: new Date().toISOString().split("T")[0],
            totalItems: searchItems.length,
            description: "Thông tin hành chính sau sắp xếp"
        },
        data: searchItems
    };

    return JSON.stringify(jsonData, null, 2);
}