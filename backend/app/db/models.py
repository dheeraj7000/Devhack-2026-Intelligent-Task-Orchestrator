from datetime import datetime

from sqlalchemy import Column, String, Text, JSON, Integer, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.db.database import Base


class EpicModel(Base):
    __tablename__ = "epics"

    id = Column(String, primary_key=True, index=True)
    goal = Column(Text, nullable=False)
    tasks = Column(JSON, nullable=True)
    dependencies = Column(JSON, nullable=True)
    success_criteria = Column(JSON, nullable=True)
    status = Column(String, default="draft")
    created_at = Column(DateTime, default=datetime.utcnow)

    validations = relationship("ValidationModel", back_populates="epic")


class ValidationModel(Base):
    __tablename__ = "validations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    epic_id = Column(String, ForeignKey("epics.id"), nullable=False)
    attempt_number = Column(Integer, default=1)
    trigger = Column(String, default="manual")  # "auto_generate", "manual", "replan"
    metrics = Column(JSON, nullable=True)
    average = Column(Float, nullable=True)
    passed = Column(Boolean, default=False)
    low_metrics = Column(JSON, nullable=True)  # metrics that scored below threshold
    feedback_given = Column(Text, nullable=True)  # feedback sent to LLM for next attempt
    created_at = Column(DateTime, default=datetime.utcnow)

    epic = relationship("EpicModel", back_populates="validations")
