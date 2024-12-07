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
import { Subject } from "@/lib/types";
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

interface SubjectTableProps {
  data: Subject[];
}

export function SubjectTable({ data }: SubjectTableProps) {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>(data);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = (subject: Subject) => {
    router.push(`/subjects/${subject._id}/edit`);
  };

  const handleDelete = async (subject: Subject) => {
    setSubjectToDelete(subject);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!subjectToDelete) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/subjects/${subjectToDelete._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete subject');
      }

      setSubjects(subjects.filter(s => s._id !== subjectToDelete._id));
      toast({
        title: "Success",
        description: "Subject deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast({
        title: "Error",
        description: "Failed to delete subject. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setSubjectToDelete(null);
      router.refresh();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => router.push('/subjects/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Subject
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Credits</TableHead>
              <TableHead>Teacher</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No subjects found.
                </TableCell>
              </TableRow>
            ) : (
              subjects.map((subject) => (
                <TableRow key={subject._id}>
                  <TableCell>{subject.name}</TableCell>
                  <TableCell>{subject.code}</TableCell>
                  <TableCell>{subject.description}</TableCell>
                  <TableCell>{subject.credits}</TableCell>
                  <TableCell>{subject.teacher}</TableCell>
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
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(subject._id)}>
                          Copy ID
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(subject)}>
                          Edit Subject
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(subject)}
                          className="text-red-600"
                        >
                          Delete Subject
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
              This action cannot be undone. This will permanently delete the subject
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