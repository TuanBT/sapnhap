interface MergeInfo {
    [key: string]: {
        name: string;
        originalProvinces: string[];
        description?: string;
    };
}

interface MergeGroup {
    newId: string;
    oldIds: string[];
    name: string;
}

export class SVGMerger {
    private provinceMapping: { [key: string]: string };
    private mergeInfo: MergeInfo;

    constructor(provinceMapping: { [key: string]: string }, mergeInfo: MergeInfo) {
        this.provinceMapping = provinceMapping;
        this.mergeInfo = mergeInfo;
    }

    /**
     * Tạo danh sách các nhóm merge từ mapping
     */
    private createMergeGroups(): MergeGroup[] {
        const groups: { [key: string]: MergeGroup } = {};

        // Tạo nhóm từ mapping
        Object.entries(this.provinceMapping).forEach(([oldId, newId]) => {
            if (!groups[newId]) {
                groups[newId] = {
                    newId: newId,
                    oldIds: [],
                    name: this.mergeInfo[newId]?.name || newId
                };
            }
            groups[newId].oldIds.push(oldId);
        });

        return Object.values(groups);
    }

    /**
     * Type guard để check xem element có phải SVGElement không
     */
    private isSVGElement(element: Element | null): element is SVGElement {
        return element !== null && element instanceof SVGElement;
    }

    /**
     * Type guard để check xem element có phải SVGPathElement không
     */
    private isSVGPathElement(element: SVGElement): element is SVGPathElement {
        return element.tagName === 'path' && element instanceof SVGPathElement;
    }

    /**
     * Merge SVG elements theo nhóm
     */
    public mergeSVG(svgContent: string): string {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgContent, 'image/svg+xml');

        const mergeGroups = this.createMergeGroups();

        mergeGroups.forEach(group => {
            // Tìm tất cả elements cần merge
            const elements: SVGElement[] = [];

            group.oldIds.forEach(id => {
                const element = doc.getElementById(id);
                if (this.isSVGElement(element)) {
                    elements.push(element);
                }
            });

            if (elements.length === 0) {
                console.warn(`⚠️  No elements found for group ${group.newId}`);
                return;
            }

            // Lấy primary element (guaranteed to exist vì elements.length > 0)
            const primaryElement = elements[0]!;

            if (elements.length === 1) {
                // Chỉ có 1 element, chỉ cần đổi ID
                primaryElement.id = group.newId;
            } else {
                // Có nhiều elements, cần merge
                const otherElements = elements.slice(1);

                // Merge paths
                if (this.isSVGPathElement(primaryElement)) {
                    const pathElements = otherElements.filter(this.isSVGPathElement.bind(this));
                    this.mergePaths(primaryElement, pathElements, group.newId);
                } else {
                    this.mergeGroups(primaryElement, otherElements, group.newId);
                }

                // Xóa các elements cũ
                otherElements.forEach(el => {
                    if (el.parentNode) {
                        el.parentNode.removeChild(el);
                    }
                });
            }
        });

        // Convert back to string
        const serializer = new XMLSerializer();
        const result = serializer.serializeToString(doc);

        return result;
    }

    /**
     * Merge path elements
     */
    private mergePaths(primaryElement: SVGPathElement, otherElements: SVGPathElement[], newId: string): void {
        primaryElement.id = newId;

        // Collect all path data
        const pathData = [primaryElement.getAttribute('d')];

        otherElements.forEach(el => {
            const d = el.getAttribute('d');
            if (d) {
                pathData.push(d);
            }
        });

        // Combine path data
        const combinedPath = pathData.filter(d => d).join(' ');
        primaryElement.setAttribute('d', combinedPath);

        // Copy other attributes from the first element
        const fill = primaryElement.getAttribute('fill') || '#e5e7eb';
        const stroke = primaryElement.getAttribute('stroke') || '#9ca3af';
        const strokeWidth = primaryElement.getAttribute('stroke-width') || '0.5';

        primaryElement.setAttribute('fill', fill);
        primaryElement.setAttribute('stroke', stroke);
        primaryElement.setAttribute('stroke-width', strokeWidth);
    }

    /**
     * Merge group elements
     */
    private mergeGroups(primaryElement: SVGElement, otherElements: SVGElement[], newId: string): void {
        primaryElement.id = newId;

        // If primary is not a group, create one
        if (primaryElement.tagName !== 'g') {
            const group = primaryElement.ownerDocument!.createElementNS('http://www.w3.org/2000/svg', 'g') as SVGGElement;
            group.id = newId;

            // Move primary element into group
            if (primaryElement.parentNode) {
                primaryElement.parentNode.insertBefore(group, primaryElement);
                group.appendChild(primaryElement);
                primaryElement.removeAttribute('id');
            }

            // Move other elements into group
            otherElements.forEach(el => {
                group.appendChild(el);
                el.removeAttribute('id');
            });
        } else {
            // Primary is already a group, just move other elements
            otherElements.forEach(el => {
                if (el.tagName === 'g') {
                    // Move all children from other group
                    while (el.firstChild) {
                        primaryElement.appendChild(el.firstChild);
                    }
                } else {
                    // Move element directly
                    primaryElement.appendChild(el);
                }
            });
        }
    }
}