import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Teacher, CommissionType } from '../../types';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { toast } from 'sonner';
import { X, Percent, Loader2, ShieldCheck } from 'lucide-react';

interface TeacherCommissionModalProps {
  teacher: Teacher | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TeacherCommissionModal: React.FC<TeacherCommissionModalProps> = ({
  teacher,
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();

  const [defaultTuitionCommissionPct, setDefaultTuitionCommissionPct] = useState<number>(
    teacher?.defaultTuitionCommissionPct || 70,
  );
  const [admissionCommissionType, setAdmissionCommissionType] = useState<CommissionType>(
    teacher?.admissionCommissionType || 'PERCENTAGE',
  );
  const [admissionCommissionValue, setAdmissionCommissionValue] = useState<number>(
    teacher?.admissionCommissionValue || 0,
  );

  const mutation = useMutation({
    mutationFn: (data: any) => api.put(`/teachers/${teacher?.id}/commission`, data),
    onSuccess: () => {
      toast.success(`Commission rules updated for ${teacher?.fullName}!`);
      queryClient.invalidateQueries({ queryKey: ['teachers-list'] });
      onClose();
    },
  });

  if (!isOpen || !teacher) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      defaultTuitionCommissionPct: Number(defaultTuitionCommissionPct),
      admissionCommissionType,
      admissionCommissionValue: Number(admissionCommissionValue),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-lg bg-card border-border shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <div className="flex items-center space-x-2">
            <Percent className="h-5 w-5 text-emerald-600" />
            <div>
              <CardTitle className="text-lg font-bold">Commission Configuration</CardTitle>
              <div className="text-xs text-muted-foreground font-semibold">
                {teacher.fullName} ({teacher.teacherCode})
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-4">
            {/* 1. Tuition Fee Commission Rule */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">
                Default Monthly Tuition Fee Commission (%) *
              </label>
              <div className="flex items-center space-x-3">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={defaultTuitionCommissionPct}
                  onChange={(e) => setDefaultTuitionCommissionPct(Number(e.target.value))}
                  required
                />
                <span className="text-xs font-bold text-emerald-600">% to Teacher</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Institute automatically retains {(100 - defaultTuitionCommissionPct).toFixed(1)}% of all collected monthly student tuition payments.
              </p>
            </div>

            {/* 2. Admission Fee Commission Rule */}
            <div className="space-y-3 pt-4 border-t border-border">
              <label className="text-xs font-bold text-foreground">
                One-Time Admission Fee Commission Rule
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Calculation Type</label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm"
                    value={admissionCommissionType}
                    onChange={(e) => setAdmissionCommissionType(e.target.value as CommissionType)}
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Amount (LKR)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Commission Value</label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={admissionCommissionValue}
                    onChange={(e) => setAdmissionCommissionValue(Number(e.target.value))}
                  />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                If configured, teacher receives{' '}
                {admissionCommissionType === 'PERCENTAGE'
                  ? `${admissionCommissionValue}%`
                  : `LKR ${admissionCommissionValue}`}{' '}
                from newly registered student admission fees when tagged as the referrer.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between border-t border-border pt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving Rules...
                </>
              ) : (
                'Save Commission Configuration'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
