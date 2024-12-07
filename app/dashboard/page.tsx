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
    // Fetch students first
    console.log('Fetching students...');
    const studentsRes = await fetch(`${baseUrl}/api/students`, {
      headers: {
        'Cookie': headersList.get('cookie') || '',
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!studentsRes.ok) {
      const errorText = await studentsRes.text();
      console.error('Students API Error:', studentsRes.status, errorText);
      throw new Error(`Failed to fetch students: ${errorText}`);
    }

    const students = await studentsRes.json();
    console.log('Fetched students:', students);

    // Initialize with empty arrays for other data
    const data = {
      students,
      subjects: [],
      assignments: [],
      schedules: []
    };

    console.log('Final dashboard data:', data);
    return data;
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

    if (!initialData?.students) {
      console.log('No students data, showing empty state');
      initialData = {
        students: [],
        subjects: [],
        assignments: [],
        schedules: []
      };
    }

    console.log('Rendering AdminDashboard with data:', initialData);
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