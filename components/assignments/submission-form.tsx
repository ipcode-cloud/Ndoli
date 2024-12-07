import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface SubmissionFormProps {
  assignmentId: string;
  studentId: string;
  onSuccess?: () => void;
}

export function SubmissionForm({ assignmentId, studentId, onSuccess }: SubmissionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create submission
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignmentId,
          studentId,
          status: 'Submitted',
          attachments: [] // TODO: Implement file upload
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit assignment');
      }

      toast.success('Assignment submitted successfully');
      onSuccess?.();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="files">Attachments</Label>
          <Input
            id="files"
            type="file"
            multiple
            onChange={(e) => setFiles(e.target.files)}
            className="mt-1"
          />
          <p className="text-sm text-gray-500 mt-1">
            You can upload multiple files (PDF, Word, images)
          </p>
        </div>

        <div>
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            placeholder="Add any notes for your teacher..."
            className="mt-1"
          />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
        </Button>
      </form>
    </Card>
  );
} 