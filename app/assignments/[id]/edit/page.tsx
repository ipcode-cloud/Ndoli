import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AssignmentForm } from "@/components/assignments/assignment-form";
import { headers } from "next/headers";

interface EditAssignmentPageProps {
  params: {
    id: string;
  };
}

async function getAssignment(id: string) {
  const headersList = headers();
  const host = headersList.get("host") || "";
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const response = await fetch(`${protocol}://${host}/api/assignments/${id}`, {
    headers: {
      'Cookie': headersList.get('cookie') || '',
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error('Failed to fetch assignment');
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
    console.error('Failed to fetch subjects');
    return [];
  }

  return response.json();
}

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
    console.error('Failed to fetch students');
    return [];
  }

  return response.json();
}

export default async function EditAssignmentPage({ params }: EditAssignmentPageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/api/auth/signin');
  }

  if (session?.user?.role !== 'admin') {
    redirect('/');
  }

  const [assignment, subjects, students] = await Promise.all([
    getAssignment(params.id),
    getSubjects(),
    getStudents()
  ]);

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Assignment</h1>
        <AssignmentForm 
          initialData={assignment}
          subjects={subjects}
          students={students}
        />
      </div>
    </div>
  );
} 