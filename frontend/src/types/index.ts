export type FeeCategory = 'FULL_FEE' | 'HALF_FEE' | 'NO_FEE';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type StudentStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type TeacherStatus = 'ACTIVE' | 'INACTIVE';
export type InvoiceStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED';
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CARD' | 'OTHER';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
export type CommissionType = 'PERCENTAGE' | 'FIXED_AMOUNT';
export type EnrollmentStatus = 'ACTIVE' | 'DROPPED' | 'COMPLETED' | 'SUSPENDED';
export type ClassSessionStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  lastLoginAt?: string;
}

export interface Guardian {
  id: string;
  fullName: string;
  nicOrPassport?: string;
  mobileNumber: string;
  email?: string;
  address?: string;
}

export interface StudentGuardian {
  id: string;
  studentId: string;
  guardianId: string;
  relationship: string;
  isPrimary: boolean;
  guardian?: Guardian;
}

export interface Student {
  id: string;
  studentCode: string;
  branchId?: string;
  branch?: { id: string; code: string; name: string };
  fullName: string;
  dob: string;
  gender: Gender;
  address: string;
  mobileNumber?: string;
  email?: string;
  status: StudentStatus;
  guardianName?: string;
  guardianRelationship?: string;
  guardianMobile?: string;
  guardianEmail?: string;
  guardianAddress?: string;
  guardians?: StudentGuardian[];
  feeCategory: FeeCategory;
  customConcessionNotes?: string;
  admissionDate: string;
  admissionFeeAmount: number;
  admissionFeePaid: boolean;
  referredByTeacherId?: string;
  createdAt: string;
  enrollments?: Array<{
    id: string;
    status?: EnrollmentStatus;
    customFeeCategory?: FeeCategory;
    batchClass: {
      id: string;
      batchName: string;
      subject: { name: string };
    };
  }>;
}

export interface Teacher {
  id: string;
  teacherCode: string;
  fullName: string;
  nicOrPassport: string;
  dob: string;
  gender: Gender;
  mobileNumber: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  joiningDate: string;
  status: TeacherStatus;
  qualifications?: string;
  photoUrl?: string;
  defaultTuitionCommissionPct: number;
  admissionCommissionType?: CommissionType;
  admissionCommissionValue?: number;
  createdAt: string;
  teacherSubjects?: Array<{
    subject: { name: string; code: string };
  }>;
  _count?: {
    batchClasses: number;
    referredStudents: number;
  };
}

export interface GradeLevel {
  id: string;
  name: string;
  numericOrder: number;
}

export interface Subject {
  id: string;
  gradeLevelId?: string;
  code: string;
  name: string;
  standardMonthlyFee: number;
  gradeLevel?: GradeLevel;
  subjectGradeLevels?: Array<{ gradeLevel: GradeLevel }>;
  createdAt?: string;
}

export interface BatchClass {
  id: string;
  batchName: string;
  monthlyFee: number;
  hallNumber?: string;
  gradeLevelId?: string;
  gradeLevel?: GradeLevel;
  batchClassGradeLevels?: Array<{ gradeLevel: GradeLevel }>;
  subject: { id: string; name: string; code: string };
  teacher: { id: string; fullName: string; teacherCode: string };
  branch?: { name: string };
  classSchedules?: ClassSchedule[];
  _count?: { enrollments: number };
}

export interface ClassSchedule {
  id: string;
  batchClassId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  batchClass?: {
    batchName: string;
    subject: { name: string; code: string };
    teacher: { fullName: string; teacherCode: string };
  };
}

export interface MonthlyInvoice {
  id: string;
  invoiceNumber: string;
  studentId: string;
  batchClassId: string;
  billingMonth: number;
  billingYear: number;
  originalFee: number;
  feeCategoryApplied: FeeCategory;
  finalAmountDue: number;
  status: InvoiceStatus;
  attendancePercentage: number;
  isZeroAttendanceOverride: boolean;
  overrideReason?: string;
  dueDate: string;
  createdAt: string;
  student?: { studentCode: string; fullName: string; mobileNumber?: string };
  batchClass?: { batchName: string; teacherId?: string; teacher?: { id: string; fullName: string }; subject: { name: string } };
}

export interface PaymentRecord {
  id: string;
  receiptNumber: string;
  invoiceId?: string;
  studentId: string;
  isAdmissionFee: boolean;
  amountPaid: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  teacherId?: string;
  teacherShareAmount: number;
  instituteShareAmount: number;
  remarks?: string;
  student?: { studentCode: string; fullName: string };
  teacher?: { teacherCode: string; fullName: string };
  invoice?: { invoiceNumber: string };
}
