
using BuildAndHire.Infrastructure.Authentication;
using Microsoft.OpenApi;
using FluentValidation;
using Build_Hire.API.Validation;
using Build_Hire.API.Startup;

var builder = WebApplication.CreateBuilder(args);

    // Register services
    builder.Services.AddControllers(options =>
    {
        options.Filters.Add<RequestValidationFilter>();
        options.Filters.Add<ApiExceptionFilter>();
    });
    // Register validators from the application assembly without a second package.
    foreach (var type in typeof(CustomerService).Assembly.GetTypes()
        .Where(type => !type.IsAbstract && !type.IsInterface))
    {
        foreach (var contract in type.GetInterfaces().Where(contract =>
            contract.IsGenericType && contract.GetGenericTypeDefinition() == typeof(IValidator<>)))
            builder.Services.AddScoped(contract, type);
    }
    builder.Services.AddScoped<IJwtService, JwtService>();
    builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "Enter your JWT token."
    });

    options.AddSecurityRequirement(document =>
        new OpenApiSecurityRequirement
        {
            [new OpenApiSecuritySchemeReference("Bearer", document)] = []
        });
});

builder.Services.AddDbContext<BuildAndHireDbContext>(options =>
        options.UseNpgsql(
            builder.Configuration.GetConnectionString("DefaultConnection")));

        builder.Services.AddScoped<ICompanyRepository, CompanyRepository>();
        builder.Services.AddScoped<ICustomerRepository, CustomerRepository>();
        builder.Services.AddScoped<IJobRepository, JobRepository>();
        builder.Services.AddScoped<IWorkersRepository, WorkerRepository>();
        builder.Services.AddScoped<IPayementRepository, PaymentRepository>();
        builder.Services.AddScoped<IAdminRepository, AdminRepository>();

        builder.Services.AddScoped<ICompanyService, CompanyService>();
        builder.Services.AddScoped<ICustomerService, CustomerService>();
        builder.Services.AddScoped<IJobService, JobService>();
        builder.Services.AddScoped<IPaymentService, PaymentService>();
        builder.Services.AddScoped<IWorkerService, WorkerService>();
        builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = builder.Configuration["JwtConfig:Issuer"],
            ValidAudience = builder.Configuration["JwtConfig:Audience"],

            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    builder.Configuration["JwtConfig:Key"]!
                )
            ),

            ClockSkew = TimeSpan.Zero
        };

        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = async context =>
            {
                var principal = context.Principal;
                var subject = principal?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                    ?? principal?.FindFirst("sub")?.Value;
                if (!Guid.TryParse(subject, out var accountId))
                {
                    context.Fail("Invalid account ID.");
                    return;
                }

                var db = context.HttpContext.RequestServices.GetRequiredService<BuildAndHireDbContext>();
                var active = principal!.IsInRole("Customer")
                    ? await db.Customers.AnyAsync(c => c.CustomerId == accountId && c.Status == AccountStatus.Active)
                    : principal.IsInRole("Company")
                    ? await db.Companies.AnyAsync(c => c.CompanyId == accountId && c.Status == AccountStatus.Active)
                    : principal.IsInRole("Admin") || principal.IsInRole("SuperAdmin")
                    ? await db.Admin.AnyAsync(a => a.AdminId == accountId && a.Status == AccountStatus.Active)
                    : false;
                if (!active) context.Fail("Account is not active.");
            },
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine(
                    $"JWT Authentication Failed: {context.Exception.Message}");

                return Task.CompletedTask;
            },

            OnChallenge = context =>
            {
                Console.WriteLine(
                    $"JWT Challenge: {context.Error} - {context.ErrorDescription}");

                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddScoped<IPasswordService, PasswordService>();

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins(builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                ?? ["http://localhost:5173", "http://127.0.0.1:5173"])
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();
// Explicit maintenance command; normal startup never changes the schema.
if (args.Contains("--migrate"))
{
    await using var scope = app.Services.CreateAsyncScope();
    await scope.ServiceProvider.GetRequiredService<BuildAndHireDbContext>().Database.MigrateAsync();
    await app.DisposeAsync();
    return;
}
await SuperAdminSeeder.SeedAsync(app.Services, app.Configuration);

    // Configure middleware
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

app.UseHttpsRedirection();

app.UseRouting();

app.UseCors("Frontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
