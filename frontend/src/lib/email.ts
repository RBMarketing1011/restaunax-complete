import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '465'),
  secure: process.env.EMAIL_SERVER_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

export const sendVerificationEmail = async (email: string, token: string) =>
{
  const verificationUrl = `${ process.env.NEXTAUTH_URL }/auth/verify-email?token=${ token }`

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verify your RestaunaX account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1976d2; margin: 0;">RestaunaX</h1>
          <p style="color: #666; margin: 5px 0 0 0;">Restaurant Order Management</p>
        </div>
        
        <div style="background-color: #f5f5f5; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
          <h2 style="color: #333; margin: 0 0 20px 0;">Verify Your Email Address</h2>
          <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0;">
            Thank you for signing up for RestaunaX! Please click the button below to verify your email address and activate your account.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${ verificationUrl }" 
               style="background-color: #1976d2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin: 20px 0 0 0; font-size: 14px;">
            If the button doesn't work, you can copy and paste this link into your browser:<br>
            <a href="${ verificationUrl }" style="color: #1976d2; word-break: break-all;">${ verificationUrl }</a>
          </p>
        </div>
        
        <div style="text-align: center; color: #999; font-size: 12px;">
          <p>This verification link will expire in 24 hours.</p>
          <p>If you didn't create an account with RestaunaX, you can safely ignore this email.</p>
        </div>
      </div>
    `,
  }

  try
  {
    await transporter.sendMail(mailOptions)
    console.log('Verification email sent successfully to:', email)
    return { success: true }
  } catch (error)
  {
    console.error('Error sending verification email:', error)
    return { success: false, error }
  }
}

export const sendWelcomeEmail = async (email: string, name: string) =>
{
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Welcome to RestaunaX!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1976d2; margin: 0;">RestaunaX</h1>
          <p style="color: #666; margin: 5px 0 0 0;">Restaurant Order Management</p>
        </div>
        
        <div style="background-color: #f5f5f5; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
          <h2 style="color: #333; margin: 0 0 20px 0;">Welcome to RestaunaX, ${ name }!</h2>
          <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0;">
            Your email has been verified successfully! You can now access your RestaunaX dashboard and start managing your restaurant orders.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${ process.env.NEXTAUTH_URL }/auth/signin" 
               style="background-color: #4caf50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Sign In to Dashboard
            </a>
          </div>
          
          <div style="background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin: 0 0 15px 0;">What you can do with RestaunaX:</h3>
            <ul style="color: #666; line-height: 1.6; margin: 0; padding-left: 20px;">
              <li>Track and manage orders in real-time</li>
              <li>Update order statuses with one click</li>
              <li>View detailed order information</li>
              <li>Create new orders quickly</li>
            </ul>
          </div>
        </div>
        
        <div style="text-align: center; color: #999; font-size: 12px;">
          <p>Thank you for choosing RestaunaX for your restaurant management needs!</p>
        </div>
      </div>
    `,
  }

  try
  {
    await transporter.sendMail(mailOptions)
    console.log('Welcome email sent successfully to:', email)
    return { success: true }
  } catch (error)
  {
    console.error('Error sending welcome email:', error)
    return { success: false, error }
  }
}
