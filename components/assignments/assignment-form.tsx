'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { Assignment, Student } from "@/lib/types";

const assignmentFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  subjectId: z.string().min(1, "Subject is required"),
  dueDate: z.string().min(1, "Due date is required"),
  status: z.enum(["Not Started", "In Progress", "Completed"]),
  assignedTo: z.array(z.string()).optional().default([])
});

interface AssignmentFormProps {
  initialData?: Assignment;
  onSuccess?: () => void;
  subjects?: { _id: string; name: string }[];
  students?: Student[];
}

const GRADES = ["9th", "10th", "11th", "12th"] as const;

export function AssignmentForm({ initialData, onSuccess, subjects = [], students = [] }: AssignmentFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectAll, setSelectAll] = useState(false);

  const form = useForm<z.infer<typeof assignmentFormSchema>>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: initialData ? {
      title: initialData.title,
      description: initialData.description,
      subjectId: initialData.subjectId,
      dueDate: new Date(initialData.dueDate).toISOString().split('T')[0],
      status: initialData.status,
      assignedTo: initialData.assignedTo || []
    } : {
      title: "",
      description: "",
      subjectId: "",
      dueDate: "",
      status: "Not Started",
      assignedTo: []
    },
  });

  const filteredStudents = selectedGrade
    ? students.filter(student => student.grade === selectedGrade)
    : [];

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked && selectedGrade) {
      const gradeStudentIds = filteredStudents.map(s => s._id);
      form.setValue('assignedTo', gradeStudentIds);
    } else {
      form.setValue('assignedTo', []);
    }
  };

  async function onSubmit(data: z.infer<typeof assignmentFormSchema>) {
    try {
      setIsLoading(true);
      const url = initialData?._id 
        ? `/api/assignments/${initialData._id}`
        : '/api/assignments';
      
      const response = await fetch(url, {
        method: initialData?._id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          dueDate: new Date(data.dueDate).toISOString(),
          assignedTo: data.assignedTo || []
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save assignment');
      }

      toast({
        title: "Success",
        description: `Assignment ${initialData?._id ? 'updated' : 'created'} successfully`,
      });

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error('Error saving assignment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Assignment Title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter assignment description" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subjectId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject._id} value={subject._id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="assignedTo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assigned Students</FormLabel>
              <div className="space-y-4">
                <Select onValueChange={(grade) => {
                  setSelectedGrade(grade);
                  setSelectAll(false);
                  form.setValue('assignedTo', []);
                }}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a grade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {GRADES.map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        {grade} Grade
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedGrade && (
                  <div className="border rounded-md p-4 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectAll}
                        onCheckedChange={handleSelectAll}
                      />
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Select All {selectedGrade} Grade Students
                      </label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                      {filteredStudents.map((student) => (
                        <div key={student._id} className="flex items-center space-x-2">
                          <Checkbox
                            checked={field.value.includes(student._id)}
                            onCheckedChange={(checked) => {
                              const updatedValue = checked
                                ? [...field.value, student._id]
                                : field.value.filter((id) => id !== student._id);
                              field.onChange(updatedValue);
                              setSelectAll(updatedValue.length === filteredStudents.length);
                            }}
                          />
                          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {student.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              "Saving..."
            ) : initialData?._id ? (
              "Update Assignment"
            ) : (
              "Create Assignment"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
} 