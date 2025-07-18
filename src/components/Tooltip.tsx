// components/Tooltip.tsx
import React from 'react';

interface TooltipProps {
    visible: boolean;
    x: number;
    y: number;
    content: string;
    title?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ visible, x, y, content, title }) => {
    if (!visible) return null;

    return (
        <div
            className="absolute z-50 bg-gray-900 bg-opacity-95 text-white p-3 rounded-lg shadow-lg pointer-events-none max-w-sm"
            style={{
                left: x,
                top: y,
                transform: 'translateY(-100%)'
            }}
        >
            {title && (
                <div className="font-semibold text-sm mb-1 text-blue-300">
                    {title}
                </div>
            )}
            <div className="text-xs leading-relaxed">
                {content}
            </div>
        </div>
    );
};

export default Tooltip;