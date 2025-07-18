import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import SearchResultItem from './SearchResultItem';
import type { FlatSearchItem } from '../hooks/useSearchData';

interface SearchResultsProps {
    results: FlatSearchItem[];
    searchQuery: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, searchQuery }) => {
    if (!searchQuery) {
        return (
            <div className="text-center py-12">
                <FontAwesomeIcon
                    icon={faSearch}
                    className="text-4xl text-gray-300 dark:text-gray-600 mb-4"
                />
                <p className="text-gray-500 dark:text-gray-400">
                    Nhập từ khóa để tìm kiếm thông tin đơn vị hành chính
                </p>
            </div>
        );
    }

    if (results.length === 0) {
        return (
            <div className="text-center py-12">
                <FontAwesomeIcon
                    icon={faInfoCircle}
                    className="text-4xl text-gray-300 dark:text-gray-600 mb-4"
                />
                <p className="text-gray-500 dark:text-gray-400">
                    Không tìm thấy kết quả nào cho "<strong>{searchQuery}</strong>"
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    Thử sử dụng từ khóa khác hoặc kiểm tra lại chính tả
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Kết quả tìm kiếm
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    {results.length} kết quả
                </span>
            </div>

            <div className="space-y-4">
                {results.map((item) => (
                    <SearchResultItem
                        key={item.id || `${item.level}-${Math.random()}`}
                        item={item}
                        searchQuery={searchQuery}
                    />
                ))}
            </div>
        </div>
    );
};

export default SearchResults;