import React, { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import type { FlatSearchItem } from '../hooks/useSearchData';
import SearchResultItem from './SearchResultItem';

interface SearchResultsProps {
    results: FlatSearchItem[];
    searchQuery: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, searchQuery }) => {
    // Group results by level
    const groupedResults = useMemo(() => {
        const groups = {
            province: results.filter(r => r.level === 'province'),
            district: results.filter(r => r.level === 'district'),
            commune: results.filter(r => r.level === 'commune')
        };

        return groups;
    }, [results]);

    // Limit results
    const limitedResults = useMemo(() => {
        return results.slice(0, 50);
    }, [results]);

    const hasMoreResults = results.length > 50;

    if (!searchQuery.trim()) {
        return (
            <div className="text-center py-16">
                <FontAwesomeIcon icon={faSearch} className="text-gray-400 text-4xl mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                    Nhập từ khóa để tìm kiếm
                </h3>
                <p className="text-gray-500">
                    Tìm kiếm theo tên tỉnh, huyện, phường/xã cũ hoặc mới
                </p>
            </div>
        );
    }

    if (results.length === 0) {
        return (
            <div className="text-center py-16">
                <FontAwesomeIcon icon={faSearch} className="text-gray-400 text-4xl mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                    Không tìm thấy kết quả
                </h3>
                <p className="text-gray-500">
                    Thử với từ khóa khác hoặc kiểm tra lại chính tả
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
                Tìm thấy <span className="font-medium text-blue-600">{results.length}</span> kết quả
                {hasMoreResults && (
                    <span className="text-orange-600 ml-2">
                        (hiển thị 50 kết quả đầu)
                    </span>
                )}

                {/* Summary by level */}
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {groupedResults.province.length > 0 && (
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            Tỉnh/TP: {groupedResults.province.length}
                        </span>
                    )}
                    {groupedResults.district.length > 0 && (
                        <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">
                            Quận/Huyện: {groupedResults.district.length}
                        </span>
                    )}
                    {groupedResults.commune.length > 0 && (
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                            Xã/Phường: {groupedResults.commune.length}
                        </span>
                    )}
                </div>
            </div>

            {limitedResults.map((item) => (
                <SearchResultItem
                    key={item.id}
                    item={item}
                    searchQuery={searchQuery}
                />
            ))}

            {hasMoreResults && (
                <div className="text-center py-4 text-sm text-gray-500">
                    Có {results.length - 50} kết quả khác. Hãy sử dụng từ khóa cụ thể hơn để tìm kiếm chính xác.
                </div>
            )}
        </div>
    );
};

export default SearchResults;