namespace WeeklyPlanner.API.DTOs
{
    public class WeeklyPlanDto
    {
        public int Id { get; set; }
        public DateTime StartDate { get; set; }
        public bool IsFrozen { get; set; }
    }
}
