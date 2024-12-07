'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Schedule {
  _id: string;
  subjectId: {
    _id: string;
    name: string;
    code: string;
  };
  grade: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
}

export default function ScheduleListPage() {
  const router = useRouter();
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await fetch('/api/schedules');
        if (!response.ok) throw new Error('Failed to fetch schedules');
        const data = await response.json();
        setSchedules(data);
      } catch (error) {
        toast.error('Failed to load schedules');
      }
    };

    fetchSchedules();
  }, []);

  const filteredSchedules = schedules.filter(schedule => {
    if (selectedGrade !== 'all' && schedule.grade !== selectedGrade) return false;
    if (selectedDay !== 'all' && schedule.day !== selectedDay) return false;
    return true;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/schedules/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete schedule');
      }

      toast.success('Schedule deleted successfully');
      setSchedules(prev => prev.filter(schedule => schedule._id !== id));
    } catch (error) {
      toast.error('Failed to delete schedule');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4 mb-6">
          <Select value={selectedGrade} onValueChange={setSelectedGrade}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select Grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Grades</SelectItem>
              <SelectItem value="9th">9th Grade</SelectItem>
              <SelectItem value="10th">10th Grade</SelectItem>
              <SelectItem value="11th">11th Grade</SelectItem>
              <SelectItem value="12th">12th Grade</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedDay} onValueChange={setSelectedDay}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select Day" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Days</SelectItem>
              {days.map(day => (
                <SelectItem key={day} value={day}>{day}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4">
          {filteredSchedules.map(schedule => (
            <div
              key={schedule._id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <h3 className="font-medium">{schedule.subjectId.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {schedule.day} • {schedule.startTime}-{schedule.endTime} • Room {schedule.room}
                </p>
                <p className="text-sm text-muted-foreground">
                  {schedule.grade} Grade • {schedule.subjectId.code}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push(`/schedules/${schedule._id}/edit`)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(schedule._id)}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {filteredSchedules.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No schedules found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 