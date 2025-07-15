export interface Province {
    id: string;
    name: string;
}

export interface ProvinceMapping {
    [key: string]: string;
}

export interface ProvinceMergedData {
    [provinceName: string]: {
        [unitName: string]: {
            tu_xa_cu: string[];
        };
    };
}

export interface SearchResult {
    province: string;
    newName: string;
    oldName?: string;
    oldNames?: string[];
    isProvince?: boolean;
}

export interface SearchIndex {
    oldToNew: { [key: string]: SearchResult[] };
    newToOld: { [key: string]: SearchResult };
    provinces: { [key: string]: ProvinceInfo };
}

export interface ProvinceInfo {
    name: string;
    units: number;
    totalOldUnits: number;
    unitsList: {
        newName: string;
        oldNames: string[];
    }[];
}

export interface VietnamData {
    tinh_moi: ProvinceMergedData;
    tra_cuu_tinh_cu: ProvinceMapping;
}

// Thêm interface cho merge info
export interface MergeInfo {
    [key: string]: {
        name: string;
        originalProvinces: string[];
        description: string;
    };
}

// Thêm interface cho transformed data
export interface TransformedProvinceMergedData {
    [provinceName: string]: {
        [unitName: string]: {
            tu_xa_cu: string[];
        };
    };
}