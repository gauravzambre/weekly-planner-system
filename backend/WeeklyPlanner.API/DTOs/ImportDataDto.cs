using System.Collections.Generic;
namespace WeeklyPlanner.API.DTOs
{
    public class ImportDataDto
    {
        public List<BacklogItemDto> Backlog { get; set; } = new();
        public List<CategoryResponseDto> Categories { get; set; } = new();
        public List<UserDTO> Users { get; set; } = new();
        public List<TeamMemberDto> TeamMembers { get; set; } = new();
        public List<WeeklyPlanDto> WeeklyPlans { get; set; } = new();
        public List<PlanTaskDto> PlanTasks { get; set; } = new();
        public List<CategoryAllocationDto> CategoryAllocations { get; set; } = new();
    }
}
