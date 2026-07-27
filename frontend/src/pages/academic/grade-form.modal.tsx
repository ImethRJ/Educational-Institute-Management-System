import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { GradeLevel } from '../../types';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { toast } from 'sonner';
import { X, Award, Loader2 } from 'lucide-react';

interface GradeFormModalProps {
  grade?: GradeLevel | null;
  isOpen: boolean;
  onClose: () => void;
}

export const GradeFormModal: React.FC<GradeFormModalProps> = ({
  grade,
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const isEditing = !!grade;

  const [name, setName] = useState('');
  const [numericOrder, setNumericOrder] = useState<number>(1);

  useEffect(() => {
    if (grade) {
      setName(grade.name || '');
      setNumericOrder(grade.numericOrder || 1);
    } else {
      setName('');
      setNumericOrder(1);
    }
  }, [grade, isOpen]);

  const mutation = useMutation({
    mutationFn: (payload: any) =>
      isEditing
        ? api.put(`/academic/grades/${grade.id}`, payload)
        : api.post('/academic/grades', payload),
    onSuccess: () => {
      toast.success(isEditing ? 'Grade level updated!' : 'Grade level created!');
      queryClient.invalidateQueries({ queryKey: ['grades-list'] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to save grade level.');
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      name,
      numericOrder: Number(numericOrder),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md bg-card border-border shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <div className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-bold">
              {isEditing ? `Edit Grade: ${grade.name}` : 'Add New Grade Level'}
            </CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Grade Name *</label>
              <Input
                placeholder="e.g. Grade 11 (O/L)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold">Numeric Order *</label>
              <Input
                type="number"
                min="1"
                max="100"
                value={numericOrder}
                onChange={(e) => setNumericOrder(Number(e.target.value))}
                required
              />
              <p className="text-[11px] text-muted-foreground">
                Used for sorting grades sequentially (e.g. Grade 1 = 1, Grade 11 = 11).
              </p>
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
                'Save Grade Level'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
