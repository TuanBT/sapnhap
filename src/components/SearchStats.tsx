import React from 'react';
import type { SearchData } from '../hooks/useSearchData';

interface SearchStatsProps {
    searchData: SearchData;
}

const SearchStats: React.FC<SearchStatsProps> = ({ searchData }) => {
    const totalOriginalUnits = searchData.allItems.reduce(
        (acc, item) => acc + item.originalUnits.length, 0
    );

    const totalNewUnits = searchData.allItems.length;
    const overallRatio = totalOriginalUnits / totalNewUnits;

    const provincesWithMerge = searchData.provinces.filter(p => p.mergeRatio > 1);
    const districtsWithMerge = searchData.districts.filter(d => d.mergeRatio > 1);
    const communesWithMerge = searchData.communes.filter(c => c.mergeRatio > 1);

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    📊 Thống kê tổng quan
                </h3>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <span className="text-xl">🏛️</span>
                            <span className="font-medium text-gray-900">Tỉnh/Thành phố</span>
                        </div>
                        <div className="text-right">
                            <div className="font-semibold text-blue-600">
                                {searchData.provinces.length}
                            </div>
                            <div className="text-xs text-gray-600">
                                {provincesWithMerge.length} có sáp nhập
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <span className="text-xl">🏢</span>
                            <span className="font-medium text-gray-900">Huyện/Quận</span>
                        </div>
                        <div className="text-right">
                            <div className="font-semibold text-green-600">
                                {searchData.districts.length}
                            </div>
                            <div className="text-xs text-gray-600">
                                {districtsWithMerge.length} có sáp nhập
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <span className="text-xl">🏘️</span>
                            <span className="font-medium text-gray-900">Xã/Phường</span>
                        </div>
                        <div className="text-right">
                            <div className="font-semibold text-purple-600">
                                {searchData.communes.length}
                            </div>
                            <div className="text-xs text-gray-600">
                                {communesWithMerge.length} có sáp nhập
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    📈 Tỷ lệ sáp nhập
                </h3>

                <div className="space-y-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">
                            {overallRatio.toFixed(2)}:1
                        </div>
                        <div className="text-sm text-gray-600">
                            Tỷ lệ sáp nhập tổng thể
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="font-semibold text-blue-600">
                                {totalOriginalUnits.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-600">
                                Đơn vị gốc
                            </div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="font-semibold text-green-600">
                                {totalNewUnits.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-600">
                                Đơn vị mới
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    💡 Hướng dẫn sử dụng
                </h3>

                <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-start space-x-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>Nhập tên đơn vị cũ hoặc mới để tìm kiếm</span>
                    </div>
                    <div className="flex items-start space-x-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>Sử dụng bộ lọc để thu hẹp kết quả</span>
                    </div>
                    <div className="flex items-start space-x-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>Click "Chi tiết" để xem danh sách đơn vị gốc</span>
                    </div>
                    <div className="flex items-start space-x-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>Tỷ lệ sáp nhập cho biết bao nhiêu đơn vị cũ gộp thành 1</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchStats;