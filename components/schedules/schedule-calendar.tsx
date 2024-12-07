'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface Subject {
  _id: string;
  name: string;
  code: string;
}

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

interface Props {
  initialSchedules: Schedule[];
  subjects: Subject[];
}

export default function ScheduleCalendar({ initialSchedules, subjects }: Props) {
  const router = useRouter();
  const [selectedGrade, setSelectedGrade] = useState<string>('9th');
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTime, setSelectedTime] = useState<{ day: string; time: string } | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [room, setRoom] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    setSchedules(initialSchedules);
  }, [initialSchedules]);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  });

  const getTimeSlotIndex = (time: string) => {
    const [hour, minute] = time.split(':').map(Number);
    return (hour - 8) * 2 + (minute === 30 ? 1 : 0);
  };

  const getScheduleDuration = (schedule: Schedule) => {
    const startIndex = getTimeSlotIndex(schedule.startTime);
    const endIndex = getTimeSlotIndex(schedule.endTime);
    return endIndex - startIndex;
  };

  const getScheduleForTimeSlot = (day: string, time: string) => {
    return schedules.find(schedule => {
      const isCorrectGrade = schedule.grade === selectedGrade;
      const isCorrectDay = schedule.day === day;
      const startIndex = getTimeSlotIndex(schedule.startTime);
      const endIndex = getTimeSlotIndex(schedule.endTime);
      const currentIndex = getTimeSlotIndex(time);
      
      return isCorrectGrade && isCorrectDay && currentIndex >= startIndex && currentIndex < endIndex;
    });
  };

  const handleCellClick = (day: string, time: string) => {
    if (getScheduleForTimeSlot(day, time)) return;
    setSelectedTime({ day, time });
    setIsDialogOpen(true);
  };

  const handleCreateSchedule = async () => {
    if (!selectedTime || !selectedSubject || !room) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsCreating(true);

      // Calculate end time (1.5 hours after start time)
      const [hour, minute] = selectedTime.time.split(':').map(Number);
      let endHour = hour + 1;
      let endMinute = minute + 30;
      
      if (endMinute >= 60) {
        endHour += 1;
        endMinute -= 60;
      }

      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subjectId: selectedSubject,
          grade: selectedGrade,
          day: selectedTime.day,
          startTime: selectedTime.time,
          endTime,
          room
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create schedule');
      }

      setSchedules(prev => [...prev, data]);
      toast.success('Schedule created successfully');
      setIsDialogOpen(false);
      setSelectedSubject('');
      setRoom('');
      router.refresh();
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create schedule');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="mb-6">
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="9th">9th Grade</SelectItem>
                <SelectItem value="10th">10th Grade</SelectItem>
                <SelectItem value="11th">11th Grade</SelectItem>
                <SelectItem value="12th">12th Grade</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr>
                  <th className="border p-2 bg-muted w-24">Time</th>
                  {days.map(day => (
                    <th key={day} className="border p-2 bg-muted">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((time, timeIndex) => (
                  <tr key={time}>
                    <td className="border p-2 text-sm text-center font-medium">
                      {time}
                    </td>
                    {days.map(day => {
                      const schedule = getScheduleForTimeSlot(day, time);
                      const isStartTime = schedule?.startTime === time;
                      const isScheduled = !!schedule;

                      return (
                        <td 
                          key={`${day}-${time}`} 
                          className={cn(
                            "border p-2 relative h-16",
                            !isScheduled && "cursor-pointer hover:bg-muted/50",
                            isScheduled && !isStartTime && "bg-blue-50/50"
                          )}
                          onClick={() => handleCellClick(day, time)}
                        >
                          {isStartTime && schedule && (
                            <div
                              className="absolute left-0 right-0 m-1 bg-blue-50 rounded-md p-2 shadow-sm cursor-pointer hover:bg-blue-100 transition-colors"
                              style={{
                                top: '0',
                                height: `${getScheduleDuration(schedule) * 100}%`,
                                zIndex: 10
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/schedules/${schedule._id}/edit`);
                              }}
                            >
                              <div className="font-medium text-sm truncate">
                                {schedule.subjectId.name}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                Room {schedule.room}
                              </div>
                              <div className="text-xs text-gray-500">
                                {schedule.startTime} - {schedule.endTime}
                              </div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {schedules.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No schedules found. Click on any time slot to create a schedule.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Schedule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject._id} value={subject._id}>
                      {subject.name} ({subject.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="room">Room</Label>
              <Input
                id="room"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="Enter room number"
              />
            </div>

            {selectedTime && (
              <div className="text-sm text-muted-foreground">
                Time: {selectedTime.time} - {selectedTime.day}
              </div>
            )}

            <Button 
              onClick={handleCreateSchedule} 
              disabled={isCreating || !selectedSubject || !room}
              className="w-full"
            >
              {isCreating ? 'Creating...' : 'Create Schedule'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 