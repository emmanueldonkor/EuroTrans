FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy repository and build only the backend solution
COPY . .
WORKDIR /src/eurotrans.server
RUN dotnet restore EuroTrans.sln
RUN dotnet publish src/EuroTrans.Api/EuroTrans.Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

# Render provides PORT at runtime.
ENTRYPOINT ["sh", "-c", "dotnet EuroTrans.Api.dll --urls http://0.0.0.0:${PORT:-10000}"]
