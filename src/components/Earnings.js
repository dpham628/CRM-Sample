'use client';

const Earnings = () => {
  const data = [
    { label: 'Jan', monthly: 3500, annual: 42000 },
    { label: 'Feb', monthly: 4200, annual: 50400 },
    { label: 'Mar', monthly: 4800, annual: 57600 },
    { label: 'Apr', monthly: 3000, annual: 36000 },
    { label: 'May', monthly: 4500, annual: 54000 },
  ];

  return (
    <div className="bg-white rounded-2xl shadow p-4 md:p-6 min-w-0 w-full max-w-[800px] mx-auto">
      <h2 className="text-xl font-semibold text-gray-00 mb-4">Earnings Overview</h2>
      <div className="flex justify-center">
        <div className="space-y-4 w-full max-w-[600px]">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span className="w-12 text-sm text-gray-500">{item.label}</span>
              <div className="flex-1 mx-2 h-4 bg-gray-100 rounded overflow-hidden relative">
                <div
                  className="h-4 bg-blue-500 absolute left-0 top-0"
                  style={{ width: `${(item.monthly / 6000) * 100}%` }}
                />
                <div
                  className="h-4 bg-green-400 absolute left-0 top-0 opacity-50"
                  style={{ width: `${(item.annual / 60000) * 100}%` }}
                />
              </div>
              <div className="text-sm text-gray-700">${item.monthly.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-3">
        Blue = Monthly, Green = Annual (scaled for demo purposes)
      </p>
    </div>
  );
};

export default Earnings;