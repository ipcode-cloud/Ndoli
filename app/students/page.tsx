import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { StudentTable } from "@/components/students/student-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

async function getStudents() {
  console.log('Starting getStudents function');
  const headersList = headers();
  const host = headersList.get("host") || "";
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const url = `${protocol}://${host}/api/students`;
  console.log('Fetching from URL:', url);
  
  try {
    const headers = {
      'Cookie': headersList.get('cookie') || '',
      'Content-Type': 'application/json',
    };
    console.log('Request headers:', headers);

    const response = await fetch(url, {
      headers,
      cache: 'no-store',
      credentials: 'include'
    });

    console.log('Response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`Failed to fetch students: ${errorText}`);
    }

    const data = await response.json();
    console.log('Received data:', data);
    return data;
  } catch (error) {
    console.error('Error in getStudents:', error);
    return [];
  }
}

export default async function StudentsPage() {
  console.log('Starting StudentsPage');
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session);
    const isAdmin = session?.user?.role === 'admin';
    console.log('Is admin:', isAdmin);

    if (!isAdmin) {
      console.log('Not admin, redirecting');
      redirect('/');
    }

    console.log('Fetching students...');
    const students = await getStudents();
    console.log('Fetched students:', students);

    return (
      <main className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Students</h1>
          <Link href="/students/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </Link>
        </div>
        <StudentTable data={students} />
      </main>
    );
  } catch (error) {
    console.error('Error in StudentsPage:', error);
    return (
      <main className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error Loading Students</h1>
          <p className="text-gray-600 mt-2">
            {error instanceof Error ? error.message : 'An error occurred while loading students'}
          </p>
        </div>
      </main>
    );
  }
} 