namespace WeeklyPlanner.API.DTOs
{
    public class PlanTaskDto
    {
        public int Id { get; set; }
        public int WeeklyPlanId { get; set; }
        public int BacklogItemId { get; set; }
        public int TeamMemberId { get; set; }
        public int PlannedHours { get; set; }
        public int ActualHours { get; set; }
        public Guid? UserId { get; set; }
    }
}
