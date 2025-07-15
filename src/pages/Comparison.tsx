import React, { useState, useEffect, useRef } from 'react';
import { useProvinceData } from '../hooks/useProvinceData';
import { useMapLogic } from '../hooks/useMapLogic';
import { SVGMerger } from '../utils/svgMerger';
import MapDisplay, { type MapDisplayRef } from '../components/MapDisplay';
import Header from '../components/Header';
import InfoPanel from '../components/InfoPanel';

const Comparison: React.FC = () => {
    const { provinces, provincesMerged, provinceMapping, mergeInfo, loading, error } = useProvinceData();
    const [processedSvgContent, setProcessedSvgContent] = useState<string>('');

    const currentMapRef = useRef<MapDisplayRef | null>(null);
    const mergedMapRef = useRef<MapDisplayRef | null>(null);

    const {
        currentProvinceName,
        mergedProvinceName,
        isActive,
        handleProvinceHover,
        handleProvinceLeave
    } = useMapLogic({
        provinces,
        provincesMerged,
        provinceMapping,
        mergeInfo,
        currentMapRef,
        mergedMapRef
    });

    // Process merged SVG
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
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="container mx-auto px-4 pb-8 pt-3">
                {/* Maps */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <MapDisplay
                        ref={currentMapRef}
                        title="Bản đồ Trước sáp nhập"
                        count={provinces ? Object.keys(provinces).length : 0}
                        backgroundColor="bg-blue-500"
                        onProvinceHover={handleProvinceHover}
                        onProvinceLeave={handleProvinceLeave}
                        svgUrl="/vn.svg"
                        mapType="current"
                    />

                    <MapDisplay
                        ref={mergedMapRef}
                        title="Bản đồ Sau sáp nhập"
                        count={provincesMerged ? Object.keys(provincesMerged).length : 0}
                        backgroundColor="bg-green-500"
                        onProvinceHover={handleProvinceHover}
                        onProvinceLeave={handleProvinceLeave}
                        svgUrl="/vn2.svg"
                        mapType="merged"
                        processedSvgContent={processedSvgContent}
                    />
                </div>

                {/* Info Panel */}
                <InfoPanel
                    currentProvinceName={currentProvinceName}
                    mergedProvinceName={mergedProvinceName}
                    isActive={isActive}
                />
            </div>
        </div>
    );
};

export default Comparison;