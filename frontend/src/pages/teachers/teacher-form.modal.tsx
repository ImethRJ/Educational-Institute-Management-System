import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Teacher, CommissionType, Gender, Subject } from '../../types';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { toast } from 'sonner';
import { X, UserCheck, Loader2 } from 'lucide-react';

interface TeacherFormModalProps {
  teacher?: Teacher | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TeacherFormModal: React.FC<TeacherFormModalProps> = ({
  teacher,
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const isEditing = !!teacher;

  const [fullName, setFullName] = useState('');
  const [nicOrPassport, setNicOrPassport] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<Gender>('MALE');
  const [dob, setDob] = useState('1990-01-01');
  const [qualifications, setQualifications] = useState('');
  const [defaultTuitionCommissionPct, setDefaultTuitionCommissionPct] = useState<number>(75);
  const [admissionCommissionType, setAdmissionCommissionType] = useState<CommissionType>('PERCENTAGE');
  const [admissionCommissionValue, setAdmissionCommissionValue] = useState<number>(20);

  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);

  // Fetch all Subjects for Multi-Selection
  const { data: subjectsResponse } = useQuery({
    queryKey: ['subjects-list'],
    queryFn: () => api.get('/academic/subjects'),
    enabled: isOpen,
  });

  const rawSubjects = (subjectsResponse as any)?.data;
  const subjects: Subject[] = Array.isArray(rawSubjects) ? rawSubjects : rawSubjects?.items || [];

  useEffect(() => {
    if (teacher) {
      setFullName(teacher.fullName || '');
      setNicOrPassport(teacher.nicOrPassport || '');
      setMobileNumber(teacher.mobileNumber || '');
      setEmail(teacher.email || '');
      setGender(teacher.gender || 'MALE');
      setDob(teacher.dob ? new Date(teacher.dob).toISOString().split('T')[0] : '1990-01-01');
      setQualifications(teacher.qualifications || '');
      setDefaultTuitionCommissionPct(Number(teacher.defaultTuitionCommissionPct) || 75);
      setAdmissionCommissionType(teacher.admissionCommissionType || 'PERCENTAGE');
      setAdmissionCommissionValue(Number(teacher.admissionCommissionValue) || 20);

      // Populate existing linked subjects
      const initialSubjectIds = teacher.teacherSubjects?.map((ts: any) => ts.subjectId || ts.subject?.id).filter(Boolean) || [];
      setSelectedSubjectIds(initialSubjectIds);
    } else {
      setFullName('');
      setNicOrPassport('');
      setMobileNumber('');
      setEmail('');
      setGender('MALE');
      setDob('1990-01-01');
      setQualifications('');
      setDefaultTuitionCommissionPct(75);
      setAdmissionCommissionType('PERCENTAGE');
      setAdmissionCommissionValue(20);
      setSelectedSubjectIds([]);
    }
  }, [teacher, isOpen]);

  const mutation = useMutation({
    mutationFn: (payload: any) =>
      isEditing ? api.put(`/teachers/${teacher.id}`, payload) : api.post('/teachers', payload),
    onSuccess: (res: any) => {
      toast.success(
        isEditing
          ? `Teacher ${res.data?.fullName || ''} updated successfully!`
          : `Teacher ${res.data?.teacherCode || ''} registered successfully!`,
      );
      queryClient.invalidateQueries({ queryKey: ['teachers-list'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-kpi-summary'] });
      onClose();
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      fullName,
      nicOrPassport,
      mobileNumber,
      email: email || undefined,
      gender,
      dob,
      qualifications: qualifications || undefined,
      defaultTuitionCommissionPct: Number(defaultTuitionCommissionPct),
      admissionCommissionType,
      admissionCommissionValue: Number(admissionCommissionValue),
      subjectIds: selectedSubjectIds,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <Card className="w-full max-w-xl bg-card border-border shadow-2xl my-8">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <div className="flex items-center space-x-2">
            <UserCheck className="h-5 w-5 text-emerald-600" />
            <CardTitle className="text-lg font-bold">
              {isEditing ? `Edit Teacher: ${teacher.fullName}` : 'Register New Teacher'}
            </CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-4 max-h-[70vh] overflow-y-auto">
            {!isEditing && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-md flex justify-between items-center text-xs">
                <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                  Auto Teacher Code Preview:
                </span>
                <Badge variant="outline" className="font-mono text-xs border-emerald-600 text-emerald-600 font-bold">
                  TCH-2026-XXX
                </Badge>
              </div>
            )}

            {/* Personal Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold">Teacher Full Name *</label>
                <Input
                  placeholder="e.g. Prof. Sunil Shantha"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">NIC / Passport Number *</label>
                <Input
                  placeholder="851234567V / 198512345678"
                  value={nicOrPassport}
                  onChange={(e) => setNicOrPassport(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Mobile Number *</label>
                <Input
                  placeholder="0771122334"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Email Address</label>
                <Input
                  type="email"
                  placeholder="sunil@sector.lk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Gender *</label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold">Academic Qualifications</label>
                <Input
                  placeholder="B.Sc. (Hons) Mathematics, M.Sc. Physics"
                  value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
                />
              </div>

              {/* Subject Multi-Selection Section */}
              <div className="sm:col-span-2 space-y-2 pt-2 border-t border-border">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex justify-between items-center">
                  <span>Assigned Teaching Subjects (Multiple Allowed)</span>
                  <Badge variant="outline" className="text-[10px] font-normal">
                    {selectedSubjectIds.length} Selected
                  </Badge>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 border border-border rounded-md bg-muted/20">
                  {subjects.map((sub) => {
                    const isSelected = selectedSubjectIds.includes(sub.id);
                    return (
                      <label
                        key={sub.id}
                        className={`flex items-center space-x-2 text-xs p-1.5 rounded cursor-pointer transition-colors ${
                          isSelected ? 'bg-primary/10 border border-primary/40 font-semibold' : 'hover:bg-muted'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSubjectIds([...selectedSubjectIds, sub.id]);
                            } else {
                              setSelectedSubjectIds(selectedSubjectIds.filter((id) => id !== sub.id));
                            }
                          }}
                          className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                        />
                        <div className="truncate">
                          <span>{sub.name}</span>
                          <span className="text-[10px] text-muted-foreground ml-1">({sub.code})</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Commission Rules Configuration */}
            <div className="space-y-3 pt-3 border-t border-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Tuition & Admission Commission Rules
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold">Default Monthly Tuition Fee Commission (%) *</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={defaultTuitionCommissionPct}
                    onChange={(e) => setDefaultTuitionCommissionPct(Number(e.target.value))}
                    required
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Teacher receives {defaultTuitionCommissionPct}% of collected student tuition. Institute retains {(100 - defaultTuitionCommissionPct).toFixed(1)}%.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold">Admission Commission Type</label>
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
                  <label className="text-xs font-semibold">Admission Commission Value</label>
                  <Input
                    type="number"
                    min="0"
                    value={admissionCommissionValue}
                    onChange={(e) => setAdmissionCommissionValue(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between border-t border-border pt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving Teacher...
                </>
              ) : isEditing ? (
                'Update Teacher Profile'
              ) : (
                'Complete Teacher Registration'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
