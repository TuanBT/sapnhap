import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faArrowRight, faEye, faEyeSlash, faFileText, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import type { FlatItem, AdministrativeUnit } from '../hooks/useSearchData';

interface SimpleSearchResultProps {
    item: FlatItem;
    searchQuery: string;
}

const SimpleSearchResult: React.FC<SimpleSearchResultProps> = ({ item, searchQuery }) => {
    const [showDetails, setShowDetails] = useState(false);

    const highlightText = (text: string, query: string) => {
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

    const renderAdministrativeUnit = (unit: AdministrativeUnit, isOld: boolean, index?: number) => {
        const bgColor = isOld ? 'bg-red-50' : 'bg-green-50';
        const textColor = isOld ? 'text-red-700' : 'text-green-700';

        return (
            <div key={index} className={`${bgColor} rounded-lg p-3 border ${isOld ? 'border-red-200' : 'border-green-200'}`}>
                <div className="space-y-1">
                    <div className={`font-medium ${textColor}`}>
                        {highlightText(unit.ward, searchQuery)}
                    </div>
                    <div className="text-xs space-y-0.5">
                        <div className={`${textColor} opacity-75`}>
                            📍 {highlightText(unit.district, searchQuery)}
                        </div>
                        <div className={`${textColor} opacity-60`}>
                            🏛️ {highlightText(unit.province, searchQuery)}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const getRelevantOldUnits = (oldUnits: AdministrativeUnit[], query: string) => {
        if (!query.trim()) return oldUnits.slice(0, 3);

        const lowerQuery = query.toLowerCase();
        const relevantUnits = oldUnits.filter(unit =>
            unit.ward.toLowerCase().includes(lowerQuery) ||
            unit.district.toLowerCase().includes(lowerQuery) ||
            unit.province.toLowerCase().includes(lowerQuery)
        );

        if (relevantUnits.length > 0) {
            return relevantUnits.slice(0, 3);
        }

        return oldUnits.slice(0, 3);
    };

    const relevantOldUnits = getRelevantOldUnits(item.oldUnits, searchQuery);
    const hasMoreUnits = item.oldUnits.length > 3;

    return (
        <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow border-purple-200">
            <div className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <FontAwesomeIcon icon={faHome} className="text-purple-600" />
                        <span className="text-sm font-medium text-purple-600">
                            Sắp xếp hành chính
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                            {item.oldUnits.length} → 1
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

                {/* Main comparison */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    {/* TRƯỚC */}
                    <div className="space-y-3">
                        <div className="text-center">
                            <div className="text-xs font-medium text-red-600 mb-2">
                                TRƯỚC SÁP XẾP
                            </div>
                            <div className="h-px bg-red-200"></div>
                        </div>
                        <div className="space-y-2">
                            {relevantOldUnits.map((unit, index) => renderAdministrativeUnit(unit, true, index))}
                            {hasMoreUnits && (
                                <div className="text-xs text-red-500 text-center py-2">
                                    +{item.oldUnits.length - 3} đơn vị khác
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex justify-center items-center">
                        <FontAwesomeIcon
                            icon={faArrowRight}
                            className="text-gray-400 text-xl"
                        />
                    </div>

                    {/* SAU */}
                    <div className="space-y-3">
                        <div className="text-center">
                            <div className="text-xs font-medium text-green-600 mb-2">
                                SAU SÁP XẾP
                            </div>
                            <div className="h-px bg-green-200"></div>
                        </div>
                        <div>
                            {renderAdministrativeUnit(item.newUnit, false)}
                        </div>
                    </div>
                </div>

                {/* Expandable Details */}
                {showDetails && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="space-y-6">
                            {/* Tất cả đơn vị cũ */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-red-500" />
                                    Tất cả đơn vị trước sắp xếp ({item.oldUnits.length}):
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {item.oldUnits.map((unit, index) => (
                                        <div key={index} className="bg-gray-50 rounded p-3 border">
                                            <div className="text-sm font-medium text-gray-800">
                                                {highlightText(unit.ward, searchQuery)}
                                            </div>
                                            <div className="text-xs text-gray-600 mt-1">
                                                📍 {highlightText(unit.district, searchQuery)}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                🏛️ {highlightText(unit.province, searchQuery)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Đơn vị mới chi tiết */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-green-500" />
                                    Đơn vị sau sắp xếp:
                                </h4>
                                <div className="bg-green-50 rounded p-4 border border-green-200">
                                    <div className="text-lg font-medium text-green-800">
                                        {highlightText(item.newUnit.ward, searchQuery)}
                                    </div>
                                    <div className="text-sm text-green-700 mt-1">
                                        📍 {highlightText(item.newUnit.district, searchQuery)}
                                    </div>
                                    <div className="text-sm text-green-600">
                                        🏛️ {highlightText(item.newUnit.province, searchQuery)}
                                    </div>
                                </div>
                            </div>

                            {/* Văn bản pháp lý */}
                            {item.document && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                        <FontAwesomeIcon icon={faFileText} className="text-blue-500" />
                                        Văn bản sắp xếp:
                                    </h4>
                                    <div className="bg-blue-50 rounded p-3 border border-blue-200">
                                        <div className="text-sm text-blue-800">
                                            {item.document}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SimpleSearchResult;