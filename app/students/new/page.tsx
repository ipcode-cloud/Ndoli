import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { StudentForm } from "@/components/students/student-form";

export const dynamic = 'force-dynamic';

export default async function NewStudentPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === 'admin';

  if (!isAdmin) {
    redirect('/');
  }

  return (
    <main className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Add New Student</h1>
      <StudentForm />
    </main>
  );
} 