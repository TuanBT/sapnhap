import React, { useState, useEffect, useRef } from 'react';
import { useProvinceData } from '../hooks/useProvinceData';
import { useMapLogic } from '../hooks/useMapLogic';
import { SVGMerger } from '../utils/svgMerger';
import MapDisplay, { type MapDisplayRef } from '../components/map/MapDisplay.tsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const Map: React.FC = () => {
    const { provinces, provincesMerged, provinceMapping, mergeInfo, loading, error } = useProvinceData();
    const [processedSvgContent, setProcessedSvgContent] = useState<string>('');

    const beforeMapRef = useRef<MapDisplayRef | null>(null);
    const mergedMapRef = useRef<MapDisplayRef | null>(null);

    const {
        beforeProvinceName,
        mergedProvinceName,
        currentHoveredProvince,
        allRelatedProvinces,
        description,
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

                {/* Mobile: Vertical Stack - Trên Dưới */}
                <div className="lg:hidden space-y-4">

                    {/* Map 1: Bản đồ TRƯỚC sáp nhập */}
                    <div className="h-[80vh]">
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

                    {/* Map 2: Bản đồ SAU sáp nhập */}
                    <div className="h-[80vh]">
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

                    {/* Footer tip */}
                    <div className="text-center">
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            Chụm 2 ngón để zoom • Chạm và kéo để di chuyển
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Map;