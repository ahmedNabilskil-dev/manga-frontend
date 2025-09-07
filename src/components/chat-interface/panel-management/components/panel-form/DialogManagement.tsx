import { Character } from "@/types/entities";
import { MessageSquare, Plus, X } from "lucide-react";
import { memo } from "react";
import { DialogManagementProps, PanelDialogue } from "../../types";

const DialogManagement = memo<DialogManagementProps>(
  ({
    dialogs,
    characters,
    colors,
    onAddDialog,
    onUpdateDialog,
    onRemoveDialog,
  }) => {
    return (
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <h3 className={`text-lg sm:text-xl font-bold ${colors.text}`}>
              Dialogues
            </h3>
          </div>
          <button
            onClick={onAddDialog}
            className="flex items-center gap-2 px-3 py-2 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Dialogue
          </button>
        </div>

        <div className="space-y-4">
          {dialogs.map((dialogue, index) => (
            <DialogItem
              key={dialogue._id || `dialog-${index}`}
              dialogue={dialogue}
              index={index}
              characters={characters}
              colors={colors}
              onUpdate={(field, value) => onUpdateDialog(index, field, value)}
              onRemove={() => onRemoveDialog(index)}
            />
          ))}

          {dialogs.length === 0 && (
            <div
              className={`text-center py-6 sm:py-8 ${colors.panelBg} rounded-xl ${colors.border} border-dashed border-2`}
            >
              <MessageSquare className="w-8 h-8 sm:w-12 sm:h-12 text-gray-500 mx-auto mb-3" />
              <p className={`${colors.textMuted} text-sm`}>
                No dialogues added yet
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }
);

const DialogItem = memo<{
  dialogue: PanelDialogue;
  index: number;
  characters: Character[];
  colors: any;
  onUpdate: (field: keyof PanelDialogue, value: any) => void;
  onRemove: () => void;
}>(({ dialogue, index, characters, colors, onUpdate, onRemove }) => {
  return (
    <div
      className={`${colors.panelBg} rounded-xl p-3 sm:p-4 ${colors.border} border`}
    >
      <div className="flex justify-between items-center mb-3">
        <h4 className={`font-medium ${colors.text} text-sm sm:text-base`}>
          Dialogue #{index + 1}
        </h4>
        <button
          onClick={onRemove}
          className="p-1 hover:bg-red-500/20 rounded-md transition-colors"
        >
          <X className="w-4 h-4 text-red-400" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
        <div>
          <label className={`block ${colors.textSecondary} text-sm mb-2`}>
            Speaker
          </label>
          <select
            value={dialogue.speakerId || ""}
            onChange={(e) => onUpdate("speakerId", e.target.value)}
            className={`w-full p-2 sm:p-3 ${colors.panelBg} ${colors.border} border rounded-lg ${colors.text} focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 text-sm`}
          >
            <option value="">Select Speaker</option>
            {characters.map((char) => (
              <option key={char._id} value={char._id}>
                {char.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={`block ${colors.textSecondary} text-sm mb-2`}>
            Emotion
          </label>
          <select
            value={dialogue.emotion || ""}
            onChange={(e) => onUpdate("emotion", e.target.value)}
            className={`w-full p-2 sm:p-3 ${colors.panelBg} ${colors.border} border rounded-lg ${colors.text} focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 text-sm`}
          >
            <option value="">Select Emotion</option>
            <option value="happy">Happy</option>
            <option value="angry">Angry</option>
            <option value="sad">Sad</option>
            <option value="surprised">Surprised</option>
            <option value="neutral">Neutral</option>
          </select>
        </div>

        <div className="sm:col-span-2 lg:col-span-1">
          <label className={`block ${colors.textSecondary} text-sm mb-2`}>
            Bubble Type
          </label>
          <select
            value={dialogue.bubbleType || "normal"}
            onChange={(e) => onUpdate("bubbleType", e.target.value)}
            className={`w-full p-2 sm:p-3 ${colors.panelBg} ${colors.border} border rounded-lg ${colors.text} focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 text-sm`}
          >
            <option value="normal">Normal</option>
            <option value="thought">Thought</option>
            <option value="scream">Scream</option>
            <option value="whisper">Whisper</option>
            <option value="narration">Narration</option>
          </select>
        </div>
      </div>

      <div>
        <label className={`block ${colors.textSecondary} text-sm mb-2`}>
          Dialogue Text
        </label>
        <textarea
          value={dialogue.content}
          onChange={(e) => onUpdate("content", e.target.value)}
          placeholder="Enter dialogue text..."
          className={`w-full p-2 sm:p-3 ${colors.panelBg} ${colors.border} border rounded-lg ${colors.text} placeholder-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200 resize-none text-sm`}
          rows={2}
        />
      </div>
    </div>
  );
});

DialogManagement.displayName = "DialogManagement";
DialogItem.displayName = "DialogItem";

export default DialogManagement;
