'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Student } from "@/lib/types";

interface StudentDashboardProps {
  student: Student;
}

export default function StudentDashboard({ student }: StudentDashboardProps) {
  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p>{student.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p>{student.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Grade</p>
              <p>{student.grade}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <p>{student.status}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Academic Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}