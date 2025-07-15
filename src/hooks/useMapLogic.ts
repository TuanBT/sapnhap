import { useState, useCallback, useRef } from 'react';

interface MapLogicHookProps {
    provinces: Record<string, string> | null;
    provincesMerged: Record<string, string> | null;
    provinceMapping: Record<string, string> | null;
    mergeInfo: Record<string, any> | null;
}

export const useMapLogic = ({
                                provinces,
                                provincesMerged,
                                provinceMapping,
                                mergeInfo
                            }: MapLogicHookProps) => {
    const [currentProvinceName, setCurrentProvinceName] = useState('Hover vào bản đồ');
    const [mergedProvinceName, setMergedProvinceName] = useState('Hover vào bản đồ');
    const [relatedProvinces, setRelatedProvinces] = useState<string[]>([]);
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(false);

    const currentMapRef = useRef<HTMLDivElement>(null);
    const mergedMapRef = useRef<HTMLDivElement>(null);

    const handleProvinceHover = useCallback((element: SVGElement, mapType: 'current' | 'merged') => {
        if (!provinces || !provincesMerged || !provinceMapping || !mergeInfo) return;

        const provinceId = element.id;
        if (!provinceId) {
            console.warn('No province ID found for element:', element);
            return;
        }

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
            const mappedId = provinceMapping[provinceId];

            if (mappedId && provincesMerged[mappedId]) {
                mergedName = provincesMerged[mappedId];
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
            mergedName = provincesMerged[provinceId] || provinceId;
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

        // Cập nhật state
        setCurrentProvinceName(currentName);
        setMergedProvinceName(mergedName);
        setRelatedProvinces(related);
        setDescription(desc);
        setIsActive(true);
    }, [provinces, provincesMerged, provinceMapping, mergeInfo]);

    const handleProvinceLeave = useCallback(() => {
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
    }, []);

    return {
        currentProvinceName,
        mergedProvinceName,
        relatedProvinces,
        description,
        isActive,
        currentMapRef,
        mergedMapRef,
        handleProvinceHover,
        handleProvinceLeave
    };
};