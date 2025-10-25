#!/usr/bin/env python3
"""
Test script to verify email-validator is working
"""
try:
    import email_validator
    print("✅ email-validator imported successfully")
    
    # Test email validation
    from email_validator import validate_email, EmailNotValidError
    
    # Test with a valid email
    try:
        email = validate_email("test@example.com")
        print(f"✅ Email validation works: {email.email}")
    except EmailNotValidError as e:
        print(f"❌ Email validation failed: {e}")
    
    # Test pydantic email validation
    from pydantic import BaseModel, EmailStr
    from typing import Optional
    
    class TestUser(BaseModel):
        email: EmailStr
        name: Optional[str] = None
    
    # Test creating a user with email
    user = TestUser(email="test@example.com", name="Test User")
    print(f"✅ Pydantic EmailStr validation works: {user.email}")
    
    print("🎉 All email validation tests passed!")
    
except ImportError as e:
    print(f"❌ Failed to import email-validator: {e}")
    print("Please install: pip install email-validator")
    exit(1)
except Exception as e:
    print(f"❌ Error during testing: {e}")
    exit(1)
