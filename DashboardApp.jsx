// DashboardApp.jsx: React Component for Interactive Financial Dashboard

import React, { useState, useMemo } from 'react';

// Mock Data for the Dashboard
const MOCK_DATA = [
    { name: 'Jan', value: 42000, gain: 1.5, risk: 6.5 },
    { name: 'Feb', value: 43500, gain: 2.5, risk: 6.8 },
    { name: 'Mar', value: 41000, gain: -1.0, risk: 7.2 },
    { name: 'Apr', value: 45000, gain: 4.0, risk: 6.9 },
    { name: 'May', value: 47500, gain: 5.5, risk: 7.0 },
    { name: 'Jun', value: 46000, gain: 3.0, risk: 7.1 },
    { name: 'Jul', value: 48500, gain: 4.5, risk: 7.3 },
    { name: 'Aug', value: 51000, gain: 5.0, risk: 7.5 },
    { name: 'Sep', value: 49500, gain: 3.5, risk: 7.4 },
    { name: 'Oct', value: 52000, gain: 5.0, risk: 7.6 },
    { name: 'Nov', value: 54500, gain: 6.5, risk: 7.5 },
    { name: 'Dec', value: 56000, gain: 7.0, risk: 7.7 }
];

const ASSET_ALLOCATION = [
    { name: 'Equity', value: 65, color: 'bg-blue-600' },
    { name: 'Debt', value: 25, color: 'bg-teal-500' },
    { name: 'Gold', value: 10, color: 'bg-amber-500' },
];

const formatCurrency = (amount) => {
    return '₹' + Number(Math.round(amount)).toLocaleString('en-IN');
};

const formatPercentage = (amount) => {
    return (amount > 0 ? '+' : '') + amount.toFixed(1) + '%';
};


// --- Chart Placeholder Component ---
const ChartPlaceholder = ({ title, type, data }) => (
    <div className="p-4 bg-white rounded-xl shadow-lg h-96 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3">{title}</h3>
        <div className="flex-grow flex items-center justify-center text-gray-400 text-center">
            {/* D3/Recharts chart would go here */}
            <p className="p-4 bg-gray-50 rounded-lg">
                [{type} Chart Placeholder]
                <br/>
                (Data points: {data.length})
            </p>
        </div>
        <p className="text-xs text-gray-500 mt-2">Visualization engine not included. Data rendered via D3/Recharts.</p>
    </div>
);


// --- Main Application Component ---
const App = () => {
    const [timeframe, setTimeframe] = useState('YTD'); // YTD, 6M, 1Y
    
    // Filter data based on the selected timeframe
    const filteredData = useMemo(() => {
        const months = { 'YTD': 12, '6M': 6, '1Y': 12 }[timeframe] || 12;
        return MOCK_DATA.slice(-months);
    }, [timeframe]);

    // Calculate Summary Metrics
    const summary = useMemo(() => {
        if (!filteredData.length) return {};
        
        const initialValue = filteredData[0].value;
        const finalValue = filteredData[filteredData.length - 1].value;
        const totalGain = finalValue - initialValue;
        const totalGainPct = (totalGain / initialValue) * 100;
        const currentRisk = filteredData[filteredData.length - 1].risk;

        return {
            totalValue: finalValue,
            totalGain: totalGain,
            totalGainPct: totalGainPct,
            riskScore: currentRisk,
        };
    }, [filteredData]);


    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <header className="text-center py-6 bg-white shadow-xl rounded-2xl mb-8">
                <h1 className="text-3xl md:text-4xl font-extrabold text-blue-800">
                    Portfolio Data Dashboard
                </h1>
                <p className="text-gray-600 mt-1">Interactive visualization for key performance metrics.</p>
            </header>

            {/* --- Timeframe Filter and Controls --- */}
            <div className="flex justify-between items-center mb-6 p-3 bg-white rounded-xl shadow">
                <div className="text-sm font-semibold text-gray-700">Time Period:</div>
                <div className="flex space-x-2">
                    {['6M', '1Y', 'YTD'].map(period => (
                        <button
                            key={period}
                            onClick={() => setTimeframe(period)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition duration-150 ${
                                timeframe === period
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-gray-200 text-gray-700 hover:bg-blue-100'
                            }`}
                        >
                            {period}
                        </button>
                    ))}
                </div>
            </div>


            {/* --- Summary Cards Section --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                
                {/* Total Value */}
                <div className="p-4 bg-white rounded-xl shadow-md border-b-4 border-blue-500">
                    <p className="text-sm text-gray-500">Current Value</p>
                    <h2 className="text-3xl font-extrabold text-gray-800 mt-1">
                        {formatCurrency(summary.totalValue)}
                    </h2>
                    <span className={`text-xs font-semibold ${summary.totalGain > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercentage(summary.totalGainPct)} YTD Gain
                    </span>
                </div>
                
                {/* Monthly Gain */}
                <div className="p-4 bg-white rounded-xl shadow-md border-b-4 border-green-500">
                    <p className="text-sm text-gray-500">Monthly Return (Mock)</p>
                    <h2 className="text-3xl font-extrabold text-gray-800 mt-1">
                        {formatPercentage(MOCK_DATA[MOCK_DATA.length - 1].gain)}
                    </h2>
                    <span className="text-xs text-gray-500">Last Month's Performance</span>
                </div>
                
                {/* Risk Score */}
                <div className="p-4 bg-white rounded-xl shadow-md border-b-4 border-red-500">
                    <p className="text-sm text-gray-500">Current Risk Score</p>
                    <h2 className="text-3xl font-extrabold text-gray-800 mt-1">
                        {summary.riskScore.toFixed(1)} / 10
                    </h2>
                    <span className="text-xs text-red-600 font-semibold">High Volatility Exposure</span>
                </div>

                {/* Total Invested */}
                <div className="p-4 bg-white rounded-xl shadow-md border-b-4 border-purple-500">
                    <p className="text-sm text-gray-500">Total Invested Corpus (Mock)</p>
                    <h2 className="text-3xl font-extrabold text-gray-800 mt-1">
                        {formatCurrency(48000)}
                    </h2>
                    <span className="text-xs text-gray-500">Total Capital Deployed</span>
                </div>
            </div>


            {/* --- Charts Grid --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Chart 1: Line Chart (Performance Trend) */}
                <div className="lg:col-span-2">
                    <ChartPlaceholder 
                        title={`Fund Performance Trend (${timeframe})`}
                        type="Line"
                        data={filteredData}
                    />
                </div>

                {/* Chart 2: Asset Allocation (Pie Chart) */}
                <div className="lg:col-span-1">
                    <ChartPlaceholder 
                        title="Current Asset Allocation"
                        type="Donut"
                        data={ASSET_ALLOCATION}
                    />
                </div>

                {/* Chart 3: Sector Exposure (Bar Chart) */}
                <div className="lg:col-span-3">
                    <ChartPlaceholder 
                        title="Top Sector Exposure (Mock)"
                        type="Bar"
                        data={MOCK_DATA}
                    />
                </div>

            </div>
        </div>
    );
};

export default App;
