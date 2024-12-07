import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ScheduleForm } from "@/components/schedules/schedule-form";
import { headers } from "next/headers";

interface EditSchedulePageProps {
  params: {
    id: string;
  };
}

async function getSchedule(id: string) {
  const headersList = headers();
  const host = headersList.get("host") || "";
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const response = await fetch(`${protocol}://${host}/api/schedules/${id}`, {
    headers: {
      'Cookie': headersList.get('cookie') || '',
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error('Failed to fetch schedule');
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

export default async function EditSchedulePage({ params }: EditSchedulePageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/api/auth/signin');
  }

  if (session?.user?.role !== 'admin') {
    redirect('/');
  }

  const [schedule, subjects] = await Promise.all([
    getSchedule(params.id),
    getSubjects()
  ]);

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Schedule</h1>
        <ScheduleForm 
          initialData={schedule}
          subjects={subjects}
        />
      </div>
    </div>
  );
} 