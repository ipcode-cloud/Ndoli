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
import { Assignment } from "@/lib/types";
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

interface AssignmentTableProps {
  data: Assignment[];
}

export function AssignmentTable({ data }: AssignmentTableProps) {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>(data);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = (assignment: Assignment) => {
    router.push(`/assignments/${assignment._id}/edit`);
  };

  const handleDelete = async (assignment: Assignment) => {
    setAssignmentToDelete(assignment);
    setIsDeleteDialogOpen(true);
  };

  const handleView = (assignment: Assignment) => {
    router.push(`/assignments/${assignment._id}`);
  };

  const confirmDelete = async () => {
    if (!assignmentToDelete) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/assignments/${assignmentToDelete._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete assignment');
      }

      setAssignments(assignments.filter(a => a._id !== assignmentToDelete._id));
      toast({
        title: "Success",
        description: "Assignment deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast({
        title: "Error",
        description: "Failed to delete assignment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setAssignmentToDelete(null);
      router.refresh();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => router.push('/assignments/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Assignment
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No assignments found.
                </TableCell>
              </TableRow>
            ) : (
              assignments.map((assignment) => (
                <TableRow key={assignment._id}>
                  <TableCell>{assignment.title}</TableCell>
                  <TableCell>{assignment.subjectId?.name || 'Unknown Subject'}</TableCell>
                  <TableCell>{new Date(assignment.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      assignment.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      assignment.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {assignment.status}
                    </span>
                  </TableCell>
                  <TableCell>{assignment.description}</TableCell>
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
                        <DropdownMenuItem onClick={() => handleView(assignment)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(assignment._id)}>
                          Copy ID
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(assignment)}>
                          Edit Assignment
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(assignment)}
                          className="text-red-600"
                        >
                          Delete Assignment
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
              This action cannot be undone. This will permanently delete the assignment
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