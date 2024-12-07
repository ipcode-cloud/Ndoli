import { headers } from "next/headers";
import ScheduleCalendar from "@/components/schedules/schedule-calendar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

async function getSchedules() {
  const headersList = headers();
  const host = headersList.get("host") || "";
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  
  try {
    const response = await fetch(`${protocol}://${host}/api/schedules`, {
      headers: {
        'Cookie': headersList.get('cookie') || '',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch schedules');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return [];
  }
}

async function getSubjects() {
  const headersList = headers();
  const host = headersList.get("host") || "";
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  
  try {
    const response = await fetch(`${protocol}://${host}/api/subjects`, {
      headers: {
        'Cookie': headersList.get('cookie') || '',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch subjects');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return [];
  }
}

export default async function SchedulesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/api/auth/signin');
  }

  const [schedules, subjects] = await Promise.all([
    getSchedules(),
    getSubjects()
  ]);
  
  return (
    <div className="container mx-auto pb-10">
      <ScheduleCalendar 
        initialSchedules={schedules} 
        subjects={subjects}
      />
    </div>
  );
} 