export default function siCreatorOnly(req, res, next) {
  if (!req.user || !req.user.isSiCreator) {
    return res.status(403).json({ 
      success: false, 
      message: "Only SiCreators can perform this action." 
    });
  }
  next();
}
