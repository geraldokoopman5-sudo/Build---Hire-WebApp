    FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
    WORKDIR /src
    COPY . .
    RUN dotnet publish "Build&Hire.API/BuildAndHire.API.csproj" \
        -c Release \
        -o /app/publish \
        --self-contained false \
        /p:UseAppHost=false
    
    FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
    WORKDIR /app
    COPY --from=build /app/publish .
    ENV ASPNETCORE_ENVIRONMENT=Production
    USER app
    EXPOSE 8080
    CMD ["sh", "-c", "exec dotnet BuildAndHire.API.dll --urls http://0.0.0.0:${PORT:-8080}"]