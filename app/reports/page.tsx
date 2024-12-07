import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

async function getStudents() {
  const headersList = headers();
  const host = headersList.get("host") || "";
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const response = await fetch(`${protocol}://${host}/api/students`, {
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

async function getAcademicProgress() {
  const headersList = headers();
  const host = headersList.get("host") || "";
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const response = await fetch(`${protocol}://${host}/api/academic-progress`, {
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

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/api/auth/signin');
  }

  if (session?.user?.role !== 'admin') {
    redirect('/');
  }

  const [students, assignments, progress] = await Promise.all([
    getStudents(),
    getAssignments(),
    getAcademicProgress()
  ]);

  // Calculate statistics
  const totalStudents = students.length;
  const activeStudents = students.filter((s: any) => s.status === 'Active').length;
  const totalAssignments = assignments.length;
  const completedAssignments = assignments.filter((a: any) => a.status === 'Completed').length;

  // Calculate grade distribution
  const gradeDistribution = students.reduce((acc: any, student: any) => {
    acc[student.grade] = (acc[student.grade] || 0) + 1;
    return acc;
  }, {});

  // Calculate performance metrics
  const averageScores = progress.reduce((acc: any, p: any) => {
    acc.total += p.score || 0;
    acc.count += 1;
    return acc;
  }, { total: 0, count: 0 });

  const overallAverage = averageScores.count > 0 
    ? (averageScores.total / averageScores.count).toFixed(1)
    : 'N/A';

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <Select defaultValue="current">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Term" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">Current Term</SelectItem>
            <SelectItem value="first">First Term</SelectItem>
            <SelectItem value="second">Second Term</SelectItem>
            <SelectItem value="third">Third Term</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              {activeStudents} active students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssignments}</div>
            <p className="text-xs text-muted-foreground">
              {completedAssignments} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallAverage}%</div>
            <p className="text-xs text-muted-foreground">
              Across all subjects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalAssignments > 0
                ? Math.round((completedAssignments / totalAssignments) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Assignment completion
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
            <CardDescription>
              Number of students in each grade level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Grade</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(gradeDistribution).map(([grade, count]) => (
                  <TableRow key={grade}>
                    <TableCell className="font-medium">Grade {grade}</TableCell>
                    <TableCell>{count}</TableCell>
                    <TableCell>
                      {Math.round((Number(count) / totalStudents) * 100)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest academic updates and submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assignments.slice(0, 5).map((assignment: any) => (
                <div key={assignment._id} className="flex items-center">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {assignment.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 