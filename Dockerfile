FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["backend/VehicleServiceAPI/VehicleServiceAPI.csproj", "backend/VehicleServiceAPI/"]
RUN dotnet restore "backend/VehicleServiceAPI/VehicleServiceAPI.csproj"
COPY . .
WORKDIR "/src/backend/VehicleServiceAPI"
RUN dotnet publish "VehicleServiceAPI.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "VehicleServiceAPI.dll"]
