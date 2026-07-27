import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateBatchDto } from './dto/create-batch.dto';

describe('CreateBatchDto Validation', () => {
  it('should pass validation for valid payload including academicYearId 00000000-0000-0000-0000-000000002026', async () => {
    const payload = {
      branchId: 'c39a82e1-4567-4b12-8901-23456789abcd',
      academicYearId: '00000000-0000-0000-0000-000000002026',
      subjectId: 'c39a82e1-4567-4b12-8901-23456789abcd',
      teacherId: 'c39a82e1-4567-4b12-8901-23456789abcd',
      batchName: 'O/L ICT Theory Class',
      monthlyFee: 2000,
      hallNumber: 'Hall A',
      gradeLevelIds: ['c39a82e1-4567-4b12-8901-23456789abcd'],
    };

    const dto = plainToInstance(CreateBatchDto, payload);
    const errors = await validate(dto);

    console.log('DTO Validation Errors:', errors);
    expect(errors.length).toBe(0);
  });
});
