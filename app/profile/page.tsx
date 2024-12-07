import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  return (
    <main className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Name</p>
            <p>{session?.user?.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p>{session?.user?.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Role</p>
            <p className="capitalize">{session?.user?.role}</p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
} 