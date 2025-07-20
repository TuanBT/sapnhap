import { useRef, useEffect, forwardRef, useImperativeHandle, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearchPlus, faSearchMinus, faExpand } from '@fortawesome/free-solid-svg-icons';

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
    tooltipContent?: string;
    showTooltip?: boolean;
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
                                                                   processedSvgContent,
                                                                   tooltipContent,
                                                               }, ref) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [translateX, setTranslateX] = useState(0);
    const [translateY, setTranslateY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0, translateX: 0, translateY: 0 });

    // Touch handling for pinch zoom
    const [touchStart, setTouchStart] = useState<{ dist: number; scale: number; x: number; y: number } | null>(null);

    // State cho tooltip
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);
    const [selectedElement, setSelectedElement] = useState<SVGElement | null>(null);

    // Detect mobile device
    const isMobile = () => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            ('ontouchstart' in window) ||
            (window.innerWidth <= 768);
    };

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

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Wheel event handler with proper passive: false
        const handleWheelEvent = (e: WheelEvent) => {
            e.preventDefault();
            if (e.deltaY < 0) {
                setScale(prevScale => Math.min(prevScale * 1.3, 4));
            } else {
                setScale(prevScale => Math.max(prevScale / 1.3, 0.6));
            }
        };

        const preventTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        };

        container.addEventListener('wheel', handleWheelEvent, { passive: false });
        container.addEventListener('touchmove', preventTouchMove, { passive: false });

        return () => {
            container.removeEventListener('wheel', handleWheelEvent);
            container.removeEventListener('touchmove', preventTouchMove);
        };
    }, []);

    // Reset selection when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent | TouchEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                resetSelection();
            }
        };

        document.addEventListener('click', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [selectedElement]);

    const resetSelection = () => {
        if (selectedElement) {
            selectedElement.classList.remove('province-selected');
            selectedElement.removeAttribute('style');

            const isDarkMode = document.documentElement.classList.contains('dark');
            const defaultFill = isDarkMode ? '#4b5563' : '#e5e7eb';
            const defaultStroke = isDarkMode ? '#6b7280' : '#9ca3af';

            selectedElement.setAttribute('fill', defaultFill);
            selectedElement.setAttribute('stroke', defaultStroke);
            selectedElement.setAttribute('stroke-width', '0.5');

            setSelectedElement(null);
        }
        setIsTooltipVisible(false);
        onProvinceLeave();
    };

    const highlightElement = (element: SVGElement) => {
        const isDarkMode = document.documentElement.classList.contains('dark');
        const selectedFill = isDarkMode ? '#60a5fa' : '#3b82f6';
        const selectedStroke = isDarkMode ? '#3b82f6' : '#1e40af';

        element.setAttribute('fill', selectedFill);
        element.setAttribute('stroke', selectedStroke);
        element.setAttribute('stroke-width', '1.5');
        element.classList.add('province-selected');
    };

    const resetElementStyle = (element: SVGElement) => {
        element.classList.remove('province-selected');
        element.removeAttribute('style');

        const isDarkMode = document.documentElement.classList.contains('dark');
        const defaultFill = isDarkMode ? '#4b5563' : '#e5e7eb';
        const defaultStroke = isDarkMode ? '#6b7280' : '#9ca3af';

        element.setAttribute('fill', defaultFill);
        element.setAttribute('stroke', defaultStroke);
        element.setAttribute('stroke-width', '0.5');
    };

    const setupEventListeners = () => {
        if (!mapRef.current) return;

        const svg = mapRef.current.querySelector('svg');
        if (!svg) return;

        const mobile = isMobile();

        const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
        style.textContent = `
            path, g[id*="VN-"] {
                fill: #e5e7eb;
                stroke: #9ca3af;
                stroke-width: 0.5;
                cursor: pointer;
                transition: fill 0.2s ease, stroke 0.2s ease;
            }
            ${!mobile ? `
                path:hover:not(.province-selected), g[id*="VN-"]:hover:not(.province-selected) {
                    fill: #3b82f6;
                    stroke: #1e40af;
                    stroke-width: 1;
                }
            ` : ''}
            @media (prefers-color-scheme: dark) {
                path, g[id*="VN-"] {
                    fill: #4b5563;
                    stroke: #6b7280;
                }
                ${!mobile ? `
                    path:hover:not(.province-selected), g[id*="VN-"]:hover:not(.province-selected) {
                        fill: #60a5fa;
                        stroke: #3b82f6;
                    }
                ` : ''}
            }
            .dark path, .dark g[id*="VN-"] {
                fill: #4b5563;
                stroke: #6b7280;
            }
            ${!mobile ? `
                .dark path:hover:not(.province-selected), .dark g[id*="VN-"]:hover:not(.province-selected) {
                    fill: #60a5fa;
                    stroke: #3b82f6;
                }
            ` : ''}
        `;
        svg.insertBefore(style, svg.firstChild);

        const elements = svg.querySelectorAll('path, g[id*="VN-"]');

        elements.forEach((element) => {
            if (mobile) {
                // Mobile: Chỉ có click behavior
                element.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    if (isDragging) return;

                    // Reset previous selection
                    if (selectedElement && selectedElement !== element) {
                        resetElementStyle(selectedElement);
                    }

                    // Toggle current selection
                    if (selectedElement === element) {
                        resetSelection();
                    } else {
                        setSelectedElement(element as SVGElement);
                        highlightElement(element as SVGElement);

                        // Get click position for tooltip
                        const rect = containerRef.current?.getBoundingClientRect();
                        if (rect) {
                            setTooltipPosition({
                                x: rect.width / 2,
                                y: rect.height / 2
                            });
                        }

                        onProvinceHover(element as SVGElement, mapType);
                        setIsTooltipVisible(true);
                    }
                });
            } else {
                // Desktop: Hover + click behavior
                element.addEventListener('mouseenter', () => {
                    if (!isDragging && !selectedElement) {
                        onProvinceHover(element as SVGElement, mapType);
                        setIsTooltipVisible(true);
                    }
                });

                element.addEventListener('mousemove', (e) => {
                    if (!isDragging && !selectedElement) {
                        const mouseEvent = e as MouseEvent;
                        const rect = containerRef.current?.getBoundingClientRect();
                        if (rect) {
                            setTooltipPosition({
                                x: mouseEvent.clientX - rect.left + 10,
                                y: mouseEvent.clientY - rect.top - 10
                            });
                        }
                    }
                });

                element.addEventListener('mouseleave', () => {
                    if (!isDragging && !selectedElement) {
                        onProvinceLeave();
                        setIsTooltipVisible(false);
                    }
                });

                element.addEventListener('click', (e) => {
                    if (isDragging) {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                    }

                    e.preventDefault();
                    e.stopPropagation();

                    if (selectedElement && selectedElement !== element) {
                        resetElementStyle(selectedElement);
                    }

                    if (selectedElement === element) {
                        resetSelection();
                    } else {
                        setSelectedElement(element as SVGElement);
                        highlightElement(element as SVGElement);

                        const rect = containerRef.current?.getBoundingClientRect();
                        if (rect) {
                            const mouseEvent = e as MouseEvent;
                            setTooltipPosition({
                                x: mouseEvent.clientX - rect.left + 10,
                                y: mouseEvent.clientY - rect.top - 10
                            });
                        }

                        onProvinceHover(element as SVGElement, mapType);
                        setIsTooltipVisible(true);
                    }
                });
            }
        });
    };

    // Touch distance calculation
    const getTouchDistance = (touches: React.TouchList) => {
        if (touches.length < 2) return 0;
        const touch1 = touches[0];
        const touch2 = touches[1];
        return Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );
    };

    // Touch center calculation
    const getTouchCenter = (touches: React.TouchList) => {
        if (touches.length < 2) return { x: 0, y: 0 };
        const touch1 = touches[0];
        const touch2 = touches[1];
        return {
            x: (touch1.clientX + touch2.clientX) / 2,
            y: (touch1.clientY + touch2.clientY) / 2
        };
    };

    const handleZoomIn = () => {
        setScale(prevScale => Math.min(prevScale * 1.3, 4));
    };

    const handleZoomOut = () => {
        setScale(prevScale => Math.max(prevScale / 1.3, 0.6));
    };

    const handleResetZoom = () => {
        setScale(1);
        setTranslateX(0);
        setTranslateY(0);
    };

    // Mouse events
    const handleMouseDown = (e: React.MouseEvent) => {
        if (scale > 1) {
            e.preventDefault();
            setIsDragging(true);
            setDragStart({
                x: e.clientX,
                y: e.clientY,
                translateX: translateX,
                translateY: translateY
            });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && scale > 1) {
            e.preventDefault();
            const deltaX = e.clientX - dragStart.x;
            const deltaY = e.clientY - dragStart.y;
            setTranslateX(dragStart.translateX + deltaX);
            setTranslateY(dragStart.translateY + deltaY);
        }
    };

    const handleMouseUp = () => {
        if (isDragging) {
            setTimeout(() => {
                setIsDragging(false);
            }, 100);
        }
    };

    // Touch events - Google Maps style
    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            const distance = getTouchDistance(e.touches);
            const center = getTouchCenter(e.touches);
            setTouchStart({
                dist: distance,
                scale: scale,
                x: center.x,
                y: center.y
            });
        } else if (e.touches.length === 1 && scale > 1) {
            e.preventDefault();
            setIsDragging(true);
            setDragStart({
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
                translateX: translateX,
                translateY: translateY
            });
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 2 && touchStart) {
            e.preventDefault();
            const distance = getTouchDistance(e.touches);
            const scaleChange = distance / touchStart.dist;
            const newScale = Math.min(Math.max(touchStart.scale * scaleChange, 0.6), 4);
            setScale(newScale);
        } else if (e.touches.length === 1 && isDragging && scale > 1) {
            e.preventDefault();
            const deltaX = e.touches[0].clientX - dragStart.x;
            const deltaY = e.touches[0].clientY - dragStart.y;
            setTranslateX(dragStart.translateX + deltaX);
            setTranslateY(dragStart.translateY + deltaY);
        }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (e.touches.length < 2) {
            setTouchStart(null);
        }
        if (e.touches.length === 0) {
            setTimeout(() => {
                setIsDragging(false);
            }, 100);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-colors duration-200 h-full flex flex-col">
            <div className={`${backgroundColor} text-white p-2 md:p-4 flex-shrink-0`}>
                <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-baseline">
                            <h2 className="text-lg md:text-xl font-bold truncate">{title}</h2>
                        </div>
                    </div>
                    <span className={`${backgroundColor.replace('bg-', 'bg-').replace('500', '600')} px-2 md:px-3 py-1 rounded-full text-xs md:text-sm flex-shrink-0 ml-2`}>
                        {count} tỉnh
                    </span>
                </div>
            </div>

            <div className="p-2 md:p-4 flex-1 flex flex-col min-h-0">
                {/* Zoom Controls */}
                <div className="flex items-center justify-between mb-2 md:mb-3 flex-shrink-0">
                    <div className="flex items-center space-x-1 md:space-x-2">
                        <button
                            onClick={handleZoomIn}
                            className="w-6 h-6 md:w-8 md:h-8 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors"
                            title="Phóng to"
                        >
                            <FontAwesomeIcon icon={faSearchPlus} className="text-gray-600 dark:text-gray-300 text-xs md:text-sm" />
                        </button>
                        <button
                            onClick={handleZoomOut}
                            className="w-6 h-6 md:w-8 md:h-8 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors"
                            title="Thu nhỏ"
                        >
                            <FontAwesomeIcon icon={faSearchMinus} className="text-gray-600 dark:text-gray-300 text-xs md:text-sm" />
                        </button>
                        <button
                            onClick={handleResetZoom}
                            className="w-6 h-6 md:w-8 md:h-8 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors"
                            title="Khôi phục"
                        >
                            <FontAwesomeIcon icon={faExpand} className="text-gray-600 dark:text-gray-300 text-xs md:text-sm" />
                        </button>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {Math.round(scale * 100)}%
                    </div>
                </div>

                {/* Map Container - Google Maps style */}
                <div
                    ref={containerRef}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 transition-colors duration-200 overflow-hidden relative"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    style={{
                        cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                        userSelect: 'none',
                        minHeight: '300px',
                        touchAction: 'none' // Prevents default touch behaviors
                    }}
                >
                    <div
                        ref={mapRef}
                        className="w-full h-full flex items-center justify-center"
                        style={{
                            transform: `scale(${scale}) translate(${translateX / scale}px, ${translateY / scale}px)`,
                            transformOrigin: 'center center',
                            transition: isDragging ? 'none' : 'transform 0.2s ease'
                        }}
                    >
                        <div className="text-gray-500 dark:text-gray-400">Đang tải bản đồ...</div>
                    </div>

                    {/* Tooltip - Mobile optimized */}
                    {isTooltipVisible && tooltipContent && (
                        <div
                            className="absolute z-50 bg-gray-900 bg-opacity-95 text-white px-3 py-2 rounded-lg text-xs md:text-sm pointer-events-none max-w-xs shadow-lg"
                            style={{
                                left: isMobile() ? '50%' : Math.min(tooltipPosition.x, (containerRef.current?.clientWidth || 0) - 200),
                                top: isMobile() ? '50%' : Math.max(tooltipPosition.y - 10, 10),
                                transform: isMobile() ? 'translate(-50%, -50%)' :
                                    tooltipPosition.y > 50 ? 'translateY(-100%)' : 'translateY(0)'
                            }}
                        >
                            <div className="font-semibold mb-1 text-blue-300">
                                {title}
                            </div>
                            <div className="leading-relaxed">
                                {tooltipContent}
                            </div>
                        </div>
                    )}

                    {/* Mobile zoom instruction */}
                    {isMobile() && (
                        <div className="absolute bottom-2 left-2 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded opacity-60 pointer-events-none">
                            Chụm 2 ngón để zoom
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

MapDisplay.displayName = 'MapDisplay';

export default MapDisplay;