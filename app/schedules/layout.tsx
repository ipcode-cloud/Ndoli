import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { headers } from "next/headers";

interface SessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

interface CustomSession {
  user?: SessionUser;
  expires: string;
}

interface Props {
  children: React.ReactNode;
}

export default async function SchedulesLayout({ children }: Props) {
  const session = await getServerSession(authOptions) as CustomSession;
  const headersList = headers();
  const pathname = headersList.get("x-pathname") || "";
  const isListView = pathname.includes('list');

  if (!session) {
    redirect('/api/auth/signin');
  }

  if (!session?.user?.role || session.user.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Class Schedule</h1>
          <p className="text-muted-foreground">Manage class schedules and timetables</p>
        </div>
        <Link href="/schedules/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Schedule
          </Button>
        </Link>
      </div>

      <div className="flex items-center space-x-4 mb-8">
        <Link href="/schedules">
          <Button variant={!isListView ? 'default' : 'ghost'} className="hover:text-foreground">
            Calendar View
          </Button>
        </Link>
        <Link href="/schedules/list">
          <Button variant={isListView ? 'default' : 'ghost'} className="hover:text-foreground">
            List View
          </Button>
        </Link>
      </div>

      {children}
    </div>
  );
} 