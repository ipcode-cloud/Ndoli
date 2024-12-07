import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SubjectForm } from "@/components/subjects/subject-form";
import { headers } from "next/headers";

interface EditSubjectPageProps {
  params: {
    id: string;
  };
}

async function getSubject(id: string) {
  const headersList = headers();
  const host = headersList.get("host") || "";
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const response = await fetch(`${protocol}://${host}/api/subjects/${id}`, {
    headers: {
      'Cookie': headersList.get('cookie') || '',
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error('Failed to fetch subject');
  }

  return response.json();
}

export default async function EditSubjectPage({ params }: EditSubjectPageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/api/auth/signin');
  }

  if (session?.user?.role !== 'admin') {
    redirect('/');
  }

  const subject = await getSubject(params.id);

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Subject</h1>
        <SubjectForm initialData={subject} />
      </div>
    </div>
  );
} 