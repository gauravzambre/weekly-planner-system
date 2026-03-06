using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WeeklyPlanner.API.Data;
using WeeklyPlanner.API.Models;
using WeeklyPlanner.API.DTOs;

namespace WeeklyPlanner.API.Controllers;

[ApiController]
[Route("api/team-members")]
public class TeamMembersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TeamMembersController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var list = await _context.TeamMembers.ToListAsync();
        var dto = list.Select(m => new TeamMemberDto
        {
            Id = m.Id,
            Name = m.Name,
            Role = m.Role
        });
        return Ok(dto);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTeamMemberDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var member = new TeamMember
        {
            Name = dto.Name,
            Role = dto.Role
        };

        _context.TeamMembers.Add(member);
        await _context.SaveChangesAsync();

        var result = new TeamMemberDto
        {
            Id = member.Id,
            Name = member.Name,
            Role = member.Role
        };

        return CreatedAtAction(nameof(GetAll), new { id = result.Id }, result);
    }

// getbyID team memberer
    [HttpGet("{id}")]
public async Task<IActionResult> GetById(int id)
{
    var member = await _context.TeamMembers.FindAsync(id);

    if (member == null)
        return NotFound();

    var dto = new TeamMemberDto
    {
        Id = member.Id,
        Name = member.Name,
        Role = member.Role
    };

    return Ok(dto);
}


[HttpPut("{id}")]
public async Task<IActionResult> Update(int id, [FromBody] CreateTeamMemberDto dto)
{
    if (!ModelState.IsValid)
        return BadRequest(ModelState);

    var member = await _context.TeamMembers.FindAsync(id);

    if (member == null)
        return NotFound();

    member.Name = dto.Name;
    member.Role = dto.Role;

    await _context.SaveChangesAsync();

    return Ok(member);
}
[HttpDelete("{id}")]
public async Task<IActionResult> Delete(int id)
{
    var member = await _context.TeamMembers.FindAsync(id);

    if (member == null)
        return NotFound();

    _context.TeamMembers.Remove(member);
    await _context.SaveChangesAsync();

    return NoContent();
}

    // GET TASKS FOR A TEAM MEMBER
    [HttpGet("{id}/tasks")]
    public async Task<IActionResult> GetTasks(int id)
    {
        var exists = await _context.TeamMembers.AnyAsync(m => m.Id == id);
        if (!exists)
            return NotFound();

        var tasks = await _context.PlanTasks
            .Where(t => t.TeamMemberId == id)
            .ToListAsync();
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
}
