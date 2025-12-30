export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
};

export const BOOKING = {
    MIN_BOOKING_HOURS_AHEAD: 1, // Đặt sân tối thiểu 1 giờ trước
    MIN_DURATION_HOURS: 1, // Thời gian thuê tối thiểu 1 giờ
    MAX_DURATION_HOURS: 4, // Thời gian thuê tối đa 4 giờ
    PAYMENT_TIMEOUT_MINUTES: 15, // Thời gian thanh toán
    RECURRING_MIN_WEEKS: 4, // Đặt cố định tối thiểu 4 tuần
    RECURRING_MAX_WEEKS: 12, // Đặt cố định tối đa 12 tuần
    RECURRING_DISCOUNT_PERCENT: 10, // Giảm giá đặt cố định
};

export const REFUND_POLICY = {
    FULL_REFUND_HOURS: 24, // Hoàn 100% nếu hủy trước 24h
    PARTIAL_REFUND_HOURS: 12, // Hoàn 50% nếu hủy trước 12h
    PARTIAL_REFUND_PERCENT: 50,
};

export const AUTH = {
    OTP_LENGTH: 6,
    OTP_EXPIRATION_MINUTES: 5,
    RESET_TOKEN_EXPIRATION_MINUTES: 30,
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION_MINUTES: 15,
    BCRYPT_SALT_ROUNDS: 12,
};

export const CACHE_KEYS = {
    VENUES: 'venues',
    VENUE_DETAIL: 'venue:',
    USER_BOOKINGS: 'user:bookings:',
    VENUE_SCHEDULE: 'venue:schedule:',
};

export const CACHE_TTL = {
    SHORT: 60, // 1 minute
    MEDIUM: 300, // 5 minutes
    LONG: 3600, // 1 hour
    DAY: 86400, // 24 hours
};
