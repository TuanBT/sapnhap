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
    // Detect administrative level from query - CHỈ KHI CÓ PREFIX RÕ RÀNG
    const detectedLevel = useMemo(() => {
        const normalizedQuery = searchQuery.toLowerCase();

        // Chỉ detect level khi có prefix rõ ràng ở đầu
        if (normalizedQuery.startsWith('tỉnh ') || normalizedQuery.startsWith('tinh ')) {
            return 'province';
        }

        if (normalizedQuery.startsWith('quận ') || normalizedQuery.startsWith('huyện ') ||
            normalizedQuery.startsWith('thị xã ') || normalizedQuery.startsWith('quan ') ||
            normalizedQuery.startsWith('huyen ') || normalizedQuery.startsWith('thi xa ')) {
            return 'district';
        }

        if (normalizedQuery.startsWith('xã ') || normalizedQuery.startsWith('phường ') ||
            normalizedQuery.startsWith('thị trấn ') || normalizedQuery.startsWith('xa ') ||
            normalizedQuery.startsWith('phuong ') || normalizedQuery.startsWith('thi tran ')) {
            return 'commune';
        }

        // Không detect level nếu không có prefix rõ ràng
        return 'all';
    }, [searchQuery]);

    // KHÔNG filter results based on detected level - hiển thị tất cả kết quả
    const filteredResults = useMemo(() => {
        return results.slice(0, 100); // Tăng limit lên 100
    }, [results]);

    const hasMoreResults = results.length > filteredResults.length;

    if (!searchQuery.trim()) {
        return (
            <div className="text-center py-16">
                <FontAwesomeIcon icon={faSearch} className="text-gray-400 text-4xl mb-4" />
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nhập từ khóa để tìm kiếm
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Tìm kiếm theo tên tỉnh, huyện, phường/xã cũ hoặc mới
                </p>
                <div className="max-w-md mx-auto text-sm text-gray-400 dark:text-gray-500">
                    <p className="mb-2">💡 <strong>Mẹo tìm kiếm:</strong></p>
                    <div className="text-left space-y-1">
                        <p>"<strong>An Khánh</strong>" - tìm tất cả đơn vị có tên này</p>
                        <p>"<strong>Tuy Hòa</strong>" - tìm tất cả đơn vị có tên này</p>
                        <p>"<strong>Tỉnh Phú Yên</strong>" - chỉ tìm cấp tỉnh</p>
                        <p>"<strong>Huyện Tuy Hòa</strong>" - chỉ tìm cấp huyện</p>
                        <p>"<strong>Xã Hòa Bình</strong>" - chỉ tìm cấp xã</p>
                    </div>
                </div>
            </div>
        );
    }

    if (results.length === 0) {
        return (
            <div className="text-center py-16">
                <FontAwesomeIcon icon={faSearch} className="text-gray-400 text-4xl mb-4" />
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Không tìm thấy kết quả cho "{searchQuery}"
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Thử với từ khóa khác hoặc kiểm tra lại chính tả
                </p>
                <div className="max-w-md mx-auto text-sm text-gray-400 dark:text-gray-500">
                    <p className="mb-2">💡 <strong>Gợi ý:</strong></p>
                    <div className="text-left space-y-1">
                        <p>• Thử tìm kiếm với từ khóa ngắn hơn: "<strong>Tuy Hòa</strong>"</p>
                        <p>• Không cần gõ dấu tiếng Việt: "<strong>tuy hoa</strong>"</p>
                        <p>• Thử tìm kiếm tên cũ thay vì tên mới</p>
                        <p>• Chỉ sử dụng prefix khi muốn lọc cấp: "<strong>Huyện Tuy Hòa</strong>"</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Search info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                <div className="flex items-start space-x-3">
                    <FontAwesomeIcon icon={faInfoCircle} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                        <div className="text-sm text-blue-800 dark:text-blue-200">
                            <strong>Kết quả tìm kiếm cho:</strong> "<span className="font-mono">{searchQuery}</span>"
                        </div>
                        <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                            Tìm thấy {filteredResults.length} kết quả
                            {detectedLevel !== 'all' && (
                                <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded text-xs">
                                    {detectedLevel === 'province' && 'Lọc theo cấp tỉnh/thành phố'}
                                    {detectedLevel === 'district' && 'Lọc theo cấp quận/huyện'}
                                    {detectedLevel === 'commune' && 'Lọc theo cấp xã/phường'}
                                </span>
                            )}
                        </div>
                        {hasMoreResults && (
                            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                Có {results.length - filteredResults.length} kết quả khác. Scroll xuống để xem thêm.
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