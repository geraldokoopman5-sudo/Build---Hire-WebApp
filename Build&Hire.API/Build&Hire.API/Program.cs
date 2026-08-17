

using BuildAndHire.Infrastructure.Authentication;

var builder = WebApplication.CreateBuilder(args);

    // Register services
    builder.Services.AddControllers();
    builder.Services.AddScoped<IJwtService, JwtService>();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();

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
            )
        };
    });

builder.Services.AddScoped<IPasswordService, PasswordService>();

builder.Services.AddAuthorization();

var app = builder.Build();

    // Configure middleware
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    app.UseAuthentication();

    app.UseAuthorization();

    app.UseHttpsRedirection();

    app.UseAuthorization();

    app.MapControllers();

    app.Run();