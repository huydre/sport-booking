import {
    IsString,
    IsNumber,
    IsEnum,
    IsOptional,
    IsArray,
    Min,
    Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SportType } from '../../../shared/enums';

export class CreateVenueDto {
    @ApiProperty({ example: 'Sân Bóng Đá ABC' })
    @IsString()
    name: string;

    @ApiPropertyOptional({ example: 'Sân cỏ nhân tạo chất lượng cao' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ example: '123 Nguyễn Văn Linh, Quận 7, TP.HCM' })
    @IsString()
    address: string;

    @ApiProperty({ example: 10.7285 })
    @IsNumber()
    @Type(() => Number)
    latitude: number;

    @ApiProperty({ example: 106.7215 })
    @IsNumber()
    @Type(() => Number)
    longitude: number;

    @ApiProperty({ enum: SportType, example: SportType.FOOTBALL })
    @IsEnum(SportType)
    sportType: SportType;

    @ApiProperty({ example: 200000 })
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    pricePerHour: number;

    @ApiProperty({ example: '06:00' })
    @IsString()
    @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'Opening time must be in HH:mm format',
    })
    openingTime: string;

    @ApiProperty({ example: '22:00' })
    @IsString()
    @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'Closing time must be in HH:mm format',
    })
    closingTime: string;

    @ApiPropertyOptional({ type: [String], example: ['https://example.com/image1.jpg'] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images?: string[];

    @ApiPropertyOptional({ type: [String], example: ['Wifi', 'Parking', 'Shower'] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    amenities?: string[];
}
