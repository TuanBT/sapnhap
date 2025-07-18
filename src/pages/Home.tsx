import React, { useState } from 'react';
import Search from './Search';
import Comparison from './Comparison';

const Home: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'search' | 'comparison'>('search');

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            {/* Tab Navigation */}
            <div className="container mx-auto px-4 pt-6">
                <div className="flex bg-white dark:bg-gray-800 rounded-2xl p-1.5 shadow-md max-w-sm mx-auto">
                    <button
                        onClick={() => setActiveTab('search')}
                        className={`
                            flex-1 py-2 px-4 rounded-xl font-medium text-sm transition-all duration-300
                            ${activeTab === 'search'
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                        }
                        `}
                    >
                        Tìm kiếm
                    </button>
                    <button
                        onClick={() => setActiveTab('comparison')}
                        className={`
                            flex-1 py-2 px-4 rounded-xl font-medium text-sm transition-all duration-300
                            ${activeTab === 'comparison'
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
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