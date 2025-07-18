import React, { useState, useEffect, useRef } from 'react';
import { useProvinceData } from '../hooks/useProvinceData';
import { useMapLogic } from '../hooks/useMapLogic';
import { SVGMerger } from '../utils/svgMerger';
import MapDisplay, { type MapDisplayRef } from '../components/MapDisplay';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const Comparison: React.FC = () => {
    const { provinces, provincesMerged, provinceMapping, mergeInfo, loading, error } = useProvinceData();
    const [processedSvgContent, setProcessedSvgContent] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'before' | 'merged'>('before'); // State cho tab mobile

    const beforeMapRef = useRef<MapDisplayRef | null>(null);
    const mergedMapRef = useRef<MapDisplayRef | null>(null);

    const {
        beforeProvinceName,
        mergedProvinceName,
        currentHoveredProvince,
        allRelatedProvinces,
        description,
        isActive,
        handleProvinceHover,
        handleProvinceLeave
    } = useMapLogic({
        provinces,
        provincesMerged,
        provinceMapping,
        mergeInfo,
        beforeMapRef,
        mergedMapRef
    });

    useEffect(() => {
        const processMergedSVG = async () => {
            if (!provinceMapping || !mergeInfo) return;

            try {
                const mergedResponse = await fetch('/vn2.svg');
                const mergedSvgContent = await mergedResponse.text();

                const merger = new SVGMerger(provinceMapping, mergeInfo);
                const processed = merger.mergeSVG(mergedSvgContent);
                setProcessedSvgContent(processed);
            } catch (error) {
                console.error('Error processing merged SVG:', error);
            }
        };

        processMergedSVG();
    }, [provinceMapping, mergeInfo]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <FontAwesomeIcon
                        icon={faSpinner}
                        className="text-4xl text-blue-500 animate-spin mb-4"
                    />
                    <p className="text-gray-600 dark:text-gray-300">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <FontAwesomeIcon
                        icon={faExclamationTriangle}
                        className="text-4xl text-red-500 mb-4"
                    />
                    <p className="text-red-600 dark:text-red-400 text-lg">Lỗi: {error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <div className="container mx-auto px-2 md:px-4 pb-4 md:pb-8 pt-2 md:pt-6">
                {/* Mobile: Tab Navigation */}
                <div className="lg:hidden mb-4">
                    <div className="flex bg-white dark:bg-gray-800 rounded-lg shadow-sm p-1">
                        <button
                            onClick={() => setActiveTab('before')}
                            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                                activeTab === 'before'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            Bản đồ cũ (63 tỉnh)
                        </button>
                        <button
                            onClick={() => setActiveTab('merged')}
                            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                                activeTab === 'merged'
                                    ? 'bg-green-600 text-white'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            Bản đồ mới (34 tỉnh)
                        </button>
                    </div>
                </div>

                {/* Mobile: Single Map Display */}
                <div className="lg:hidden">
                    <div className="h-[calc(100vh-12rem)]">
                        {activeTab === 'before' ? (
                            <MapDisplay
                                ref={beforeMapRef}
                                title={currentHoveredProvince || beforeProvinceName}
                                subtitle={currentHoveredProvince && allRelatedProvinces !== currentHoveredProvince
                                    ? `${allRelatedProvinces}`
                                    : ''}
                                count={provinces ? Object.keys(provinces).length : 0}
                                backgroundColor="bg-blue-600"
                                onProvinceHover={handleProvinceHover}
                                onProvinceLeave={handleProvinceLeave}
                                svgUrl="/vn.svg"
                                mapType="before"
                                showTooltip={true}
                                tooltipContent={description}
                            />
                        ) : (
                            <MapDisplay
                                ref={mergedMapRef}
                                title={currentHoveredProvince || mergedProvinceName}
                                subtitle={currentHoveredProvince && allRelatedProvinces !== currentHoveredProvince
                                    ? `${allRelatedProvinces}`
                                    : ''}
                                count={provincesMerged ? Object.keys(provincesMerged).length : 0}
                                backgroundColor="bg-green-600"
                                onProvinceHover={handleProvinceHover}
                                onProvinceLeave={handleProvinceLeave}
                                svgUrl="/vn2.svg"
                                mapType="merged"
                                processedSvgContent={processedSvgContent}
                                showTooltip={true}
                                tooltipContent={description}
                            />
                        )}
                    </div>
                </div>

                {/* Desktop: Side by side */}
                <div className="hidden lg:grid lg:grid-cols-2 gap-6">
                    <div className="h-[calc(100vh-8rem)]">
                        <MapDisplay
                            ref={beforeMapRef}
                            title={currentHoveredProvince || beforeProvinceName}
                            subtitle={currentHoveredProvince && allRelatedProvinces !== currentHoveredProvince
                                ? `${allRelatedProvinces}`
                                : ''}
                            count={provinces ? Object.keys(provinces).length : 0}
                            backgroundColor="bg-blue-600"
                            onProvinceHover={handleProvinceHover}
                            onProvinceLeave={handleProvinceLeave}
                            svgUrl="/vn.svg"
                            mapType="before"
                            showTooltip={true}
                            tooltipContent={description}
                        />
                    </div>

                    <div className="h-[calc(100vh-8rem)]">
                        <MapDisplay
                            ref={mergedMapRef}
                            title={currentHoveredProvince || mergedProvinceName}
                            subtitle={currentHoveredProvince && allRelatedProvinces !== currentHoveredProvince
                                ? `${allRelatedProvinces}`
                                : ''}
                            count={provincesMerged ? Object.keys(provincesMerged).length : 0}
                            backgroundColor="bg-green-600"
                            onProvinceHover={handleProvinceHover}
                            onProvinceLeave={handleProvinceLeave}
                            svgUrl="/vn2.svg"
                            mapType="merged"
                            processedSvgContent={processedSvgContent}
                            showTooltip={true}
                            tooltipContent={description}
                        />
                    </div>
                </div>

                {/* Mobile: Hiển thị thông tin chi tiết ở dưới */}
                {isActive && (
                    <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg lg:hidden">
                        <div className="text-sm">
                            <div className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
                                {currentHoveredProvince}
                            </div>
                            <div className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {description}
                            </div>
                        </div>
                    </div>
                )}

                {/* Mobile: Tab indicator */}
                <div className="lg:hidden mt-4 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Chuyển tab để xem bản đồ {activeTab === 'before' ? 'sau' : 'trước'} sáp nhập
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Comparison;