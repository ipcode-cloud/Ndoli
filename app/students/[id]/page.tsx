import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Session } from "next-auth";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

interface CustomSession extends Session {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  }
}

interface StudentDetailsProps {
  params: {
    id: string;
  };
}

async function getStudent(id: string) {
  try {
    const headersList = headers();
    const host = headersList.get("host") || "";
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    
    const response = await fetch(`${protocol}://${host}/api/students/${id}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        Cookie: headersList.get('cookie') || '',
      },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Failed to fetch student: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching student:', error);
    throw error;
  }
}

export default async function StudentDetailsPage({ params }: StudentDetailsProps) {
  const session = await getServerSession(authOptions) as CustomSession;
  const isAdmin = session?.user?.role === 'admin';

  if (!isAdmin) {
    redirect('/');
  }

  const student = await getStudent(params.id);
  
  if (!student) {
    notFound();
  }

  return (
    <main className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Student Details</h1>
        <Link href={`/students/${student.id}/edit`}>
          <Button>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Student
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Name</h3>
              <p className="mt-1">{student.name}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Email</h3>
              <p className="mt-1">{student.email}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Grade</h3>
              <p className="mt-1">{student.grade}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Status</h3>
              <p className="mt-1">{student.status}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Academic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Academic information will be available soon.</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
} 