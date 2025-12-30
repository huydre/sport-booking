import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateVenueDto } from './create-venue.dto';
import { VenueStatus } from '../../../shared/enums';

export class UpdateVenueDto extends PartialType(CreateVenueDto) {
    @ApiPropertyOptional({ enum: VenueStatus })
    @IsOptional()
    @IsEnum(VenueStatus)
    status?: VenueStatus;
}
