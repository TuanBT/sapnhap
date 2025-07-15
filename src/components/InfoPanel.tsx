import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

interface InfoPanelProps {
    currentProvinceName: string;
    mergedProvinceName: string;
    isActive: boolean;
    description?: string;
    relatedProvinces?: string[];
}

const InfoPanel: React.FC<InfoPanelProps> = ({
                                                 currentProvinceName,
                                                 mergedProvinceName,
                                                 isActive,
                                                 description,
                                                 relatedProvinces
                                             }) => {
    return (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                <div className="flex-1 text-center">
                    <div
                        className={`text-lg font-medium min-h-[50px] flex items-center justify-center p-2 rounded bg-blue-50 text-blue-700 border border-blue-500 ${isActive ? 'shadow' : ''}`}>
                        {currentProvinceName}
                    </div>
                </div>

                <div className="text-2xl text-yellow-500">
                    <FontAwesomeIcon icon={faArrowRight} className="transform lg:rotate-0 rotate-90"/>
                </div>

                <div className="flex-1 text-center">
                    <div
                        className={`text-lg font-medium min-h-[50px] flex items-center justify-center p-2 rounded bg-green-50 text-green-700 border border-green-500 ${isActive ? 'shadow' : ''}`}>
                        {mergedProvinceName}
                    </div>
                </div>
            </div>

            {/* Thông tin mô tả */}
            {isActive && description && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">{description}</p>
                </div>
            )}

            {/* Các tỉnh liên quan */}
            {isActive && relatedProvinces && relatedProvinces.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <div className="text-sm font-medium text-yellow-800 mb-2">Các tỉnh liên quan:</div>
                    <div className="flex flex-wrap gap-2">
                        {relatedProvinces.map((province, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs"
                            >
                                {province}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InfoPanel;