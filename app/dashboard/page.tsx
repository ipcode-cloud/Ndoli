import { headers } from 'next/headers';
import AdminDashboard from '@/components/dashboard/admin-dashboard';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from 'next/navigation';

async function fetchData() {
  console.log('fetchData - Start');
  const session = await getServerSession(authOptions);
  console.log('Session in fetchData:', session);

  const headersList = headers();
  const host = headersList.get("host") || "";
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;
  console.log('Base URL:', baseUrl);

  try {
    // Fetch all data in parallel
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

    // Check responses and parse data
    const students = studentsRes.ok ? await studentsRes.json() : [];
    const subjects = subjectsRes.ok ? await subjectsRes.json() : [];
    const assignments = assignmentsRes.ok ? await assignmentsRes.json() : [];
    const schedules = schedulesRes.ok ? await schedulesRes.json() : [];

    console.log('Fetched data:', {
      studentsCount: students.length,
      subjectsCount: subjects.length,
      assignmentsCount: assignments.length,
      schedulesCount: schedules.length
    });

    return {
      students,
      subjects,
      assignments,
      schedules
    };
  } catch (error) {
    console.error('Error in fetchData:', error);
    return {
      students: [],
      subjects: [],
      assignments: [],
      schedules: []
    };
  }
}

export default async function DashboardPage() {
  console.log('DashboardPage - Start');
  try {
    const session = await getServerSession(authOptions);
    console.log('Session in DashboardPage:', session);
    
    if (!session) {
      console.log('No session, redirecting to signin');
      redirect('/api/auth/signin');
    }

    if (session?.user?.role !== 'admin') {
      console.log('Not admin, redirecting to home');
      redirect('/');
    }

    console.log('Fetching initial data...');
    const initialData = await fetchData();
    console.log('Received initial data:', initialData);

    return <AdminDashboard initialData={initialData} />;
  } catch (error) {
    console.error('Error in DashboardPage:', error);
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error Loading Dashboard</h1>
          <p className="text-gray-600 mt-2">
            {error instanceof Error ? error.message : 'An error occurred while loading the dashboard'}
          </p>
        </div>
      </div>
    );
  }
} 