import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface GradingFormProps {
  submissionId: string;
  initialGrade?: number;
  initialFeedback?: string;
  onSuccess?: (data: { grade: number; feedback: string; status: string }) => void;
}

export function GradingForm({ 
  submissionId, 
  initialGrade, 
  initialFeedback,
  onSuccess 
}: GradingFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [grade, setGrade] = useState(initialGrade?.toString() || '');
  const [feedback, setFeedback] = useState(initialFeedback || '');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate grade
      const numericGrade = Number(grade);
      if (isNaN(numericGrade) || numericGrade < 0 || numericGrade > 100) {
        throw new Error('Grade must be a number between 0 and 100');
      }

      const response = await fetch(`/api/submissions/${submissionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grade: numericGrade,
          feedback,
          status: 'Graded'
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save grade');
      }

      toast.success('Grade saved successfully');
      onSuccess?.({ grade: numericGrade, feedback, status: 'Graded' });
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save grade');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="grade">Grade (0-100)</Label>
          <Input
            id="grade"
            type="number"
            min="0"
            max="100"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="feedback">Feedback</Label>
          <Textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Provide feedback for the student..."
            className="mt-1"
          />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Grade'}
        </Button>
      </form>
    </Card>
  );
} 