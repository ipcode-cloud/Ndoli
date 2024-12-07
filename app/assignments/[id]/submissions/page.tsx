'use client';

import { useState } from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GradingForm } from "@/components/assignments/grading-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Assignment {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  status: string;
  subjectId: string;
  assignedTo: Array<{
    _id: string;
    name: string;
    email: string;
    grade: string;
  }>;
}

interface Submission {
  _id: string;
  assignmentId: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
  };
  status: string;
  submittedAt: string;
  grade?: number;
  feedback?: string;
  attachments?: Array<{
    fileName: string;
    fileUrl: string;
  }>;
}

interface Props {
  initialAssignment: Assignment;
  initialSubmissions: Submission[];
}

interface GradingData {
  grade: number;
  feedback: string;
  status: string;
}

export default function AssignmentSubmissionsPage({ 
  initialAssignment,
  initialSubmissions = []
}: Props) {
  if (!initialAssignment) {
    return <div>Loading...</div>;
  }

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions || []);
  const [isExporting, setIsExporting] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Late':
        return 'bg-red-100 text-red-800';
      case 'Graded':
        return 'bg-purple-100 text-purple-800';
      case 'Submitted':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Create a map of student submissions
  const submissionMap = new Map(
    submissions?.map(submission => [submission.studentId._id, submission]) || []
  );

  const handleGradingSuccess = (submissionId: string, data: { grade: number; feedback: string; status: string }) => {
    setSubmissions(prev => prev.map(sub => 
      sub._id === submissionId 
        ? { ...sub, ...data }
        : sub
    ));
  };

  const handleGradingCallback = (submissionId: string) => {
    return (data: { grade: number; feedback: string; status: string }) => {
      handleGradingSuccess(submissionId, data);
    };
  };

  const filteredStudents = (initialAssignment.assignedTo || []).filter(student => {
    const submission = submissionMap.get(student._id);
    if (statusFilter === 'all') return true;
    if (statusFilter === 'submitted') return submission?.status === 'Submitted';
    if (statusFilter === 'graded') return submission?.status === 'Graded';
    if (statusFilter === 'missing') return !submission;
    if (statusFilter === 'late') {
      return submission && new Date(submission.submittedAt) > new Date(initialAssignment.dueDate);
    }
    return true;
  });

  // Sort students based on selected criteria
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'status': {
        const statusA = submissionMap.get(a._id)?.status || 'Not submitted';
        const statusB = submissionMap.get(b._id)?.status || 'Not submitted';
        return statusA.localeCompare(statusB);
      }
      case 'grade': {
        const gradeA = submissionMap.get(a._id)?.grade || -1;
        const gradeB = submissionMap.get(b._id)?.grade || -1;
        return gradeB - gradeA;
      }
      default:
        return 0;
    }
  });

  const stats = {
    total: sortedStudents?.length || 0,
    submitted: submissions?.filter(s => s.status === 'Submitted').length || 0,
    graded: submissions?.filter(s => s.status === 'Graded').length || 0,
    missing: (sortedStudents?.length || 0) - (submissions?.length || 0),
    late: submissions?.filter(s => 
      s.submittedAt && initialAssignment?.dueDate && 
      new Date(s.submittedAt) > new Date(initialAssignment.dueDate)
    ).length || 0
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const csvContent = [
        ['Student Name', 'Email', 'Status', 'Submission Date', 'Grade', 'Feedback'],
        ...sortedStudents.map(student => {
          const submission = submissionMap.get(student._id);
          return [
            student.name,
            student.email,
            submission?.status || 'Not submitted',
            submission?.submittedAt ? new Date(submission.submittedAt).toLocaleString() : '',
            submission?.grade || '',
            submission?.feedback || ''
          ];
        })
      ].map(row => row.join(',')).join('\\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${initialAssignment?.title || 'assignment'}-submissions.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to export submissions');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6 flex justify-between items-center">
        <Link
          href={`/assignments/${initialAssignment?._id}`}
          className="inline-flex items-center text-blue-500 hover:text-blue-600"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Assignment
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Submissions for {initialAssignment?.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Due: {initialAssignment?.dueDate ? new Date(initialAssignment.dueDate).toLocaleDateString() : 'No due date'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-4 mr-4">
              <div className="text-sm">
                <span className="font-medium">Total:</span> {stats.total}
              </div>
              <div className="text-sm">
                <span className="font-medium">Submitted:</span> {stats.submitted}
              </div>
              <div className="text-sm">
                <span className="font-medium">Graded:</span> {stats.graded}
              </div>
              <div className="text-sm">
                <span className="font-medium">Missing:</span> {stats.missing}
              </div>
              <div className="text-sm">
                <span className="font-medium">Late:</span> {stats.late}
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Submissions</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="graded">Graded</SelectItem>
                <SelectItem value="missing">Missing</SelectItem>
                <SelectItem value="late">Late</SelectItem>
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy('name')}>
                  Sort by Name
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('status')}>
                  Sort by Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('grade')}>
                  Sort by Grade
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleExport}
              disabled={isExporting}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {sortedStudents?.map(student => {
              if (!student) return null;
              const submission = submissionMap.get(student._id);
              const isLate = submission && initialAssignment?.dueDate && 
                new Date(submission.submittedAt) > new Date(initialAssignment.dueDate);

              return (
                <Card key={student._id} className="p-4">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">{student.name}</h3>
                      <p className="text-sm text-gray-500">{student.email}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                          getStatusColor(submission?.status || 'Not submitted')
                        }`}>
                          {submission?.status || 'Not submitted'}
                        </span>
                        {isLate && (
                          <span className="inline-block px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                            Late
                          </span>
                        )}
                      </div>
                      {submission?.submittedAt && (
                        <p className="text-sm text-gray-500">
                          Submitted: {new Date(submission.submittedAt).toLocaleString()}
                        </p>
                      )}
                      {submission?.attachments && submission.attachments.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Attachments:</p>
                          <div className="flex flex-wrap gap-2">
                            {submission.attachments.map((attachment, index) => (
                              <a
                                key={index}
                                href={attachment.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-500 hover:text-blue-600 underline"
                              >
                                {attachment.fileName}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 max-w-md">
                      {submission ? (
                        <GradingForm
                          submissionId={submission._id}
                          initialGrade={submission.grade}
                          initialFeedback={submission.feedback}
                          onSuccess={handleGradingCallback(submission._id)}
                        />
                      ) : (
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <p className="text-gray-500 italic">No submission yet</p>
                          <p className="text-sm text-gray-400 mt-1">
                            Student has not submitted this assignment
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 