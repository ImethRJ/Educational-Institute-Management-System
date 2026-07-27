import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Subject, GradeLevel } from '../../types';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { toast } from 'sonner';
import { X, BookOpen, Loader2 } from 'lucide-react';

interface SubjectFormModalProps {
  subject?: Subject | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SubjectFormModal: React.FC<SubjectFormModalProps> = ({
  subject,
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const isEditing = !!subject;

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [gradeLevelId, setGradeLevelId] = useState('');
  const [standardMonthlyFee, setStandardMonthlyFee] = useState<number>(3500);

  // Fetch Grade Levels for selection
  const { data: gradesResponse } = useQuery({
    queryKey: ['grades-list'],
    queryFn: () => api.get('/academic/grades'),
    enabled: isOpen,
  });

  const rawGrades = (gradesResponse as any)?.data;
  const grades: GradeLevel[] = Array.isArray(rawGrades) ? rawGrades : rawGrades?.items || [];

  useEffect(() => {
    if (subject) {
      setCode(subject.code || '');
      setName(subject.name || '');
      setGradeLevelId(subject.gradeLevelId || '');
      setStandardMonthlyFee(Number(subject.standardMonthlyFee) || 3500);
    } else {
      setCode('');
      setName('');
      setGradeLevelId('');
      setStandardMonthlyFee(3500);
    }
  }, [subject, isOpen]);

  const mutation = useMutation({
    mutationFn: (payload: any) =>
      isEditing
        ? api.put(`/academic/subjects/${subject.id}`, payload)
        : api.post('/academic/subjects', payload),
    onSuccess: (res: any) => {
      toast.success(
        isEditing
          ? `Subject updated successfully!`
          : `Subject ${res.data?.name || ''} created successfully!`,
      );
      queryClient.invalidateQueries({ queryKey: ['subjects-list'] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to save subject.');
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      code,
      name,
      gradeLevelId: gradeLevelId || null,
      standardMonthlyFee: Number(standardMonthlyFee),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md bg-card border-border shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-bold">
              {isEditing ? `Edit Subject: ${subject.name}` : 'Add New Academic Subject'}
            </CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Target Grade Level (Optional)</label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm"
                value={gradeLevelId}
                onChange={(e) => setGradeLevelId(e.target.value)}
              >
                <option value="">-- Open Subject (All Grades) --</option>
                {grades.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-muted-foreground">
                Leave as "Open Subject" if taught across multiple grades (e.g. History, Maths).
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold">Subject Code *</label>
              <Input
                placeholder="e.g. CMATH-A/L, ENG-G11"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold">Subject Full Name *</label>
              <Input
                placeholder="e.g. Combined Mathematics (A/L)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold">Standard Monthly Fee (LKR) *</label>
              <Input
                type="number"
                value={standardMonthlyFee}
                onChange={(e) => setStandardMonthlyFee(Number(e.target.value))}
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-between border-t border-border pt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending} className="bg-primary text-white font-semibold text-xs">
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving Subject...
                </>
              ) : (
                'Save Subject'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
