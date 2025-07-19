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
                                {item.newDistrict && item.newDistrict !== "∅" && item.newDistrict !== "—"
                                    ? highlightText(item.newDistrict, searchQuery)
                                    : <span className="text-gray-400 italic">Tinh gọn cấp Quận/Huyện</span>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Commune result - CẢI THIỆN CHÍNH
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
                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center space-x-1"
                        >
                            <span>Chi tiết</span>
                            <FontAwesomeIcon icon={showDetails ? faChevronUp : faChevronDown} />
                        </button>
                    </div>
                </div>

                {/* Layout 3 dòng cân đối */}
                <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-start">
                    {/* Cột TRƯỚC */}
                    <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Trước</div>
                        <div className="space-y-2">
                            {/* Unit đầu tiên (match query) */}
                            {sortedOldUnits.slice(0, 1).map((unit: AdministrativeUnit, index: number) => (
                                <div key={index} className="text-sm space-y-1">
                                    <div className="font-medium text-gray-900 dark:text-white">
                                        {highlightText(unit.province, searchQuery)}
                                    </div>
                                    <div className="text-gray-600 dark:text-gray-300">
                                        {unit.district && unit.district !== "∅" && highlightText(unit.district, searchQuery)}
                                    </div>
                                    <div className="text-gray-600 dark:text-gray-300">
                                        {highlightText(unit.ward, searchQuery)}
                                    </div>
                                </div>
                            ))}
                            {/* Thông tin thêm */}
                            {!showDetails && sortedOldUnits.length > 1 && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    +{sortedOldUnits.length - 1} đơn vị khác
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mũi tên */}
                    <div className="flex justify-center pt-8">
                        <FontAwesomeIcon icon={faArrowRight} className="text-gray-400" />
                    </div>

                    {/* Cột SAU */}
                    <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Sau</div>
                        <div className="text-sm space-y-1">
                            <div className="font-medium text-gray-900 dark:text-white">
                                {highlightText(newUnit.province, searchQuery)}
                            </div>
                            <div className="text-gray-600 dark:text-gray-300">
                                {newUnit.district && newUnit.district !== "∅" && newUnit.district !== "—"
                                    ? highlightText(newUnit.district, searchQuery)
                                    : <span className="text-gray-400 italic">Tinh gọn cấp Quận/Huyện</span>
                                }
                            </div>
                            <div className="text-gray-600 dark:text-gray-300">
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
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center space-x-2">
                                    <FontAwesomeIcon icon={faMapPin} className="text-gray-500"/>
                                    <span>Tất cả {sortedOldUnits.length} đơn vị trước sắp xếp</span>
                                </h4>
                                <div className="space-y-2">
                                    {sortedOldUnits.map((unit: AdministrativeUnit, index: number) => (
                                        <div key={index} className="text-sm bg-gray-50 dark:bg-gray-700 rounded p-3">
                                            <div className="text-gray-900 dark:text-white">
                                                <span
                                                    className="font-medium">{highlightText(unit.province, searchQuery)}</span> • <span
                                                className="font-normal">{unit.district && unit.district !== "∅" && highlightText(unit.district, searchQuery)}</span> • <span
                                                className="text-gray-600 dark:text-gray-300">{highlightText(unit.ward, searchQuery)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Document */}
                            {item.document && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
                                        <FontAwesomeIcon icon={faFileText} className="text-gray-500"/>
                                        <span>Sắp xếp các đơn vị hành chính cấp xã của {newUnit.province}</span>
                                    </h4>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded p-3">
                                        <div className="text-gray-600 dark:text-gray-400">{item.document}</div>
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