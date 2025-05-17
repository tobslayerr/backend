export const EMAIL_VERIFY_TEMPLATE = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Verify Your Email</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap" rel="stylesheet" />
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: 'Open Sans', sans-serif;
        background: linear-gradient(to bottom right, #bfdbfe, #ffffff, #bfdbfe);
      }

      .container {
        max-width: 500px;
        margin: 60px auto;
        background-color: #ffffff;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }

      .header {
        background-color: #1e3a8a;
        color: #ffffff;
        text-align: center;
        padding: 20px 0;
        font-size: 24px;
        font-weight: 600;
      }

      .content {
        padding: 30px;
        color: #111827;
      }

      .content p {
        font-size: 15px;
        line-height: 1.6;
      }

      .otp-box {
        background-color: #22D172;
        color: #ffffff;
        padding: 12px 0;
        text-align: center;
        font-size: 20px;
        font-weight: bold;
        border-radius: 8px;
        margin: 20px 0;
        letter-spacing: 2px;
      }

      .footer {
        text-align: center;
        font-size: 13px;
        color: #6b7280;
        padding: 20px;
      }

      @media (max-width: 480px) {
        .container {
          margin: 20px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">SiEvent</div>
      <div class="content">
        <h2>Verify Your Email</h2>
        <p>Hi there,</p>
        <p>You are just one step away from verifying your email: <strong style="color: #3b82f6;">{{email}}</strong>.</p>
        <p>Please use the following OTP to complete your verification:</p>
        <div class="otp-box">{{otp}}</div>
        <p>This OTP is valid for <strong>24 hours</strong>.</p>
      </div>
      <div class="footer">
        &copy; SiEvent. All rights reserved.
      </div>
    </div>
  </body>
</html>
`;

export const PASSWORD_RESET_TEMPLATE = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Password Reset</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap" rel="stylesheet" />
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: 'Open Sans', sans-serif;
        background: linear-gradient(to bottom right, #bfdbfe, #ffffff, #bfdbfe);
      }

      .container {
        max-width: 500px;
        margin: 60px auto;
        background-color: #ffffff;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }

      .header {
        background-color: #1e3a8a;
        color: #ffffff;
        text-align: center;
        padding: 20px 0;
        font-size: 24px;
        font-weight: 600;
      }

      .content {
        padding: 30px;
        color: #111827;
      }

      .content p {
        font-size: 15px;
        line-height: 1.6;
      }

      .otp-box {
        background-color: #22D172;
        color: #ffffff;
        padding: 12px 0;
        text-align: center;
        font-size: 20px;
        font-weight: bold;
        border-radius: 8px;
        margin: 20px 0;
        letter-spacing: 2px;
      }

      .footer {
        text-align: center;
        font-size: 13px;
        color: #6b7280;
        padding: 20px;
      }

      @media (max-width: 480px) {
        .container {
          margin: 20px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">SiEvent</div>
      <div class="content">
        <h2>Password Reset Request</h2>
        <p>Hello,</p>
        <p>We received a request to reset the password for your account: <strong style="color: #3b82f6;">{{email}}</strong>.</p>
        <p>Use the OTP below to proceed:</p>
        <div class="otp-box">{{otp}}</div>
        <p>This OTP is valid for <strong>15 minutes</strong>.</p>
      </div>
      <div class="footer">
        &copy; SiEvent. All rights reserved.
      </div>
    </div>
  </body>
</html>
`;
