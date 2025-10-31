// pages/HostDashboard/components/DashboardTabs.jsx
const DashboardTabs = ({ activeTab, setActiveTab }) => {
  const tabs = ['overview', 'vehicles', 'bookings', 'calendar'];

  return (
    <div className="border-b border-gray-200">
      <div className="flex space-x-8 px-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DashboardTabs;