import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { ClassSchedule, BatchClass } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Calendar, Clock, Building2, Plus, Filter } from 'lucide-react';

export const TimetablePage: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<number | ''>('');
  const [selectedHall, setSelectedHall] = useState<string>('');

  const { data: timetableResponse, isLoading } = useQuery({
    queryKey: ['weekly-timetable', selectedDay, selectedHall],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedDay) params.append('dayOfWeek', selectedDay.toString());
      if (selectedHall) params.append('hallNumber', selectedHall);
      return api.get(`/academic/timetable?${params.toString()}`);
    },
  });

  const schedules: ClassSchedule[] = (timetableResponse as any)?.data || [];

  const daysMap = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Weekly Timetable Schedule Builder</h1>
          <p className="text-xs text-muted-foreground">
            Classroom hall allocations, weekly schedules, and automated teacher collision checks
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Filter Day of Week</label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm"
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">All Days (Mon - Sun)</option>
                <option value="1">Monday</option>
                <option value="2">Tuesday</option>
                <option value="3">Wednesday</option>
                <option value="4">Thursday</option>
                <option value="5">Friday</option>
                <option value="6">Saturday</option>
                <option value="7">Sunday</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Filter Hall / Room</label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm"
                value={selectedHall}
                onChange={(e) => setSelectedHall(e.target.value)}
              >
                <option value="">All Halls</option>
                <option value="Hall A">Hall A (Main Campus)</option>
                <option value="Hall B">Hall B (Science Wing)</option>
                <option value="Hall C">Hall C (Revision Hall)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timetable Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-8 text-xs text-muted-foreground">
            Loading weekly timetable schedules...
          </div>
        ) : schedules.length > 0 ? (
          schedules.map((sch) => (
            <Card key={sch.id} className="border-border hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] font-bold">
                    {daysMap[sch.dayOfWeek - 1]}
                  </Badge>
                  <div className="flex items-center space-x-1 text-xs font-bold text-emerald-600">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {sch.startTime} - {sch.endTime}
                    </span>
                  </div>
                </div>
                <CardTitle className="text-sm font-bold mt-2">
                  {sch.batchClass?.batchName || 'Batch Class'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex items-center justify-between border-t border-border pt-2 text-muted-foreground">
                  <span>Assigned Teacher:</span>
                  <span className="font-semibold text-foreground">
                    {sch.batchClass?.teacher?.fullName}
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Subject Code:</span>
                  <span className="font-mono text-primary font-bold">
                    {sch.batchClass?.subject?.code}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-xs text-muted-foreground border border-dashed border-border rounded-lg">
            No class schedule slots found matching filters.
          </div>
        )}
      </div>
    </div>
  );
};
