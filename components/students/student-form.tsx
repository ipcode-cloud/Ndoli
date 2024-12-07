'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { StudentFormData } from "@/lib/types";

interface StudentFormProps {
  initialData?: StudentFormData;
}

export function StudentForm({ initialData }: StudentFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<StudentFormData>({
    id: initialData?.id,
    name: initialData?.name || '',
    email: initialData?.email || '',
    grade: initialData?.grade || '9th',
    status: initialData?.status || 'Active',
  });

  // Log initial data when component mounts
  useEffect(() => {
    console.log('Initial form data:', initialData);
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('Submitting form data:', formData);

    try {
      const url = formData.id
        ? `/api/students/${formData.id}`
        : '/api/students';
      
      const method = formData.id ? 'PATCH' : 'POST';
      console.log('Making request to:', url, 'with method:', method);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          grade: formData.grade,
          status: formData.status,
        }),
      });

      const responseText = await response.text();
      console.log('Response:', response.status, responseText);

      if (!response.ok) {
        throw new Error(responseText || 'Failed to save student');
      }

      toast({
        title: "Success",
        description: formData.id 
          ? "Student updated successfully"
          : "Student created successfully",
      });
      
      router.push('/students');
      router.refresh();
    } catch (error) {
      console.error('Error saving student:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save student",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid w-full max-w-xl gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Student name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="student@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade">Grade</Label>
              <Select
                value={formData.grade}
                onValueChange={(value) => setFormData({ ...formData, grade: value as StudentFormData['grade'] })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {['9th', '10th', '11th', '12th'].map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as StudentFormData['status'] })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {['Active', 'Inactive', 'Suspended'].map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : formData.id ? 'Update Student' : 'Add Student'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
} 