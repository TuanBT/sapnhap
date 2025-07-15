import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faMapMarkerAlt, faArrowRight, faInfo } from '@fortawesome/free-solid-svg-icons';
import { useProvinceData } from '../hooks/useProvinceData';
import { SVGMerger } from '../utils/svgMerger';

const Comparison: React.FC = () => {
    const { provinces, provincesMerged, provinceMapping, mergeInfo, loading, error } = useProvinceData();
    const [currentProvinceName, setCurrentProvinceName] = useState('Hover vào bản đồ');
    const [mergedProvinceName, setMergedProvinceName] = useState('Hover vào bản đồ');
    const [relatedProvinces, setRelatedProvinces] = useState<string[]>([]);
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(false);

    const currentMapRef = useRef<HTMLDivElement>(null);
    const mergedMapRef = useRef<HTMLDivElement>(null);

    // Load SVG và setup event listeners
    useEffect(() => {
        const loadSVG = async () => {
            if (!provinces || !provincesMerged || !provinceMapping || !mergeInfo) return;

            try {
                console.log('🔄 Loading SVG files...');

                // Load SVG cho bản đồ hiện tại (63 tỉnh)
                const currentResponse = await fetch('/vn.svg');
                const currentSvgContent = await currentResponse.text();
                if (currentMapRef.current) {
                    currentMapRef.current.innerHTML = currentSvgContent;
                    setupEventListeners(currentMapRef.current, 'current');
                    console.log('✅ Current map loaded');
                }

                // Load SVG cho bản đồ sau sáp nhập (33 tỉnh)
                const mergedResponse = await fetch('/vn2.svg');
                const mergedSvgContent = await mergedResponse.text();

                // 🔥 MERGE SVG THEO MAPPING
                const merger = new SVGMerger(provinceMapping, mergeInfo);
                const processedSvgContent = merger.mergeSVG(mergedSvgContent);

                if (mergedMapRef.current) {
                    mergedMapRef.current.innerHTML = processedSvgContent;
                    setupEventListeners(mergedMapRef.current, 'merged');
                    console.log('✅ Merged map loaded and processed');
                }
            } catch (error) {
                console.error('❌ Error loading SVG:', error);
            }
        };

        loadSVG();
    }, [provinces, provincesMerged, provinceMapping, mergeInfo]);

    const setupEventListeners = (container: HTMLDivElement, mapType: 'current' | 'merged') => {
        const svg = container.querySelector('svg');
        if (!svg) {
            console.warn(`No SVG found in ${mapType} container`);
            return;
        }

        // Add styles
        const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
        style.textContent = `
            path, g[id*="VN-"] {
                fill: #e5e7eb;
                stroke: #9ca3af;
                stroke-width: 0.5;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            path:hover, g[id*="VN-"]:hover {
                fill: #3b82f6;
                stroke: #1e40af;
                stroke-width: 1;
            }
        `;
        svg.insertBefore(style, svg.firstChild);

        // Add event listeners
        const elements = svg.querySelectorAll('path, g[id*="VN-"]');
        console.log(`📍 Setting up ${mapType} map - found ${elements.length} elements`);

        elements.forEach((element, index) => {
            const elementId = element.id;

            if (index < 3) {
                console.log(`${mapType} Element ${index}:`, elementId);
            }

            element.addEventListener('mouseenter', () => {
                console.log(`🖱️ Mouse enter: ${mapType} - ${elementId}`);
                handleProvinceHover(element as SVGElement, mapType);
            });

            element.addEventListener('mouseleave', () => {
                console.log(`🖱️ Mouse leave: ${mapType} - ${elementId}`);
                handleProvinceLeave();
            });
        });
    };

    const handleProvinceHover = (element: SVGElement, mapType: 'current' | 'merged') => {
        if (!provinces || !provincesMerged || !provinceMapping || !mergeInfo) return;

        const provinceId = element.id;
        if (!provinceId) {
            console.warn('No province ID found for element:', element);
            return;
        }

        console.log(`=== HOVER EVENT ===`);
        console.log(`Map type: ${mapType}`);
        console.log(`Province ID: ${provinceId}`);

        // Highlight
        (element as any).style.fill = '#3b82f6';
        (element as any).style.stroke = '#1e40af';
        (element as any).style.strokeWidth = '1';

        let currentName = '';
        let mergedName = '';
        let related: string[] = [];
        let desc = '';

        if (mapType === 'current') {
            // Từ bản đồ hiện tại (63 tỉnh)
            const currentProvinceName = provinces[provinceId] || provinceId;
            console.log(`Current province name: ${currentProvinceName}`);

            const mappedId = provinceMapping[provinceId];
            console.log(`Mapped ID: ${mappedId}`);

            if (mappedId && provincesMerged[mappedId]) {
                mergedName = provincesMerged[mappedId];
                console.log(`Merged province name: ${mergedName}`);

                const info = mergeInfo[mappedId];
                if (info) {
                    currentName = info.originalProvinces.join(', ');
                    desc = info.description;
                    related = info.originalProvinces;
                } else {
                    currentName = currentProvinceName;
                    desc = `${currentProvinceName} không có thông tin sáp nhập`;
                }
            } else {
                currentName = currentProvinceName;
                mergedName = currentProvinceName;
                desc = `${currentProvinceName} không được sáp nhập`;
            }
        } else {
            // Từ bản đồ sau sáp nhập (33 tỉnh)
            // Bây giờ provinceId sẽ là ID mới (đã merged)
            mergedName = provincesMerged[provinceId] || provinceId;
            console.log(`Merged province name: ${mergedName}`);

            const info = mergeInfo[provinceId];
            if (info) {
                currentName = info.originalProvinces.join(', ');
                related = info.originalProvinces;
                desc = info.description;
            } else {
                currentName = mergedName;
                desc = `${mergedName} không có thông tin sáp nhập`;
            }
        }

        console.log('Final result:', {
            currentName,
            mergedName,
            related,
            desc
        });

        // Cập nhật state
        setCurrentProvinceName(currentName);
        setMergedProvinceName(mergedName);
        setRelatedProvinces(related);
        setDescription(desc);
        setIsActive(true);
    };

    const handleProvinceLeave = () => {
        // Reset colors
        [currentMapRef, mergedMapRef].forEach(ref => {
            if (ref.current) {
                const svg = ref.current.querySelector('svg');
                if (svg) {
                    const elements = svg.querySelectorAll('path, g[id*="VN-"]');
                    elements.forEach(element => {
                        (element as any).style.fill = '#e5e7eb';
                        (element as any).style.stroke = '#9ca3af';
                        (element as any).style.strokeWidth = '0.5';
                    });
                }
            }
        });

        // Reset state
        setIsActive(false);
        setCurrentProvinceName('Hover vào bản đồ');
        setMergedProvinceName('Hover vào bản đồ');
        setRelatedProvinces([]);
        setDescription('');
    };

    // ... rest of the component remains the same
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
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-5 text-center shadow-lg">
                <h1 className="text-4xl font-bold mb-2 drop-shadow-lg">
                    <FontAwesomeIcon icon={faGlobe} className="mr-2" />
                    🇻🇳 So sánh Bản đồ Việt Nam sau Sáp nhập
                </h1>
                <p className="text-xl opacity-90">
                    Hover vào bất kỳ tỉnh nào để xem sự thay đổi trước và sau sáp nhập
                </p>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 pb-8 pt-3">

                {/* Maps */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Current Map */}
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="bg-blue-500 text-white p-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold">Bản đồ Trước sáp nhập</h2>
                            <span className="bg-blue-600 px-3 py-1 rounded-full text-sm">
                                {provinces ? Object.keys(provinces).length : 0} tỉnh thành
                            </span>
                        </div>
                        <div className="p-4">
                            <div
                                ref={currentMapRef}
                                className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300"
                                style={{ minHeight: '384px' }}
                            >
                                <div className="text-gray-500">Đang tải bản đồ...</div>
                            </div>
                        </div>
                    </div>

                    {/* Merged Map */}
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="bg-green-500 text-white p-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold">Bản đồ Sau sáp nhập</h2>
                            <span className="bg-green-600 px-3 py-1 rounded-full text-sm">
                                {provincesMerged ? Object.keys(provincesMerged).length : 0} tỉnh thành
                            </span>
                        </div>
                        <div className="p-4">
                            <div
                                ref={mergedMapRef}
                                className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300"
                                style={{ minHeight: '384px' }}
                            >
                                <div className="text-gray-500">Đang tải bản đồ...</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Panel */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex flex-col lg:flex-row items-center justify-between mb-5 gap-5">
                        <div className="flex-1 text-center">
                            <h3 className="text-blue-600 mb-2 text-lg font-semibold">
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                                Trước sáp nhập:
                            </h3>
                            <div className={`
                                text-lg font-bold min-h-[60px] flex items-center justify-center p-3 
                                rounded-lg transition-all duration-300 bg-blue-50 text-blue-700 
                                border-2 border-blue-500 
                                ${isActive ? 'shadow-lg' : ''}
                            `}>
                                {currentProvinceName}
                            </div>
                        </div>

                        <div className="text-3xl text-yellow-500 font-bold drop-shadow-sm">
                            <FontAwesomeIcon icon={faArrowRight} className="transform lg:rotate-0 rotate-90" />
                        </div>

                        <div className="flex-1 text-center">
                            <h3 className="text-green-600 mb-2 text-lg font-semibold">
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                                Sau sáp nhập:
                            </h3>
                            <div className={`
                                text-lg font-bold min-h-[60px] flex items-center justify-center p-3 
                                rounded-lg transition-all duration-300 bg-green-50 text-green-700 
                                border-2 border-green-500 
                                ${isActive ? 'shadow-lg' : ''}
                            `}>
                                {mergedProvinceName}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {description && (
                        <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500 mb-4">
                            <div className="font-semibold text-yellow-800 mb-2">
                                <FontAwesomeIcon icon={faInfo} className="mr-2" />
                                Thông tin sáp nhập:
                            </div>
                            <p className="text-yellow-700">{description}</p>
                        </div>
                    )}

                    {/* Related Provinces */}
                    <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                        <div className="font-semibold text-gray-800 text-lg mb-2">
                            <FontAwesomeIcon icon={faInfo} className="mr-2" />
                            Các tỉnh liên quan:
                        </div>
                        <div className="text-gray-600 leading-relaxed">
                            {relatedProvinces.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {relatedProvinces.map((province, index) => (
                                        <span
                                            key={index}
                                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm border border-blue-300"
                                        >
                                            {province}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                'Chưa có thông tin'
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Comparison;