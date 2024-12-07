import React from 'react';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
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

interface Assignment {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  status: string;
  subjectId: string;
  assignedTo: Array<{
    _id: string;
    name: string;
    email: string;
    grade: string;
  }>;
}

interface Submission {
  _id: string;
  assignmentId: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
  };
  status: string;
  submittedAt: string;
  grade?: number;
  feedback?: string;
  attachments?: Array<{
    fileName: string;
    fileUrl: string;
  }>;
}

interface PageProps {
  initialAssignment: Assignment;
  initialSubmissions: Submission[];
}

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

export default async function SubmissionsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const session = await getServerSession(authOptions) as CustomSession;
  
  if (!session) {
    redirect('/api/auth/signin');
  }

  if (session?.user?.role !== 'admin') {
    redirect('/');
  }

  const assignment = await getAssignment(params.id);
  const submissions = await getSubmissions(params.id);

  return (
    <>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<PageProps>, {
            initialAssignment: assignment,
            initialSubmissions: submissions,
          } as PageProps);
        }
        return child;
      })}
    </>
  );
} 