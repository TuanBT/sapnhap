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

    // Province result - chỉ hiển thị thông tin cấp tỉnh
    if (item.level === 'province') {
        return (
            <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow border-blue-200">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <FontAwesomeIcon icon={faBuilding} className="text-blue-600 text-xl" />
                            <span className="text-lg font-semibold text-blue-600">Cấp tỉnh/thành phố</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                        <div className="bg-red-50 rounded-lg p-6 border-2 border-red-200">
                            <div className="text-center text-sm font-medium text-red-600 mb-3">TRƯỚC SẮP XẾP</div>
                            <div className="text-xl font-bold text-red-700 text-center">
                                🏛️ {highlightText(item.oldProvince || '', searchQuery)}
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <FontAwesomeIcon icon={faArrowRight} className="text-gray-400 text-3xl" />
                        </div>

                        <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
                            <div className="text-center text-sm font-medium text-green-600 mb-3">SAU SẮP XẾP</div>
                            <div className="text-xl font-bold text-green-700 text-center">
                                🏛️ {highlightText(item.newProvince || '', searchQuery)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // District result - chỉ hiển thị thông tin cấp huyện
    if (item.level === 'district') {
        return (
            <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow border-orange-200">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-orange-600 text-xl" />
                            <span className="text-lg font-semibold text-orange-600">Cấp quận/huyện</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                        <div className="bg-red-50 rounded-lg p-6 border-2 border-red-200">
                            <div className="text-center text-sm font-medium text-red-600 mb-3">TRƯỚC SẮP XẾP</div>
                            <div className="text-lg font-bold text-red-700 text-center">
                                🏛️ {highlightText(item.oldProvince || '', searchQuery)}
                            </div>
                            <div className="text-base text-red-600 mt-2 text-center">
                                📍 {highlightText(item.oldDistrict || '', searchQuery)}
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <FontAwesomeIcon icon={faArrowRight} className="text-gray-400 text-3xl" />
                        </div>

                        <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
                            <div className="text-center text-sm font-medium text-green-600 mb-3">SAU SẮP XẾP</div>
                            <div className="text-lg font-bold text-green-700 text-center">
                                🏛️ {highlightText(item.newProvince || '', searchQuery)}
                            </div>
                            <div className="text-base text-green-600 mt-2 text-center">
                                📍 {item.newDistrict === "—" ? "—" : highlightText(item.newDistrict || '', searchQuery)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Commune result - chỉ hiển thị khi cần thiết
    if (item.level === 'commune') {
        const oldUnits = item.oldUnits || [];
        const newUnit = item.newUnit || { province: '', district: '', ward: '' };

        return (
            <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow border-purple-200">
                <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                            <FontAwesomeIcon icon={faHome} className="text-purple-600 text-lg" />
                            <span className="text-sm font-medium text-purple-600">Cấp xã/phường</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                                {oldUnits.length} → 1
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
                                {oldUnits.slice(0, 3).map((unit: AdministrativeUnit, index: number) => (
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
                                {oldUnits.length > 3 && (
                                    <div className="text-xs text-red-500 text-center py-2">
                                        +{oldUnits.length - 3} đơn vị khác
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
                                    🏛️ {highlightText(newUnit.province, searchQuery)}
                                </div>
                                {newUnit.district && newUnit.district !== "∅" && (
                                    <div className="text-xs text-green-600 mt-1">
                                        📍 {highlightText(newUnit.district, searchQuery)}
                                    </div>
                                )}
                                <div className="text-xs text-green-600 mt-1">
                                    🏠 {highlightText(newUnit.ward, searchQuery)}
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
                                            {item.document || 'Không có thông tin'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return null;
});

SearchResultItem.displayName = 'SearchResultItem';

export default SearchResultItem;