import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { Prisma, Student } from "@prisma/client";
import { StudentQueryDto } from "./dto/student-query.dto";

@Injectable()
export class StudentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.StudentCreateInput): Promise<Student> {
    return this.prisma.student.create({ data });
  }

  async findById(id: string) {
    return this.prisma.student.findUnique({
      where: { id },
      include: {
        branch: {
          select: { id: true, code: true, name: true },
        },
        guardians: {
          include: {
            guardian: true,
          },
        },
        referredByTeacher: {
          select: { id: true, teacherCode: true, fullName: true },
        },
        enrollments: {
          where: { isActive: true },
          include: {
            batchClass: {
              include: {
                subject: true,
                teacher: { select: { id: true, fullName: true } },
              },
            },
          },
        },
      },
    });
  }

  async findByCode(studentCode: string) {
    return this.prisma.student.findUnique({
      where: { studentCode },
    });
  }

  async findAll(query: StudentQueryDto) {
    const {
      search,
      status,
      feeCategory,
      batchClassId,
      page = 1,
      limit = 20,
    } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.StudentWhereInput = {};

    if (search) {
      where.OR = [
        { studentCode: { contains: search, mode: "insensitive" } },
        { fullName: { contains: search, mode: "insensitive" } },
        { mobileNumber: { contains: search } },
        { guardianMobile: { contains: search } },
        {
          guardians: {
            some: {
              guardian: {
                mobileNumber: { contains: search },
              },
            },
          },
        },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (feeCategory) {
      where.feeCategory = feeCategory;
    }

    if (batchClassId) {
      where.enrollments = {
        some: { batchClassId, isActive: true },
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          branch: {
            select: { id: true, code: true, name: true },
          },
          guardians: {
            include: {
              guardian: true,
            },
          },
          enrollments: {
            where: { isActive: true },
            include: {
              batchClass: {
                select: {
                  id: true,
                  batchName: true,
                  subject: { select: { name: true } },
                },
              },
            },
          },
        },
      }),
      this.prisma.student.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(id: string, data: Prisma.StudentUpdateInput): Promise<Student> {
    return this.prisma.student.update({
      where: { id },
      data,
    });
  }

  async generateNextStudentCode(branchCode: string = "COL"): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `SEC-${year}-${branchCode}-`;

    const existingStudents = await this.prisma.student.findMany({
      where: {
        studentCode: { startsWith: prefix },
      },
      select: { studentCode: true },
    });

    let maxSeq = 0;
    for (const s of existingStudents) {
      const parts = s.studentCode.split("-");
      const seqStr = parts[parts.length - 1];
      const parsedSeq = parseInt(seqStr, 10);
      if (!isNaN(parsedSeq) && parsedSeq > maxSeq) {
        maxSeq = parsedSeq;
      }
    }

    const nextSeq = maxSeq + 1;
    return `${prefix}${nextSeq.toString().padStart(4, "0")}`;
  }
}
