import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { BatchClass, Subject, Teacher, GradeLevel } from '../../types';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { toast } from 'sonner';
import { X, Users, Loader2 } from 'lucide-react';

interface BatchFormModalProps {
  batch?: BatchClass | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BatchFormModal: React.FC<BatchFormModalProps> = ({
  batch,
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const isEditing = !!batch;

  const [branchId, setBranchId] = useState('');
  const [academicYearId, setAcademicYearId] = useState('');
  const [selectedGradeIds, setSelectedGradeIds] = useState<string[]>([]);
  const [subjectId, setSubjectId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [batchName, setBatchName] = useState('');
  const [monthlyFee, setMonthlyFee] = useState<number>(3500);
  const [hallNumber, setHallNumber] = useState('Hall A');

  // Fetch Dropdown options
  const { data: branchesRes } = useQuery({
    queryKey: ['branches-list'],
    queryFn: () => api.get('/academic/branches'),
    enabled: isOpen,
  });

  const { data: yearsRes } = useQuery({
    queryKey: ['academic-years-list'],
    queryFn: () => api.get('/academic/years'),
    enabled: isOpen,
  });

  const { data: gradesRes } = useQuery({
    queryKey: ['grades-list'],
    queryFn: () => api.get('/academic/grades'),
    enabled: isOpen,
  });

  const { data: subjectsRes } = useQuery({
    queryKey: ['subjects-list'],
    queryFn: () => api.get('/academic/subjects'),
    enabled: isOpen,
  });

  const { data: teachersRes } = useQuery({
    queryKey: ['teachers-list-all'],
    queryFn: () => api.get('/teachers'),
    enabled: isOpen,
  });

  const branches = (branchesRes as any)?.data || [];
  const years = (yearsRes as any)?.data || [];
  const rawGrades = (gradesRes as any)?.data;
  const grades: GradeLevel[] = Array.isArray(rawGrades) ? rawGrades : rawGrades?.items || [];
  const rawSubjects = (subjectsRes as any)?.data;
  const subjects: Subject[] = Array.isArray(rawSubjects) ? rawSubjects : rawSubjects?.items || [];
  const rawTeachers = (teachersRes as any)?.data;
  const teachers: Teacher[] = Array.isArray(rawTeachers) ? rawTeachers : rawTeachers?.items || [];

  useEffect(() => {
    if (batch) {
      setBatchName(batch.batchName || '');
      setMonthlyFee(Number(batch.monthlyFee) || 3500);
      setHallNumber(batch.hallNumber || 'Hall A');
      setSubjectId(batch.subject?.id || '');
      setTeacherId(batch.teacher?.id || '');

      const ids = batch.batchClassGradeLevels?.map((b) => b.gradeLevel.id) || [];
      if (ids.length === 0 && batch.gradeLevelId) {
        ids.push(batch.gradeLevelId);
      }
      setSelectedGradeIds(ids);
    } else {
      setBatchName('');
      setMonthlyFee(3500);
      setHallNumber('Hall A');
      setSelectedGradeIds([]);
      setSubjectId('');
      setTeacherId('');
    }
  }, [batch, isOpen]);

  // Preselect defaults when loaded
  useEffect(() => {
    if (!isEditing && isOpen) {
      if (branches.length > 0 && !branchId) setBranchId(branches[0].id);
      if (years.length > 0 && !academicYearId) setAcademicYearId(years[0].id);
    }
  }, [branches, years, isOpen, isEditing, branchId, academicYearId]);

  const toggleGrade = (id: string) => {
    setSelectedGradeIds((prev) =>
      prev.includes(id) ? prev.filter((gId) => gId !== id) : [...prev, id],
    );
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(e.target.selectedOptions, (option) => option.value);
    setSelectedGradeIds(values);
  };

  const mutation = useMutation({
    mutationFn: (payload: any) =>
      isEditing
        ? api.put(`/academic/batches/${batch.id}`, payload)
        : api.post('/academic/batches', payload),
    onSuccess: () => {
      toast.success(isEditing ? 'Batch class updated!' : 'Batch class created successfully!');
      queryClient.invalidateQueries({ queryKey: ['batches-list'] });
      onClose();
    },
    onError: (err: any) => {
      const details = err?.response?.data?.error?.details;
      const msg =
        (Array.isArray(details) && details.length > 0 ? details.join(' | ') : null) ||
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        'Failed to save batch class.';
      toast.error(msg);
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!subjectId) {
      toast.error('Please select an Open Subject.');
      return;
    }
    if (!teacherId) {
      toast.error('Please select an Assigned Teacher.');
      return;
    }

    const payload: any = {
      batchName,
      monthlyFee: Number(monthlyFee),
      hallNumber,
      subjectId,
      teacherId,
      gradeLevelIds: selectedGradeIds,
      gradeLevelId: selectedGradeIds[0] || null,
    };
    if (!isEditing) {
      const finalBranchId = branchId || branches[0]?.id;
      const finalAcademicYearId = academicYearId || years[0]?.id;
      if (!finalBranchId) {
        toast.error('Please select an Institute Branch.');
        return;
      }
      if (!finalAcademicYearId) {
        toast.error('Please select an Academic Year.');
        return;
      }
      payload.branchId = finalBranchId;
      payload.academicYearId = finalAcademicYearId;
    }

    mutation.mutate(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-lg bg-card border-border shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-bold">
              {isEditing ? `Edit Batch: ${batch.batchName}` : 'Create New Batch Class'}
            </CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {!isEditing && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Institute Branch *</label>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm"
                      value={branchId}
                      onChange={(e) => setBranchId(e.target.value)}
                      required
                    >
                      {branches.map((b: any) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Academic Year *</label>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm"
                      value={academicYearId}
                      onChange={(e) => setAcademicYearId(e.target.value)}
                      required
                    >
                      {years.map((y: any) => (
                        <option key={y.id} value={y.id}>
                          Year {y.yearName}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold">Open Subject *</label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm"
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Subject --</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Assigned Teacher *</label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm"
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Teacher --</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} ({t.teacherCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Target Grade Levels Multi-select */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold">Target Grade Levels (Multi-select holding Ctrl/Cmd)</label>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {selectedGradeIds.length === 0
                    ? 'General / All Grades'
                    : `${selectedGradeIds.length} Grade(s) Selected`}
                </span>
              </div>

              <select
                multiple
                size={4}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm font-sans"
                value={selectedGradeIds}
                onChange={handleSelectChange}
              >
                {grades.map((g) => (
                  <option key={g.id} value={g.id} className="py-0.5">
                    {g.name}
                  </option>
                ))}
              </select>

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
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold">Batch Class Name *</label>
              <Input
                placeholder="e.g. 2026 Grade 10 & 11 History - Batch A"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Monthly Class Fee (LKR) *</label>
                <Input
                  type="number"
                  value={monthlyFee}
                  onChange={(e) => setMonthlyFee(Number(e.target.value))}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Hall / Room Number</label>
                <Input
                  placeholder="e.g. Hall A, Hall B"
                  value={hallNumber}
                  onChange={(e) => setHallNumber(e.target.value)}
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
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                'Save Batch Class'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
