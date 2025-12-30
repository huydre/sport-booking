import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { VenuesService } from './venues.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { QueryVenueDto } from './dto/query-venue.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, CurrentUser, Public } from '../../common/decorators';
import { Role } from '../../shared/enums';

@ApiTags('Venues')
@Controller('venues')
export class VenuesController {
    constructor(private readonly venuesService: VenuesService) { }

    @Public()
    @Get()
    @ApiOperation({ summary: 'Get all venues (public)' })
    async findAll(@Query() query: QueryVenueDto) {
        return this.venuesService.findAll(query);
    }

    @Public()
    @Get(':id')
    @ApiOperation({ summary: 'Get venue by ID (public)' })
    async findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.venuesService.findById(id);
    }

    @Public()
    @Get(':id/schedule')
    @ApiOperation({ summary: 'Get venue schedule for a date (public)' })
    @ApiQuery({ name: 'date', required: true, type: String, example: '2024-12-30' })
    async getSchedule(
        @Param('id', ParseUUIDPipe) id: string,
        @Query('date') date: string,
    ) {
        return this.venuesService.getSchedule(id, new Date(date));
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.OWNER, Role.ADMIN)
    @Post()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create new venue (Owner/Admin only)' })
    async create(
        @CurrentUser('id') userId: string,
        @Body() createVenueDto: CreateVenueDto,
    ) {
        return this.venuesService.create(userId, createVenueDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.OWNER, Role.ADMIN)
    @Get('owner/my-venues')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get my venues (Owner only)' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async getMyVenues(
        @CurrentUser('id') userId: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.venuesService.findByOwner(userId, page, limit);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.OWNER, Role.ADMIN)
    @Patch(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update venue (Owner/Admin only)' })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: any,
        @Body() updateVenueDto: UpdateVenueDto,
    ) {
        return this.venuesService.update(id, user.id, user.role, updateVenueDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.OWNER, Role.ADMIN)
    @Delete(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete venue (Owner/Admin only)' })
    async delete(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: any,
    ) {
        return this.venuesService.delete(id, user.id, user.role);
    }
}
