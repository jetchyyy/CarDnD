// pages/HostDashboard/components/StatsCard.jsx
const StatsCard = ({ title, value, change, icon, bgColor, iconColor }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`${bgColor} ${iconColor} p-3 rounded-lg`}>
          {icon}
        </div>
        <span className="text-sm font-medium text-gray-500">{change}</span>
      </div>
      <h3 className="text-gray-600 text-sm mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

export default StatsCard;