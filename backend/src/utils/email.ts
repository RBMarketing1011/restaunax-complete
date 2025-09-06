import nodemailer, { Transporter } from 'nodemailer'

// Create transporter
const createTransporter = (): Transporter =>
{
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || '465'),
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  })
}

export const sendVerificationEmail = async (email: string, name: string, verificationToken: string): Promise<any> =>
{
  try
  {
    const transporter = createTransporter()

    const verificationUrl = `${ process.env.CORS_ORIGIN }/auth/verify-email?token=${ verificationToken }`

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Verify your RestaunaX account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to RestaunaX, ${ name }!</h2>
          <p>Thank you for creating an account with us. Please click the button below to verify your email address:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${ verificationUrl }" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #666;">${ verificationUrl }</p>
          <p>This link will expire in 24 hours for security reasons.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">If you didn't create this account, please ignore this email.</p>
        </div>
      `
    }

    const result = await transporter.sendMail(mailOptions)
    return result
  }
  catch (error)
  {
    console.error('Error sending verification email:', error)
    throw error
  }
}

export const sendPasswordResetEmail = async (email: string, name: string, resetToken: string): Promise<any> =>
{
  try
  {
    const transporter = createTransporter()

    const resetUrl = `${ process.env.CORS_ORIGIN }/reset-password?token=${ resetToken }`

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Reset your RestaunaX password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello ${ name },</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${ resetUrl }" style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #666;">${ resetUrl }</p>
          <p>This link will expire in 1 hour for security reasons.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
        </div>
      `
    }

    const result = await transporter.sendMail(mailOptions)
    return result
  }
  catch (error)
  {
    console.error('Error sending password reset email:', error)
    throw error
  }
}
