import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

console.log('🧪 Testing Hostinger email configuration...\n');
console.log('Host:', process.env.EMAIL_HOST);
console.log('Port:', process.env.EMAIL_PORT);
console.log('User:', process.env.EMAIL_USER);
console.log('Secure: true (SSL/TLS)\n');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: true,  // Port 465 需要 SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// 1. 验证连接
console.log('Step 1: Verifying connection...');
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Connection failed:', error.message);
    process.exit(1);
  } else {
    console.log('✅ Connection successful!\n');
    
    // 2. 发送测试邮件
    console.log('Step 2: Sending test email...');
    transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_TO,
      subject: '🧪 Test Email from Vincent Yu Website',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">Email Configuration Test</h2>
          <p>If you're reading this, your email configuration is working correctly! ✅</p>
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            Sent from: ${process.env.EMAIL_HOST}<br>
            Time: ${new Date().toLocaleString()}
          </p>
        </div>
      `
    }).then(() => {
      console.log('✅ Test email sent successfully!');
      console.log('📧 Check your inbox at:', process.env.EMAIL_TO);
      process.exit(0);
    }).catch(err => {
      console.log('❌ Failed to send test email:', err.message);
      process.exit(1);
    });
  }
});