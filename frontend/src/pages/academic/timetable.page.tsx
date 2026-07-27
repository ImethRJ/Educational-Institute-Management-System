import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { ClassSchedule, Subject, BatchClass, GradeLevel } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { SubjectFormModal } from './subject-form.modal';
import { GradeFormModal } from './grade-form.modal';
import { BatchFormModal } from './batch-form.modal';
import { ScheduleFormModal } from './schedule-form.modal';
import { toast } from 'sonner';
import {
  Calendar,
  Clock,
  BookOpen,
  Plus,
  Users,
  Award,
  Edit2,
  Trash2,
  Loader2,
} from 'lucide-react';

export const TimetablePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'grades' | 'subjects' | 'batches' | 'timetable'>('subjects');

  // Filter States for Timetable
  const [selectedDay, setSelectedDay] = useState<number | ''>('');
  const [selectedHall, setSelectedHall] = useState<string>('');

  // Modal States
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<GradeLevel | null>(null);

  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<BatchClass | null>(null);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ClassSchedule | null>(null);

  // Queries
  const { data: gradesResponse, isLoading: loadingGrades } = useQuery({
    queryKey: ['grades-list'],
    queryFn: () => api.get('/academic/grades'),
  });

  const { data: subjectsResponse, isLoading: loadingSubjects } = useQuery({
    queryKey: ['subjects-list'],
    queryFn: () => api.get('/academic/subjects'),
  });

  const { data: batchesResponse, isLoading: loadingBatches } = useQuery({
    queryKey: ['batches-list'],
    queryFn: () => api.get('/academic/batches'),
  });

  const { data: timetableResponse, isLoading: loadingTimetable } = useQuery({
    queryKey: ['weekly-timetable', selectedDay, selectedHall],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedDay) params.append('dayOfWeek', selectedDay.toString());
      if (selectedHall) params.append('hallNumber', selectedHall);
      return api.get(`/academic/timetable?${params.toString()}`);
    },
    enabled: activeTab === 'timetable',
  });

  // Extract Lists
  const rawGrades = (gradesResponse as any)?.data;
  const grades: GradeLevel[] = Array.isArray(rawGrades) ? rawGrades : rawGrades?.items || [];

  const rawSubjects = (subjectsResponse as any)?.data;
  const subjects: Subject[] = Array.isArray(rawSubjects) ? rawSubjects : rawSubjects?.items || [];

  const rawBatches = (batchesResponse as any)?.data;
  const batches: BatchClass[] = Array.isArray(rawBatches) ? rawBatches : rawBatches?.items || [];

  const schedules: ClassSchedule[] = (timetableResponse as any)?.data || [];
  const daysMap = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Delete Mutations
  const deleteGradeMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/academic/grades/${id}`),
    onSuccess: () => {
      toast.success('Grade level deleted.');
      queryClient.invalidateQueries({ queryKey: ['grades-list'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete grade level.');
    },
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/academic/subjects/${id}`),
    onSuccess: () => {
      toast.success('Subject deleted.');
      queryClient.invalidateQueries({ queryKey: ['subjects-list'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete subject.');
    },
  });

  const deleteBatchMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/academic/batches/${id}`),
    onSuccess: () => {
      toast.success('Batch class deleted.');
      queryClient.invalidateQueries({ queryKey: ['batches-list'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete batch class.');
    },
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/academic/schedules/${id}`),
    onSuccess: () => {
      toast.success('Timetable schedule slot deleted.');
      queryClient.invalidateQueries({ queryKey: ['weekly-timetable'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete schedule slot.');
    },
  });

  const handleDeleteGrade = (g: GradeLevel) => {
    if (confirm(`Are you sure you want to delete grade level "${g.name}"?`)) {
      deleteGradeMutation.mutate(g.id);
    }
  };

  const handleDeleteSubject = (s: Subject) => {
    if (confirm(`Are you sure you want to delete subject "${s.name}" (${s.code})?`)) {
      deleteSubjectMutation.mutate(s.id);
    }
  };

  const handleDeleteBatch = (b: BatchClass) => {
    if (confirm(`Are you sure you want to delete batch class "${b.batchName}"?`)) {
      deleteBatchMutation.mutate(b.id);
    }
  };

  const handleDeleteSchedule = (sch: ClassSchedule) => {
    if (confirm('Are you sure you want to remove this timetable schedule slot?')) {
      deleteScheduleMutation.mutate(sch.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Academic, Subject & Timetable Management</h1>
          <p className="text-xs text-muted-foreground">
            Manage grade levels, subjects, monthly course fees, active batch classes, and weekly hall schedules
          </p>
        </div>

        {activeTab === 'grades' && (
          <Button
            onClick={() => {
              setEditingGrade(null);
              setIsGradeModalOpen(true);
            }}
            className="text-xs font-semibold bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-1.5" /> Add Grade Level
          </Button>
        )}

        {activeTab === 'subjects' && (
          <Button
            onClick={() => {
              setEditingSubject(null);
              setIsSubjectModalOpen(true);
            }}
            className="text-xs font-semibold bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-1.5" /> Add New Subject
          </Button>
        )}

        {activeTab === 'batches' && (
          <Button
            onClick={() => {
              setEditingBatch(null);
              setIsBatchModalOpen(true);
            }}
            className="text-xs font-semibold bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-1.5" /> Create Batch Class
          </Button>
        )}

        {activeTab === 'timetable' && (
          <Button
            onClick={() => {
              setEditingSchedule(null);
              setIsScheduleModalOpen(true);
            }}
            className="text-xs font-semibold bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-1.5" /> Add Schedule Slot
          </Button>
        )}
      </div>

      {/* Tab Controls */}
      <div className="flex flex-wrap space-x-2 border-b border-border pb-2">
        <Button
          variant={activeTab === 'grades' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('grades')}
          className="text-xs font-semibold"
        >
          <Award className="h-4 w-4 mr-1.5" /> Grade Levels ({grades.length})
        </Button>
        <Button
          variant={activeTab === 'subjects' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('subjects')}
          className="text-xs font-semibold"
        >
          <BookOpen className="h-4 w-4 mr-1.5" /> Academic Subjects ({subjects.length})
        </Button>
        <Button
          variant={activeTab === 'batches' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('batches')}
          className="text-xs font-semibold"
        >
          <Users className="h-4 w-4 mr-1.5" /> Active Batch Classes ({batches.length})
        </Button>
        <Button
          variant={activeTab === 'timetable' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('timetable')}
          className="text-xs font-semibold"
        >
          <Calendar className="h-4 w-4 mr-1.5" /> Weekly Timetable Schedules
        </Button>
      </div>

      {/* TAB 0: GRADE LEVELS ROSTER */}
      {activeTab === 'grades' && (
        <Card className="border-border">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numeric Order</TableHead>
                  <TableHead>Grade Level Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingGrades ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-xs text-muted-foreground">
                      Loading grade levels...
                    </TableCell>
                  </TableRow>
                ) : grades.length > 0 ? (
                  grades.map((g) => (
                    <TableRow key={g.id}>
                      <TableCell className="font-mono text-xs font-bold text-primary">
                        #{g.numericOrder}
                      </TableCell>
                      <TableCell className="text-xs font-semibold">{g.name}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            setEditingGrade(g);
                            setIsGradeModalOpen(true);
                          }}
                        >
                          <Edit2 className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => handleDeleteGrade(g)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-xs text-muted-foreground">
                      No grade levels found. Click "Add Grade Level" above.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* TAB 1: ACADEMIC SUBJECTS ROSTER */}
      {activeTab === 'subjects' && (
        <Card className="border-border">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject Code</TableHead>
                  <TableHead>Subject Name</TableHead>
                  <TableHead>Grade Level</TableHead>
                  <TableHead>Standard Monthly Fee</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingSubjects ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-xs text-muted-foreground">
                      Loading subjects...
                    </TableCell>
                  </TableRow>
                ) : subjects.length > 0 ? (
                  subjects.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-mono text-xs font-bold text-primary">
                        {sub.code}
                      </TableCell>
                      <TableCell className="text-xs font-semibold">{sub.name}</TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="outline">{sub.gradeLevel?.name || 'Standard'}</Badge>
                      </TableCell>
                      <TableCell className="text-xs font-bold text-emerald-600">
                        LKR {Number(sub.standardMonthlyFee || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString('en-LK') : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            setEditingSubject(sub);
                            setIsSubjectModalOpen(true);
                          }}
                        >
                          <Edit2 className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => handleDeleteSubject(sub)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-xs text-muted-foreground">
                      No academic subjects registered yet. Click "Add New Subject" above.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* TAB 2: ACTIVE BATCH CLASSES */}
      {activeTab === 'batches' && (
        <Card className="border-border">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch Class Name</TableHead>
                  <TableHead>Assigned Teacher</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Monthly Class Fee</TableHead>
                  <TableHead>Hall Number</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingBatches ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-xs text-muted-foreground">
                      Loading batch classes...
                    </TableCell>
                  </TableRow>
                ) : batches.length > 0 ? (
                  batches.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="text-xs font-bold">{b.batchName}</TableCell>
                      <TableCell className="text-xs font-semibold text-primary">
                        {b.teacher?.fullName || 'N/A'} ({b.teacher?.teacherCode})
                      </TableCell>
                      <TableCell className="text-xs font-mono">{b.subject?.name || 'Subject'}</TableCell>
                      <TableCell className="text-xs font-bold text-emerald-600">
                        LKR {Number(b.monthlyFee || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{b.hallNumber || 'Main Hall'}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            setEditingBatch(b);
                            setIsBatchModalOpen(true);
                          }}
                        >
                          <Edit2 className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => handleDeleteBatch(b)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-xs text-muted-foreground">
                      No batch classes created yet. Click "Create Batch Class" above.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: WEEKLY TIMETABLE SCHEDULES */}
      {activeTab === 'timetable' && (
        <div className="space-y-4">
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    <option value="Hall A">Hall A</option>
                    <option value="Hall B">Hall B</option>
                    <option value="Hall C">Hall C</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loadingTimetable ? (
              <div className="col-span-full text-center py-8 text-xs text-muted-foreground">
                Loading weekly timetable schedules...
              </div>
            ) : schedules.length > 0 ? (
              schedules.map((sch) => (
                <Card key={sch.id} className="border-border hover:shadow-md transition-shadow relative">
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

                    <div className="flex justify-end space-x-1 border-t border-border pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[11px] px-2"
                        onClick={() => {
                          setEditingSchedule(sch);
                          setIsScheduleModalOpen(true);
                        }}
                      >
                        <Edit2 className="h-3 w-3 mr-1" /> Edit Slot
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-[11px] px-2 text-destructive"
                        onClick={() => handleDeleteSchedule(sch)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                No class schedule slots found matching filters. Click "Add Schedule Slot" above.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grade Modal */}
      <GradeFormModal
        grade={editingGrade}
        isOpen={isGradeModalOpen}
        onClose={() => {
          setIsGradeModalOpen(false);
          setEditingGrade(null);
        }}
      />

      {/* Subject Modal */}
      <SubjectFormModal
        subject={editingSubject}
        isOpen={isSubjectModalOpen}
        onClose={() => {
          setIsSubjectModalOpen(false);
          setEditingSubject(null);
        }}
      />

      {/* Batch Modal */}
      <BatchFormModal
        batch={editingBatch}
        isOpen={isBatchModalOpen}
        onClose={() => {
          setIsBatchModalOpen(false);
          setEditingBatch(null);
        }}
      />

      {/* Schedule Modal */}
      <ScheduleFormModal
        schedule={editingSchedule}
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setEditingSchedule(null);
        }}
      />
    </div>
  );
};
