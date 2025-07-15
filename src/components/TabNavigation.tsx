import React from 'react';

export type TabType = 'before' | 'after';

interface TabNavigationProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    beforeCount: number;
    afterCount: number;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
                                                         activeTab,
                                                         onTabChange,
                                                         beforeCount,
                                                         afterCount
                                                     }) => {
    return (
        <div className="bg-white rounded-lg shadow-lg mb-6">
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => onTabChange('before')}
                    className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                        activeTab === 'before'
                            ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    <div className="flex items-center justify-center space-x-2">
                        <span className="text-lg">📜</span>
                        <span>Trước sáp nhập</span>
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                            {beforeCount.toLocaleString()}
                        </span>
                    </div>
                </button>

                <button
                    onClick={() => onTabChange('after')}
                    className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                        activeTab === 'after'
                            ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    <div className="flex items-center justify-center space-x-2">
                        <span className="text-lg">🏛️</span>
                        <span>Sau sáp nhập</span>
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                            {afterCount.toLocaleString()}
                        </span>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default TabNavigation;