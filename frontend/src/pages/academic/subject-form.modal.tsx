import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Subject, GradeLevel } from '../../types';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
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
  const [selectedGradeIds, setSelectedGradeIds] = useState<string[]>([]);
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
      setStandardMonthlyFee(Number(subject.standardMonthlyFee) || 3500);

      const ids = subject.subjectGradeLevels?.map((s) => s.gradeLevel.id) || [];
      if (ids.length === 0 && subject.gradeLevelId) {
        ids.push(subject.gradeLevelId);
      }
      setSelectedGradeIds(ids);
    } else {
      setCode('');
      setName('');
      setSelectedGradeIds([]);
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

  const toggleGrade = (id: string) => {
    setSelectedGradeIds((prev) =>
      prev.includes(id) ? prev.filter((gId) => gId !== id) : [...prev, id],
    );
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(e.target.selectedOptions, (option) => option.value);
    setSelectedGradeIds(values);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      code,
      name,
      gradeLevelIds: selectedGradeIds,
      gradeLevelId: selectedGradeIds[0] || null,
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold">Target Grade Levels (Multi-select holding Ctrl/Cmd)</label>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {selectedGradeIds.length === 0
                    ? 'Open Catalog (All Grades)'
                    : `${selectedGradeIds.length} Grade(s) Selected`}
                </span>
              </div>

              {/* Multi-select select box */}
              <select
                multiple
                size={4}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-primary font-sans"
                value={selectedGradeIds}
                onChange={handleSelectChange}
              >
                {grades.map((g) => (
                  <option key={g.id} value={g.id} className="py-0.5">
                    {g.name}
                  </option>
                ))}
              </select>

              {/* Interactive Grade Pill Toggles */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {grades.map((g) => {
                  const isSelected = selectedGradeIds.includes(g.id);
                  return (
                    <Badge
                      key={g.id}
                      variant={isSelected ? 'default' : 'outline'}
                      className={`cursor-pointer text-[10px] transition-colors ${
                        isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                      }`}
                      onClick={() => toggleGrade(g.id)}
                    >
                      {g.name}
                    </Badge>
                  );
                })}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Hold <kbd className="px-1 py-0.5 text-[10px] bg-muted rounded border">Ctrl</kbd> / <kbd className="px-1 py-0.5 text-[10px] bg-muted rounded border">Cmd</kbd> to select multiple grades or click grade pills above.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold">Subject Code *</label>
              <Input
                placeholder="e.g. HIST, MATH, ENG"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold">Subject Full Name *</label>
              <Input
                placeholder="e.g. History, Mathematics, English"
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
