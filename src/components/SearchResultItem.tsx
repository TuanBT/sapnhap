import React, { useState, useMemo, memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faHome, faMapMarkerAlt, faArrowRight, faEye, faEyeSlash, faFileText } from '@fortawesome/free-solid-svg-icons';
import type { FlatSearchItem } from '../hooks/useSearchData';
import type { AdministrativeUnit } from '../types/administrative';

interface SearchResultItemProps {
    item: FlatSearchItem;
    searchQuery: string;
}

const SearchResultItem: React.FC<SearchResultItemProps> = memo(({ item, searchQuery }) => {
    const [showDetails, setShowDetails] = useState(false);

    const highlightText = useMemo(() => {
        return (text: string, query: string) => {
            if (!query.trim()) return text;
            const regex = new RegExp(`(${query})`, 'gi');
            const parts = text.split(regex);
            return parts.map((part, index) =>
                regex.test(part) ? (
                    <mark key={index} className="bg-yellow-200 px-1 rounded">
                        {part}
                    </mark>
                ) : (
                    part
                )
            );
        };
    }, []);

    // Render different types based on level
    const renderProvinceResult = (provinceItem: FlatSearchItem) => (
        <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow border-blue-200">
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <FontAwesomeIcon icon={faBuilding} className="text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">Cấp tỉnh/thành phố</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                        <div className="text-center text-xs font-medium text-red-600 mb-2">TRƯỚC</div>
                        <div className="text-sm font-bold text-red-700">
                            🏛️ {highlightText(provinceItem.oldProvince || '', searchQuery)}
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <FontAwesomeIcon icon={faArrowRight} className="text-gray-400 text-xl" />
                    </div>

                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                        <div className="text-center text-xs font-medium text-green-600 mb-2">SAU</div>
                        <div className="text-sm font-bold text-green-700">
                            🏛️ {highlightText(provinceItem.newProvince || '', searchQuery)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderDistrictResult = (districtItem: FlatSearchItem) => (
        <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow border-orange-200">
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-orange-600" />
                        <span className="text-sm font-medium text-orange-600">Cấp quận/huyện</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                        <div className="text-center text-xs font-medium text-red-600 mb-2">TRƯỚC</div>
                        <div className="text-sm font-bold text-red-700">
                            🏛️ {highlightText(districtItem.oldProvince || '', searchQuery)}
                        </div>
                        <div className="text-xs text-red-600 mt-1">
                            📍 {highlightText(districtItem.oldDistrict || '', searchQuery)}
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <FontAwesomeIcon icon={faArrowRight} className="text-gray-400 text-xl" />
                    </div>

                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                        <div className="text-center text-xs font-medium text-green-600 mb-2">SAU</div>
                        <div className="text-sm font-bold text-green-700">
                            🏛️ {highlightText(districtItem.newProvince || '', searchQuery)}
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                            📍 {highlightText(districtItem.newDistrict || '', searchQuery)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderCommuneResult = (communeItem: FlatSearchItem) => (
        <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow border-purple-200">
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <FontAwesomeIcon icon={faHome} className="text-purple-600" />
                        <span className="text-sm font-medium text-purple-600">Cấp xã/phường</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                            {communeItem.oldUnits?.length || 0} → 1
                        </span>
                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800"
                        >
                            <FontAwesomeIcon icon={showDetails ? faEyeSlash : faEye} />
                            <span>{showDetails ? 'Ẩn' : 'Chi tiết'}</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    <div className="space-y-3">
                        <div className="text-center">
                            <div className="text-xs font-medium text-red-600 mb-2">TRƯỚC SẮP XẾP</div>
                            <div className="h-px bg-red-200"></div>
                        </div>
                        <div className="space-y-2">
                            {communeItem.oldUnits?.slice(0, 3).map((unit: AdministrativeUnit, index: number) => (
                                <div key={index} className="bg-red-50 rounded-lg p-3 border border-red-200">
                                    <div className="text-sm font-bold text-red-700">
                                        🏛️ {highlightText(unit.province, searchQuery)}
                                    </div>
                                    {unit.district && unit.district !== "∅" && (
                                        <div className="text-xs text-red-600 mt-1">
                                            📍 {highlightText(unit.district, searchQuery)}
                                        </div>
                                    )}
                                    <div className="text-xs text-red-600 mt-1">
                                        🏠 {highlightText(unit.ward, searchQuery)}
                                    </div>
                                </div>
                            ))}
                            {(communeItem.oldUnits?.length || 0) > 3 && (
                                <div className="text-xs text-red-500 text-center py-2">
                                    +{(communeItem.oldUnits?.length || 0) - 3} đơn vị khác
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-center items-center">
                        <FontAwesomeIcon icon={faArrowRight} className="text-gray-400 text-xl" />
                    </div>

                    <div className="space-y-3">
                        <div className="text-center">
                            <div className="text-xs font-medium text-green-600 mb-2">SAU SẮP XẾP</div>
                            <div className="h-px bg-green-200"></div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                            <div className="text-sm font-bold text-green-700">
                                🏛️ {highlightText(communeItem.newUnit?.province || '', searchQuery)}
                            </div>
                            <div className="text-xs text-green-600 mt-1">
                                🏠 {highlightText(communeItem.newUnit?.ward || '', searchQuery)}
                            </div>
                        </div>
                    </div>
                </div>

                {showDetails && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faFileText} className="text-blue-500" />
                                    Văn bản sắp xếp:
                                </h4>
                                <div className="bg-blue-50 rounded p-3 border border-blue-200">
                                    <div className="text-sm text-blue-800">
                                        {communeItem.document || 'Không có thông tin'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    // Render based on level
    switch (item.level) {
        case 'province':
            return renderProvinceResult(item);
        case 'district':
            return renderDistrictResult(item);
        case 'commune':
            return renderCommuneResult(item);
        default:
            return null;
    }
});

SearchResultItem.displayName = 'SearchResultItem';

export default SearchResultItem;