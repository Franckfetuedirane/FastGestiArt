import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Category } from "@/types";

interface ViewCategoryModalProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewCategoryModal({ category, isOpen, onClose }: ViewCategoryModalProps) {
  if (!category) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium">Description</h4>
            <p className="text-sm text-muted-foreground">{category.description}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium">Date de création</h4>
            <p className="text-sm text-muted-foreground">
              {new Date(category.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium">Dernière modification</h4>
            <p className="text-sm text-muted-foreground">
              {new Date(category.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}