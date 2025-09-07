import { Sparkles } from "lucide-react";
import { memo } from "react";

interface PanelDescriptionProps {
  value: string;
  onChange: (value: string) => void;
  colors: any;
}

const PanelDescription = memo<PanelDescriptionProps>(
  ({ value, onChange, colors }) => {
    return (
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h3 className={`text-lg sm:text-xl font-bold ${colors.text}`}>
            Panel Description
          </h3>
        </div>

        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Describe what happens in this panel... Be detailed about the action, emotions, and atmosphere."
          className={`w-full h-24 sm:h-32 p-3 sm:p-4 ${colors.panelBg} ${colors.border} border-2 rounded-xl ${colors.text} placeholder-gray-500 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/20 transition-all duration-200 resize-none text-sm`}
        />
      </div>
    );
  }
);

PanelDescription.displayName = "PanelDescription";

export default PanelDescription;
