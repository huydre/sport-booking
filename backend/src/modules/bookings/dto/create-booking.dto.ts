import { IsString, IsDateString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingDto {
    @ApiProperty({ example: 'uuid-of-venue' })
    @IsUUID()
    venueId: string;

    @ApiProperty({ example: '2024-12-30T09:00:00Z' })
    @IsDateString()
    startTime: string;

    @ApiProperty({ example: '2024-12-30T11:00:00Z' })
    @IsDateString()
    endTime: string;

    @ApiPropertyOptional({ example: 'Đặt sân cho đội bóng công ty' })
    @IsOptional()
    @IsString()
    notes?: string;
}
