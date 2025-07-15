import { useEffect, useRef } from 'react';

interface MapSectionProps {
    selectedProvince: string | null;
    relatedProvinces: string[];
    onProvinceSelect: (provinceName: string) => void;
    mapType: 'original' | 'merged';
    onMapTypeChange: (type: 'original' | 'merged') => void;
}

export function MapSection({
                               selectedProvince,
                               relatedProvinces,
                               onProvinceSelect,
                               onMapTypeChange
                           }: MapSectionProps) {
    const svgRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadSVG = async () => {
            if (!svgRef.current) return;

            try {
                const response = await fetch('/vn.svg');
                const svgContent = await response.text();
                svgRef.current.innerHTML = svgContent;

                // Add event listeners to SVG paths
                const svg = svgRef.current.querySelector('svg');
                if (svg) {
                    const paths = svg.querySelectorAll('path');
                    paths.forEach(path => {
                        path.addEventListener('click', (e) => {
                            const target = e.target as SVGPathElement;
                            const provinceName = target.getAttribute('data-province');
                            if (provinceName) {
                                onProvinceSelect(provinceName);
                            }
                        });
                    });
                }
            } catch (error) {
                console.error('Error loading SVG:', error);
            }
        };

        loadSVG();
    }, [onProvinceSelect]);

    // Highlight selected province
    useEffect(() => {
        if (!svgRef.current) return;

        const svg = svgRef.current.querySelector('svg');
        if (!svg) return;

        const paths = svg.querySelectorAll('path');
        paths.forEach(path => {
            const provinceName = path.getAttribute('data-province');
            if (provinceName === selectedProvince) {
                path.setAttribute('fill', '#3b82f6');
            } else if (relatedProvinces.includes(provinceName || '')) {
                path.setAttribute('fill', '#93c5fd');
            } else {
                path.setAttribute('fill', '#e5e7eb');
            }
        });
    }, [selectedProvince, relatedProvinces]);

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Vietnam Map</h2>
                <div className="flex space-x-2">
                    <button
                        onClick={() => onMapTypeChange('original')}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Original
                    </button>
                    <button
                        onClick={() => onMapTypeChange('merged')}
                        className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        Merged
                    </button>
                </div>
            </div>

            <div
                ref={svgRef}
                className="w-full h-96 border border-gray-300 rounded-md overflow-hidden"
            >
                <div className="flex items-center justify-center h-full text-gray-500">
                    Loading map...
                </div>
            </div>

            {selectedProvince && (
                <div className="mt-4 p-3 bg-blue-50 rounded">
                    <h3 className="font-medium text-blue-800">
                        Selected: {selectedProvince}
                    </h3>
                    {relatedProvinces.length > 0 && (
                        <div className="mt-2 text-sm text-blue-600">
                            Related units: {relatedProvinces.length}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}