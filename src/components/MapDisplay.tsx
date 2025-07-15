import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

interface MapDisplayProps {
    title: string;
    count: number;
    backgroundColor: string;
    onProvinceHover: (element: SVGElement, mapType: 'current' | 'merged') => void;
    onProvinceLeave: () => void;
    svgUrl: string;
    mapType: 'current' | 'merged';
    processedSvgContent?: string;
}

export interface MapDisplayRef {
    getContainer: () => HTMLDivElement | null;
}

const MapDisplay = forwardRef<MapDisplayRef, MapDisplayProps>(({
                                                                   title,
                                                                   count,
                                                                   backgroundColor,
                                                                   onProvinceHover,
                                                                   onProvinceLeave,
                                                                   svgUrl,
                                                                   mapType,
                                                                   processedSvgContent
                                                               }, ref) => {
    const mapRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
        getContainer: () => mapRef.current
    }));

    useEffect(() => {
        const loadSVG = async () => {
            if (!mapRef.current) return;

            try {
                let svgContent: string;

                if (processedSvgContent) {
                    svgContent = processedSvgContent;
                } else {
                    const response = await fetch(svgUrl);
                    svgContent = await response.text();
                }

                mapRef.current.innerHTML = svgContent;
                setupEventListeners();
            } catch (error) {
                console.error(`Error loading SVG for ${mapType}:`, error);
            }
        };

        loadSVG();
    }, [svgUrl, mapType, processedSvgContent]);

    const setupEventListeners = () => {
        if (!mapRef.current) return;

        const svg = mapRef.current.querySelector('svg');
        if (!svg) return;

        // Add styles - Remove transition để tránh conflict khi programmatically change style
        const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
        style.textContent = `
            path, g[id*="VN-"] {
                fill: #e5e7eb;
                stroke: #9ca3af;
                stroke-width: 0.5;
                cursor: pointer;
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
        console.log(`Setting up ${mapType} map - found ${elements.length} elements`);

        elements.forEach((element, index) => {
            if (index < 3) {
                console.log(`${mapType} element ${index}: ${element.id}`);
            }

            element.addEventListener('mouseenter', () => {
                onProvinceHover(element as SVGElement, mapType);
            });

            element.addEventListener('mouseleave', () => {
                onProvinceLeave();
            });
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className={`${backgroundColor} text-white p-4 flex justify-between items-center`}>
                <h2 className="text-xl font-bold">{title}</h2>
                <span className={`${backgroundColor.replace('bg-', 'bg-').replace('500', '600')} px-3 py-1 rounded-full text-sm`}>
                    {count} tỉnh thành
                </span>
            </div>
            <div className="p-4">
                <div
                    ref={mapRef}
                    className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300"
                    style={{ minHeight: '384px' }}
                >
                    <div className="text-gray-500">Đang tải bản đồ...</div>
                </div>
            </div>
        </div>
    );
});

MapDisplay.displayName = 'MapDisplay';

export default MapDisplay;