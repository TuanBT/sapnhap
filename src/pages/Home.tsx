import React, { useState } from 'react';
import Search from './Search';
import Comparison from './Comparison';

const Home: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'search' | 'comparison'>('search');

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Tab Navigation */}
            <div className="container mx-auto px-4 pt-6">
                <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm max-w-md mx-auto">
                    <button
                        onClick={() => setActiveTab('search')}
                        className={`
                            flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200
                            ${activeTab === 'search'
                            ? 'bg-blue-500 text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }
                        `}
                    >
                        Tìm kiếm
                    </button>
                    <button
                        onClick={() => setActiveTab('comparison')}
                        className={`
                            flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200
                            ${activeTab === 'comparison'
                            ? 'bg-blue-500 text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }
                        `}
                    >
                        So sánh bản đồ
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'search' && (
                    <div className="animate-fadeIn">
                        <SearchTab />
                    </div>
                )}
                {activeTab === 'comparison' && (
                    <div className="animate-fadeIn">
                        <ComparisonTab />
                    </div>
                )}
            </div>
        </div>
    );
};

// Component for Search Tab
const SearchTab: React.FC = () => {
    return (
        <div className="pt-6">
            <Search />
        </div>
    );
};

// Component for Comparison Tab
const ComparisonTab: React.FC = () => {
    return (
        <div className="pt-6">
            <Comparison />
        </div>
    );
};

export default Home;