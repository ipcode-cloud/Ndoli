import { ScrollArea } from "@/components/ui/scroll-area";
import { Class } from "@/lib/types";
import { formatTime } from "@/lib/utils/date";

interface ClassListProps {
  classes: Class[];
}

export function ClassList({ classes }: ClassListProps) {
  return (
    <ScrollArea className="h-[200px]">
      {classes.map((class_) => (
        <div
          key={class_.id}
          className="flex items-center justify-between p-2 hover:bg-accent rounded-lg"
        >
          <span>{class_.name}</span>
          <span className="text-sm text-muted-foreground">
            {class_.schedule[0]?.startTime && formatTime(class_.schedule[0].startTime)}
          </span>
        </div>
      ))}
    </ScrollArea>
  );
}