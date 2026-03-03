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
}