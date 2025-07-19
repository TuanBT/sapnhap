import { useState, useCallback, useRef, type RefObject } from 'react';
import { type MapDisplayRef } from '../components/map/MapDisplay.tsx';

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
    beforeMapRef?: RefObject<MapDisplayRef | null>;
    mergedMapRef?: RefObject<MapDisplayRef | null>;
}

export const useMapLogic = ({
                                provinces,
                                provincesMerged,
                                provinceMapping,
                                mergeInfo,
                                beforeMapRef,
                                mergedMapRef
                            }: MapLogicHookProps) => {
    const [beforeProvinceName, setBeforeProvinceName] = useState('Tên tỉnh trước sáp nhập');
    const [mergedProvinceName, setMergedProvinceName] = useState('Tên tỉnh sau sáp nhập');
    const [relatedProvinces, setRelatedProvinces] = useState<string[]>([]);
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(false);

    // Thêm 2 state mới để lưu thông tin chi tiết
    const [currentHoveredProvince, setCurrentHoveredProvince] = useState('');
    const [allRelatedProvinces, setAllRelatedProvinces] = useState('');

    // Fallback refs nếu không được truyền từ ngoài
    const fallbackBeforeMapRef = useRef<HTMLDivElement>(null);
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
    const getSVGContainer = (mapType: 'before' | 'merged'): SVGElement | null => {
        let container: HTMLDivElement | null = null;

        if (mapType === 'before') {
            container = beforeMapRef?.current?.getContainer() || fallbackBeforeMapRef.current;
        } else {
            container = mergedMapRef?.current?.getContainer() || fallbackMergedMapRef.current;
        }

        return container?.querySelector('svg') as SVGElement;
    };

    // Helper function để highlight tỉnh tương ứng ở bản đồ khác
    const highlightCorrespondingProvince = (provinceId: string, mapType: 'before' | 'merged') => {
        if (!provinces || !provincesMerged || !provinceMapping || !mergeInfo) return;

        const otherMapType = mapType === 'before' ? 'merged' : 'before';
        const otherSvg = getSVGContainer(otherMapType);

        if (!otherSvg) {
            console.warn(`Cannot find SVG for ${otherMapType} map`);
            return;
        }

        let targetIds: string[] = [];

        if (mapType === 'before') {
            // Từ bản đồ hiện tại -> tìm tỉnh tương ứng ở bản đồ sau sáp nhập
            const mappedId = provinceMapping[provinceId];
            if (mappedId) {
                targetIds = [mappedId];
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
            } else {
                console.warn(`No merge info found for ${provinceId} (${provincesMerged[provinceId]})`);
            }
        }

        // Highlight các tỉnh tương ứng
        targetIds.forEach(targetId => {
            const targetElement = findElementById(otherSvg, targetId);
            if (targetElement) {
                highlightElement(targetElement);
            } else {
                console.warn(`Element with ID ${targetId} not found in ${otherMapType} map`);
            }
        });
    };

    const handleProvinceHover = useCallback((element: SVGElement, mapType: 'before' | 'merged') => {
        if (!provinces || !provincesMerged || !provinceMapping || !mergeInfo) return;

        const provinceId = element.id;
        if (!provinceId) {
            console.warn('No province ID found for element:', element);
            return;
        }

        // Highlight element hiện tại
        highlightElement(element);

        // Highlight tỉnh tương ứng ở bản đồ khác
        highlightCorrespondingProvince(provinceId, mapType);

        let beforeName = '';
        let mergedName = '';
        let related: string[] = [];
        let desc = '';
        let hoveredProvince = '';
        let allRelated = '';

        if (mapType === 'before') {
            // Từ bản đồ hiện tại (63 tỉnh)
            const beforeProvinceName = provinces[provinceId] || provinceId;
            hoveredProvince = beforeProvinceName; // Tỉnh đang hover

            const mappedId = provinceMapping[provinceId];

            if (mappedId && provincesMerged[mappedId]) {
                mergedName = provincesMerged[mappedId];

                const info = mergeInfo[mappedId];
                if (info) {
                    beforeName = info.originalProvinces.join(', ');
                    allRelated = info.originalProvinces.join(', '); // Tất cả tỉnh liên quan
                    desc = info.description || `${beforeProvinceName} được sáp nhập vào ${mergedName}`;
                    related = info.originalProvinces;
                } else {
                    beforeName = beforeProvinceName;
                    allRelated = beforeProvinceName;
                    desc = `${beforeProvinceName} được sáp nhập vào ${mergedName}`;
                    related = [beforeProvinceName];
                }
            } else {
                // Tỉnh không được sáp nhập hoặc không tìm thấy mapping
                beforeName = beforeProvinceName;
                mergedName = beforeProvinceName;
                allRelated = beforeProvinceName;
                desc = `${beforeProvinceName} không được sáp nhập hoặc không có thông tin`;
                related = [beforeProvinceName];
            }
        } else {
            // Từ bản đồ sau sáp nhập (34 tỉnh)
            mergedName = provincesMerged[provinceId] || provinceId;
            hoveredProvince = mergedName; // Tỉnh đang hover

            const info = mergeInfo[provinceId];
            if (info && info.originalProvinces) {
                beforeName = info.originalProvinces.join(', ');
                allRelated = info.originalProvinces.join(', '); // Tất cả tỉnh gốc
                related = info.originalProvinces;
                desc = info.description || `${mergedName} được tạo thành từ việc sáp nhập ${info.originalProvinces.join(', ')}`;
            } else {
                beforeName = mergedName;
                allRelated = mergedName;
                related = [mergedName];
                desc = `${mergedName} không có thông tin sáp nhập`;
            }
        }

        // Cập nhật state
        setBeforeProvinceName(beforeName);
        setMergedProvinceName(mergedName);
        setCurrentHoveredProvince(hoveredProvince);
        setAllRelatedProvinces(allRelated);
        setRelatedProvinces(related);
        setDescription(desc);
        setIsActive(true);
    }, [provinces, provincesMerged, provinceMapping, mergeInfo]);

    const handleProvinceLeave = useCallback(() => {
        // Reset colors cho cả 2 bản đồ
        ['before', 'merged'].forEach((mapType) => {
            const svg = getSVGContainer(mapType as 'before' | 'merged');
            if (svg) {
                const elements = svg.querySelectorAll('path, g[id*="VN-"]');
                elements.forEach(element => {
                    resetElement(element as SVGElement);
                });
            }
        });

        // Reset state
        setIsActive(false);
        setBeforeProvinceName('Tên tỉnh trước sáp nhập');
        setMergedProvinceName('Tên tỉnh sau sáp nhập');
        setCurrentHoveredProvince('');
        setAllRelatedProvinces('');
        setRelatedProvinces([]);
        setDescription('');
    }, []);

    return {
        beforeProvinceName,
        mergedProvinceName,
        currentHoveredProvince,
        allRelatedProvinces,
        relatedProvinces,
        description,
        isActive,
        beforeMapRef: fallbackBeforeMapRef,
        mergedMapRef: fallbackMergedMapRef,
        handleProvinceHover,
        handleProvinceLeave
    };
};