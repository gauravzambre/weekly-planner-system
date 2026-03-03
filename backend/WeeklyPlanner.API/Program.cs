using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using WeeklyPlanner.API.Data;
using WeeklyPlanner.API.Repositories; 
using WeeklyPlanner.API.Services;
var builder = WebApplication.CreateBuilder(args);

//
// ============================
// SERVICES CONFIGURATION
// ============================
//
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<IAppService, AppService>();
// builder.Services.AddScoped<IAppService, AppService>();

// Add Controllers
builder.Services.AddControllers();

//
// SQL SERVER DB CONTEXT (Replace Mongo)
//
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")
    ));

//
// Swagger (Enabled for Production Also)
//
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "WeeklyPlanner API",
        Version = "v1",
        Description = "Weekly Planner Backend API"
    });
});

//
// CORS CONFIGURATION
//
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy
                .WithOrigins(
                    "http://localhost:4200",
                    "https://localhost:4200",
                    "https://weekly-planner-cloud-platform-ui-gcefgwgue5h4cncd.centralindia-01.azurewebsites.net"
                )
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        });
});

//
// ============================
// BUILD APP
// ============================
//
var app = builder.Build();

//
// ============================
// MIDDLEWARE PIPELINE
// ============================
//

// Swagger
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "WeeklyPlanner API V1");
    c.RoutePrefix = "swagger";
});

// HTTPS
app.UseHttpsRedirection();

// CORS (Before Controllers)
app.UseCors("AllowFrontend");

// Authorization
app.UseAuthorization();

// Map Controllers
app.MapControllers();

//
// ============================
// RUN APP
// ============================
//
app.Run();