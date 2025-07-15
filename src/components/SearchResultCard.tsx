import React, { useState } from 'react';
import type { SearchItem } from '../hooks/useSearchData';

interface SearchResultCardProps {
    item: SearchItem;
    searchQuery: string;
    icon: string;
    typeLabel: string;
}

const SearchResultCard: React.FC<SearchResultCardProps> = ({
                                                               item,
                                                               searchQuery,
                                                               icon,
                                                               typeLabel
                                                           }) => {
    const [isExpanded, setIsExpanded] = useState(false);

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

    const formatMergeRatio = (ratio: number) => {
        if (ratio <= 1) return 'Không sáp nhập';
        return `${ratio.toFixed(1)}:1`;
    };

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <span className="text-2xl">{icon}</span>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {highlightText(item.name, searchQuery)}
                            </h3>
                            <p className="text-sm text-gray-600">
                                {typeLabel}
                                {item.type !== 'province' && (
                                    <span> • {item.parentProvince}</span>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <div className="text-sm text-gray-600">Tỷ lệ sáp nhập</div>
                            <div className="font-semibold text-blue-600">
                                {formatMergeRatio(item.mergeRatio)}
                            </div>
                        </div>

                        {item.originalUnits.length > 0 && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                            >
                                {isExpanded ? 'Thu gọn' : 'Chi tiết'}
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-600">Sau sáp nhập:</span>
                                <div className="font-medium text-green-600">
                                    {highlightText(item.name, searchQuery)}
                                </div>
                            </div>
                            <div>
                                <span className="text-gray-600">Gộp từ:</span>
                                <div className="font-medium text-blue-600">
                                    {item.originalUnits.length} đơn vị
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {isExpanded && item.originalUnits.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-3">
                            📋 Danh sách đơn vị gốc ({item.originalUnits.length}):
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {item.originalUnits.map((unit, index) => (
                                <div
                                    key={index}
                                    className="p-2 bg-gray-50 rounded-md text-sm"
                                >
                                    <span className="text-gray-600">• </span>
                                    {highlightText(unit, searchQuery)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResultCard;