import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faArrowRight, faInfo } from '@fortawesome/free-solid-svg-icons';

interface InfoPanelProps {
    currentProvinceName: string;
    mergedProvinceName: string;
    relatedProvinces: string[];
    isActive: boolean;
}

const InfoPanel: React.FC<InfoPanelProps> = ({
                                                 currentProvinceName,
                                                 mergedProvinceName,
                                                 relatedProvinces,
                                                 isActive
                                             }) => {
    return (
        <div className="bg-white mx-5 mb-5 rounded-lg shadow-lg p-6">
            <div className="flex flex-col lg:flex-row items-center justify-between mb-5 gap-5">
                <div className="flex-1 text-center">
                    <h3 className="text-blue-600 mb-2 text-lg font-semibold">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                        Tỉnh trước sáp nhập:
                    </h3>
                    <div className={`
            text-2xl font-bold min-h-[60px] flex items-center justify-center p-3 
            rounded-lg transition-all duration-300 bg-blue-50 text-blue-700 
            border-2 border-blue-500 
            ${isActive ? 'shadow-lg' : ''}
          `}>
                        {currentProvinceName}
                    </div>
                </div>

                <div className="text-3xl text-yellow-500 font-bold drop-shadow-sm">
                    <FontAwesomeIcon icon={faArrowRight} className="transform lg:rotate-0 rotate-90" />
                </div>

                <div className="flex-1 text-center">
                    <h3 className="text-green-600 mb-2 text-lg font-semibold">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                        Hiện tại:
                    </h3>
                    <div className={`
            text-2xl font-bold min-h-[60px] flex items-center justify-center p-3 
            rounded-lg transition-all duration-300 bg-green-50 text-green-700 
            border-2 border-green-500 
            ${isActive ? 'shadow-lg' : ''}
          `}>
                        {mergedProvinceName}
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-yellow-500">
                <div className="font-semibold text-gray-800 text-lg mb-2">
                    <FontAwesomeIcon icon={faInfo} className="mr-2" />
                    Các tỉnh liên quan:
                </div>
                <div className="text-gray-600 leading-relaxed">
                    {relatedProvinces.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {relatedProvinces.map((province, index) => (
                                <span
                                    key={index}
                                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm border border-blue-300"
                                >
                                    {province}
                                </span>
                            ))}
                        </div>
                    ) : (
                        'Chưa có thông tin'
                    )}
                </div>
            </div>
        </div>
    );
};

export default InfoPanel;