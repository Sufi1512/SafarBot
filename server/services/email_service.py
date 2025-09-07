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
                    width: 60px;
                    height: 60px;
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    border-radius: 12px;
                    margin: 0 auto 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 24px;
                    font-weight: bold;
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
                    <div class="logo">SB</div>
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

# Global email service instance
email_service = EmailService()
