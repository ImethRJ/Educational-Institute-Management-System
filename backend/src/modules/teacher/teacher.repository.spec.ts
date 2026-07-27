import { Test, TestingModule } from "@nestjs/testing";
import { TeacherRepository } from "./teacher.repository";
import { PrismaService } from "../../common/prisma/prisma.service";

const mockTeacher = {
  id: "teacher-uuid-1",
  teacherCode: "TCH-0001",
  fullName: "Kamal Perera",
  nicOrPassport: "851234567V",
  mobileNumber: "+94771234567",
  status: "ACTIVE",
  defaultTuitionCommissionPct: 80.0,
  createdAt: new Date(),
  updatedAt: new Date(),
} as any;

describe("TeacherRepository", () => {
  let repository: TeacherRepository;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const mockPrisma = {
      teacher: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        findFirst: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeacherRepository,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    repository = module.get<TeacherRepository>(TeacherRepository);
    prismaService = module.get(PrismaService);
  });

  it("should be defined", () => {
    expect(repository).toBeDefined();
  });

  describe("findById", () => {
    it("should find teacher by ID with relations", async () => {
      (prismaService.teacher.findUnique as jest.Mock).mockResolvedValue(
        mockTeacher,
      );

      const result = await repository.findById("teacher-uuid-1");

      expect(prismaService.teacher.findUnique).toHaveBeenCalledWith({
        where: { id: "teacher-uuid-1" },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockTeacher);
    });
  });

  describe("findByCode", () => {
    it("should find teacher by unique teacher code", async () => {
      (prismaService.teacher.findUnique as jest.Mock).mockResolvedValue(
        mockTeacher,
      );

      const result = await repository.findByCode("TCH-0001");

      expect(prismaService.teacher.findUnique).toHaveBeenCalledWith({
        where: { teacherCode: "TCH-0001" },
      });
      expect(result).toEqual(mockTeacher);
    });
  });
});
