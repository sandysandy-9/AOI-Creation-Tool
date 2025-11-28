import type { Feature } from '../types';
import { downloadJSON } from '../utils/helpers';

interface FeatureListProps {
  features: Feature[];
  onFeatureRemove: (id: string) => void;
  onClearAll: () => void;
}

const FeatureList = ({ features, onFeatureRemove, onClearAll }: FeatureListProps) => {
  const handleExport = () => {
    downloadJSON(features, `aoi-features-${Date.now()}.json`);
  };

  return (
    <div className="w-full flex flex-col h-full">
      <div className="mb-1.5">
        <h3 className="text-[10px] font-semibold text-gray-700">Features ({features.length})</h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 mb-2">
        {features.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No features drawn yet. Use the drawing tools to create features.
          </p>
        ) : (
          features.map((feature, index) => (
            <div
              key={feature.id}
              className="p-2 bg-gradient-to-br from-cyan-200 via-blue-200 to-purple-200 rounded-lg border-2 border-blue-400 hover:border-purple-600 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 animate-slide-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-800 capitalize">{feature.type}</p>
                  <p className="text-[10px] text-gray-500">
                    {new Date(feature.properties.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => onFeatureRemove(feature.id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  title="Remove feature"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {features.length > 0 && (
        <div className="space-y-2 pt-3 border-t">
          <button
            onClick={handleExport}
            className="w-full px-3 py-2 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white rounded-lg hover:from-cyan-600 hover:via-blue-700 hover:to-purple-700 transition-all duration-300 text-xs font-bold shadow-lg hover:shadow-2xl transform hover:scale-110 active:scale-95"
          >
            💾 Export Features
          </button>
          <button
            onClick={onClearAll}
            className="w-full px-3 py-2 bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 text-white rounded-lg hover:from-pink-600 hover:via-red-600 hover:to-orange-600 transition-all duration-300 text-xs font-bold shadow-lg hover:shadow-2xl transform hover:scale-110 active:scale-95"
          >
            🗑️ Clear All
          </button>
        </div>
      )}
    </div>
  );
};

export default FeatureList;
