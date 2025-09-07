import { Panel } from "@/types/entities";
import React from "react";
import { PanelViewer } from "./PanelViewer";

/**
 * Legacy InteractivePanel component - now uses PanelViewer for clean viewing
 * This maintains backward compatibility while using our new clean architecture
 */
interface InteractivePanelProps {
  panel: Panel;
  className?: string;
  containerHeight?: string;
}
const InteractivePanel: React.FC<InteractivePanelProps> = ({
  panel,
  className,
  containerHeight,
}) => {
  // Use PanelViewer for all display scenarios
  return (
    <PanelViewer
      panel={panel}
      className={className}
      containerHeight={containerHeight}
      showDialogs={true}
    />
  );
};

export default InteractivePanel;
