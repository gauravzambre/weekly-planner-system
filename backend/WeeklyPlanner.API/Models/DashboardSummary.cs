namespace WeeklyPlanner.API.Models
{
    public class DashboardSummary
    {
        public int TotalTasks { get; set; }

        public int CompletedTasks { get; set; }

        public int InProgressTasks { get; set; }

        public int PendingTasks { get; set; }

        public int OverallProgress { get; set; }
    }
}