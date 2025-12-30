import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, CurrentUser } from '../../common/decorators';
import { Role, BookingStatus } from '../../shared/enums';

@ApiTags('Bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingsController {
    constructor(private readonly bookingsService: BookingsService) { }

    @Post()
    @ApiOperation({ summary: 'Create new booking' })
    async create(
        @CurrentUser('id') userId: string,
        @Body() createBookingDto: CreateBookingDto,
    ) {
        return this.bookingsService.create(userId, createBookingDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get user bookings' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'status', required: false, enum: BookingStatus })
    async findAll(
        @CurrentUser() user: any,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('status') status?: BookingStatus,
    ) {
        return this.bookingsService.findAll(user.id, user.role, page, limit, status);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get booking by ID' })
    async findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.bookingsService.findById(id);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Cancel booking' })
    async cancel(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser() user: any,
    ) {
        return this.bookingsService.cancel(id, user.id, user.role);
    }

    @UseGuards(RolesGuard)
    @Roles(Role.OWNER, Role.ADMIN)
    @Get('venue/:venueId')
    @ApiOperation({ summary: 'Get bookings for a venue (Owner only)' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async getVenueBookings(
        @Param('venueId', ParseUUIDPipe) venueId: string,
        @CurrentUser('id') userId: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.bookingsService.getVenueBookings(venueId, userId, page, limit);
    }
}
