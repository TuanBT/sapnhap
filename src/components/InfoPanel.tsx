
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faArrowRight } from '@fortawesome/free-solid-svg-icons';

interface InfoPanelProps {
    currentProvinceName: string;
    mergedProvinceName: string;
    isActive: boolean;
}

const InfoPanel: React.FC<InfoPanelProps> = ({
                                                 currentProvinceName,
                                                 mergedProvinceName,
                                                 isActive
                                             }) => {
    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex flex-col lg:flex-row items-center justify-between mb-5 gap-5">
                <div className="flex-1 text-center">
                    <h3 className="text-blue-600 mb-2 text-lg font-semibold">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                        Trước sáp nhập:
                    </h3>
                    <div className={`
                        text-lg font-bold min-h-[60px] flex items-center justify-center p-3 
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
                        Sau sáp nhập:
                    </h3>
                    <div className={`
                        text-lg font-bold min-h-[60px] flex items-center justify-center p-3 
                        rounded-lg transition-all duration-300 bg-green-50 text-green-700 
                        border-2 border-green-500 
                        ${isActive ? 'shadow-lg' : ''}
                    `}>
                        {mergedProvinceName}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InfoPanel;