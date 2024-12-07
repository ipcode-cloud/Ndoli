import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function StudentDetailsLoading() {
  return (
    <main className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Student Details</h1>
        <Button disabled>
          <Skeleton className="h-4 w-4 mr-2" />
          Edit Student
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Name</h3>
              <Skeleton className="h-6 w-48 mt-1" />
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Email</h3>
              <Skeleton className="h-6 w-64 mt-1" />
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Grade</h3>
              <Skeleton className="h-6 w-24 mt-1" />
            </div>
            <div>
              <h3 className="font-medium text-sm text-muted-foreground">Status</h3>
              <Skeleton className="h-6 w-32 mt-1" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Academic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-6 w-full" />
          </CardContent>
        </Card>
      </div>
    </main>
  );
} 