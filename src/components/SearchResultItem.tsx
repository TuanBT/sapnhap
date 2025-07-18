
import React, { useState, useMemo, memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBuilding,
    faMapPin,
    faHome,
    faArrowRight,
    faChevronDown,
    faChevronUp,
    faFileText
} from '@fortawesome/free-solid-svg-icons';
import type { FlatSearchItem } from '../hooks/useSearchData';
import type { AdministrativeUnit } from '../types/administrative';
import { normalizeForSearch } from '../utils/searchUtils';

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
                    <mark key={index} className="bg-yellow-200 dark:bg-yellow-900/50 px-1 rounded text-yellow-900 dark:text-yellow-100">
                        {part}
                    </mark>
                ) : (
                    part
                )
            );
        };
    }, []);

    // Hàm sắp xếp oldUnits để đưa unit match lên đầu
    const sortedOldUnits = useMemo(() => {
        if (item.level !== 'commune' || !item.oldUnits || !searchQuery.trim()) {
            return item.oldUnits || [];
        }

        const normalizedQuery = normalizeForSearch(searchQuery);
        const oldUnits = [...item.oldUnits];

        // Sắp xếp: units match lên đầu
        oldUnits.sort((a, b) => {
            const aText = normalizeForSearch(`${a.province} ${a.district} ${a.ward}`);
            const bText = normalizeForSearch(`${b.province} ${b.district} ${b.ward}`);

            const aMatches = aText.includes(normalizedQuery);
            const bMatches = bText.includes(normalizedQuery);

            if (aMatches && !bMatches) return -1;
            if (!aMatches && bMatches) return 1;

            // Nếu cả hai đều match hoặc đều không match, giữ nguyên thứ tự
            return 0;
        });

        return oldUnits;
    }, [item.oldUnits, item.level, searchQuery]);

    const getLevelConfig = (level: string) => {
        switch (level) {
            case 'province':
                return {
                    icon: faBuilding,
                    label: 'Tỉnh/Thành phố',
                    color: 'text-blue-600 dark:text-blue-400'
                };
            case 'district':
                return {
                    icon: faMapPin,
                    label: 'Quận/Huyện',
                    color: 'text-green-600 dark:text-green-400'
                };
            case 'commune':
                return {
                    icon: faHome,
                    label: 'Phường/Xã',
                    color: 'text-purple-600 dark:text-purple-400'
                };
            default:
                return {
                    icon: faBuilding,
                    label: 'Đơn vị',
                    color: 'text-gray-600 dark:text-gray-400'
                };
        }
    };

    const config = getLevelConfig(item.level);

    // Province result
    if (item.level === 'province') {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center space-x-3 mb-3">
                    <FontAwesomeIcon icon={config.icon} className={config.color} />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {config.label}
                    </span>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="flex-1">
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Trước</div>
                        <div className="font-medium text-gray-900 dark:text-white">
                            {highlightText(item.oldProvince || '', searchQuery)}
                        </div>
                    </div>

                    <FontAwesomeIcon icon={faArrowRight} className="text-gray-400" />

                    <div className="flex-1">
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Sau</div>
                        <div className="font-medium text-gray-900 dark:text-white">
                            {highlightText(item.newProvince || '', searchQuery)}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // District result
    if (item.level === 'district') {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center space-x-3 mb-3">
                    <FontAwesomeIcon icon={config.icon} className={config.color} />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {config.label}
                    </span>
                </div>

                <div className="flex items-center space-x-4">
                    <div className="flex-1">
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Trước</div>
                        <div className="space-y-1">
                            <div className="font-medium text-gray-900 dark:text-white">
                                {highlightText(item.oldProvince || '', searchQuery)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                                {highlightText(item.oldDistrict || '', searchQuery)}
                            </div>
                        </div>
                    </div>

                    <FontAwesomeIcon icon={faArrowRight} className="text-gray-400" />

                    <div className="flex-1">
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Sau</div>
                        <div className="space-y-1">
                            <div className="font-medium text-gray-900 dark:text-white">
                                {highlightText(item.newProvince || '', searchQuery)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                                {item.newDistrict === "—" ? "—" : highlightText(item.newDistrict || '', searchQuery)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Commune result
    if (item.level === 'commune') {
        const newUnit = item.newUnit || { province: '', district: '', ward: '' };

        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                        <FontAwesomeIcon icon={config.icon} className={config.color} />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {config.label}
                        </span>
                    </div>

                    <div className="flex items-center space-x-3">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {sortedOldUnits.length} → 1
                        </span>
                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center space-x-1"
                        >
                            <span>Chi tiết</span>
                            <FontAwesomeIcon icon={showDetails ? faChevronUp : faChevronDown} />
                        </button>
                    </div>
                </div>

                <div className="flex items-start space-x-4">
                    <div className="flex-1">
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Trước sắp xếp</div>
                        <div className="space-y-2">
                            {/* Hiển thị 1 đơn vị đầu tiên (đã được sắp xếp để unit match lên đầu) */}
                            {sortedOldUnits.slice(0, 1).map((unit: AdministrativeUnit, index: number) => (
                                <div key={index} className="text-sm">
                                    <div className="font-medium text-gray-900 dark:text-white">
                                        {highlightText(unit.province, searchQuery)}
                                    </div>
                                    <div className="text-gray-600 dark:text-gray-300">
                                        {unit.district && unit.district !== "∅" && highlightText(unit.district, searchQuery)}
                                        {unit.district && unit.district !== "∅" && " • "}
                                        {highlightText(unit.ward, searchQuery)}
                                    </div>
                                </div>
                            ))}
                            {/* Hiển thị "+x đơn vị khác" nếu có hơn 1 đơn vị */}
                            {sortedOldUnits.length > 1 && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    +{sortedOldUnits.length - 1} đơn vị khác
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-shrink-0 pt-6">
                        <FontAwesomeIcon icon={faArrowRight} className="text-gray-400" />
                    </div>

                    <div className="flex-1">
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Sau sắp xếp</div>
                        <div className="text-sm">
                            <div className="font-medium text-gray-900 dark:text-white">
                                {highlightText(newUnit.province, searchQuery)}
                            </div>
                            <div className="text-gray-600 dark:text-gray-300">
                                {/* Bỏ ký hiệu "— •" khi district là "—" hoặc rỗng */}
                                {newUnit.district && newUnit.district !== "∅" && newUnit.district !== "—" && (
                                    <>
                                        {highlightText(newUnit.district, searchQuery)}
                                        {" • "}
                                    </>
                                )}
                                {highlightText(newUnit.ward, searchQuery)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* CHI TIẾT - chỉ hiển thị khi click */}
                {showDetails && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="space-y-4">
                            {/* All old units */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Tất cả các đơn vị trước sắp xếp
                                </h4>
                                <div className="space-y-2">
                                    {sortedOldUnits.map((unit: AdministrativeUnit, index: number) => (
                                        <div key={index} className="text-sm bg-gray-50 dark:bg-gray-700 rounded p-2">
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {highlightText(unit.province, searchQuery)}
                                            </div>
                                            <div className="text-gray-600 dark:text-gray-300">
                                                {unit.district && unit.district !== "∅" && highlightText(unit.district, searchQuery)}
                                                {unit.district && unit.district !== "∅" && " • "}
                                                {highlightText(unit.ward, searchQuery)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Document */}
                            {item.document && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
                                        <FontAwesomeIcon icon={faFileText} className="text-gray-500" />
                                        <span>Văn bản sắp xếp</span>
                                    </h4>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded p-3">
                                        {item.document}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return null;
});

SearchResultItem.displayName = 'SearchResultItem';

export default SearchResultItem;