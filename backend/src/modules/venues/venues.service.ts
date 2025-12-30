import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { QueryVenueDto } from './dto/query-venue.dto';
import { PAGINATION } from '../../shared/constants';
import { Role } from '../../shared/enums';

@Injectable()
export class VenuesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(ownerId: string, createVenueDto: CreateVenueDto) {
        return this.prisma.venue.create({
            data: {
                ...createVenueDto,
                ownerId,
            },
        });
    }

    async findAll(query: QueryVenueDto) {
        const {
            page = PAGINATION.DEFAULT_PAGE,
            limit = PAGINATION.DEFAULT_LIMIT,
            sportType,
            minPrice,
            maxPrice,
            search,
            latitude,
            longitude,
            radius,
        } = query;

        const skip = (page - 1) * limit;

        const where: any = {
            status: 'ACTIVE',
        };

        if (sportType) {
            where.sportType = sportType;
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            where.pricePerHour = {};
            if (minPrice !== undefined) where.pricePerHour.gte = minPrice;
            if (maxPrice !== undefined) where.pricePerHour.lte = maxPrice;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { address: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [venues, total] = await Promise.all([
            this.prisma.venue.findMany({
                where,
                skip,
                take: limit,
                include: {
                    owner: {
                        select: {
                            id: true,
                            name: true,
                            phone: true,
                        },
                    },
                    _count: {
                        select: { bookings: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.venue.count({ where }),
        ]);

        return {
            data: venues,
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
        const venue = await this.prisma.venue.findUnique({
            where: { id },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        email: true,
                    },
                },
            },
        });

        if (!venue) {
            throw new NotFoundException('Venue not found');
        }

        return venue;
    }

    async findByOwner(ownerId: string, page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const [venues, total] = await Promise.all([
            this.prisma.venue.findMany({
                where: { ownerId },
                skip,
                take: limit,
                include: {
                    _count: {
                        select: { bookings: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.venue.count({ where: { ownerId } }),
        ]);

        return {
            data: venues,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async update(
        id: string,
        userId: string,
        userRole: Role,
        updateVenueDto: UpdateVenueDto,
    ) {
        const venue = await this.findById(id);

        // Check ownership or admin
        if (venue.ownerId !== userId && userRole !== Role.ADMIN) {
            throw new ForbiddenException('You do not have permission to update this venue');
        }

        return this.prisma.venue.update({
            where: { id },
            data: updateVenueDto,
        });
    }

    async delete(id: string, userId: string, userRole: Role) {
        const venue = await this.findById(id);

        // Check ownership or admin
        if (venue.ownerId !== userId && userRole !== Role.ADMIN) {
            throw new ForbiddenException('You do not have permission to delete this venue');
        }

        // Soft delete by setting status to INACTIVE
        await this.prisma.venue.update({
            where: { id },
            data: { status: 'INACTIVE' },
        });

        return { message: 'Venue deleted successfully' };
    }

    async getSchedule(venueId: string, date: Date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const venue = await this.findById(venueId);

        const bookings = await this.prisma.booking.findMany({
            where: {
                venueId,
                startTime: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                status: {
                    in: ['PENDING', 'CONFIRMED'],
                },
            },
            select: {
                id: true,
                startTime: true,
                endTime: true,
                status: true,
            },
            orderBy: { startTime: 'asc' },
        });

        return {
            venue: {
                id: venue.id,
                name: venue.name,
                openingTime: venue.openingTime,
                closingTime: venue.closingTime,
            },
            date: date.toISOString().split('T')[0],
            bookings,
        };
    }
}
