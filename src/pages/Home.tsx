import React, { useState } from 'react';
import Search from './Search';
import Map from './Map.tsx';

const Home: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'search' | 'comparison'>('search');

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            {/* Simple Header */}
            <div className="container mx-auto px-4 pt-8 pb-4">
                {/* Minimal Tab Navigation */}
                <div className="flex justify-center mb-8">
                    <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-2xl p-1">
                        <button
                            onClick={() => setActiveTab('search')}
                            className={`
                                px-4 py-2 text-sm font-medium rounded-2xl transition-all duration-200
                                ${activeTab === 'search'
                                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }
                            `}
                        >
                            Tìm kiếm
                        </button>
                        <button
                            onClick={() => setActiveTab('comparison')}
                            className={`
                                px-4 py-2 text-sm font-medium rounded-2xl transition-all duration-200
                                ${activeTab === 'comparison'
                                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }
                            `}
                        >
                            Bản đồ
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'search' && (
                    <div className="animate-fadeIn">
                        <Search />
                    </div>
                )}
                {activeTab === 'comparison' && (
                    <div className="animate-fadeIn">
                        <Map />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;