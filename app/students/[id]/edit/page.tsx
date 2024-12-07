import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { StudentForm } from "@/components/students/student-form";
import { Session } from "next-auth";
import { StudentFormData } from "@/lib/types";
import { notFound } from "next/navigation";
import { headers } from "next/headers";

export const dynamic = 'force-dynamic';

interface CustomSession extends Session {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  }
}

interface EditStudentPageProps {
  params: {
    id: string;
  };
}

async function getStudent(id: string): Promise<StudentFormData | null> {
  try {
    console.log('Fetching student with ID:', id);
    
    // Get the current host
    const headersList = headers();
    const host = headersList.get("host") || "";
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    
    const response = await fetch(`${protocol}://${host}/api/students/${id}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        // Forward the cookie header for authentication
        Cookie: headersList.get('cookie') || '',
      },
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log('Student not found');
        return null;
      }
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to fetch student: ${response.statusText}. ${errorText}`);
    }

    const student = await response.json();
    console.log('Fetched student data:', student);
    
    if (!student || !student.id) {
      console.log('Invalid student data received');
      return null;
    }

    return {
      id: student.id,
      name: student.name,
      email: student.email,
      grade: student.grade,
      status: student.status,
    };
  } catch (error) {
    console.error('Error fetching student:', error);
    throw error;
  }
}

export default async function EditStudentPage({ params }: EditStudentPageProps) {
  try {
    console.log('Starting EditStudentPage with params:', params);
    
    const session = await getServerSession(authOptions) as CustomSession;
    console.log('Session:', JSON.stringify(session, null, 2));
    
    const isAdmin = session?.user?.role === 'admin';
    console.log('Is admin:', isAdmin);

    if (!isAdmin) {
      console.log('User is not admin, redirecting to home');
      redirect('/');
    }

    if (!params.id) {
      console.log('No ID provided, showing 404');
      notFound();
    }

    const student = await getStudent(params.id);
    console.log('Retrieved student for edit:', JSON.stringify(student, null, 2));
    
    if (!student) {
      console.log('No student found, showing 404');
      notFound();
    }

    return (
      <main className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Edit Student</h1>
        <StudentForm initialData={student} />
      </main>
    );
  } catch (error) {
    console.error('Error in EditStudentPage:', error);
    throw error;
  }
} 