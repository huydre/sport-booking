import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { VenuesService } from '../venues/venues.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BOOKING, REFUND_POLICY, PAGINATION } from '../../shared/constants';
import { BookingStatus, Role } from '../../shared/enums';

@Injectable()
export class BookingsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly venuesService: VenuesService,
    ) { }

    async create(userId: string, createBookingDto: CreateBookingDto) {
        const { venueId, startTime, endTime, notes } = createBookingDto;

        // Validate venue exists
        const venue = await this.venuesService.findById(venueId);

        const start = new Date(startTime);
        const end = new Date(endTime);

        // Validate booking time
        this.validateBookingTime(start, end);

        // Check availability
        const isAvailable = await this.checkAvailability(venueId, start, end);
        if (!isAvailable) {
            throw new BadRequestException('This time slot is not available');
        }

        // Calculate total amount
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        const totalAmount = Number(venue.pricePerHour) * hours;

        // Create booking
        const booking = await this.prisma.booking.create({
            data: {
                userId,
                venueId,
                startTime: start,
                endTime: end,
                totalAmount,
                notes,
                status: BookingStatus.PENDING,
            },
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
        });

        // TODO: Schedule auto-cancel after PAYMENT_TIMEOUT_MINUTES
        // TODO: Send notification to owner

        return {
            ...booking,
            paymentTimeout: BOOKING.PAYMENT_TIMEOUT_MINUTES,
            message: `Please complete payment within ${BOOKING.PAYMENT_TIMEOUT_MINUTES} minutes`,
        };
    }

    async findAll(
        userId: string,
        userRole: Role,
        page = PAGINATION.DEFAULT_PAGE,
        limit = PAGINATION.DEFAULT_LIMIT,
        status?: BookingStatus,
    ) {
        const skip = (page - 1) * limit;

        const where: any = {};

        // Filter by user unless admin
        if (userRole !== Role.ADMIN) {
            where.userId = userId;
        }

        if (status) {
            where.status = status;
        }

        const [bookings, total] = await Promise.all([
            this.prisma.booking.findMany({
                where,
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
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                        },
                    },
                    payment: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.booking.count({ where }),
        ]);

        return {
            data: bookings,
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
        const booking = await this.prisma.booking.findUnique({
            where: { id },
            include: {
                venue: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                payment: true,
            },
        });

        if (!booking) {
            throw new NotFoundException('Booking not found');
        }

        return booking;
    }

    async cancel(id: string, userId: string, userRole: Role) {
        const booking = await this.findById(id);

        // Check ownership or admin/owner
        if (
            booking.userId !== userId &&
            booking.venue.ownerId !== userId &&
            userRole !== Role.ADMIN
        ) {
            throw new ForbiddenException('You do not have permission to cancel this booking');
        }

        if (booking.status === BookingStatus.CANCELLED) {
            throw new BadRequestException('Booking is already cancelled');
        }

        if (booking.status === BookingStatus.COMPLETED) {
            throw new BadRequestException('Cannot cancel a completed booking');
        }

        // Calculate refund amount based on policy
        const hoursUntilBooking =
            (booking.startTime.getTime() - Date.now()) / (1000 * 60 * 60);

        let refundPercent = 0;
        if (hoursUntilBooking >= REFUND_POLICY.FULL_REFUND_HOURS) {
            refundPercent = 100;
        } else if (hoursUntilBooking >= REFUND_POLICY.PARTIAL_REFUND_HOURS) {
            refundPercent = REFUND_POLICY.PARTIAL_REFUND_PERCENT;
        }

        const refundAmount =
            (Number(booking.totalAmount) * refundPercent) / 100;

        // Update booking status
        await this.prisma.booking.update({
            where: { id },
            data: { status: BookingStatus.CANCELLED },
        });

        // TODO: Process refund if payment was made
        // TODO: Send cancellation notification

        return {
            message: 'Booking cancelled successfully',
            refundPercent,
            refundAmount,
        };
    }

    async confirmPayment(bookingId: string, paymentData: any) {
        const booking = await this.findById(bookingId);

        if (booking.status !== BookingStatus.PENDING) {
            throw new BadRequestException('Booking is not in pending status');
        }

        // Create payment record
        await this.prisma.payment.create({
            data: {
                bookingId,
                amount: booking.totalAmount,
                method: paymentData.method,
                transactionId: paymentData.transactionId,
                status: 'SUCCESS',
                paidAt: new Date(),
            },
        });

        // Update booking status
        await this.prisma.booking.update({
            where: { id: bookingId },
            data: { status: BookingStatus.CONFIRMED },
        });

        // TODO: Send confirmation notification

        return { message: 'Payment confirmed, booking is now active' };
    }

    async getVenueBookings(
        venueId: string,
        ownerId: string,
        page = 1,
        limit = 10,
    ) {
        const venue = await this.venuesService.findById(venueId);

        if (venue.ownerId !== ownerId) {
            throw new ForbiddenException('You do not own this venue');
        }

        const skip = (page - 1) * limit;

        const [bookings, total] = await Promise.all([
            this.prisma.booking.findMany({
                where: { venueId },
                skip,
                take: limit,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                        },
                    },
                    payment: true,
                },
                orderBy: { startTime: 'desc' },
            }),
            this.prisma.booking.count({ where: { venueId } }),
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

    private validateBookingTime(start: Date, end: Date) {
        const now = new Date();
        const minBookingTime = new Date(
            now.getTime() + BOOKING.MIN_BOOKING_HOURS_AHEAD * 60 * 60 * 1000,
        );

        if (start < minBookingTime) {
            throw new BadRequestException(
                `Booking must be at least ${BOOKING.MIN_BOOKING_HOURS_AHEAD} hour(s) in advance`,
            );
        }

        if (end <= start) {
            throw new BadRequestException('End time must be after start time');
        }

        const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

        if (durationHours < BOOKING.MIN_DURATION_HOURS) {
            throw new BadRequestException(
                `Minimum booking duration is ${BOOKING.MIN_DURATION_HOURS} hour(s)`,
            );
        }

        if (durationHours > BOOKING.MAX_DURATION_HOURS) {
            throw new BadRequestException(
                `Maximum booking duration is ${BOOKING.MAX_DURATION_HOURS} hours`,
            );
        }
    }

    private async checkAvailability(
        venueId: string,
        start: Date,
        end: Date,
    ): Promise<boolean> {
        const conflictingBooking = await this.prisma.booking.findFirst({
            where: {
                venueId,
                status: {
                    in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
                },
                OR: [
                    {
                        AND: [
                            { startTime: { lte: start } },
                            { endTime: { gt: start } },
                        ],
                    },
                    {
                        AND: [
                            { startTime: { lt: end } },
                            { endTime: { gte: end } },
                        ],
                    },
                    {
                        AND: [
                            { startTime: { gte: start } },
                            { endTime: { lte: end } },
                        ],
                    },
                ],
            },
        });

        return !conflictingBooking;
    }
}
