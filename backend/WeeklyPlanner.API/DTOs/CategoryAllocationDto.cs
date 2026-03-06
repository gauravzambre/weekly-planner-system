namespace WeeklyPlanner.API.DTOs
{
    public class CategoryAllocationDto
    {
        public int Id { get; set; }
        public int WeeklyPlanId { get; set; }
        public Guid CategoryId { get; set; }
        public int Percentage { get; set; }
    }
}