import { getServerSession } from "next-auth";
import StudentDashboard from '@/components/dashboard/student-dashboard';
import AdminDashboard from '@/components/dashboard/admin-dashboard';
import GeminiChat from '@/components/ai/gemini-chat';
import { authOptions } from "@/lib/auth";
import { Session } from "next-auth";
import { Student } from "@/lib/types";
import { Types } from 'mongoose';

export const dynamic = 'force-dynamic';

// Extend the Session type to include role
interface UserWithRole extends Session {
  user: {
    role?: string;
  } & Session['user'];
}

// Create a simplified mock student
const mockStudentData = {
  _id: new Types.ObjectId(),
  name: 'John Doe',
  email: 'john@example.com',
  grade: '10th' as const,
  status: 'Active' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
} as unknown as Student;

export default async function Home() {
  const session = await getServerSession(authOptions) as UserWithRole;
  const userIsAdmin = session?.user?.role?.toLowerCase() === 'admin' || false;

  return (
    <main className="container mx-auto py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {userIsAdmin ? <AdminDashboard /> : <StudentDashboard student={mockStudentData} />}
        </div>
        <div>
          <GeminiChat student={!userIsAdmin ? mockStudentData : undefined} />
        </div>
      </div>
    </main>
  );
}