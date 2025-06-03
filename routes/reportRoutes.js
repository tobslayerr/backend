import express from 'express';
import { reportCreator, reportUser, getAllReports, getReportById, updateReport, deleteReport} from '../controllers/reportController.js';
import userAuth from '../middleware/userAuth.js';
import siCreatorOnly from '../middleware/siCreatorOnly.js';

const ReportRouter = express.Router();

ReportRouter.post('/Creator/:Id', userAuth, reportCreator);
ReportRouter.post('/User/:Id', userAuth, siCreatorOnly, reportUser);
ReportRouter.get('/ReadAll', getAllReports);
ReportRouter.get('/Read/:id', getReportById);
ReportRouter.put('/Update/:id', userAuth, updateReport);
ReportRouter.delete('/Delete/:id', userAuth, deleteReport);

export default ReportRouter;