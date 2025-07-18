import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

interface MapDisplayProps {
    title: string;
    subtitle?: string;
    count: number;
    backgroundColor: string;
    onProvinceHover: (element: SVGElement, mapType: 'before' | 'merged') => void;
    onProvinceLeave: () => void;
    svgUrl: string;
    mapType: 'before' | 'merged';
    processedSvgContent?: string;
}

export interface MapDisplayRef {
    getContainer: () => HTMLDivElement | null;
}

const MapDisplay = forwardRef<MapDisplayRef, MapDisplayProps>(({
                                                                   title,
                                                                   subtitle,
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

        // Add styles with dark mode support
        const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
        style.textContent = `
            path, g[id*="VN-"] {
                fill: #e5e7eb;
                stroke: #9ca3af;
                stroke-width: 0.5;
                cursor: pointer;
                transition: fill 0.2s ease, stroke 0.2s ease;
            }
            path:hover, g[id*="VN-"]:hover {
                fill: #3b82f6;
                stroke: #1e40af;
                stroke-width: 1;
            }
            @media (prefers-color-scheme: dark) {
                path, g[id*="VN-"] {
                    fill: #4b5563;
                    stroke: #6b7280;
                }
                path:hover, g[id*="VN-"]:hover {
                    fill: #60a5fa;
                    stroke: #3b82f6;
                }
            }
            .dark path, .dark g[id*="VN-"] {
                fill: #4b5563;
                stroke: #6b7280;
            }
            .dark path:hover, .dark g[id*="VN-"]:hover {
                fill: #60a5fa;
                stroke: #3b82f6;
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-colors duration-200">
            <div className={`${backgroundColor} text-white p-4`}>
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-baseline">
                            <h2 className="text-xl font-bold">{title}</h2>
                            {subtitle && <p className="text-sm opacity-90 leading-relaxed ml-2">({subtitle})</p>}
                        </div>
                    </div>
                    <span className={`${backgroundColor.replace('bg-', 'bg-').replace('500', '600')} px-3 py-1 rounded-full text-sm flex-shrink-0`}>
                        {count} tỉnh thành
                    </span>
                </div>
            </div>
            <div className="p-4">
                <div
                    ref={mapRef}
                    className="w-full h-96 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 transition-colors duration-200"
                    style={{ minHeight: '384px' }}
                >
                    <div className="text-gray-500 dark:text-gray-400">Đang tải bản đồ...</div>
                </div>
            </div>
        </div>
    );
});

MapDisplay.displayName = 'MapDisplay';

export default MapDisplay;