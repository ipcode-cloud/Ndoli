import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pencil, ClipboardList } from "lucide-react";

async function getAssignment(id: string) {
  const headersList = headers();
  const host = headersList.get("host") || "";
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const response = await fetch(`${protocol}://${host}/api/assignments/${id}`, {
    headers: {
      'Cookie': headersList.get('cookie') || '',
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error('Failed to fetch assignment');
  }

  return response.json();
}

async function getSubmissions(assignmentId: string) {
  const headersList = headers();
  const host = headersList.get("host") || "";
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const response = await fetch(
    `${protocol}://${host}/api/submissions?assignmentId=${assignmentId}`,
    {
      headers: {
        'Cookie': headersList.get('cookie') || '',
      },
      cache: 'no-store'
    }
  );

  if (!response.ok) {
    return [];
  }

  return response.json();
}

export default async function AssignmentPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/api/auth/signin');
  }

  const [assignment, submissions] = await Promise.all([
    getAssignment(params.id),
    getSubmissions(params.id)
  ]);

  const getSubmissionStatus = (studentId: string) => {
    const submission = submissions.find((s: any) => s.studentId._id === studentId);
    if (!submission) return { status: 'Not submitted', className: 'bg-gray-100 text-gray-600' };
    
    const statusStyles = {
      'Pending': 'bg-yellow-100 text-yellow-600',
      'Submitted': 'bg-blue-100 text-blue-600',
      'Late': 'bg-red-100 text-red-600',
      'Graded': 'bg-green-100 text-green-600'
    };
    
    return {
      status: submission.status,
      className: statusStyles[submission.status as keyof typeof statusStyles],
      grade: submission.grade,
      submittedAt: submission.submittedAt
    };
  };

  const isAdmin = session?.user?.role === 'admin';

  return (
    <div className="container mx-auto py-10">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{assignment.title}</h1>
          <div className="flex gap-3">
            {isAdmin && (
              <>
                <Link href={`/assignments/${params.id}/submissions`}>
                  <Button variant="outline" className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" />
                    View Submissions
                  </Button>
                </Link>
                <Link href={`/assignments/${params.id}/edit`}>
                  <Button className="flex items-center gap-2">
                    <Pencil className="h-4 w-4" />
                    Edit Assignment
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
        
        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-gray-500 text-sm">Subject</h2>
              <p className="font-medium mt-1">{assignment.subjectId?.name}</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-gray-500 text-sm">Due Date</h2>
              <p className="font-medium mt-1">{new Date(assignment.dueDate).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-gray-500 text-sm">Status</h2>
            <span className={`inline-block px-3 py-1 rounded-full text-sm mt-1 ${
              assignment.status === 'Completed' ? 'bg-green-100 text-green-800' :
              assignment.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {assignment.status}
            </span>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-gray-500 text-sm">Description</h2>
            <p className="whitespace-pre-wrap mt-2">{assignment.description}</p>
          </div>
          
          {assignment.assignedTo?.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-gray-500 text-sm mb-3">Assigned Students</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assignment.assignedTo.map((student: any) => {
                  const submissionInfo = getSubmissionStatus(student._id);
                  return (
                    <div key={student._id} className="p-3 bg-white rounded-md shadow-sm">
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-gray-500">{student.email}</p>
                      <div className="mt-2 space-y-2">
                        <span className={`text-xs px-2 py-1 rounded ${submissionInfo.className}`}>
                          {submissionInfo.status}
                        </span>
                        {submissionInfo.submittedAt && (
                          <p className="text-xs text-gray-500">
                            Submitted: {new Date(submissionInfo.submittedAt).toLocaleString()}
                          </p>
                        )}
                        {submissionInfo.grade !== undefined && (
                          <p className="text-xs font-medium">
                            Grade: {submissionInfo.grade}/100
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 