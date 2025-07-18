export interface AdministrativeUnit {
    province: string;
    district: string;
    ward: string;
}

export type AdministrativeLevel = 'province' | 'district' | 'commune';

export interface BaseSearchItem {
    id: string;
    name: string;
    level: AdministrativeLevel;
    fullPath: string;
    searchText: string;
}

// Kết quả cấp tỉnh - chỉ tỉnh cũ/mới
export interface ProvinceSearchItem extends BaseSearchItem {
    level: 'province';
    oldProvince: string;
    newProvince: string;
}

// Kết quả cấp huyện - có tỉnh cũ/mới + huyện cũ/mới
export interface DistrictSearchItem extends BaseSearchItem {
    level: 'district';
    oldProvince: string;
    newProvince: string;
    oldDistrict: string;
    newDistrict: string;
}

// Kết quả cấp xã - đầy đủ thông tin + văn bản
export interface CommuneSearchItem extends BaseSearchItem {
    level: 'commune';
    newUnit: AdministrativeUnit;
    oldUnits: AdministrativeUnit[];
    document: string;
}

export type SearchItem = ProvinceSearchItem | DistrictSearchItem | CommuneSearchItem;