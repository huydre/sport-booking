import {
    Controller,
    Get,
    Patch,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
    ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, CurrentUser } from '../../common/decorators';
import { Role } from '../../shared/enums';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Get all users (Admin only)' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async findAll(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.usersService.findAll(page, limit);
    }

    @Get('me')
    @ApiOperation({ summary: 'Get current user profile' })
    async getMe(@CurrentUser('id') userId: string) {
        return this.usersService.findById(userId);
    }

    @Get('me/bookings')
    @ApiOperation({ summary: 'Get current user bookings' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async getMyBookings(
        @CurrentUser('id') userId: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.usersService.getUserBookings(userId, page, limit);
    }

    @Get(':id')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Get user by ID (Admin only)' })
    async findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.usersService.findById(id);
    }

    @Patch('me')
    @ApiOperation({ summary: 'Update current user profile' })
    async updateMe(
        @CurrentUser('id') userId: string,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        return this.usersService.update(userId, updateUserDto);
    }

    @Patch(':id')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Update user by ID (Admin only)' })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        return this.usersService.update(id, updateUserDto);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Deactivate user (Admin only)' })
    async deactivate(@Param('id', ParseUUIDPipe) id: string) {
        return this.usersService.deactivate(id);
    }

    @Patch(':id/activate')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Activate user (Admin only)' })
    async activate(@Param('id', ParseUUIDPipe) id: string) {
        return this.usersService.activate(id);
    }
}
