import React, { useState, useMemo, memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faArrowRight, faEye, faEyeSlash, faFileText } from '@fortawesome/free-solid-svg-icons';
import type { FlatSearchItem } from '../hooks/useSearchData';
import type { AdministrativeUnit } from '../types/administrative';

interface SimpleSearchResultProps {
    item: FlatSearchItem;
    searchQuery: string;
}

const SimpleSearchResult: React.FC<SimpleSearchResultProps> = memo(({ item, searchQuery }) => {
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

    // Only show commune level data for now
    if (item.level !== 'commune') {
        return null;
    }

    const oldUnits = item.oldUnits || [];
    const newUnit = item.newUnit || { province: '', district: '', ward: '' };

    // Filter relevant old units based on search query
    const relevantOldUnits = useMemo(() => {
        if (!searchQuery.trim()) return oldUnits;

        const relevantUnits = oldUnits.filter((unit: AdministrativeUnit) =>
            unit.province.toLowerCase().includes(searchQuery.toLowerCase()) ||
            unit.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
            unit.ward.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return relevantUnits.length > 0 ? relevantUnits : oldUnits;
    }, [oldUnits, searchQuery]);

    const renderAdministrativeUnit = (unit: AdministrativeUnit, isOld: boolean, key: number) => (
        <div key={key} className={`rounded-lg p-3 border ${isOld ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
            <div className={`text-sm font-bold ${isOld ? 'text-red-700' : 'text-green-700'}`}>
                🏛️ {highlightText(unit.province, searchQuery)}
            </div>
            {unit.district && unit.district !== "∅" && (
                <div className={`text-xs mt-1 ${isOld ? 'text-red-600' : 'text-green-600'}`}>
                    📍 {highlightText(unit.district, searchQuery)}
                </div>
            )}
            <div className={`text-xs mt-1 ${isOld ? 'text-red-600' : 'text-green-600'}`}>
                🏠 {highlightText(unit.ward, searchQuery)}
            </div>
        </div>
    );

    return (
        <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow border-purple-200">
            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <FontAwesomeIcon icon={faHome} className="text-purple-600" />
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
                            {relevantOldUnits.map((unit: AdministrativeUnit, index: number) => renderAdministrativeUnit(unit, true, index))}
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
                        {renderAdministrativeUnit(newUnit, false, 0)}
                    </div>
                </div>

                {showDetails && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="space-y-4">
                            {/* All old units */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-3">
                                    Tất cả các đơn vị trước sắp xếp:
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {oldUnits.map((unit: AdministrativeUnit, index: number) => (
                                        <div key={index} className="bg-red-50 rounded p-3 border border-red-200">
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
                                </div>
                            </div>

                            {/* Document */}
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
});

SimpleSearchResult.displayName = 'SimpleSearchResult';

export default SimpleSearchResult;