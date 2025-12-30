export enum Role {
    CUSTOMER = 'CUSTOMER',
    OWNER = 'OWNER',
    ADMIN = 'ADMIN',
}

export enum BookingStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED',
    COMPLETED = 'COMPLETED',
    NO_SHOW = 'NO_SHOW',
}

export enum PaymentStatus {
    PENDING = 'PENDING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED',
}

export enum SportType {
    FOOTBALL = 'FOOTBALL',
    BADMINTON = 'BADMINTON',
    TENNIS = 'TENNIS',
    BASKETBALL = 'BASKETBALL',
    VOLLEYBALL = 'VOLLEYBALL',
    SWIMMING = 'SWIMMING',
    OTHER = 'OTHER',
}

export enum VenueStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    MAINTENANCE = 'MAINTENANCE',
}
