import { Layout, MapPin } from "lucide-react";
import { memo } from "react";
import { LocationSelectorProps } from "../../types";

const LocationSelector = memo<LocationSelectorProps>(
  ({ locations, selectedId, onSelect, colors }) => {
    return (
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <h3 className={`text-lg sm:text-xl font-bold ${colors.text}`}>
            Location
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {locations.map((location) => (
            <button
              key={location._id}
              onClick={() => onSelect(location._id || "")}
              className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 text-left ${
                selectedId === location._id
                  ? "border-green-500 bg-green-500/20 shadow-lg shadow-green-500/25"
                  : `border-gray-600 ${colors.panelBg} hover:border-green-400`
              }`}
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${
                    selectedId === location._id
                      ? "bg-gradient-to-r from-green-500 to-emerald-500"
                      : "bg-gradient-to-r from-gray-600 to-gray-500"
                  }`}
                >
                  <Layout className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <span
                  className={`font-medium text-sm ${
                    selectedId === location._id ? "text-green-300" : colors.text
                  }`}
                >
                  {location.name}
                </span>
              </div>
              <p className={`text-xs ${colors.textMuted} truncate`}>
                {location.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }
);

LocationSelector.displayName = "LocationSelector";

export default LocationSelector;
