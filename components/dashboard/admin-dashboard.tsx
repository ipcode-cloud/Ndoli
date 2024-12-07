'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, Users, BookOpen, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function AdminDashboard() {
  const [conflicts, setConflicts] = useState<string[]>([]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Timetable Upload</h3>
            <Button className="w-full">Upload Timetable</Button>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Assignment Upload</h3>
            <Button className="w-full">Upload Assignments</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Student Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            {/* Student list would go here */}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Recent Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            {/* Recent assignments would go here */}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Schedule Conflicts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            {conflicts.map((conflict, index) => (
              <div
                key={index}
                className="p-2 text-sm text-destructive bg-destructive/10 rounded-lg mb-2"
              >
                {conflict}
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}