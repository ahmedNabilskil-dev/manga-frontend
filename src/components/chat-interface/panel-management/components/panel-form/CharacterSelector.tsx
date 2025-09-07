import { Users } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { CharacterSelectorProps } from "../../types";

const CharacterSelector = memo<CharacterSelectorProps>(
  ({ characters, selectedIds, onToggle, colors }) => {
    // selectedIds now refers to outfit IDs
    const [selectedOutfits, setSelectedOutfits] = useState<string[]>(
      selectedIds || []
    );

    useEffect(() => {
      setSelectedOutfits(selectedIds || []);
    }, [selectedIds]);

    const handleSelectOutfit = (outfitId: string) => {
      let updated;
      if (selectedOutfits.includes(outfitId)) {
        updated = selectedOutfits.filter((id) => id !== outfitId);
      } else {
        updated = [...selectedOutfits, outfitId];
      }
      setSelectedOutfits(updated);
      onToggle(updated as any); // Pass only outfit IDs (array)
    };

    return (
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <h3 className={`text-lg sm:text-xl font-bold ${colors.text}`}>
            Characters & Outfits
          </h3>
          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs sm:text-sm font-medium">
            {selectedOutfits.length} selected
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {characters.map((char) => (
            <div
              key={char._id}
              className={`p-3 sm:p-4 rounded-xl border-2 ${colors.panelBg} border-gray-600`}
            >
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 mb-2 rounded-full flex items-center justify-center bg-gradient-to-r from-gray-600 to-gray-500">
                  <span className="text-white font-bold text-xs sm:text-sm">
                    {char.name.charAt(0)}
                  </span>
                </div>
                <p className={`font-medium text-sm ${colors.text}`}>
                  {char.name}
                </p>
              </div>
              {char.outfitTemplates && char.outfitTemplates.length > 0 && (
                <div className="mt-3">
                  <div className="text-xs font-semibold mb-1 text-gray-400">
                    Outfits:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {char.outfitTemplates.map((outfit) => (
                      <button
                        key={outfit._id}
                        onClick={() => handleSelectOutfit(outfit._id!)}
                        className={`px-2 py-1 rounded-lg border text-xs transition-all duration-200 ${
                          selectedOutfits.includes(outfit._id!)
                            ? "border-blue-500 bg-blue-500/20 text-blue-300 shadow"
                            : "border-gray-500 bg-gray-800 text-gray-200 hover:border-blue-400"
                        }`}
                      >
                        {outfit.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
);

CharacterSelector.displayName = "CharacterSelector";

export default CharacterSelector;
