import React, { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import type { FlatSearchItem } from '../hooks/useSearchData';
import SearchResultItem from './SearchResultItem';

interface SearchResultsProps {
    results: FlatSearchItem[];
    searchQuery: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, searchQuery }) => {
    // Detect administrative level from query
    const detectedLevel = useMemo(() => {
        const normalizedQuery = searchQuery.toLowerCase();

        if (normalizedQuery.includes('tỉnh') || normalizedQuery.includes('thành phố') ||
            normalizedQuery.includes('tinh') || normalizedQuery.includes('thanh pho')) {
            return 'province';
        }

        if (normalizedQuery.includes('quận') || normalizedQuery.includes('huyện') ||
            normalizedQuery.includes('thị xã') || normalizedQuery.includes('quan') ||
            normalizedQuery.includes('huyen') || normalizedQuery.includes('thi xa')) {
            return 'district';
        }

        if (normalizedQuery.includes('xã') || normalizedQuery.includes('phường') ||
            normalizedQuery.includes('thị trấn') || normalizedQuery.includes('xa') ||
            normalizedQuery.includes('phuong') || normalizedQuery.includes('thi tran')) {
            return 'commune';
        }

        return 'all';
    }, [searchQuery]);

    // Filter results based on detected level
    const filteredResults = useMemo(() => {
        if (detectedLevel === 'all') {
            return results.slice(0, 50);
        }

        // Chỉ hiển thị kết quả đúng cấp
        return results.filter(r => r.level === detectedLevel).slice(0, 20);
    }, [results, detectedLevel]);

    const hasMoreResults = results.length > filteredResults.length;

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
                <div className="mt-4 text-sm text-gray-400">
                    <p>💡 <strong>Mẹo:</strong> Sử dụng từ khóa cụ thể như:</p>
                    <p>"<strong>Tỉnh Phú Yên</strong>" - chỉ hiển thị kết quả cấp tỉnh</p>
                    <p>"<strong>Huyện Tuy Hòa</strong>" - chỉ hiển thị kết quả cấp huyện</p>
                    <p>"<strong>Xã Hòa Bình</strong>" - chỉ hiển thị kết quả cấp xã</p>
                </div>
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
            {/* Search info */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start space-x-3">
                    <FontAwesomeIcon icon={faInfoCircle} className="text-blue-600 mt-0.5" />
                    <div>
                        <div className="text-sm text-blue-800">
                            <strong>Kết quả tìm kiếm:</strong> {filteredResults.length} kết quả
                            {detectedLevel !== 'all' && (
                                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                    {detectedLevel === 'province' && 'Chỉ hiển thị cấp tỉnh/thành phố'}
                                    {detectedLevel === 'district' && 'Chỉ hiển thị cấp quận/huyện'}
                                    {detectedLevel === 'commune' && 'Chỉ hiển thị cấp xã/phường'}
                                </span>
                            )}
                        </div>
                        {hasMoreResults && (
                            <div className="text-xs text-blue-600 mt-1">
                                {detectedLevel === 'all' ?
                                    `Có ${results.length - filteredResults.length} kết quả khác. Sử dụng từ khóa cụ thể hơn.` :
                                    `Đã lọc ra ${results.length - filteredResults.length} kết quả không đúng cấp.`
                                }
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Results */}
            {filteredResults.map((item) => (
                <SearchResultItem
                    key={item.id}
                    item={item}
                    searchQuery={searchQuery}
                />
            ))}
        </div>
    );
};

export default SearchResults;