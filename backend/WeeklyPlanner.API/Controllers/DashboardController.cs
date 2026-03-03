using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WeeklyPlanner.API.Data;
using WeeklyPlanner.API.Models;

namespace WeeklyPlanner.API.Controllers;

[ApiController]
[Route("api/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DashboardController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("team-progress")]
    public async Task<IActionResult> TeamProgress([FromQuery] int? planId)
    {
        IQueryable<PlanTask> query = _context.PlanTasks;
        if (planId.HasValue)
            query = query.Where(t => t.WeeklyPlanId == planId.Value);

        var totalPlanned = await query.SumAsync(t => t.PlannedHours);
        var totalActual = await query.SumAsync(t => t.ActualHours);

        return Ok(new
        {
            TotalPlanned = totalPlanned,
            TotalActual = totalActual,
            CompletionPercentage = totalPlanned == 0 ? 0 :
                (double)totalActual / totalPlanned * 100
        });
    }

    [HttpGet("member-progress/{memberId}")]
    public async Task<IActionResult> MemberProgress(int memberId, [FromQuery] int? planId)
    {
        IQueryable<PlanTask> query = _context.PlanTasks.Where(t => t.TeamMemberId == memberId);
        if (planId.HasValue)
            query = query.Where(t => t.WeeklyPlanId == planId.Value);

        var planned = await query.SumAsync(t => t.PlannedHours);
        var actual = await query.SumAsync(t => t.ActualHours);

        return Ok(new
        {
            Planned = planned,
            Actual = actual,
            Completion = planned == 0 ? 0 :
                (double)actual / planned * 100
        });
    }
}