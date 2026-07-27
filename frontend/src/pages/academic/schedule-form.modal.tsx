import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { ClassSchedule, BatchClass } from '../../types';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { toast } from 'sonner';
import { X, Calendar, Loader2 } from 'lucide-react';

interface ScheduleFormModalProps {
  schedule?: ClassSchedule | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ScheduleFormModal: React.FC<ScheduleFormModalProps> = ({
  schedule,
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const isEditing = !!schedule;

  const [batchClassId, setBatchClassId] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState<number>(6); // Default Saturday
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('10:00');

  // Fetch active batch classes for dropdown selection
  const { data: batchesRes } = useQuery({
    queryKey: ['batches-list-all'],
    queryFn: () => api.get('/academic/batches'),
    enabled: isOpen,
  });

  const rawBatches = (batchesRes as any)?.data;
  const batches: BatchClass[] = Array.isArray(rawBatches) ? rawBatches : rawBatches?.items || [];

  useEffect(() => {
    if (schedule) {
      setBatchClassId(schedule.batchClassId || '');
      setDayOfWeek(schedule.dayOfWeek || 6);
      setStartTime(schedule.startTime || '08:00');
      setEndTime(schedule.endTime || '10:00');
    } else {
      setBatchClassId('');
      setDayOfWeek(6);
      setStartTime('08:00');
      setEndTime('10:00');
    }
  }, [schedule, isOpen]);

  const mutation = useMutation({
    mutationFn: (payload: any) =>
      isEditing
        ? api.put(`/academic/schedules/${schedule.id}`, payload)
        : api.post('/academic/schedules', payload),
    onSuccess: () => {
      toast.success(isEditing ? 'Schedule slot updated!' : 'Timetable schedule created!');
      queryClient.invalidateQueries({ queryKey: ['weekly-timetable'] });
      queryClient.invalidateQueries({ queryKey: ['batches-list'] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create schedule slot.');
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (startTime >= endTime) {
      toast.error('End time must be later than start time.');
      return;
    }

    mutation.mutate({
      batchClassId,
      dayOfWeek: Number(dayOfWeek),
      startTime,
      endTime,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md bg-card border-border shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-bold">
              {isEditing ? 'Edit Schedule Slot' : 'Add Timetable Schedule Slot'}
            </CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Target Batch Class *</label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm"
                value={batchClassId}
                onChange={(e) => setBatchClassId(e.target.value)}
                required
                disabled={isEditing}
              >
                <option value="">-- Select Batch Class --</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.batchName} ({b.teacher?.fullName})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold">Day of Week *</label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm"
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(Number(e.target.value))}
                required
              >
                <option value="1">Monday</option>
                <option value="2">Tuesday</option>
                <option value="3">Wednesday</option>
                <option value="4">Thursday</option>
                <option value="5">Friday</option>
                <option value="6">Saturday</option>
                <option value="7">Sunday</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Start Time (HH:mm) *</label>
                <Input
                  type="text"
                  placeholder="08:00"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">End Time (HH:mm) *</label>
                <Input
                  type="text"
                  placeholder="10:00"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between border-t border-border pt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending} className="bg-primary text-white font-semibold text-xs">
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Checking & Saving...
                </>
              ) : (
                'Save Schedule Slot'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
