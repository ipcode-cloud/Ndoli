import { ScrollArea } from "@/components/ui/scroll-area";
import { Assignment } from "@/lib/types";
import { formatDate } from "@/lib/utils/date";

interface AssignmentListProps {
  assignments: Assignment[];
}

export function AssignmentList({ assignments }: AssignmentListProps) {
  const sortedAssignments = [...assignments].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  return (
    <ScrollArea className="h-[200px]">
      {sortedAssignments.map((assignment) => (
        <div
          key={assignment.id}
          className="flex flex-col p-2 hover:bg-accent rounded-lg"
        >
          <span className="font-medium">{assignment.title}</span>
          <span className="text-sm text-muted-foreground">
            Due: {formatDate(new Date(assignment.dueDate))}
          </span>
        </div>
      ))}
    </ScrollArea>
  );
}