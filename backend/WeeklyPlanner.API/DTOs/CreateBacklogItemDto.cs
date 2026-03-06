using System.ComponentModel.DataAnnotations;

namespace WeeklyPlanner.API.DTOs
{
    public class CreateBacklogItemDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public Guid CategoryId { get; set; }

        [Range(0, int.MaxValue)]
        public int EstimatedHours { get; set; }
    }
}