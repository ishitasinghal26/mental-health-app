from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime

Base = declarative_base()

class ChatbotLog(Base):
    __tablename__ = "chatbot_logs"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    user_message = Column(Text)
    bot_response = Column(Text)
    conversation_id = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    title = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)