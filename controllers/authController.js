import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import userModel from "../models/userModel.js"
import transporter from "../config/nodemailer.js"
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from "../config/emailTemplates.js"

export const register = async (req, res)=> {
    
    const {name, email, password} = req.body

    if(!name || !email || !password) {
        return res.status(400).json({success: false, message: 'Missing Details'})
    }

    try {
        const existingUser = await userModel.findOne({email})

        if(existingUser) {
            return res.status(400).json({success: false, message: "User already exists"})
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = new userModel({name, email, password: hashedPassword})
        await user.save()

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, { expiresIn: '7d'})

        // Konfigurasi cookie yang benar untuk Vercel
        res.cookie('token', token, { 
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Perubahan dari 'strict' ke 'lax'/'none'
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/'
        })
        
        // Sending email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to SiEvent',
            text: `Welcome to sievent website. your account has been created with email id: ${email}`
        }
        
        // Try-catch untuk handling error pada pengiriman email
        try {
            await transporter.sendMail(mailOptions)
        } catch (emailError) {
            console.error("Email sending failed:", emailError);
            // Lanjutkan eksekusi walaupun email gagal terkirim
        }
     
        // Tambahkan token dalam response sebagai fallback
        return res.status(201).json({
            success: true, 
            token: token, // Token sebagai fallback jika cookie bermasalah
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isAccountVerified: user.isAccountVerified
            }
        })

    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({success: false, message: error.message})
    }
}

export const login = async (req, res)=> {
    const {email, password} = req.body

    if(!email || !password) {
        return res.status(400).json({success: false, message: 'Email and password are required'})
    }

    try {
        const user = await userModel.findOne({email})

        if (!user) {
            return res.status(401).json({success: false, message: 'Invalid email or password'})
        } 

        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(401).json({success: false, message: 'Invalid email or password'})
        }
        
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, { expiresIn: '7d'})

        // Konfigurasi cookie yang benar untuk Vercel
        res.cookie('token', token, { 
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Perubahan dari 'strict' ke 'lax'/'none'
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 hari dalam milidetik
        })

        // Tambahkan token dalam response sebagai fallback
        return res.status(200).json({
            success: true,
            token: token, // Token sebagai fallback jika cookie bermasalah
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isAccountVerified: user.isAccountVerified
            }
        })

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({success: false, message: error.message})
    }
}

export const logout = async (req, res)=> {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Perubahan dari 'strict' ke 'lax'/'none'
            path: '/' // Penting untuk memastikan cookie dihapus dengan benar
        })

        return res.status(200).json({success: true, message: "Logged Out"})

    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({success: false, message: error.message})
    }
}

export const sendVerifyOtp = async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const user = req.user; // ✅ user sudah ada dari middleware

    if (user.isAccountVerified) {
      return res.status(400).json({ success: false, message: "Account already verified" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: 'Account Verification OTP',
      html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
    };

    // Try-catch untuk handling error pada pengiriman email
    try {
        await transporter.sendMail(mailOption);
    } catch (emailError) {
        console.error("Email sending failed:", emailError);
        // Lanjutkan eksekusi walaupun email gagal terkirim
    }
    
    return res.status(200).json({ success: true, message: 'Verification OTP sent to email' });
  } catch (error) {
    console.error("Send verification OTP error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
    const userId = req.user?._id;
    const { otp } = req.body;

    if (!userId || !otp) {
        return res.status(400).json({ success: false, message: 'Missing Details' });
    }

    try {
        const user = await userModel.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        if (!user.verifyOtp || user.verifyOtp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        if (user.verifyOtpExpireAt < Date.now()) {
            return res.status(400).json({ success: false, message: 'OTP expired' });
        }

        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;

        await user.save();
        return res.status(200).json({ success: true, message: 'Email verified successfully' });
    } catch (error) {
        console.error("Email verification error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// CHECK IF USER IS AUTHENTICATED 
export const isAuthenticated = async (req, res, next) => {
  try {
    // Logging untuk debug
    console.log("Cookies:", req.cookies);
    console.log("Authorization header:", req.headers.authorization);
    
    // Periksa token dari berbagai sumber
    const token = 
      req.cookies?.token || 
      req.headers.authorization?.split(" ")[1] || 
      req.body.token || 
      req.query.token; // Tambahkan support untuk token di query params

    console.log("Token found:", !!token);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please log in.",
      });
    }

    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Cari user dengan ID dari token
    const user = await userModel.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please log in again.",
      });
    }

    // Pasang user ke objek request
    req.user = user;
    
    // Lanjut ke middleware berikutnya
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please log in again.",
      });
    }
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please log in again.",
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Authentication error. Please try again.",
    });
  }
};

// Route untuk cek autentikasi (is-auth)
export const checkAuth = async (req, res) => {
  try {
    // req.user sudah tersedia dari middleware isAuthenticated
    return res.status(200).json({
      success: true,
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        isAccountVerified: req.user.isAccountVerified
      },
      message: "User authenticated"
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return res.status(500).json({
      success: false,
      message: "Error checking authentication: " + error.message
    });
  }
};

// Send Password reset otp
export const sendResetOtp = async (req, res) => {
    const {email} = req.body

    if (!email) {
        return res.status(400).json({success: false, message: 'Email is required'})
    }

    try {
        const user = await userModel.findOne({email})
        if (!user) {
            return res.status(404).json({success: false, message: 'User not found'})
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000))

        user.resetOtp = otp
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000

        await user.save()

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password Reset OTP',
            html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
        }

        // Try-catch untuk handling error pada pengiriman email
        try {
            await transporter.sendMail(mailOption)
        } catch (emailError) {
            console.error("Email sending failed:", emailError);
            // Lanjutkan eksekusi walaupun email gagal terkirim
        }

        return res.status(200).json({success: true, message: 'OTP sent to your email'})

    } catch (error) {
        console.error("Send reset OTP error:", error);
        return res.status(500).json({success: false, message: error.message})
    }
}

// RESET USER PASSWORD
export const resetPassword = async (req, res)=> {
    const {email, otp, newPassword} = req.body

    if (!email || !otp || !newPassword) {
        return res.status(400).json({success: false, message: 'Email, OTP, and new password are required'})
    }
    
    try {
        const user = await userModel.findOne({email})
        if (!user) {
          return res.status(404).json({success: false, message: 'User not found'})
        }

        if (user.resetOtp === "" || user.resetOtp !== otp) {
          return res.status(400).json({success: false, message: 'Invalid OTP'})
        }

        if (user.resetOtpExpireAt < Date.now()) {
          return res.status(400).json({success: false, message: 'OTP expired'})  
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)

        user.password = hashedPassword
        user.resetOtp = ''
        user.resetOtpExpireAt = 0

        await user.save()

        return res.status(200).json({success: true, message: 'Password has been reset successfully'})

    } catch (error) {
        console.error("Reset password error:", error);
        return res.status(500).json({success: false, message: error.message})
    }
}
