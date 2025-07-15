import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faCity, faHome, faMapMarkerAlt, faListUl, faCheckCircle, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import type { FlatItem } from '../hooks/useSearchData';

interface SimpleSearchResultProps {
    item: FlatItem;
    searchQuery: string;
}

const SimpleSearchResult: React.FC<SimpleSearchResultProps> = ({ item, searchQuery }) => {
    const [showAllOldNames, setShowAllOldNames] = useState(false);

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

    const getTypeInfo = (type: string) => {
        switch (type) {
            case 'province':
                return {
                    icon: faCity,
                    label: 'Tỉnh/TP',
                    color: 'bg-blue-50 text-blue-700 border-blue-200',
                    cardColor: 'border-blue-200 bg-blue-50/30',
                    indent: 'ml-0'
                };
            case 'district':
                return {
                    icon: faBuilding,
                    label: 'Huyện/Quận',
                    color: 'bg-green-50 text-green-700 border-green-200',
                    cardColor: 'border-green-200 bg-green-50/30',
                    indent: 'ml-4'
                };
            case 'commune':
                return {
                    icon: faHome,
                    label: 'Xã/Phường',
                    color: 'bg-purple-50 text-purple-700 border-purple-200',
                    cardColor: 'border-purple-200 bg-purple-50/30',
                    indent: 'ml-8'
                };
            default:
                return {
                    icon: faMapMarkerAlt,
                    label: 'Khác',
                    color: 'bg-gray-50 text-gray-700 border-gray-200',
                    cardColor: 'border-gray-200 bg-gray-50/30',
                    indent: 'ml-0'
                };
        }
    };

    const typeInfo = getTypeInfo(item.type);
    const displayOldNames = showAllOldNames ? item.oldNames : item.oldNames.slice(0, 3);
    const hasMoreOldNames = item.oldNames.length > 3;

    return (
        <div className={`bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow ${typeInfo.cardColor} ${typeInfo.indent}`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <FontAwesomeIcon icon={typeInfo.icon} className="text-lg text-gray-600" />
                        <div>
                            <h3 className="font-semibold text-gray-900 text-lg">
                                {highlightText(item.name, searchQuery)}
                            </h3>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${typeInfo.color}`}>
                                {item.fullPath}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content: Before → After */}
            <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* LEFT: Trước sáp nhập (CŨ) */}
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2 mb-3">
                            <FontAwesomeIcon icon={faListUl} className="text-red-500" />
                            <span className="text-red-500 font-semibold">TRƯỚC SÁP NHẬP</span>
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                                {item.oldNames.length} đơn vị
                            </span>
                        </div>

                        <div className="space-y-2">
                            {displayOldNames.map((oldName, index) => (
                                <div key={index} className="flex items-center space-x-2 p-2 bg-red-50 rounded-md border border-red-100">
                                    <span className="text-red-400 text-xs">•</span>
                                    <span className="text-sm text-red-700">
                                        {highlightText(oldName, searchQuery)}
                                    </span>
                                </div>
                            ))}

                            {hasMoreOldNames && (
                                <button
                                    onClick={() => setShowAllOldNames(!showAllOldNames)}
                                    className="flex items-center space-x-1 text-xs text-red-600 hover:text-red-800 font-medium"
                                >
                                    <FontAwesomeIcon icon={showAllOldNames ? faChevronUp : faChevronDown} />
                                    <span>
                                        {showAllOldNames
                                            ? 'Thu gọn'
                                            : `+ ${item.oldNames.length - 3} đơn vị khác`
                                        }
                                    </span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Sau sáp nhập (MỚI) */}
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2 mb-3">
                            <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
                            <span className="text-green-500 font-semibold">SAU SÁP NHẬP</span>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                1 đơn vị
                            </span>
                        </div>

                        <div className="p-4 bg-green-50 rounded-md border border-green-100">
                            <div className="flex items-center space-x-2">
                                <FontAwesomeIcon icon={faCheckCircle} className="text-green-400" />
                                <div>
                                    <div className="font-semibold text-green-800 text-lg">
                                        {highlightText(item.name, searchQuery)}
                                    </div>
                                    <div className="text-xs text-green-600 mt-1">
                                        {item.fullPath}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimpleSearchResult;