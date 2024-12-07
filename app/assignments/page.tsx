import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useState } from "react";

interface SessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

interface CustomSession {
  user?: SessionUser;
  expires: string;
}

async function getAssignments() {
  const headersList = headers();
  const host = headersList.get("host") || "";
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const response = await fetch(`${protocol}://${host}/api/assignments`, {
    headers: {
      'Cookie': headersList.get('cookie') || '',
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    return [];
  }

  return response.json();
}

async function getSubjects() {
  const headersList = headers();
  const host = headersList.get("host") || "";
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const response = await fetch(`${protocol}://${host}/api/subjects`, {
    headers: {
      'Cookie': headersList.get('cookie') || '',
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    return [];
  }

  return response.json();
}

export default async function AssignmentsPage() {
  const session = await getServerSession(authOptions) as CustomSession;
  
  if (!session) {
    redirect('/api/auth/signin');
  }

  if (session?.user?.role !== 'admin') {
    redirect('/');
  }

  const [assignments, subjects] = await Promise.all([
    getAssignments(),
    getSubjects()
  ]);

  // Function to filter assignments by subject and status
  const filterAssignments = (assignments: any[], subjectId: string | null, status: 'upcoming' | 'completed' | 'overdue') => {
    let filtered = [...assignments];

    // Filter by subject if selected
    if (subjectId && subjectId !== 'all') {
      filtered = filtered.filter(a => a.subjectId === subjectId);
    }

    // Filter by status
    switch (status) {
      case 'upcoming':
        return filtered.filter(a => 
          new Date(a.dueDate) > new Date() && a.status !== 'Completed'
        );
      case 'completed':
        return filtered.filter(a => a.status === 'Completed');
      case 'overdue':
        return filtered.filter(a => 
          new Date(a.dueDate) < new Date() && a.status !== 'Completed'
        );
      default:
        return filtered;
    }
  };

  // Group assignments by status
  const groupedAssignments = {
    upcoming: filterAssignments(assignments, null, 'upcoming'),
    completed: filterAssignments(assignments, null, 'completed'),
    overdue: filterAssignments(assignments, null, 'overdue')
  };

  // Sort assignments by due date
  const sortByDueDate = (a: any, b: any) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();

  Object.values(groupedAssignments).forEach(group => group.sort(sortByDueDate));

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'In Progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'Late':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const AssignmentCard = ({ assignment }: { assignment: any }) => {
    const subject = subjects.find((s: any) => s._id === assignment.subjectId);
    const dueDate = new Date(assignment.dueDate);
    const isOverdue = dueDate < new Date() && assignment.status !== 'Completed';

    return (
      <Link href={`/assignments/${assignment._id}`}>
        <Card className="hover:bg-accent transition-colors">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="font-medium">{assignment.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {subject?.name || 'Unknown Subject'}
                </p>
              </div>
              {getStatusIcon(assignment.status)}
            </div>
            <div className="mt-2 flex items-center text-sm text-muted-foreground">
              <Calendar className="mr-2 h-4 w-4" />
              <span className={isOverdue ? 'text-red-500' : ''}>
                Due {dueDate.toLocaleDateString()}
              </span>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              {assignment.assignedTo?.length || 0} students assigned
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Assignments</h1>
          <p className="text-sm text-muted-foreground">
            Manage and track student assignments
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((subject: any) => (
                <SelectItem key={subject._id} value={subject._id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Link href="/assignments/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Assignment
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({groupedAssignments.upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({groupedAssignments.completed.length})
          </TabsTrigger>
          <TabsTrigger value="overdue">
            Overdue ({groupedAssignments.overdue.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="space-y-4">
          {groupedAssignments.upcoming.map((assignment: any) => (
            <AssignmentCard key={assignment._id} assignment={assignment} />
          ))}
          {groupedAssignments.upcoming.length === 0 && (
            <p className="text-muted-foreground text-center py-4">
              No upcoming assignments
            </p>
          )}
        </TabsContent>
        <TabsContent value="completed" className="space-y-4">
          {groupedAssignments.completed.map((assignment: any) => (
            <AssignmentCard key={assignment._id} assignment={assignment} />
          ))}
          {groupedAssignments.completed.length === 0 && (
            <p className="text-muted-foreground text-center py-4">
              No completed assignments
            </p>
          )}
        </TabsContent>
        <TabsContent value="overdue" className="space-y-4">
          {groupedAssignments.overdue.map((assignment: any) => (
            <AssignmentCard key={assignment._id} assignment={assignment} />
          ))}
          {groupedAssignments.overdue.length === 0 && (
            <p className="text-muted-foreground text-center py-4">
              No overdue assignments
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 