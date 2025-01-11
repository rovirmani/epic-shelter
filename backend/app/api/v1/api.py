from fastapi import APIRouter
from app.api.v1.endpoints import migrations, health

api_router = APIRouter()

api_router.include_router(migrations.router, prefix="/migrations", tags=["migrations"])
api_router.include_router(health.router, prefix="/health", tags=["health"])
