import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, LayoutDashboard } from "lucide-react";
import { FloorDesigner } from "@/components/visual-layout/FloorDesigner";
import { useDiningAreas, useLayoutProject } from "@/hooks/useLayouts";
import { useTables } from "@/hooks/useTables";
import { useBranch } from "@/context/BranchContext";
import { useBrand } from "@/context/BrandContext";

export default function DedicatedLayoutEditor() {
  const { diningAreaId } = useParams();
  const navigate = useNavigate();
  const { activeBrandSlug } = useBrand();
  const { activeBranchId, activeBranchSlug } = useBranch();
  const restaurantId = activeBranchId;

  const { data: tables = [] } = useTables(restaurantId);
  const { data: diningAreas = [], isLoading: isDiningAreasLoading } = useDiningAreas(restaurantId);
  const diningArea = diningAreas.find(da => da._id === diningAreaId);

  // If diningArea has an activeLayoutId, fetch the project
  const activeLayoutId = diningArea?.activeLayoutId?._id || diningArea?.activeLayoutId;
  const { data: layoutProject, isLoading: isLayoutLoading } = useLayoutProject(activeLayoutId);

  const isLoading = isDiningAreasLoading || isLayoutLoading;

  if (isLoading) {
    return (
      <div className="w-full h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!diningArea && diningAreas.length > 0) {
    return (
      <div className="w-full h-[80vh] flex flex-col items-center justify-center text-center px-4">
        <LayoutDashboard className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Dining Area Not Found</h2>
        <p className="text-muted-foreground mb-6">The requested layout could not be found or has been deleted.</p>
        <Button onClick={() => window.location.href = `/brand/${activeBrandSlug}/branch/${activeBranchSlug}/operations/layout`}>
          Return to Layout Management
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col min-h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between bg-card p-4 border-b border-border/50 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button 
            variant="default" 
            size="sm" 
            className="h-9 px-3 gap-2 bg-primary text-primary-foreground"
            onClick={() => window.location.href = `/brand/${activeBrandSlug}/branch/${activeBranchSlug}/operations/layout`}
          >
            <ChevronLeft className="w-4 h-4" /> Back to Layouts
          </Button>
          <div className="h-6 w-[1px] bg-border"></div>
          <div>
            <h1 className="font-bold text-lg leading-tight">{diningArea?.name || "Loading..."}</h1>
            <p className="text-xs text-muted-foreground capitalize">
              {diningArea?.type || "Indoor"} Environment
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 w-full bg-muted/20 relative">
        <FloorDesigner 
          restaurantId={restaurantId} 
          diningArea={diningArea} 
          layoutProject={layoutProject} 
          tables={tables}
        />
      </div>
    </div>
  );
}
