# ==========================================
# STAGE 1: Build Frontend React
# ==========================================
FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
ENV VITE_API_URL=""
RUN npm run build

# ==========================================
# STAGE 2: Build Backend .NET
# ==========================================
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS dotnet-build
WORKDIR /src
COPY ["ImagenDiagnostico.csproj", "."]
RUN dotnet restore
COPY . .
# Copiar el frontend build al wwwroot del backend
COPY --from=frontend-build /frontend/dist ./wwwroot/
RUN dotnet publish -c Release -o /app/publish

# ==========================================
# STAGE 3: Producción
# ==========================================
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
COPY --from=dotnet-build /app/publish .
ENTRYPOINT ["dotnet", "ImagenDiagnostico.dll"]
