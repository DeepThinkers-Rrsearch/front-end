import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const { name, email, researchInterest, message } = await request.json();

    // Validate required fields
    if (!name || !email || !researchInterest || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Create Zoho SMTP transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.com",
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Email content to send to your team
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to your Zoho email
      replyTo: email, // User's email for easy reply
      subject: `New Contact Form Submission - ${researchInterest}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #f59e0b; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #374151; margin-bottom: 10px;">Contact Details:</h3>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Research Interest:</strong> ${researchInterest}</p>
          </div>

          <div style="margin: 20px 0;">
            <h3 style="color: #374151; margin-bottom: 10px;">Message:</h3>
            <div style="background-color: #f9fafb; padding: 15px; border-left: 4px solid #f59e0b; border-radius: 4px;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
            <p>This email was sent from the State Forge contact form at ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `,
      text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
Research Interest: ${researchInterest}

Message:
${message}

---
Sent from State Forge contact form at ${new Date().toLocaleString()}
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Optional: Send confirmation email to the user
    const confirmationMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Thank you for contacting State Forge",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2 style="color: #f59e0b; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">
            Thank You for Contacting State Forge
          </h2>
          
          <p style="color: #374151; line-height: 1.6;">Dear ${name},</p>
          
          <p style="color: #374151; line-height: 1.6;">
            Thank you for reaching out to our research team. We have received your message regarding 
            <strong>${researchInterest}</strong> and will get back to you as soon as possible.
          </p>

          <div style="background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;">
              <strong>Your message:</strong><br>
              ${message.replace(/\n/g, '<br>')}
            </p>
          </div>

          <p style="color: #374151; line-height: 1.6;">
            In the meantime, feel free to explore our platform and try out our automata theory conversions.
          </p>

          <div style="margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/chat" 
               style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
              Start Converting
            </a>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
            <p style="margin: 5px 0;"><strong>State Forge Research Team</strong></p>
            <p style="margin: 5px 0;">University of Moratuwa</p>
            <p style="margin: 5px 0;">contact@deepthinkers.edu.lk</p>
          </div>
        </div>
      `,
      text: `
Dear ${name},

Thank you for reaching out to our research team. We have received your message regarding ${researchInterest} and will get back to you as soon as possible.

Your message:
${message}

In the meantime, feel free to explore our platform and try out our automata theory conversions.

---
State Forge Research Team
University of Moratuwa
contact@deepthinkers.edu.lk
      `,
    };

    await transporter.sendMail(confirmationMailOptions);

    return NextResponse.json(
      { message: "Email sent successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email. Please try again later." },
      { status: 500 }
    );
  }
}
