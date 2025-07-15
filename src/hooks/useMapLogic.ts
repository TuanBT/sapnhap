import { useState, useCallback, useRef, type RefObject } from 'react';
import { type MapDisplayRef } from '../components/MapDisplay';

interface MergeInfo {
    [key: string]: {
        name: string;
        originalProvinces: string[];
        description?: string;
    };
}

interface MapLogicHookProps {
    provinces: Record<string, string> | null;
    provincesMerged: Record<string, string> | null;
    provinceMapping: Record<string, string> | null;
    mergeInfo: MergeInfo | null;
    currentMapRef?: RefObject<MapDisplayRef | null>;
    mergedMapRef?: RefObject<MapDisplayRef | null>;
}

export const useMapLogic = ({
                                provinces,
                                provincesMerged,
                                provinceMapping,
                                mergeInfo,
                                currentMapRef,
                                mergedMapRef
                            }: MapLogicHookProps) => {
    const [currentProvinceName, setCurrentProvinceName] = useState('Hover vào bản đồ');
    const [mergedProvinceName, setMergedProvinceName] = useState('Hover vào bản đồ');
    const [relatedProvinces, setRelatedProvinces] = useState<string[]>([]);
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(false);

    // Fallback refs nếu không được truyền từ ngoài
    const fallbackCurrentMapRef = useRef<HTMLDivElement>(null);
    const fallbackMergedMapRef = useRef<HTMLDivElement>(null);

    // Helper function để highlight element
    const highlightElement = (element: SVGElement) => {
        (element as any).style.fill = '#3b82f6';
        (element as any).style.stroke = '#1e40af';
        (element as any).style.strokeWidth = '1';
    };

    // Helper function để reset element
    const resetElement = (element: SVGElement) => {
        (element as any).style.fill = '#e5e7eb';
        (element as any).style.stroke = '#9ca3af';
        (element as any).style.strokeWidth = '0.5';
    };

    // Helper function để tìm element theo ID trong SVG
    const findElementById = (svg: SVGElement, id: string): SVGElement | null => {
        return svg.querySelector(`[id="${id}"]`) as SVGElement;
    };

    // Helper function để lấy SVG container
    const getSVGContainer = (mapType: 'current' | 'merged'): SVGElement | null => {
        let container: HTMLDivElement | null = null;

        if (mapType === 'current') {
            container = currentMapRef?.current?.getContainer() || fallbackCurrentMapRef.current;
        } else {
            container = mergedMapRef?.current?.getContainer() || fallbackMergedMapRef.current;
        }

        return container?.querySelector('svg') as SVGElement;
    };

    // Helper function để highlight tỉnh tương ứng ở bản đồ khác
    const highlightCorrespondingProvince = (provinceId: string, mapType: 'current' | 'merged') => {
        if (!provinces || !provincesMerged || !provinceMapping || !mergeInfo) return;

        const otherMapType = mapType === 'current' ? 'merged' : 'current';
        const otherSvg = getSVGContainer(otherMapType);

        if (!otherSvg) {
            console.warn(`Cannot find SVG for ${otherMapType} map`);
            return;
        }

        let targetIds: string[] = [];

        if (mapType === 'current') {
            // Từ bản đồ hiện tại -> tìm tỉnh tương ứng ở bản đồ sau sáp nhập
            const mappedId = provinceMapping[provinceId];
            if (mappedId) {
                targetIds = [mappedId];
                console.log(`Mapping ${provinceId} (${provinces[provinceId]}) -> ${mappedId} (${provincesMerged[mappedId]})`);
            } else {
                console.warn(`No mapping found for ${provinceId} (${provinces[provinceId]})`);
            }
        } else {
            // Từ bản đồ sau sáp nhập -> tìm các tỉnh tương ứng ở bản đồ trước sáp nhập
            const info = mergeInfo[provinceId];
            if (info && info.originalProvinces) {
                // Tìm tất cả các tỉnh cũ map tới tỉnh này
                targetIds = Object.keys(provinceMapping).filter(oldId =>
                    provinceMapping[oldId] === provinceId
                );
                console.log(`Reverse mapping ${provinceId} (${provincesMerged[provinceId]}) -> ${targetIds.map(id => `${id} (${provinces[id]})`).join(', ')}`);
            } else {
                console.warn(`No merge info found for ${provinceId} (${provincesMerged[provinceId]})`);
            }
        }

        // Highlight các tỉnh tương ứng
        targetIds.forEach(targetId => {
            const targetElement = findElementById(otherSvg, targetId);
            if (targetElement) {
                console.log(`Highlighting ${targetId} in ${otherMapType} map`);
                highlightElement(targetElement);
            } else {
                console.warn(`Element with ID ${targetId} not found in ${otherMapType} map`);
            }
        });
    };

    const handleProvinceHover = useCallback((element: SVGElement, mapType: 'current' | 'merged') => {
        if (!provinces || !provincesMerged || !provinceMapping || !mergeInfo) return;

        const provinceId = element.id;
        if (!provinceId) {
            console.warn('No province ID found for element:', element);
            return;
        }

        console.log(`=== HOVER EVENT ===`);
        console.log(`Map type: ${mapType}`);
        console.log(`Province ID: ${provinceId}`);

        // Highlight element hiện tại
        highlightElement(element);

        // Highlight tỉnh tương ứng ở bản đồ khác
        highlightCorrespondingProvince(provinceId, mapType);

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
                    desc = info.description || `${currentProvinceName} được sáp nhập vào ${mergedName}`;
                    related = info.originalProvinces;
                } else {
                    currentName = currentProvinceName;
                    desc = `${currentProvinceName} được sáp nhập vào ${mergedName}`;
                    related = [currentProvinceName];
                }
            } else {
                // Tỉnh không được sáp nhập hoặc không tìm thấy mapping
                currentName = currentProvinceName;
                mergedName = currentProvinceName;
                desc = `${currentProvinceName} không được sáp nhập hoặc không có thông tin`;
                related = [currentProvinceName];
            }
        } else {
            // Từ bản đồ sau sáp nhập (34 tỉnh)
            mergedName = provincesMerged[provinceId] || provinceId;
            console.log(`Merged province name: ${mergedName}`);

            const info = mergeInfo[provinceId];
            if (info && info.originalProvinces) {
                currentName = info.originalProvinces.join(', ');
                related = info.originalProvinces;
                desc = info.description || `${mergedName} được tạo thành từ việc sáp nhập ${info.originalProvinces.join(', ')}`;
            } else {
                currentName = mergedName;
                related = [mergedName];
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
    }, [provinces, provincesMerged, provinceMapping, mergeInfo]);

    const handleProvinceLeave = useCallback(() => {
        // Reset colors cho cả 2 bản đồ
        ['current', 'merged'].forEach((mapType) => {
            const svg = getSVGContainer(mapType as 'current' | 'merged');
            if (svg) {
                const elements = svg.querySelectorAll('path, g[id*="VN-"]');
                elements.forEach(element => {
                    resetElement(element as SVGElement);
                });
            }
        });

        // Reset state
        setIsActive(false);
        setCurrentProvinceName('Hover vào bản đồ');
        setMergedProvinceName('Hover vào bản đồ');
        setRelatedProvinces([]);
        setDescription('');
    }, []);

    return {
        currentProvinceName,
        mergedProvinceName,
        relatedProvinces,
        description,
        isActive,
        currentMapRef: fallbackCurrentMapRef,
        mergedMapRef: fallbackMergedMapRef,
        handleProvinceHover,
        handleProvinceLeave
    };
};