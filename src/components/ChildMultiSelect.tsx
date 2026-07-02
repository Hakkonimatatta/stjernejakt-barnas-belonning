import { Child } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";

interface ChildMultiSelectProps {
  children: Child[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  allLabel: string;
}

const ChildMultiSelect = ({ children, selectedIds, onChange, allLabel }: ChildMultiSelectProps) => {
  const allSelected = children.length > 0 && selectedIds.length === children.length;

  const toggleChild = (childId: string) => {
    if (selectedIds.includes(childId)) {
      onChange(selectedIds.filter((id) => id !== childId));
    } else {
      onChange([...selectedIds, childId]);
    }
  };

  const toggleAll = () => {
    onChange(allSelected ? [] : children.map((c) => c.id));
  };

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-3 px-3 py-3 bg-muted rounded-lg cursor-pointer active:opacity-70">
        <Checkbox
          checked={allSelected}
          onCheckedChange={toggleAll}
          className="h-5 w-5"
        />
        <span className="font-semibold text-card-foreground">{allLabel}</span>
      </label>
      <div className="grid grid-cols-2 gap-2">
        {children.map((child) => (
          <label
            key={child.id}
            className="flex items-center gap-2 px-3 py-3 bg-muted rounded-lg cursor-pointer active:opacity-70"
          >
            <Checkbox
              checked={selectedIds.includes(child.id)}
              onCheckedChange={() => toggleChild(child.id)}
              className="h-5 w-5 flex-shrink-0"
            />
            <span className="text-xl flex-shrink-0">{child.avatar}</span>
            <span className="font-semibold text-card-foreground truncate">{child.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default ChildMultiSelect;
