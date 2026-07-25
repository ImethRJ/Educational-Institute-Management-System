import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { BatchClass } from '../../types';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { toast } from 'sonner';
import { X, BookOpen, Loader2 } from 'lucide-react';

interface StudentEnrollModalProps {
  studentId: string;
  studentName: string;
  enrolledBatchIds: string[];
  isOpen: boolean;
  onClose: () => void;
}

export const StudentEnrollModal: React.FC<StudentEnrollModalProps> = ({
  studentId,
  studentName,
  enrolledBatchIds,
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');

  // Fetch all batch classes
  const { data: batchesResponse, isLoading } = useQuery({
    queryKey: ['batches-list'],
    queryFn: () => api.get('/academic/batches'),
    enabled: isOpen,
  });

  const rawBatches = (batchesResponse as any)?.data;
  const allBatches: BatchClass[] = Array.isArray(rawBatches) ? rawBatches : rawBatches?.items || [];

  // Filter out already enrolled batches
  const availableBatches = allBatches.filter((b) => !enrolledBatchIds.includes(b.id));

  const enrollMutation = useMutation({
    mutationFn: (batchClassId: string) => api.post(`/students/${studentId}/enroll/${batchClassId}`),
    onSuccess: () => {
      toast.success(`Enrolled ${studentName} into class successfully!`);
      queryClient.invalidateQueries({ queryKey: ['student-profile', studentId] });
      queryClient.invalidateQueries({ queryKey: ['students-list'] });
      onClose();
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchId) {
      toast.error('Please select a batch class to enroll.');
      return;
    }
    enrollMutation.mutate(selectedBatchId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <Card className="w-full max-w-lg bg-card border-border shadow-2xl my-8">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-bold">Enroll Student in Additional Class</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-4 max-h-[60vh] overflow-y-auto">
            <div className="text-xs text-muted-foreground">
              Enrolling <strong className="text-foreground">{studentName}</strong> into a new subject or teacher class.
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold">Select Available Batch Class *</label>
              {isLoading ? (
                <div className="text-xs text-muted-foreground py-4 text-center">Loading batch classes...</div>
              ) : availableBatches.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto p-1">
                  {availableBatches.map((b) => {
                    const isSelected = selectedBatchId === b.id;
                    return (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBatchId(b.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/10 shadow-sm'
                            : 'border-border hover:border-primary/50 bg-card'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-foreground">{b.batchName}</span>
                          <Badge variant="outline" className="text-[10px] font-mono border-primary text-primary font-bold">
                            LKR {Number(b.monthlyFee).toLocaleString()}/mo
                          </Badge>
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-1 flex items-center justify-between">
                          <span>Subject: <strong>{b.subject?.name}</strong></span>
                          <span>Teacher: <strong className="text-emerald-600">{b.teacher?.fullName}</strong></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 border border-border rounded-md text-center text-xs text-muted-foreground">
                  Student is already enrolled in all active batch classes.
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex justify-between border-t border-border pt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={enrollMutation.isPending || !selectedBatchId}
              className="bg-primary"
            >
              {enrollMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enrolling Class...
                </>
              ) : (
                'Confirm Enrollment'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
