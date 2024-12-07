'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Student } from "@/lib/types";
import { GraduationCap, Mail, User, Activity, Book, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface StudentDashboardProps {
  student: Student;
}

// Mock data - replace with real data later
const mockProgress = {
  overall: 85,
  subjects: [
    { name: "Mathematics", progress: 90, grade: "A" },
    { name: "Science", progress: 85, grade: "B+" },
    { name: "English", progress: 88, grade: "A-" },
    { name: "History", progress: 82, grade: "B" },
  ],
};

const mockSchedule = [
  { day: "Monday", time: "09:00 AM", subject: "Mathematics", room: "101" },
  { day: "Monday", time: "10:30 AM", subject: "Science", room: "Lab 2" },
  { day: "Monday", time: "01:00 PM", subject: "English", room: "203" },
];

export default function StudentDashboard({ student }: StudentDashboardProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Welcome, {student.name}</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p>{student.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p>{student.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Grade</p>
                <p>{student.grade}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge variant={student.status === 'Active' ? 'default' : 'secondary'}>
                  {student.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Academic Progress</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-muted-foreground">{mockProgress.overall}%</span>
                </div>
                <Progress value={mockProgress.overall} className="h-2" />
              </div>
              <div className="space-y-2">
                {mockProgress.subjects.map((subject) => (
                  <div key={subject.name} className="grid grid-cols-3 text-sm">
                    <span className="font-medium">{subject.name}</span>
                    <Progress value={subject.progress} className="h-2 mt-2" />
                    <span className="text-right text-muted-foreground">{subject.grade}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Today's Schedule</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Room</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSchedule.map((session, index) => (
                <TableRow key={index}>
                  <TableCell>{session.time}</TableCell>
                  <TableCell>{session.subject}</TableCell>
                  <TableCell>{session.room}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Mathematics Assignment</p>
                <p className="text-sm text-muted-foreground">Due in 3 days</p>
              </div>
              <Badge>Not Started</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Science Lab Report</p>
                <p className="text-sm text-muted-foreground">Due in 5 days</p>
              </div>
              <Badge variant="secondary">In Progress</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}