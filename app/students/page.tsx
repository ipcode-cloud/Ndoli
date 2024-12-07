import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { StudentTable } from "@/components/students/student-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function StudentsPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === 'admin';

  if (!isAdmin) {
    redirect('/');
  }

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
      <StudentTable />
    </main>
  );
} 