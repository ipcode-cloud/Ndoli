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
import { toast } from "@/components/ui/use-toast";
import { Subject } from "@/lib/types";

const subjectFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  code: z.string().min(2, "Code must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  credits: z.coerce.number().min(1, "Credits must be at least 1"),
  teacher: z.string().min(2, "Teacher name must be at least 2 characters"),
});

type SubjectFormValues = z.infer<typeof subjectFormSchema>;

interface SubjectFormProps {
  initialData?: Subject;
  onSuccess?: () => void;
}

export function SubjectForm({ initialData, onSuccess }: SubjectFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof subjectFormSchema>>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: initialData || {
      name: "",
      code: "",
      description: "",
      credits: 3,
      teacher: "",
    },
  });

  async function onSubmit(data: z.infer<typeof subjectFormSchema>) {
    try {
      setIsLoading(true);
      const url = initialData?._id 
        ? `/api/subjects/${initialData._id}`
        : '/api/subjects';
      
      const response = await fetch(url, {
        method: initialData?._id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          code: data.code.toUpperCase(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save subject');
      }

      toast({
        title: "Success",
        description: `Subject ${initialData?._id ? 'updated' : 'created'} successfully`,
      });

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error('Error saving subject:', error);
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject Name</FormLabel>
              <FormControl>
                <Input placeholder="Mathematics" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject Code</FormLabel>
              <FormControl>
                <Input 
                  placeholder="MATH101" 
                  {...field} 
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
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
                  placeholder="Enter subject description" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="credits"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Credits</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="1"
                  placeholder="3" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="teacher"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teacher</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
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
              "Update Subject"
            ) : (
              "Create Subject"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
} 