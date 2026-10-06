namespace VehicleServiceAPI.DTOs
{
    public class DashboardStatsDto
    {
        public int TotalUsers { get; set; }
        public int TotalVehicles { get; set; }
        public int TotalServices { get; set; }
        public int TotalTechnicians { get; set; }
        public int TotalBookings { get; set; }
        public int PendingBookings { get; set; }
        public int ConfirmedBookings { get; set; }
        public int InProgressBookings { get; set; }
        public int CompletedBookings { get; set; }
        public int CancelledBookings { get; set; }
        public decimal TotalRevenue { get; set; }
        public List<MonthlyBookingDto> MonthlyBookings { get; set; } = new();
        public List<RecentBookingDto> RecentBookings { get; set; } = new();
    }

    public class MonthlyBookingDto
    {
        public string Month { get; set; }
        public int Count { get; set; }
        public decimal Revenue { get; set; }
    }

    public class RecentBookingDto
    {
        public int Id { get; set; }
        public string CustomerName { get; set; }
        public string VehicleName { get; set; }
        public string ServiceName { get; set; }
        public string Status { get; set; }
        public DateTime ScheduledDate { get; set; }
    }

    public class AuditLogDto
    {
        public int Id { get; set; }
        public string TableName { get; set; }
        public int RecordId { get; set; }
        public string Action { get; set; }
        public string ChangedBy { get; set; }
        public string OldValues { get; set; }
        public string NewValues { get; set; }
        public DateTime ChangedAt { get; set; }
    }
}
