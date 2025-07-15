import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import InfoPanel from '../components/InfoPanel';
import { useProvinceData } from '../hooks/useProvinceData';
import { createSearchIndex, searchProvinces } from '../utils/index';
import type { SearchIndex, SearchResult, TransformedProvinceMergedData } from '../types';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSearch} from "@fortawesome/free-solid-svg-icons";

const Home: React.FC = () => {
    const { provinces, provincesMerged, provinceMapping, mergeInfo, loading, error } = useProvinceData();
    const [searchIndex, setSearchIndex] = useState<SearchIndex | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
    const [currentProvinceName, setCurrentProvinceName] = useState('Chọn tỉnh để xem thông tin');
    const [mergedProvinceName, setMergedProvinceName] = useState('Chọn tỉnh để xem thông tin');
    const [relatedProvinces, setRelatedProvinces] = useState<string[]>([]);
    const [isActive, setIsActive] = useState(false);
    const [description, setDescription] = useState('');

    // Khởi tạo search index khi dữ liệu đã load
    useEffect(() => {
        if (provinces && provincesMerged && provinceMapping && mergeInfo) {
            try {
                // Tạo vietnamData từ các props - transform ProvinceData thành ProvinceMergedData
                const transformedData: TransformedProvinceMergedData = {};

                // Transform provincesMerged từ { [key: string]: string } thành ProvinceMergedData format
                Object.entries(provincesMerged).forEach(([key, value]) => {
                    transformedData[key] = {
                        [value]: {
                            tu_xa_cu: [value] // Simplified transformation
                        }
                    };
                });

                const vietnamData = {
                    tinh_moi: transformedData,
                    tra_cuu_tinh_cu: provinceMapping
                };

                const index = createSearchIndex(vietnamData);
                setSearchIndex(index);
            } catch (error) {
                console.error('Error creating search index:', error);
            }
        }
    }, [provinces, provincesMerged, provinceMapping, mergeInfo]);

    // Xử lý tìm kiếm
    useEffect(() => {
        if (searchQuery.trim() && searchIndex) {
            const results = searchProvinces(searchQuery, searchIndex);
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    }, [searchQuery, searchIndex]);

    // Xử lý khi chọn tỉnh từ kết quả tìm kiếm
    const handleProvinceSelect = (result: SearchResult) => {
        setSelectedProvince(result.newName);
        setCurrentProvinceName(result.oldName || result.newName);
        setMergedProvinceName(result.newName);
        setDescription(`Thông tin về ${result.newName}`);
        setIsActive(true);

        // Tìm các tỉnh liên quan
        if (searchIndex && result.province) {
            const provinceInfo = searchIndex.provinces[result.province];
            if (provinceInfo) {
                const related = provinceInfo.unitsList
                    .filter(unit => unit.newName !== result.newName)
                    .map(unit => unit.newName);
                setRelatedProvinces(related);
            }
        }

        // Clear search
        setSearchQuery('');
        setSearchResults([]);
    };

    // Reset selection
    const handleReset = () => {
        setSelectedProvince(null);
        setCurrentProvinceName('Chọn tỉnh để xem thông tin');
        setMergedProvinceName('Chọn tỉnh để xem thông tin');
        setRelatedProvinces([]);
        setDescription('');
        setIsActive(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <p className="text-red-600 text-lg">Lỗi: {error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            {/* Search Section */}
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto mb-8">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm kiếm tỉnh, thành phố, quận, huyện..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <FontAwesomeIcon icon={faSearch} />
                        </div>
                    </div>

                    {/* Search Results */}
                    {searchResults.length > 0 && (
                        <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {searchResults.map((result, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleProvinceSelect(result)}
                                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                >
                                    <div className="font-medium text-gray-900">
                                        {result.newName}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {result.province}
                                        {result.oldName && ` • Tên cũ: ${result.oldName}`}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                            {provincesMerged ? Object.keys(provincesMerged).length : 0}
                        </div>
                        <div className="text-gray-600">Tỉnh thành hiện tại</div>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                            {searchIndex ? Object.keys(searchIndex.newToOld).length : 0}
                        </div>
                        <div className="text-gray-600">Đơn vị hành chính mới</div>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-2">
                            {searchIndex ? Object.keys(searchIndex.oldToNew).length : 0}
                        </div>
                        <div className="text-gray-600">Đơn vị hành chính cũ</div>
                    </div>
                </div>

                {/* Province List */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-bold mb-4">Danh sách tỉnh thành</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {provincesMerged && Object.values(provincesMerged).map((provinceName, index) => (
                            <div
                                key={index}
                                onClick={() => {
                                    setSelectedProvince(provinceName);
                                    setCurrentProvinceName(provinceName);
                                    setMergedProvinceName(provinceName);
                                    setDescription(`Thông tin về ${provinceName}`);
                                    setIsActive(true);

                                    // Hiển thị thông tin chi tiết của tỉnh
                                    if (searchIndex) {
                                        const provinceInfo = searchIndex.provinces[provinceName];
                                        if (provinceInfo) {
                                            const related = provinceInfo.unitsList.map(unit => unit.newName);
                                            setRelatedProvinces(related);
                                        }
                                    }
                                }}
                                className={`
                                    p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md
                                    ${selectedProvince === provinceName
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <div className="font-medium text-gray-900">{provinceName}</div>
                                <div className="text-sm text-gray-500 mt-1">
                                    {searchIndex?.provinces[provinceName]?.units || 0} đơn vị hành chính
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Info Panel */}
                <InfoPanel
                    currentProvinceName={currentProvinceName}
                    mergedProvinceName={mergedProvinceName}
                    description={description}
                    relatedProvinces={relatedProvinces}
                    isActive={isActive}
                />

                {/* Reset Button */}
                {isActive && (
                    <div className="fixed bottom-6 right-6">
                        <button
                            onClick={handleReset}
                            className="bg-red-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                        >
                            Reset
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;