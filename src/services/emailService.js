import nodemailer from 'nodemailer';

// 创建邮件传输器
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: true,  // ✅ Port 465 需要设置为 true
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// 发送联系表单邮件
export async function sendContactEmail({ name, email, phone, message }) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO,
    subject: `💬 New Contact Form Submission from ${name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .field { margin-bottom: 20px; }
          .label { font-weight: 600; color: #4a5568; margin-bottom: 5px; }
          .value { background: white; padding: 12px; border-radius: 6px; border-left: 4px solid #667eea; }
          .message-box { background: white; padding: 20px; border-radius: 6px; border: 1px solid #e5e7eb; white-space: pre-wrap; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0;">New Contact Form Submission</h2>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Someone wants to collaborate!</p>
          </div>
          
          <div class="content">
            <div class="field">
              <div class="label">👤 Name:</div>
              <div class="value">${name}</div>
            </div>
            
            <div class="field">
              <div class="label">📧 Email:</div>
              <div class="value"><a href="mailto:${email}">${email}</a></div>
            </div>
            
            ${phone ? `
            <div class="field">
              <div class="label">📱 Phone:</div>
              <div class="value"><a href="tel:${phone}">${phone}</a></div>
            </div>
            ` : ''}
            
            <div class="field">
              <div class="label">💬 Message:</div>
              <div class="message-box">${message}</div>
            </div>
            
            <div class="footer">
              <p>Received on ${new Date().toLocaleString('en-NZ', { timeZone: 'Pacific/Auckland' })}</p>
              <p>Reply directly to this email to contact ${name}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    replyTo: email
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw error;
  }
}

// 测试邮件配置
export async function testEmailConnection() {
  try {
    await transporter.verify();
    console.log('✅ Email server is ready to send messages');
    return true;
  } catch (error) {
    console.error('❌ Email server connection failed:', error);
    return false;
  }
}