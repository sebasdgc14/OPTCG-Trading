from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.database import engine
import models
from routers import user
from routers import authentication

app = FastAPI()

app.include_router(user.router)
app.include_router(authentication.router)

origins = ["http://localhost:8000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)  # Cross origin resource sharing, to allow only authorized frontend to access backend APIs

models.Base.metadata.create_all(bind=engine)  # This creates the tables if necessary
