import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
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

export default async function GradesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/api/auth/signin');
  }

  if (session?.user?.role !== 'admin') {
    redirect('/');
  }

  const [students, subjects, progress] = await Promise.all([
    getStudents(),
    getSubjects(),
    getAcademicProgress()
  ]);

  // Group progress by student and subject
  const progressByStudent = students.map((student: any) => {
    const studentProgress = progress.filter(
      (p: any) => p.studentId._id === student.id
    );

    const subjectGrades = subjects.map((subject: any) => {
      const subjectProgress = studentProgress.find(
        (p: any) => p.subjectId._id === subject._id
      );
      return {
        subject: subject.name,
        grade: subjectProgress?.grade || '-',
        score: subjectProgress?.score || null
      };
    });

    return {
      student,
      grades: subjectGrades,
      average: calculateAverage(subjectGrades)
    };
  });

  // Sort by average score (descending)
  progressByStudent.sort((a, b) => (b.average || 0) - (a.average || 0));

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Academic Progress</CardTitle>
          <div className="flex items-center gap-4">
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
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  {subjects.map((subject: any) => (
                    <TableHead key={subject._id}>{subject.name}</TableHead>
                  ))}
                  <TableHead>Average</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {progressByStudent.map(({ student, grades, average }) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      {student.name}
                      <div className="text-sm text-gray-500">
                        Grade {student.grade}
                      </div>
                    </TableCell>
                    {grades.map((grade: any, index: number) => (
                      <TableCell key={index}>
                        {grade.score ? (
                          <div>
                            <div className="font-medium">{grade.grade}</div>
                            <div className="text-sm text-gray-500">
                              {grade.score}/100
                            </div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    ))}
                    <TableCell>
                      {average ? (
                        <div className="font-medium">
                          {average.toFixed(1)}%
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function calculateAverage(grades: any[]) {
  const scores = grades
    .map(g => g.score)
    .filter((score): score is number => score !== null);
  
  if (scores.length === 0) return null;
  
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
} 