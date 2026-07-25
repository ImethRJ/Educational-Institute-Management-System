import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { FeeCategory, Gender } from '../../types';
import { toast } from 'sonner';
import { X, UserPlus, ShieldCheck, Loader2 } from 'lucide-react';

interface StudentAdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentAdmissionModal: React.FC<StudentAdmissionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('2008-05-14');
  const [gender, setGender] = useState<Gender>('MALE');
  const [address, setAddress] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');

  const [guardianName, setGuardianName] = useState('');
  const [guardianRelationship, setGuardianRelationship] = useState('Father');
  const [guardianMobile, setGuardianMobile] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');

  const [feeCategory, setFeeCategory] = useState<FeeCategory>('FULL_FEE');
  const [admissionFeeAmount, setAdmissionFeeAmount] = useState<number>(2500);

  const admissionMutation = useMutation({
    mutationFn: (newStudent: any) => api.post('/students', newStudent),
    onSuccess: (data: any) => {
      toast.success(
        `Student ${data.data?.studentCode || ''} admitted successfully!`,
      );
      queryClient.invalidateQueries({ queryKey: ['students-list'] });
      queryClient.invalidateQueries({ queryKey: ['students-summary'] });
      onClose();
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    admissionMutation.mutate({
      fullName,
      dob,
      gender,
      address,
      mobileNumber: mobileNumber || undefined,
      email: email || undefined,
      guardianName,
      guardianRelationship,
      guardianMobile,
      guardianEmail: guardianEmail || undefined,
      feeCategory,
      admissionFeeAmount: Number(admissionFeeAmount),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl bg-card border-border shadow-2xl my-8">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <div className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-bold">New Student Admission Processing</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-4 max-h-[70vh] overflow-y-auto">
            {/* Auto ID Generation Info Banner */}
            <div className="p-3 bg-primary/5 rounded-md border border-primary/20 flex items-center justify-between text-xs">
              <span className="font-semibold text-primary">Auto Student ID Format Preview:</span>
              <Badge variant="outline" className="font-mono text-xs border-primary text-primary font-bold">
                SEC-2026-COL-XXXX
              </Badge>
            </div>

            {/* Section 1: Student Personal Details */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                1. Personal Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold">Full Name *</label>
                  <Input
                    placeholder="e.g. Kasun Perera"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Date of Birth *</label>
                  <Input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Gender *</label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold">Home Address *</label>
                  <Input
                    placeholder="123, Temple Road, Nugegoda"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Mobile Phone (Sri Lanka)</label>
                  <Input
                    placeholder="0771234567"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Email Address</label>
                  <Input
                    type="email"
                    placeholder="kasun@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Guardian Info */}
            <div className="space-y-3 pt-2 border-t border-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                2. Guardian Contact Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Guardian Full Name *</label>
                  <Input
                    placeholder="Suneth Perera"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Relationship *</label>
                  <Input
                    placeholder="Father / Mother / Guardian"
                    value={guardianRelationship}
                    onChange={(e) => setGuardianRelationship(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Guardian Mobile *</label>
                  <Input
                    placeholder="0719876543"
                    value={guardianMobile}
                    onChange={(e) => setGuardianMobile(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Guardian Email</label>
                  <Input
                    type="email"
                    placeholder="suneth@gmail.com"
                    value={guardianEmail}
                    onChange={(e) => setGuardianEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Admission & Fee Configuration */}
            <div className="space-y-3 pt-2 border-t border-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                3. Admission Fee & Concession Rules
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Monthly Fee Category *</label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={feeCategory}
                    onChange={(e) => setFeeCategory(e.target.value as FeeCategory)}
                  >
                    <option value="FULL_FEE">FULL_FEE (100% Standard Tuition Fee)</option>
                    <option value="HALF_FEE">HALF_FEE (50% Concession Discount)</option>
                    <option value="NO_FEE">NO_FEE (100% Full Scholarship)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">One-Time Admission Fee (LKR) *</label>
                  <Input
                    type="number"
                    value={admissionFeeAmount}
                    onChange={(e) => setAdmissionFeeAmount(Number(e.target.value))}
                    required
                  />
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between border-t border-border pt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={admissionMutation.isPending} className="bg-primary">
              {admissionMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing Admission...
                </>
              ) : (
                'Save & Complete Admission'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
