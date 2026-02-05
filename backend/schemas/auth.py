from pydantic import BaseModel


class User(BaseModel):
    email: str
    username: str
    password: str


class ShowUser(BaseModel):
    username: str


class ProfileUser(BaseModel):
    email: str
    username: str


class Login(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: str | None = None
