import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { PAGINATION } from '../../shared/constants';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT) {
        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                skip,
                take: limit,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    phone: true,
                    avatar: true,
                    role: true,
                    isVerified: true,
                    isActive: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count(),
        ]);

        return {
            data: users,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1,
            },
        };
    }

    async findById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                avatar: true,
                role: true,
                isVerified: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        bookings: true,
                        venues: true,
                    },
                },
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        const user = await this.findById(id);

        return this.prisma.user.update({
            where: { id: user.id },
            data: updateUserDto,
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                avatar: true,
                role: true,
            },
        });
    }

    async deactivate(id: string) {
        const user = await this.findById(id);

        await this.prisma.user.update({
            where: { id: user.id },
            data: { isActive: false },
        });

        return { message: 'User deactivated successfully' };
    }

    async activate(id: string) {
        const user = await this.findById(id);

        await this.prisma.user.update({
            where: { id: user.id },
            data: { isActive: true },
        });

        return { message: 'User activated successfully' };
    }

    async getUserBookings(userId: string, page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const [bookings, total] = await Promise.all([
            this.prisma.booking.findMany({
                where: { userId },
                skip,
                take: limit,
                include: {
                    venue: {
                        select: {
                            id: true,
                            name: true,
                            address: true,
                            sportType: true,
                        },
                    },
                },
                orderBy: { startTime: 'desc' },
            }),
            this.prisma.booking.count({ where: { userId } }),
        ]);

        return {
            data: bookings,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}
