'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Plus } from "lucide-react";
import { Schedule } from "@/lib/types";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ScheduleTableProps {
  data: Schedule[];
}

export function ScheduleTable({ data }: ScheduleTableProps) {
  const router = useRouter();
  const [schedules, setSchedules] = useState<Schedule[]>(data);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<Schedule | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = (schedule: Schedule) => {
    router.push(`/schedules/${schedule._id}/edit`);
  };

  const handleDelete = async (schedule: Schedule) => {
    setScheduleToDelete(schedule);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!scheduleToDelete) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/schedules/${scheduleToDelete._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete schedule');
      }

      setSchedules(schedules.filter(s => s._id !== scheduleToDelete._id));
      toast({
        title: "Success",
        description: "Schedule deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast({
        title: "Error",
        description: "Failed to delete schedule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setScheduleToDelete(null);
      router.refresh();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => router.push('/schedules/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Schedule
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>Day</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Room</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No schedules found.
                </TableCell>
              </TableRow>
            ) : (
              schedules.map((schedule) => (
                <TableRow key={schedule._id}>
                  <TableCell>{schedule.subjectId?.name || 'Unknown Subject'}</TableCell>
                  <TableCell>{schedule.day}</TableCell>
                  <TableCell>{schedule.startTime}</TableCell>
                  <TableCell>{schedule.endTime}</TableCell>
                  <TableCell>{schedule.room}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(schedule._id)}>
                          Copy ID
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(schedule)}>
                          Edit Schedule
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(schedule)}
                          className="text-red-600"
                        >
                          Delete Schedule
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the schedule
              and remove it from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 