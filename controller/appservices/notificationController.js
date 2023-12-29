const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {extractEmployeeId} = require('../../middleware/response')
const Notification = mongoose.model('Notification');


router.get('/notificationListing',extractEmployeeId,async (req,res)=>{
    const employee_id = req.employee_id;
    let notification_data = await Notification.find({employee_id,is_delete:"0"});
    if(notification_data.length<1) return res.json({status:false,message:"No notification for today",result:[]})
    return res.json({status:true,message:"Notifications for today",result:notification_data})
})

module.exports = router;