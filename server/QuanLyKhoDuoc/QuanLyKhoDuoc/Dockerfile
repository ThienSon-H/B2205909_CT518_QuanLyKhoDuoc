# Stage 1: Build ứng dụng với .NET 10.0 SDK mới nhất
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["QuanLyKhoDuoc.csproj", "."]
RUN dotnet restore "QuanLyKhoDuoc.csproj"
COPY . .
RUN dotnet publish "QuanLyKhoDuoc.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Môi trường chạy .NET 10.0 ASP.NET siêu nhẹ
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "QuanLyKhoDuoc.dll"]