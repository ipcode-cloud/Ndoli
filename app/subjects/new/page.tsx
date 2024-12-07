import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SubjectForm } from "@/components/subjects/subject-form";

export default async function NewSubjectPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/api/auth/signin');
  }

  if (session?.user?.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create New Subject</h1>
        <SubjectForm />
      </div>
    </div>
  );
} 