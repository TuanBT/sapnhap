import type {SearchIndex, VietnamData} from "../types";

export function createSearchIndex(vietnamData: VietnamData): SearchIndex {
    const searchIndex: SearchIndex = {
        oldToNew: {},
        newToOld: {},
        provinces: {}
    };

    if (!vietnamData.tinh_moi) {
        return searchIndex;
    }

    // Process province data
    for (const [provinceName, provinceData] of Object.entries(vietnamData.tinh_moi)) {
        if (!provinceData || typeof provinceData !== 'object') continue;

        const units = provinceData as Record<string, { tu_xa_cu?: string[] }>;

        searchIndex.provinces[provinceName] = {
            name: provinceName,
            units: Object.keys(units).length,
            totalOldUnits: 0,
            unitsList: []
        };

        let totalOldUnits = 0;

        for (const [newName, unitData] of Object.entries(units)) {
            if (!unitData || typeof unitData !== 'object') continue;

            const oldNames = (unitData as { tu_xa_cu?: string[] }).tu_xa_cu || [];
            totalOldUnits += oldNames.length;

            // Add to unitsList
            searchIndex.provinces[provinceName].unitsList.push({
                newName,
                oldNames: oldNames.filter(Boolean)
            });

            // Add to newToOld mapping
            searchIndex.newToOld[newName] = {
                province: provinceName,
                newName,
                oldNames: oldNames.filter(Boolean)
            };

            // Add to oldToNew mapping
            oldNames.forEach((oldName: string) => {
                if (!oldName) return;

                if (!searchIndex.oldToNew[oldName]) {
                    searchIndex.oldToNew[oldName] = [];
                }
                searchIndex.oldToNew[oldName].push({
                    province: provinceName,
                    newName,
                    oldName
                });
            });
        }

        searchIndex.provinces[provinceName].totalOldUnits = totalOldUnits;
    }

    // Process province mapping if available
    if (vietnamData.tra_cuu_tinh_cu) {
        for (const [oldProvince, newProvince] of Object.entries(vietnamData.tra_cuu_tinh_cu)) {
            if (!newProvince || typeof newProvince !== 'string') continue;

            if (!searchIndex.oldToNew[oldProvince]) {
                searchIndex.oldToNew[oldProvince] = [];
            }

            searchIndex.oldToNew[oldProvince].push({
                province: newProvince,
                newName: newProvince,
                oldName: oldProvince,
                isProvince: true
            });
        }
    }

    return searchIndex;
}

export function searchProvinces(
    query: string,
    searchIndex: SearchIndex
): Array<{
    province: string;
    newName: string;
    oldName?: string;
    oldNames?: string[];
    isProvince?: boolean;
}> {
    const results = [];
    const queryLower = query.toLowerCase();

    // Search in oldToNew
    for (const [oldName, searchResults] of Object.entries(searchIndex.oldToNew)) {
        if (oldName.toLowerCase().includes(queryLower)) {
            results.push(...searchResults);
        }
    }

    // Search in newToOld
    for (const [newName, searchResult] of Object.entries(searchIndex.newToOld)) {
        if (newName.toLowerCase().includes(queryLower)) {
            results.push(searchResult);
        }
    }

    // Search in provinces
    for (const [provinceName] of Object.entries(searchIndex.provinces)) {
        if (provinceName.toLowerCase().includes(queryLower)) {
            results.push({
                province: provinceName,
                newName: provinceName,
                isProvince: true,
                oldNames: []
            });
        }
    }

    return results;
}

export function getProvinceInfo(provinceName: string, searchIndex: SearchIndex) {
    return searchIndex.provinces[provinceName] || null;
}