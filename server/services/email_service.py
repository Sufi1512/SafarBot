"""
Email Service for sending collaboration invitations and OTP emails
"""

import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import logging
from config import settings

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        # Use Brevo SMTP configuration (same as OTP service)
        self.smtp_server = "smtp-relay.brevo.com"
        self.smtp_port = 587
        self.smtp_username = "9675c1001@smtp-brevo.com"
        self.smtp_password = os.getenv("BREVO_SMTP_PASSWORD")
        self.from_email = "SafarBot Team <ksufiyan38@gmail.com>"
        self.app_url = settings.app_url
        
        # Check if email is configured
        self.is_configured = bool(self.smtp_password)
        
        if not self.is_configured:
            logger.warning("Email service not configured. BREVO_SMTP_PASSWORD missing.")
        else:
            logger.info(f"Email service configured with Brevo SMTP server: {self.smtp_server}")
    
    async def send_invitation_email(
        self, 
        to_email: str, 
        invitation_token: str, 
        itinerary_title: str, 
        owner_name: str,
        role: str,
        message: Optional[str] = None
    ) -> bool:
        """Send collaboration invitation email"""
        try:
            # Create invitation URL
            invitation_url = f"{self.app_url}/collaboration/accept/{invitation_token}"
            
            # Create email content
            subject = f"You're invited to collaborate on '{itinerary_title}'"
            
            html_content = self._create_invitation_html(
                owner_name=owner_name,
                itinerary_title=itinerary_title,
                role=role,
                invitation_url=invitation_url,
                message=message
            )
            
            text_content = self._create_invitation_text(
                owner_name=owner_name,
                itinerary_title=itinerary_title,
                role=role,
                invitation_url=invitation_url,
                message=message
            )
            
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.from_email
            msg['To'] = to_email
            
            # Add both plain text and HTML versions
            text_part = MIMEText(text_content, 'plain')
            html_part = MIMEText(html_content, 'html')
            
            msg.attach(text_part)
            msg.attach(html_part)
            
            # Send email
            if self.is_configured:
                # Connect to SMTP server (same pattern as OTP service)
                server = smtplib.SMTP(self.smtp_server, self.smtp_port)
                server.starttls()  # Enable TLS encryption
                server.login(self.smtp_username, self.smtp_password)
                
                # Send email
                text = msg.as_string()
                server.sendmail(msg['From'], to_email, text)
                server.quit()
                
                logger.info(f"✅ Invitation email sent successfully to {to_email}")
                return True
            else:
                logger.warning("SMTP credentials not configured, email not sent")
                # For development/testing, log the email content instead
                logger.info(f"EMAIL CONTENT (not sent):")
                logger.info(f"To: {to_email}")
                logger.info(f"Subject: {subject}")
                logger.info(f"URL: {invitation_url}")
                return False
                
        except Exception as e:
            logger.error(f"Failed to send invitation email to {to_email}: {str(e)}")
            return False
    
    def _create_invitation_html(
        self, 
        owner_name: str, 
        itinerary_title: str, 
        role: str, 
        invitation_url: str,
        message: Optional[str] = None
    ) -> str:
        """Create HTML content for invitation email"""
        role_display = role.title()
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Collaboration Invitation</title>
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f8fafc;
                }}
                .container {{
                    background: white;
                    border-radius: 12px;
                    padding: 40px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }}
                .header {{
                    text-align: center;
                    margin-bottom: 30px;
                }}
                .logo {{
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 20px;
                    margin: 0 auto 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 28px;
                    font-weight: bold;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                }}
                .logo::before {{
                    content: '';
                    position: absolute;
                    top: -10px;
                    left: -10px;
                    width: 40px;
                    height: 40px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                }}
                .logo::after {{
                    content: '';
                    position: absolute;
                    bottom: -5px;
                    right: -5px;
                    width: 30px;
                    height: 30px;
                    background: rgba(255, 255, 255, 0.15);
                    border-radius: 50%;
                }}
                .logo-icon {{
                    z-index: 1;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                }}
                .title {{
                    font-size: 24px;
                    font-weight: bold;
                    color: #1f2937;
                    margin-bottom: 10px;
                }}
                .subtitle {{
                    color: #6b7280;
                    font-size: 16px;
                }}
                .content {{
                    margin-bottom: 30px;
                }}
                .invitation-details {{
                    background: #f3f4f6;
                    border-radius: 8px;
                    padding: 20px;
                    margin: 20px 0;
                }}
                .detail-row {{
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                }}
                .detail-label {{
                    font-weight: 600;
                    color: #374151;
                }}
                .detail-value {{
                    color: #6b7280;
                }}
                .role-badge {{
                    background: #dbeafe;
                    color: #1e40af;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 14px;
                    font-weight: 500;
                }}
                .message-box {{
                    background: #fef3c7;
                    border-left: 4px solid #f59e0b;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 0 8px 8px 0;
                }}
                .cta-button {{
                    display: inline-block;
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    color: white;
                    text-decoration: none;
                    padding: 16px 32px;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 16px;
                    text-align: center;
                    margin: 20px 0;
                    transition: transform 0.2s;
                }}
                .cta-button:hover {{
                    transform: translateY(-2px);
                }}
                .footer {{
                    text-align: center;
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #e5e7eb;
                    color: #6b7280;
                    font-size: 14px;
                }}
                .security-note {{
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    border-radius: 8px;
                    padding: 15px;
                    margin: 20px 0;
                    color: #991b1b;
                    font-size: 14px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo"><div class="logo-icon">✈️</div></div>
                    <div class="title">You're Invited to Collaborate!</div>
                    <div class="subtitle">Join {owner_name} in planning an amazing trip</div>
                </div>
                
                <div class="content">
                    <p>Hello!</p>
                    <p><strong>{owner_name}</strong> has invited you to collaborate on their travel itinerary. You'll be able to help plan and organize this amazing trip together.</p>
                    
                    <div class="invitation-details">
                        <div class="detail-row">
                            <span class="detail-label">Itinerary:</span>
                            <span class="detail-value">{itinerary_title}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Your Role:</span>
                            <span class="detail-value">
                                <span class="role-badge">{role_display}</span>
                            </span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Invited by:</span>
                            <span class="detail-value">{owner_name}</span>
                        </div>
                    </div>
                    
                    {f'<div class="message-box"><strong>Personal Message:</strong><br>"{message}"</div>' if message else ''}
                    
                    <div style="text-align: center;">
                        <a href="{invitation_url}" class="cta-button">Accept Invitation</a>
                    </div>
                    
                    <div class="security-note">
                        <strong>Security Note:</strong> This invitation link is unique to you and will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
                    </div>
                </div>
                
                <div class="footer">
                    <p>This invitation was sent by SafarBot - Your AI Travel Planning Assistant</p>
                    <p>If you have any questions, please contact our support team.</p>
                </div>
            </div>
        </body>
        </html>
        """
        return html
    
    def _create_invitation_text(
        self, 
        owner_name: str, 
        itinerary_title: str, 
        role: str, 
        invitation_url: str,
        message: Optional[str] = None
    ) -> str:
        """Create plain text content for invitation email"""
        role_display = role.title()
        
        text = f"""
You're Invited to Collaborate!

Hello!

{owner_name} has invited you to collaborate on their travel itinerary. You'll be able to help plan and organize this amazing trip together.

INVITATION DETAILS:
- Itinerary: {itinerary_title}
- Your Role: {role_display}
- Invited by: {owner_name}

{f'PERSONAL MESSAGE:{chr(10)}"{message}"{chr(10)}' if message else ''}

To accept this invitation, click the link below:
{invitation_url}

SECURITY NOTE: This invitation link is unique to you and will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.

---
This invitation was sent by SafarBot - Your AI Travel Planning Assistant
If you have any questions, please contact our support team.
        """
        return text.strip()

    async def send_password_reset_email(
        self, 
        to_email: str, 
        reset_token: str, 
        user_name: str
    ) -> bool:
        """Send password reset email"""
        try:
            # Create reset URL
            reset_url = f"{self.app_url}/reset-password?token={reset_token}"
            
            # Create email content
            subject = "Reset Your SafarBot Password"
            
            html_content = self._create_password_reset_html(
                user_name=user_name,
                reset_url=reset_url
            )
            
            text_content = self._create_password_reset_text(
                user_name=user_name,
                reset_url=reset_url
            )
            
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.from_email
            msg['To'] = to_email
            
            # Add both plain text and HTML versions
            text_part = MIMEText(text_content, 'plain')
            html_part = MIMEText(html_content, 'html')
            
            msg.attach(text_part)
            msg.attach(html_part)
            
            # Send email
            if self.is_configured:
                # Connect to SMTP server
                server = smtplib.SMTP(self.smtp_server, self.smtp_port)
                server.starttls()  # Enable TLS encryption
                server.login(self.smtp_username, self.smtp_password)
                
                # Send email
                text = msg.as_string()
                server.sendmail(msg['From'], to_email, text)
                server.quit()
                
                logger.info(f"✅ Password reset email sent successfully to {to_email}")
                return True
            else:
                logger.warning("SMTP credentials not configured, email not sent")
                # For development/testing, log the email content instead
                logger.info(f"EMAIL CONTENT (not sent):")
                logger.info(f"To: {to_email}")
                logger.info(f"Subject: {subject}")
                logger.info(f"Reset URL: {reset_url}")
                return False
                
        except Exception as e:
            logger.error(f"Failed to send password reset email to {to_email}: {str(e)}")
            return False

    def _create_password_reset_html(
        self, 
        user_name: str, 
        reset_url: str
    ) -> str:
        """Create HTML content for password reset email"""
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f8fafc;
                }}
                .container {{
                    background: white;
                    border-radius: 12px;
                    padding: 40px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }}
                .header {{
                    text-align: center;
                    margin-bottom: 30px;
                }}
                .logo {{
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 20px;
                    margin: 0 auto 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 28px;
                    font-weight: bold;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                }}
                .logo::before {{
                    content: '';
                    position: absolute;
                    top: -10px;
                    left: -10px;
                    width: 40px;
                    height: 40px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                }}
                .logo::after {{
                    content: '';
                    position: absolute;
                    bottom: -5px;
                    right: -5px;
                    width: 30px;
                    height: 30px;
                    background: rgba(255, 255, 255, 0.15);
                    border-radius: 50%;
                }}
                .logo-icon {{
                    z-index: 1;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                }}
                .title {{
                    font-size: 24px;
                    font-weight: bold;
                    color: #1f2937;
                    margin-bottom: 10px;
                }}
                .subtitle {{
                    color: #6b7280;
                    font-size: 16px;
                }}
                .content {{
                    margin-bottom: 30px;
                }}
                .greeting {{
                    font-size: 18px;
                    margin-bottom: 20px;
                    color: #374151;
                }}
                .message {{
                    margin-bottom: 30px;
                    color: #4b5563;
                    line-height: 1.7;
                }}
                .cta-button {{
                    display: inline-block;
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    color: white;
                    text-decoration: none;
                    padding: 16px 32px;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 16px;
                    text-align: center;
                    margin: 20px 0;
                    transition: transform 0.2s;
                    box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
                }}
                .cta-button:hover {{
                    transform: translateY(-2px);
                    box-shadow: 0 6px 8px rgba(59, 130, 246, 0.4);
                }}
                .backup-link {{
                    background: #f3f4f6;
                    border-radius: 8px;
                    padding: 20px;
                    margin: 20px 0;
                    border-left: 4px solid #3b82f6;
                }}
                .backup-link-title {{
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 10px;
                }}
                .backup-url {{
                    word-break: break-all;
                    color: #3b82f6;
                    font-family: monospace;
                    font-size: 14px;
                    background: white;
                    padding: 10px;
                    border-radius: 4px;
                    border: 1px solid #e5e7eb;
                }}
                .security-note {{
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    border-radius: 8px;
                    padding: 15px;
                    margin: 20px 0;
                    color: #991b1b;
                    font-size: 14px;
                }}
                .footer {{
                    text-align: center;
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #e5e7eb;
                    color: #6b7280;
                    font-size: 14px;
                }}
                .help-section {{
                    background: #f8fafc;
                    border-radius: 8px;
                    padding: 20px;
                    margin: 20px 0;
                }}
                .help-title {{
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 10px;
                }}
                .help-list {{
                    margin: 0;
                    padding-left: 20px;
                }}
                .help-list li {{
                    margin-bottom: 5px;
                    color: #4b5563;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo"><div class="logo-icon">✈️</div></div>
                    <div class="title">Reset Your Password</div>
                    <div class="subtitle">SafarBot - Your AI Travel Planning Assistant</div>
                </div>
                
                <div class="content">
                    <div class="greeting">Hello {user_name}!</div>
                    
                    <div class="message">
                        <p>We received a request to reset your password for your SafarBot account. If you made this request, click the button below to create a new password:</p>
                    </div>
                    
                    <div style="text-align: center;">
                        <a href="{reset_url}" class="cta-button">Reset My Password</a>
                    </div>
                    
                    <div class="backup-link">
                        <div class="backup-link-title">Button not working? Copy and paste this link:</div>
                        <div class="backup-url">{reset_url}</div>
                    </div>
                    
                    <div class="security-note">
                        <strong>Security Note:</strong> This password reset link is valid for 1 hour and can only be used once. If you didn't request this password reset, you can safely ignore this email. Your password will not be changed.
                    </div>
                    
                    <div class="help-section">
                        <div class="help-title">Need help?</div>
                        <ul class="help-list">
                            <li>Make sure your new password is at least 8 characters long</li>
                            <li>Use a combination of letters, numbers, and special characters</li>
                            <li>Don't share your password with anyone</li>
                            <li>Contact support if you continue to have issues</li>
                        </ul>
                    </div>
                </div>
                
                <div class="footer">
                    <p>This email was sent by SafarBot - Your AI Travel Planning Assistant</p>
                    <p>If you have any questions, please contact our support team.</p>
                    <p style="font-size: 12px; color: #9ca3af;">
                        This is an automated message. Please do not reply to this email.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        return html

    def _create_password_reset_text(
        self, 
        user_name: str, 
        reset_url: str
    ) -> str:
        """Create plain text content for password reset email"""
        text = f"""
Reset Your SafarBot Password

Hello {user_name}!

We received a request to reset your password for your SafarBot account. If you made this request, click the link below to create a new password:

{reset_url}

SECURITY NOTE: This password reset link is valid for 1 hour and can only be used once. If you didn't request this password reset, you can safely ignore this email. Your password will not be changed.

NEED HELP?
- Make sure your new password is at least 8 characters long
- Use a combination of letters, numbers, and special characters
- Don't share your password with anyone
- Contact support if you continue to have issues

---
This email was sent by SafarBot - Your AI Travel Planning Assistant
If you have any questions, please contact our support team.

This is an automated message. Please do not reply to this email.
        """
        return text.strip()

# Global email service instance
email_service = EmailService()
