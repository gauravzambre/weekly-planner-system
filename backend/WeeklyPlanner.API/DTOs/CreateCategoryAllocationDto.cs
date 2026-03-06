using System.ComponentModel.DataAnnotations;

namespace WeeklyPlanner.API.DTOs
{
    public class CreateCategoryAllocationDto
    {
        [Required]
        public int WeeklyPlanId { get; set; }
        [Required]
        public Guid CategoryId { get; set; }
        [Range(0,100)]
        public int Percentage { get; set; }
    }
}