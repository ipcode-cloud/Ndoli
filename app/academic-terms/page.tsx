import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle } from "lucide-react";

const CURRENT_YEAR = new Date().getFullYear();
const TERMS = ['First', 'Second', 'Third', 'Final'] as const;

const ACADEMIC_YEARS = [
  {
    year: `${CURRENT_YEAR}-${CURRENT_YEAR + 1}`,
    terms: [
      { name: 'First Term', status: 'Completed', startDate: '2023-09-01', endDate: '2023-12-15' },
      { name: 'Second Term', status: 'In Progress', startDate: '2024-01-10', endDate: '2024-03-30' },
      { name: 'Third Term', status: 'Pending', startDate: '2024-04-15', endDate: '2024-07-30' },
    ]
  },
  {
    year: `${CURRENT_YEAR - 1}-${CURRENT_YEAR}`,
    terms: [
      { name: 'First Term', status: 'Completed', startDate: '2022-09-01', endDate: '2022-12-15' },
      { name: 'Second Term', status: 'Completed', startDate: '2023-01-10', endDate: '2023-03-30' },
      { name: 'Third Term', status: 'Completed', startDate: '2023-04-15', endDate: '2023-07-30' },
    ]
  }
];

export default async function AcademicTermsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/api/auth/signin');
  }

  if (session?.user?.role !== 'admin') {
    redirect('/');
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Academic Terms</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Academic Year
        </Button>
      </div>

      <div className="grid gap-6">
        {ACADEMIC_YEARS.map((academicYear) => (
          <Card key={academicYear.year}>
            <CardHeader>
              <CardTitle>Academic Year {academicYear.year}</CardTitle>
              <CardDescription>
                Manage terms and their schedules for this academic year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Term</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {academicYear.terms.map((term) => (
                    <TableRow key={term.name}>
                      <TableCell className="font-medium">
                        {term.name}
                      </TableCell>
                      <TableCell>
                        {new Date(term.startDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(term.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                          getStatusColor(term.status)
                        }`}>
                          {term.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 