import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import os
from dotenv import load_dotenv

from config import settings
from database import get_collection, USERS_COLLECTION

load_dotenv()

class OTPService:
    """Service for handling OTP generation, sending, and verification using SMTP."""
    
    # OTP configuration
    OTP_LENGTH = 6
    OTP_EXPIRE_MINUTES = 10
    MAX_OTP_ATTEMPTS = 3
    
    # SMTP Configuration
    SMTP_SERVER = "smtp-relay.brevo.com"
    SMTP_PORT = 587
    SMTP_LOGIN = "9675c1001@smtp-brevo.com"
    SMTP_PASSWORD = os.getenv("BREVO_SMTP_PASSWORD")
    
    @staticmethod
    def generate_otp() -> str:
        """Generate a 6-digit OTP."""
        return str(random.randint(100000, 999999))
    
    @staticmethod
    def send_otp_email(receiver_email: str, otp: str, user_name: str = "User") -> bool:
        """Send OTP email using SMTP."""
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = "Your SafarBot Verification Code"
            msg['From'] = "SafarBot Team <ksufiyan38@gmail.com>"
            msg['To'] = receiver_email
            
            # HTML content
            html_content = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #2563eb; margin: 0;">SafarBot</h1>
                    <p style="color: #6b7280; margin: 5px 0;">Your Travel Planning Assistant</p>
                </div>
                
                <div style="background: #f8fafc; padding: 30px; border-radius: 10px; text-align: center;">
                    <h2 style="color: #1f2937; margin: 0 0 20px 0;">Verification Code</h2>
                    <p style="color: #4b5563; margin: 0 0 20px 0;">Hello {user_name},</p>
                    <p style="color: #4b5563; margin: 0 0 30px 0;">Your verification code is:</p>
                    
                    <div style="background: #ffffff; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 5px;">{otp}</span>
                    </div>
                    
                    <p style="color: #ef4444; font-size: 14px; margin: 20px 0 0 0;">
                        ⏰ This code will expire in {OTPService.OTP_EXPIRE_MINUTES} minutes
                    </p>
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0;">
                        If you didn't request this code, please ignore this email.
                    </p>
                    <p style="color: #6b7280; font-size: 12px; margin: 5px 0 0 0;">
                        © 2024 SafarBot. All rights reserved.
                    </p>
                </div>
            </div>
            """
            
            # Attach HTML content
            html_part = MIMEText(html_content, 'html')
            msg.attach(html_part)
            
            # Connect to SMTP server
            server = smtplib.SMTP(OTPService.SMTP_SERVER, OTPService.SMTP_PORT)
            server.starttls()  # Enable TLS encryption
            server.login(OTPService.SMTP_LOGIN, OTPService.SMTP_PASSWORD)
            
            # Send email
            text = msg.as_string()
            server.sendmail(msg['From'], receiver_email, text)
            server.quit()
            
            print(f"✅ OTP email sent successfully to {receiver_email}")
            return True
            
        except Exception as e:
            print(f"❌ Error sending OTP email: {e}")
            return False
    
    @staticmethod
    async def store_otp(email: str, otp: str) -> bool:
        """Store OTP in database with expiration."""
        try:
            collection = get_collection(USERS_COLLECTION)
            if collection is None:
                return False
            
            # Calculate expiration time
            expires_at = datetime.utcnow() + timedelta(minutes=OTPService.OTP_EXPIRE_MINUTES)
            
            # Store OTP data
            otp_data = {
                "otp": otp,
                "otp_expires_at": expires_at,
                "otp_attempts": 0,
                "otp_created_at": datetime.utcnow()
            }
            
            # Update user document with OTP data
            result = await collection.update_one(
                {"email": email},
                {
                    "$set": {
                        **otp_data,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            return result.modified_count > 0 or result.matched_count > 0
            
        except Exception as e:
            print(f"❌ Error storing OTP: {e}")
            return False
    
    @staticmethod
    async def verify_otp(email: str, user_otp: str) -> Dict[str, Any]:
        """Verify OTP for user."""
        try:
            collection = get_collection(USERS_COLLECTION)
            if collection is None:
                return {"success": False, "message": "Database connection error"}
            
            # Find user with OTP data
            user_doc = await collection.find_one({"email": email})
            if not user_doc:
                return {"success": False, "message": "No OTP found. Please request a new one."}
            
            # Check if OTP exists
            if "otp" not in user_doc:
                return {"success": False, "message": "No OTP found. Please request a new one."}
            
            # Check if OTP has expired
            if datetime.utcnow() > user_doc.get("otp_expires_at", datetime.min):
                # Clean up expired OTP
                await collection.update_one(
                    {"email": email},
                    {
                        "$unset": {
                            "otp": "",
                            "otp_expires_at": "",
                            "otp_attempts": "",
                            "otp_created_at": ""
                        }
                    }
                )
                return {"success": False, "message": "OTP has expired. Please request a new one."}
            
            # Check if max attempts exceeded
            otp_attempts = user_doc.get("otp_attempts", 0)
            if otp_attempts >= OTPService.MAX_OTP_ATTEMPTS:
                # Set last attempt time for cooldown period
                await collection.update_one(
                    {"email": email},
                    {
                        "$set": {
                            "otp_last_attempt": datetime.utcnow(),
                            "updated_at": datetime.utcnow()
                        },
                        "$unset": {
                            "otp": "",
                            "otp_expires_at": "",
                            "otp_created_at": ""
                        }
                    }
                )
                return {"success": False, "message": "Maximum OTP attempts exceeded. Please wait 2 minutes before requesting a new OTP."}
            
            # Verify OTP
            if user_doc["otp"] == user_otp:
                # OTP is correct - clean up OTP data and mark email as verified
                await collection.update_one(
                    {"email": email},
                    {
                        "$set": {
                            "is_email_verified": True,
                            "status": "active",
                            "updated_at": datetime.utcnow()
                        },
                        "$unset": {
                            "otp": "",
                            "otp_expires_at": "",
                            "otp_attempts": "",
                            "otp_created_at": ""
                        }
                    }
                )
                return {"success": True, "message": "Email verified successfully", "is_verified": True}
            else:
                # Increment attempts
                await collection.update_one(
                    {"email": email},
                    {
                        "$inc": {"otp_attempts": 1},
                        "$set": {"updated_at": datetime.utcnow()}
                    }
                )
                remaining_attempts = OTPService.MAX_OTP_ATTEMPTS - (otp_attempts + 1)
                return {
                    "success": False, 
                    "message": f"Invalid OTP. {remaining_attempts} attempts remaining."
                }
                
        except Exception as e:
            print(f"❌ Error verifying OTP: {e}")
            return {"success": False, "message": "OTP verification failed"}
    
    @staticmethod
    async def send_verification_otp(email: str, user_name: str = "User") -> Dict[str, Any]:
        """Generate, store, and send OTP for email verification."""
        try:
            # Generate OTP
            otp = OTPService.generate_otp()
            
            # Store OTP in database
            stored = await OTPService.store_otp(email, otp)
            if not stored:
                return {"success": False, "message": "Failed to store OTP"}
            
            # Send OTP email
            sent = OTPService.send_otp_email(email, otp, user_name)
            if not sent:
                return {"success": False, "message": "Failed to send OTP email"}
            
            return {"success": True, "message": "OTP sent successfully"}
            
        except Exception as e:
            print(f"❌ Error in send_verification_otp: {e}")
            return {"success": False, "message": "Failed to send verification OTP"}
    
    @staticmethod
    async def resend_otp(email: str, user_name: str = "User") -> Dict[str, Any]:
        """Resend OTP for email verification."""
        try:
            collection = get_collection(USERS_COLLECTION)
            if collection is None:
                return {"success": False, "message": "Database connection error"}
            
            # Check if user exists
            user_doc = await collection.find_one({"email": email})
            if not user_doc:
                return {"success": False, "message": "User not found"}
            
            # Check if email is already verified
            if user_doc.get("is_email_verified", False):
                return {"success": False, "message": "Email is already verified"}
            
            # Check if user has reached max attempts and is in cooldown period
            otp_attempts = user_doc.get("otp_attempts", 0)
            if otp_attempts >= OTPService.MAX_OTP_ATTEMPTS:
                # Check if 2 minutes have passed since last attempt
                last_attempt_time = user_doc.get("otp_last_attempt", datetime.min)
                cooldown_end = last_attempt_time + timedelta(minutes=2)
                
                if datetime.utcnow() < cooldown_end:
                    remaining_time = cooldown_end - datetime.utcnow()
                    seconds = int(remaining_time.total_seconds())
                    minutes = seconds // 60
                    secs = seconds % 60
                    return {
                        "success": False, 
                        "message": f"Please wait {minutes}:{secs:02d} before requesting a new OTP after {OTPService.MAX_OTP_ATTEMPTS} failed attempts"
                    }
                else:
                    # Reset attempts after cooldown period
                    await collection.update_one(
                        {"email": email},
                        {
                            "$set": {
                                "otp_attempts": 0,
                                "updated_at": datetime.utcnow()
                            },
                            "$unset": {
                                "otp_last_attempt": ""
                            }
                        }
                    )
            
            # Check if there's an existing OTP that hasn't expired and user hasn't reached max attempts
            if "otp" in user_doc and datetime.utcnow() < user_doc.get("otp_expires_at", datetime.min) and otp_attempts < OTPService.MAX_OTP_ATTEMPTS:
                remaining_time = user_doc["otp_expires_at"] - datetime.utcnow()
                minutes = int(remaining_time.total_seconds() / 60)
                return {
                    "success": False, 
                    "message": f"Please wait {minutes} minutes before requesting a new OTP"
                }
            
            # Send new OTP
            return await OTPService.send_verification_otp(email, user_name)
            
        except Exception as e:
            print(f"❌ Error in resend_otp: {e}")
            return {"success": False, "message": "Failed to resend OTP"}
