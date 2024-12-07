'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentTable } from "@/components/students/student-table";
import { SubjectTable } from "@/components/subjects/subject-table";
import { AssignmentTable } from "@/components/assignments/assignment-table";
import { ScheduleTable } from "@/components/schedules/schedule-table";
import { useEffect, useState } from "react";
import { Student, Subject, Assignment, Schedule } from "@/lib/types";

interface DashboardProps {
  initialData: {
    students: Student[];
    subjects: Subject[];
    assignments: Assignment[];
    schedules: Schedule[];
  };
}

export default function AdminDashboard({ initialData }: DashboardProps) {
  console.log('AdminDashboard received initialData:', initialData);

  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  useEffect(() => {
    console.log('Setting initial data:', initialData);
    if (initialData) {
      setStudents(initialData.students || []);
      setSubjects(initialData.subjects || []);
      setAssignments(initialData.assignments || []);
      setSchedules(initialData.schedules || []);
    }
  }, [initialData]);

  // Calculate stats
  const activeStudents = students.filter(student => student.status === 'Active').length;
  const totalSubjects = subjects.length;
  const pendingAssignments = assignments.filter(a => a.status === 'Not Started').length;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeStudents}</div>
            <p className="text-xs text-muted-foreground">
              out of {students.length} total students
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubjects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingAssignments}</div>
            <p className="text-xs text-muted-foreground">
              out of {assignments.length} total assignments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <Tabs defaultValue="students" className="space-y-4">
        <TabsList>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
        </TabsList>
        <TabsContent value="students" className="space-y-4">
          <StudentTable data={students} />
        </TabsContent>
        <TabsContent value="subjects" className="space-y-4">
          <SubjectTable data={subjects} />
        </TabsContent>
        <TabsContent value="assignments" className="space-y-4">
          <AssignmentTable data={assignments} />
        </TabsContent>
        <TabsContent value="schedules" className="space-y-4">
          <ScheduleTable data={schedules} />
        </TabsContent>
      </Tabs>
    </div>
  );
}