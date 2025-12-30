# Software Requirements Specification (SRS)
## Hệ Thống Đặt Sân Thể Thao
---

## Mục Lục

1. [Giới Thiệu](#1-giới-thiệu)
2. [Mô Tả Tổng Quan](#2-mô-tả-tổng-quan)
3. [Yêu Cầu Chức Năng](#3-yêu-cầu-chức-năng)
4. [Yêu Cầu Phi Chức Năng](#4-yêu-cầu-phi-chức-năng)
5. [Giao Diện Hệ Thống](#5-giao-diện-hệ-thống)
6. [Phụ Lục](#6-phụ-lục)

---

## 1. Giới Thiệu

### 1.1 Mục Đích

Tài liệu này mô tả đầy đủ các yêu cầu chức năng và phi chức năng cho **Hệ Thống Đặt Sân Thể Thao** - một nền tảng cho phép người dùng tìm kiếm, đặt lịch và quản lý việc thuê sân thể thao trực tuyến.

### 1.2 Phạm Vi Dự Án

Hệ thống bao gồm:
- **Web Application**: Giao diện người dùng cuối (Customer Portal)
- **Admin Dashboard**: Quản lý sân, lịch đặt và người dùng
- **Owner Portal**: Giao diện cho chủ sân quản lý cơ sở
- **Notification Service**: Hệ thống thông báo real-time
- **Payment Gateway Integration**: Tích hợp thanh toán trực tuyến

### 1.3 Định Nghĩa và Thuật Ngữ

| Thuật ngữ | Định nghĩa |
|-----------|------------|
| **Customer** | Người dùng cuối sử dụng hệ thống để đặt sân |
| **Owner** | Chủ sân thể thao, quản lý cơ sở và lịch đặt |
| **Admin** | Quản trị viên hệ thống |
| **Venue** | Cơ sở thể thao (có thể có nhiều sân) |
| **Court/Field** | Sân thể thao đơn lẻ |
| **Booking** | Lịch đặt sân |
| **Recurring Booking** | Đặt sân cố định theo lịch lặp lại |
| **Walk-in Booking** | Đặt sân vãng lai (1 lần) |

---

## 2. Mô Tả Tổng Quan

### 2.1 Bối Cảnh Sản Phẩm

```
┌─────────────────────────────────────────────────────────────┐
│                    SPORT BOOKING SYSTEM                      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐ │
│  │ Customer │   │  Owner   │   │  Admin   │   │ External │ │
│  │  Portal  │   │  Portal  │   │Dashboard │   │ Services │ │
│  └────┬─────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘ │
│       │              │              │              │        │
│       └──────────────┴──────────────┴──────────────┘        │
│                          │                                   │
│              ┌───────────┴───────────┐                      │
│              │     API Gateway       │                      │
│              └───────────┬───────────┘                      │
│                          │                                   │
│  ┌────────────┬──────────┼──────────┬────────────┐         │
│  │            │          │          │            │         │
│  ▼            ▼          ▼          ▼            ▼         │
│ Auth      Booking     Payment   Notification   Report      │
│ Service   Service     Service     Service     Service      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Actors và Vai Trò

| Actor | Mô tả | Quyền hạn chính |
|-------|-------|-----------------|
| **Guest** | Người dùng chưa đăng nhập | Xem thông tin sân, tìm kiếm |
| **Customer** | Người dùng đã đăng ký | Đặt sân, thanh toán, quản lý lịch cá nhân |
| **Owner** | Chủ sân thể thao | Quản lý sân, xem thống kê, xuất báo cáo |
| **Admin** | Quản trị viên hệ thống | Quản lý toàn bộ hệ thống, người dùng, cấu hình |

### 2.3 Giả Định và Ràng Buộc

**Giả định:**
- Người dùng có kết nối internet ổn định
- Chủ sân cung cấp thông tin chính xác về cơ sở
- Hệ thống thanh toán bên thứ 3 hoạt động ổn định

**Ràng buộc:**
- Tuân thủ quy định bảo vệ dữ liệu cá nhân của Việt Nam
- Tích hợp với các cổng thanh toán được cấp phép tại Việt Nam
- Hỗ trợ tiếng Việt và tiếng Anh

---

## 3. Yêu Cầu Chức Năng

### 3.1 Module Xác Thực (Authentication)

#### FR-AUTH-001: Đăng Ký Tài Khoản

| Thuộc tính | Giá trị |
|------------|---------|
| **Độ ưu tiên** | Cao |
| **Actor** | Guest |

**Mô tả:** Người dùng có thể đăng ký tài khoản mới thông qua email hoặc tài khoản Google.

**Luồng chính (Email):**
1. Người dùng truy cập trang đăng ký
2. Nhập thông tin: Email, Mật khẩu, Họ tên, Số điện thoại
3. Hệ thống validate thông tin đầu vào
4. Hệ thống gửi mã OTP (6 số) qua email
5. Người dùng nhập mã OTP trong vòng 5 phút
6. Hệ thống xác thực và tạo tài khoản
7. Redirect về trang đăng nhập

**Luồng thay thế (Google OAuth):**
1. Người dùng click "Đăng nhập với Google"
2. Redirect đến Google OAuth consent screen
3. Người dùng xác nhận quyền truy cập
4. Hệ thống nhận thông tin từ Google
5. Tạo tài khoản hoặc liên kết với tài khoản hiện có

**Validation Rules:**
- Email: Format hợp lệ, chưa tồn tại trong hệ thống
- Mật khẩu: Tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường và số
- Số điện thoại: Format Việt Nam (10 số, bắt đầu bằng 0)

---

#### FR-AUTH-002: Đăng Nhập

| Thuộc tính | Giá trị |
|------------|---------|
| **Độ ưu tiên** | Cao |
| **Actor** | Guest |

**Mô tả:** Người dùng đăng nhập vào hệ thống để sử dụng các chức năng.

**Luồng chính:**
1. Người dùng nhập Email và Mật khẩu
2. Hệ thống xác thực thông tin
3. Hệ thống tạo JWT Token (Access Token + Refresh Token)
4. Redirect về trang chủ tương ứng với role

**Exception:**
- Sai mật khẩu 5 lần liên tiếp → Khóa tài khoản 15 phút
- Tài khoản chưa xác thực → Yêu cầu xác thực OTP

---

#### FR-AUTH-003: Quên Mật Khẩu

| Thuộc tính | Giá trị |
|------------|---------|
| **Độ ưu tiên** | Cao |
| **Actor** | Guest |

**Mô tả:** Người dùng có thể reset mật khẩu thông qua email.

**Luồng chính:**
1. Người dùng nhập email đã đăng ký
2. Hệ thống gửi link reset mật khẩu (có hiệu lực 30 phút)
3. Người dùng click link và nhập mật khẩu mới
4. Hệ thống cập nhật mật khẩu và invalidate tất cả session cũ

---

### 3.2 Module Quản Lý Sân (Venue Management)

#### FR-VENUE-001: Quản Lý Thông Tin Sân

| Thuộc tính | Giá trị |
|------------|---------|
| **Độ ưu tiên** | Cao |
| **Actor** | Owner, Admin |

**Mô tả:** Cho phép tạo, sửa, xóa và xem thông tin sân thể thao.

**Thông tin sân bao gồm:**

| Trường | Kiểu dữ liệu | Bắt buộc | Mô tả |
|--------|--------------|----------|-------|
| name | String(100) | ✓ | Tên sân |
| description | Text | ✗ | Mô tả chi tiết |
| address | String(500) | ✓ | Địa chỉ |
| latitude | Decimal | ✓ | Tọa độ GPS |
| longitude | Decimal | ✓ | Tọa độ GPS |
| sport_type | Enum | ✓ | Loại thể thao (Football, Badminton, Tennis, Basketball) |
| price_per_hour | Decimal | ✓ | Giá thuê/giờ |
| opening_time | Time | ✓ | Giờ mở cửa |
| closing_time | Time | ✓ | Giờ đóng cửa |
| images | Array[URL] | ✗ | Hình ảnh sân (tối đa 10) |
| amenities | Array[String] | ✗ | Tiện ích (Wifi, Parking, Shower...) |
| status | Enum | ✓ | Trạng thái (Active, Inactive, Maintenance) |

**Use Cases:**
- **UC-VENUE-001**: Tạo sân mới
- **UC-VENUE-002**: Cập nhật thông tin sân
- **UC-VENUE-003**: Xóa sân (soft delete)
- **UC-VENUE-004**: Xem danh sách sân (có phân trang, filter, sort)
- **UC-VENUE-005**: Xem chi tiết sân

---

#### FR-VENUE-002: Xem Lịch Sân

| Thuộc tính | Giá trị |
|------------|---------|
| **Độ ưu tiên** | Cao |
| **Actor** | Customer, Owner, Admin |

**Mô tả:** Hiển thị lịch trống/đã đặt của sân theo ngày/tuần/tháng.

**Màu sắc trạng thái:**
- 🟢 **Trống (Available)**: Có thể đặt
- 🔴 **Đã đặt (Booked)**: Không thể đặt
- 🟡 **Đang chờ (Pending)**: Đang chờ thanh toán
- ⚫ **Bảo trì (Maintenance)**: Tạm ngưng

---

### 3.3 Module Đặt Sân (Booking)

#### FR-BOOK-001: Đặt Sân Vãng Lai (Walk-in)

| Thuộc tính | Giá trị |
|------------|---------|
| **Độ ưu tiên** | Cao |
| **Actor** | Customer |

**Mô tả:** Khách hàng đặt sân cho một lần sử dụng.

**Luồng chính:**
1. Customer chọn sân và ngày giờ mong muốn
2. Hệ thống kiểm tra tính khả dụng
3. Customer xác nhận thông tin đặt sân
4. Hệ thống tạo booking với trạng thái "Pending"
5. Customer tiến hành thanh toán trong vòng 15 phút
6. Sau thanh toán thành công → Trạng thái "Confirmed"
7. Gửi email/notification xác nhận cho Customer và Owner

**Business Rules:**
- Đặt sân tối thiểu 1 giờ trước giờ chơi
- Slot time tối thiểu: 1 giờ, tối đa: 4 giờ liên tục
- Nếu không thanh toán trong 15 phút → Tự động hủy booking

---

#### FR-BOOK-002: Đặt Sân Cố Định (Recurring)

| Thuộc tính | Giá trị |
|------------|---------|
| **Độ ưu tiên** | Trung bình |
| **Actor** | Customer |

**Mô tả:** Khách hàng đặt sân theo lịch lặp lại (hàng tuần).

**Thông tin đặt cố định:**

| Trường | Mô tả |
|--------|-------|
| start_date | Ngày bắt đầu |
| end_date | Ngày kết thúc (tối đa 3 tháng) |
| day_of_week | Thứ trong tuần (có thể chọn nhiều) |
| time_slot | Khung giờ |
| recurrence_type | Weekly |

**Business Rules:**
- Đặt cố định tối thiểu 4 tuần, tối đa 12 tuần
- Thanh toán trước toàn bộ hoặc thanh toán từng đợt (4 tuần/lần)
- Được ưu đãi 10% so với đặt vãng lai

---

#### FR-BOOK-003: Hủy Đặt Sân

| Thuộc tính | Giá trị |
|------------|---------|
| **Độ ưu tiên** | Cao |
| **Actor** | Customer, Owner, Admin |

**Mô tả:** Cho phép hủy lịch đặt sân đã xác nhận.

**Chính sách hoàn tiền:**

| Thời điểm hủy | Tỷ lệ hoàn tiền |
|---------------|-----------------|
| > 24 giờ trước giờ chơi | 100% |
| 12-24 giờ trước giờ chơi | 50% |
| < 12 giờ trước giờ chơi | 0% |

**Exception:**
- Owner hủy → Hoàn 100% + Voucher bù 10%
- Force majeure (thiên tai, dịch bệnh) → Hoàn 100%

---

### 3.4 Module Thanh Toán (Payment)

#### FR-PAY-001: Thanh Toán Online

| Thuộc tính | Giá trị |
|------------|---------|
| **Độ ưu tiên** | Cao |
| **Actor** | Customer |

**Mô tả:** Tích hợp thanh toán trực tuyến qua các cổng thanh toán.

**Phương thức thanh toán hỗ trợ:**
- VNPay
- Momo
- ZaloPay
- Chuyển khoản ngân hàng (QR Code)

**Luồng thanh toán:**
1. Customer chọn phương thức thanh toán
2. Redirect đến trang thanh toán của Payment Gateway
3. Customer hoàn tất thanh toán
4. Payment Gateway callback về hệ thống
5. Hệ thống xác nhận và cập nhật trạng thái booking
6. Gửi hóa đơn điện tử qua email

---

### 3.5 Module Thông Báo (Notification)

#### FR-NOTI-001: Hệ Thống Thông Báo

| Thuộc tính | Giá trị |
|------------|---------|
| **Độ ưu tiên** | Trung bình |
| **Actor** | Tất cả users |

**Mô tả:** Gửi thông báo real-time và push notification.

**Events trigger notification:**

| Event | Người nhận | Channel |
|-------|------------|---------|
| Đặt sân thành công | Customer, Owner | Email, Push, In-app |
| Thanh toán thành công | Customer | Email, In-app |
| Hủy booking | Customer, Owner | Email, Push, In-app |
| Reminder trước giờ chơi (2h) | Customer | Push |
| Owner xác nhận/từ chối | Customer | Email, Push, In-app |

---

### 3.6 Module Báo Cáo & Thống Kê (Reporting)

#### FR-REPORT-001: Dashboard Thống Kê

| Thuộc tính | Giá trị |
|------------|---------|
| **Độ ưu tiên** | Trung bình |
| **Actor** | Owner, Admin |

**Metrics hiển thị:**
- Tổng doanh thu (theo ngày/tuần/tháng/năm)
- Số lượng booking (confirmed/cancelled/pending)
- Tỷ lệ sử dụng sân (occupancy rate)
- Top customers
- Peak hours

---

#### FR-REPORT-002: Xuất Báo Cáo

| Thuộc tính | Giá trị |
|------------|---------|
| **Độ ưu tiên** | Thấp |
| **Actor** | Owner, Admin |

**Mô tả:** Xuất báo cáo lịch đặt sân theo các định dạng.

**Format hỗ trợ:**
- Excel (.xlsx)
- PDF
- CSV

**Nội dung báo cáo:**
- Danh sách booking theo khoảng thời gian
- Thống kê doanh thu
- Tỷ lệ hủy booking

---

### 3.7 Module Quản Lý Người Dùng (User Management)

#### FR-USER-001: Quản Lý Tài Khoản

| Thuộc tính | Giá trị |
|------------|---------|
| **Độ ưu tiên** | Cao |
| **Actor** | Admin |

**Mô tả:** Quản lý toàn bộ tài khoản người dùng trong hệ thống.

**Chức năng:**
- Xem danh sách người dùng (phân trang, tìm kiếm, filter theo role)
- Xem chi tiết thông tin người dùng
- Cập nhật thông tin người dùng
- Kích hoạt/Vô hiệu hóa tài khoản
- Reset mật khẩu cho người dùng
- Phân quyền (assign role)

---

### 3.8 Module Quản Lý Hệ Thống (System Management)

#### FR-SYS-001: Cấu Hình Hệ Thống

| Thuộc tính | Giá trị |
|------------|---------|
| **Độ ưu tiên** | Thấp |
| **Actor** | Admin |

**Mô tả:** Quản lý các cấu hình toàn cục của hệ thống.

**Cấu hình bao gồm:**
- Thời gian timeout thanh toán
- Chính sách hoàn tiền
- Email templates
- Notification settings
- Maintenance mode

---

#### FR-SYS-002: Audit Log

| Thuộc tính | Giá trị |
|------------|---------|
| **Độ ưu tiên** | Trung bình |
| **Actor** | Admin |

**Mô tả:** Ghi lại toàn bộ hoạt động quan trọng trong hệ thống.

**Events được log:**
- Đăng nhập/Đăng xuất
- Tạo/Sửa/Xóa dữ liệu
- Thay đổi cấu hình
- Các thao tác nhạy cảm

**Thông tin log:**

| Trường | Mô tả |
|--------|-------|
| timestamp | Thời gian thực hiện |
| user_id | ID người thực hiện |
| action | Hành động |
| resource | Tài nguyên bị tác động |
| old_value | Giá trị trước |
| new_value | Giá trị sau |
| ip_address | IP address |
| user_agent | Browser/Device info |

---

## 4. Yêu Cầu Phi Chức Năng

### 4.1 Hiệu Năng (Performance)

| ID | Yêu cầu | Mục tiêu |
|----|---------|----------|
| NFR-PERF-001 | Response time API | < 500ms (P95) |
| NFR-PERF-002 | Page load time | < 2 giây |
| NFR-PERF-003 | Concurrent users | 1000 users đồng thời |
| NFR-PERF-004 | Database query time | < 100ms |
| NFR-PERF-005 | Uptime SLA | 99.5% |

### 4.2 Bảo Mật (Security)

| ID | Yêu cầu | Chi tiết |
|----|---------|----------|
| NFR-SEC-001 | Authentication | JWT với Refresh Token rotation |
| NFR-SEC-002 | Authorization | Role-Based Access Control (RBAC) |
| NFR-SEC-003 | Data encryption | TLS 1.3 cho transmission, AES-256 cho data at rest |
| NFR-SEC-004 | Input validation | Chống XSS, SQL Injection, CSRF |
| NFR-SEC-005 | Password policy | Bcrypt hashing, salt rounds: 12 |
| NFR-SEC-006 | Rate limiting | 100 requests/minute/IP |
| NFR-SEC-007 | Audit logging | Log tất cả sensitive operations |

### 4.3 Khả Năng Mở Rộng (Scalability)

| ID | Yêu cầu |
|----|---------|
| NFR-SCALE-001 | Horizontal scaling với container orchestration (Kubernetes) |
| NFR-SCALE-002 | Database sharding ready |
| NFR-SCALE-003 | Microservices architecture |
| NFR-SCALE-004 | CDN cho static assets |

### 4.4 Khả Năng Bảo Trì (Maintainability)

| ID | Yêu cầu |
|----|---------|
| NFR-MAIN-001 | Code coverage > 80% |
| NFR-MAIN-002 | Comprehensive API documentation (OpenAPI 3.0) |
| NFR-MAIN-003 | Coding standards enforcement (ESLint, Prettier) |
| NFR-MAIN-004 | Git branching strategy (GitFlow) |
| NFR-MAIN-005 | CI/CD pipeline với automated testing |

### 4.5 Triển Khai (Deployment)

| ID | Yêu cầu |
|----|---------|
| NFR-DEPLOY-001 | Containerization với Docker |
| NFR-DEPLOY-002 | Orchestration với Kubernetes |
| NFR-DEPLOY-003 | Infrastructure as Code (Terraform/Helm) |
| NFR-DEPLOY-004 | Zero-downtime deployment |
| NFR-DEPLOY-005 | Environment separation (Dev/Staging/Production) |

---

## 5. Giao Diện Hệ Thống

### 5.1 Giao Diện Người Dùng (UI)

- **Responsive Design**: Hỗ trợ Desktop, Tablet, Mobile
- **Browser Support**: Chrome, Firefox, Safari, Edge (2 phiên bản gần nhất)
- **Accessibility**: WCAG 2.1 Level AA compliance

### 5.2 API Interface

- **Protocol**: RESTful API over HTTPS
- **Format**: JSON
- **Versioning**: URL-based (v1, v2)
- **Documentation**: Swagger/OpenAPI 3.0

### 5.3 Tích Hợp Bên Thứ 3

| Service | Mục đích |
|---------|----------|
| Google OAuth | Social login |
| VNPay/Momo/ZaloPay | Payment gateway |
| Firebase Cloud Messaging | Push notification |
| SendGrid/SES | Email service |
| Google Maps API | Location services |
| Cloudinary/S3 | Image storage |

---

## 6. Phụ Lục

### 6.1 Use Case Diagram

```
                    ┌─────────────────────────────────────────┐
                    │           SPORT BOOKING SYSTEM           │
                    └─────────────────────────────────────────┘
                                        │
        ┌───────────────────────────────┼───────────────────────────────┐
        │                               │                               │
        ▼                               ▼                               ▼
   ┌─────────┐                    ┌─────────┐                     ┌─────────┐
   │  Guest  │                    │Customer │                     │  Owner  │
   └────┬────┘                    └────┬────┘                     └────┬────┘
        │                              │                               │
        ├── Search Venues              ├── All Guest actions           ├── Manage Venues
        ├── View Venue Details         ├── Book Court                  ├── View Calendar
        ├── View Availability          ├── Manage Bookings             ├── Manage Bookings
        └── Register/Login             ├── Make Payment                ├── View Statistics
                                       ├── View History                ├── Export Reports
                                       └── Receive Notifications       └── Receive Notifications
                                       
                    ┌─────────┐
                    │  Admin  │
                    └────┬────┘
                         │
                         ├── All Owner actions
                         ├── Manage Users
                         ├── Manage System Config
                         ├── View Audit Logs
                         └── Generate Reports
```

### 6.2 Entity Relationship Diagram (Simplified)

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│     USER     │       │    VENUE     │       │   BOOKING    │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id           │       │ id           │       │ id           │
│ email        │       │ owner_id(FK) │◄──────│ venue_id(FK) │
│ password     │       │ name         │       │ user_id(FK)  │
│ name         │       │ sport_type   │       │ start_time   │
│ phone        │       │ price        │       │ end_time     │
│ role         │       │ status       │       │ status       │
│ status       │       │ ...          │       │ total_amount │
└──────┬───────┘       └──────────────┘       └──────┬───────┘
       │                                              │
       │ 1:N                                          │ 1:1
       │                                              ▼
       │                                       ┌──────────────┐
       └──────────────────────────────────────►│   PAYMENT    │
                                               ├──────────────┤
                                               │ id           │
                                               │ booking_id   │
                                               │ amount       │
                                               │ method       │
                                               │ status       │
                                               └──────────────┘
```

### 6.3 Trạng Thái Booking (State Diagram)

```
                    ┌─────────┐
                    │  START  │
                    └────┬────┘
                         │ create booking
                         ▼
                    ┌─────────┐
              ┌─────│ PENDING │─────┐
              │     └────┬────┘     │
    timeout   │          │          │ cancel
    (15 min)  │          │ payment  │
              │          │ success  │
              ▼          ▼          ▼
        ┌─────────┐ ┌─────────┐ ┌─────────┐
        │CANCELLED│ │CONFIRMED│ │CANCELLED│
        └─────────┘ └────┬────┘ └─────────┘
                         │
            ┌────────────┼────────────┐
            │            │            │
     cancel │   complete │     │no-show│
            ▼            ▼            ▼
      ┌─────────┐  ┌─────────┐  ┌─────────┐
      │CANCELLED│  │COMPLETED│  │ NO_SHOW │
      └─────────┘  └─────────┘  └─────────┘
```

---

> **Ghi chú**: Tài liệu này là living document và sẽ được cập nhật trong suốt quá trình phát triển dự án.