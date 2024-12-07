import { getServerSession } from "next-auth";
import StudentDashboard from '@/components/dashboard/student-dashboard';
import AdminDashboard from '@/components/dashboard/admin-dashboard';
import GeminiChat from '@/components/ai/gemini-chat';
import { authOptions } from "@/lib/auth";
import { Session } from "next-auth";
import { Student } from "@/lib/types";
import { Types } from 'mongoose';
import { headers } from 'next/headers';

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

async function fetchDashboardData() {
  const headersList = headers();
  const host = headersList.get("host") || "";
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  try {
    const [studentsRes, subjectsRes, assignmentsRes, schedulesRes] = await Promise.all([
      fetch(`${baseUrl}/api/students`, {
        headers: {
          'Cookie': headersList.get('cookie') || '',
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      }),
      fetch(`${baseUrl}/api/subjects`, {
        headers: {
          'Cookie': headersList.get('cookie') || '',
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      }),
      fetch(`${baseUrl}/api/assignments`, {
        headers: {
          'Cookie': headersList.get('cookie') || '',
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      }),
      fetch(`${baseUrl}/api/schedules`, {
        headers: {
          'Cookie': headersList.get('cookie') || '',
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      })
    ]);

    const students = studentsRes.ok ? await studentsRes.json() : [];
    const subjects = subjectsRes.ok ? await subjectsRes.json() : [];
    const assignments = assignmentsRes.ok ? await assignmentsRes.json() : [];
    const schedules = schedulesRes.ok ? await schedulesRes.json() : [];

    return {
      students,
      subjects,
      assignments,
      schedules
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return {
      students: [],
      subjects: [],
      assignments: [],
      schedules: []
    };
  }
}

export default async function Home() {
  const session = await getServerSession(authOptions) as UserWithRole;
  const userIsAdmin = session?.user?.role?.toLowerCase() === 'admin' || false;
  const dashboardData = userIsAdmin ? await fetchDashboardData() : null;

  return (
    <main className="container mx-auto py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {userIsAdmin ? (
            <AdminDashboard initialData={dashboardData!} />
          ) : (
            <StudentDashboard student={mockStudentData} />
          )}
        </div>
        <div>
          <GeminiChat student={!userIsAdmin ? mockStudentData : undefined} />
        </div>
      </div>
    </main>
  );
}