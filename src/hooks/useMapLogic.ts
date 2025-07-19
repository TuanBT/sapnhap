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
            }
        } else {
            // Từ bản đồ sau sáp nhập -> tìm các tỉnh tương ứng ở bản đồ trước sáp nhập
            const info = mergeInfo[provinceId];
            if (info && info.originalProvinces) {
                // Tìm tất cả các tỉnh cũ map tới tỉnh này
                targetIds = Object.keys(provinceMapping).filter(oldId =>
                    provinceMapping[oldId] === provinceId
                );
            }
        }

        // Highlight các tỉnh tương ứng
        targetIds.forEach(targetId => {
            const targetElement = findElementById(otherSvg, targetId);
            if (targetElement) {
                highlightElement(targetElement);
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
            hoveredProvince = beforeProvinceName;

            const mappedId = provinceMapping[provinceId];

            if (mappedId && provincesMerged[mappedId]) {
                mergedName = provincesMerged[mappedId];

                // Kiểm tra nếu tên cũ giống tên mới -> không thay đổi
                if (beforeProvinceName === mergedName) {
                    beforeName = beforeProvinceName;
                    allRelated = beforeProvinceName;
                    desc = `Không đổi tên`;
                    related = [beforeProvinceName];
                } else {
                    // Có sự thay đổi thực sự
                    const info = mergeInfo[mappedId];
                    if (info) {
                        beforeName = info.originalProvinces.join(', ');
                        allRelated = info.originalProvinces.join(', ');
                        desc = `Sáp nhập vào ${mergedName}`;
                        related = info.originalProvinces;
                    } else {
                        beforeName = beforeProvinceName;
                        allRelated = beforeProvinceName;
                        desc = `Sáp nhập vào ${mergedName}`;
                        related = [beforeProvinceName];
                    }
                }
            } else {
                // Không có mapping -> tỉnh không thay đổi
                beforeName = beforeProvinceName;
                mergedName = beforeProvinceName;
                allRelated = beforeProvinceName;
                desc = `${beforeProvinceName} không thay đổi`;
                related = [beforeProvinceName];
            }
        } else {
            // Từ bản đồ sau sáp nhập (34 tỉnh)
            mergedName = provincesMerged[provinceId] || provinceId;
            hoveredProvince = mergedName;

            const info = mergeInfo[provinceId];
            if (info && info.originalProvinces) {
                beforeName = info.originalProvinces.join(', ');
                allRelated = info.originalProvinces.join(', ');
                related = info.originalProvinces;

                // Kiểm tra nếu chỉ có 1 tỉnh gốc và tên giống nhau -> không thay đổi
                if (info.originalProvinces.length === 1 && info.originalProvinces[0] === mergedName) {
                    desc = `${mergedName} không thay đổi`;
                } else {
                    // Có sự gộp thực sự
                    desc = `Gộp từ ${info.originalProvinces.join(', ')}`;
                }
            } else {
                // Không có info -> tỉnh không thay đổi
                beforeName = mergedName;
                allRelated = mergedName;
                related = [mergedName];
                desc = `${mergedName} không thay đổi`;
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