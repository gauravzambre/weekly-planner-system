using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WeeklyPlanner.API.Data;
using WeeklyPlanner.API.Models;
using WeeklyPlanner.API.DTOs;

namespace WeeklyPlanner.API.Controllers;

[ApiController]
[Route("api/plantasks")]
public class PlanTaskController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PlanTaskController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET ALL TASKS
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var tasks = await _context.PlanTasks.ToListAsync();
        var dto = tasks.Select(t => new PlanTaskDto
        {
            Id = t.Id,
            WeeklyPlanId = t.WeeklyPlanId,
            BacklogItemId = t.BacklogItemId,
            TeamMemberId = t.TeamMemberId,
            PlannedHours = t.PlannedHours,
            ActualHours = t.ActualHours,
            UserId = t.UserId
        });
        return Ok(dto);
    }

    // CREATE TASK (30-HOUR RULE + FREEZE CHECK)
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePlanTaskDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var plan = await _context.WeeklyPlans
            .FirstOrDefaultAsync(p => p.Id == dto.WeeklyPlanId);

        if (plan == null)
            return NotFound("Weekly plan not found.");

        if (plan.IsFrozen)
            return BadRequest("Plan is frozen. Cannot add tasks.");

        // validate hour cap
        var existing = await _context.PlanTasks
            .Where(t => t.WeeklyPlanId == dto.WeeklyPlanId)
            .SumAsync(t => t.PlannedHours);
        if (existing + dto.PlannedHours > 30)
            return BadRequest("Total planned hours cannot exceed 30 hours.");

        var task = new PlanTask
        {
            WeeklyPlanId = dto.WeeklyPlanId,
            BacklogItemId = dto.BacklogItemId,
            TeamMemberId = dto.TeamMemberId,
            PlannedHours = dto.PlannedHours,
            UserId = dto.UserId
        };

        _context.PlanTasks.Add(task);
        await _context.SaveChangesAsync();

        var result = new PlanTaskDto
        {
            Id = task.Id,
            WeeklyPlanId = task.WeeklyPlanId,
            BacklogItemId = task.BacklogItemId,
            TeamMemberId = task.TeamMemberId,
            PlannedHours = task.PlannedHours,
            ActualHours = task.ActualHours,
            UserId = task.UserId
        };

        return CreatedAtAction(nameof(GetAll), new { id = result.Id }, result);
    }

    // UPDATE PROGRESS (ONLY AFTER FREEZE)
    [HttpPut("{id}/progress")]
    public async Task<IActionResult> UpdateProgress(int id, [FromBody] int hours)
    {
        var task = await _context.PlanTasks.FindAsync(id);
        if (task == null)
            return NotFound("Task not found.");

        var plan = await _context.WeeklyPlans
            .FirstOrDefaultAsync(p => p.Id == task.WeeklyPlanId);

        if (plan == null)
            return NotFound("Weekly plan not found.");

        if (!plan.IsFrozen)
            return BadRequest("Progress can only be updated after plan is frozen.");

        // actual hours cannot exceed planned
        if (hours > task.PlannedHours)
            return BadRequest("Actual hours cannot exceed planned hours.");

        task.ActualHours = hours;
        await _context.SaveChangesAsync();

        var dto = new PlanTaskDto
        {
            Id = task.Id,
            WeeklyPlanId = task.WeeklyPlanId,
            BacklogItemId = task.BacklogItemId,
            TeamMemberId = task.TeamMemberId,
            PlannedHours = task.PlannedHours,
            ActualHours = task.ActualHours,
            UserId = task.UserId
        };
        return Ok(dto);
    }

    // UPDATE TASK (only before freeze / hour cap)
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] CreatePlanTaskDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var task = await _context.PlanTasks.FindAsync(id);
        if (task == null)
            return NotFound("Task not found.");

        var plan = await _context.WeeklyPlans.FirstOrDefaultAsync(p => p.Id == task.WeeklyPlanId);
        if (plan == null)
            return NotFound("Weekly plan not found.");

        if (plan.IsFrozen)
            return BadRequest("Cannot modify task after plan is frozen.");

        // check hour cap (exclude current task)
        var totalOther = await _context.PlanTasks
            .Where(t => t.WeeklyPlanId == task.WeeklyPlanId && t.Id != id)
            .SumAsync(t => t.PlannedHours);
        if (totalOther + dto.PlannedHours > 30)
            return BadRequest("Total planned hours cannot exceed 30 hours.");

        task.WeeklyPlanId = dto.WeeklyPlanId;
        task.BacklogItemId = dto.BacklogItemId;
        task.TeamMemberId = dto.TeamMemberId;
        task.PlannedHours = dto.PlannedHours;
        task.UserId = dto.UserId;

        await _context.SaveChangesAsync();

        var result = new PlanTaskDto
        {
            Id = task.Id,
            WeeklyPlanId = task.WeeklyPlanId,
            BacklogItemId = task.BacklogItemId,
            TeamMemberId = task.TeamMemberId,
            PlannedHours = task.PlannedHours,
            ActualHours = task.ActualHours,
            UserId = task.UserId
        };
        return Ok(result);
    }

    // DELETE TASK (NOT ALLOWED AFTER FREEZE)
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var task = await _context.PlanTasks.FindAsync(id);
        if (task == null)
            return NotFound("Task not found.");

        var plan = await _context.WeeklyPlans
            .FirstOrDefaultAsync(p => p.Id == task.WeeklyPlanId);

        if (plan != null && plan.IsFrozen)
            return BadRequest("Cannot delete task after plan is frozen.");

        _context.PlanTasks.Remove(task);
        await _context.SaveChangesAsync();

        return Ok("Task deleted successfully.");
    }
}