const express = require("express");
// const fetch = require("node-fetch");
// import {fetch} from 'node-fetch'
const axios = require('axios');
const cron = require('cron');
const router = express.Router();
const extractCompanyId = require('../../middleware/response')
const mongoose = require("mongoose")
const Notification = mongoose.model("Notification")
const Employee = mongoose.model("Employee")

function get_current_date() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var yyyy = today.getFullYear();
    var time =
      today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return (today = yyyy + "-" + mm + "-" + dd + " " + time);
  }

router.post('/sendNotification', async (req, res) => {
  let title = req.body.title ? req.body.title : ""
  let date = get_current_date().split(" ")[0]
  let body = req.body.body ? req.body.body : ""
  let employee_id = req.body.employee_id ? req.body.employee_id : '';
  let employee_id_arr = employee_id.split(",")
  if (title == "") return res.json({ status: false, message: "Please specify the Title" })
  if (body == "") return res.json({ status: false, message: "Please specify the Body" })
  if (employee_id_arr.length < 1) return res.json({ status: false, message: "Please select atleast one employee" })
  for (let i = 0; i < employee_id_arr.length; i++) {
    let emp_data = await Employee.findOne({ _id: employee_id_arr[i], is_delete: "0" });
    if (!emp_data) return res.json({ status: false, message: "No such employee exist" })
    const serverKey = 'AAAAsyam19w:APA91bFDSeC_Jv90_QVlbjXwGTHMgzrX4G2RzBhWld9mNPGTXcx9IxfbyzxAbxe31f3omK5YxN2nP1CbGPYKKOlUc5XPU1m8B2j85sM2-_27p0fP7LaQfg1dvqjywNvysEy95CBPyZYo'; // Replace with your FCM server key
    // const serverKey = 'AAAAjqlaFzM:APA91bHb6nv87gRpzvSIb0AA-J9jyDLnahcblB-kPciQLBBChtE6AbqwFW3QlwqaFpq156T4vLij3eQ5ryBmexDe5i_K7u728_GWb8JXdgM-oki6OjQaiKRLXysnI8S2f7bjzPZ0jEec'; 
    const fcmEndpoint = 'https://fcm.googleapis.com/fcm/send';

    const payload = {
      priority: 'high',
      notification: {
        title: title,
        body: body,
      },
      to: emp_data.deviceToken
      // to:'dqmyxPiJTuamd7CAWIyEIJ:APA91bEzRNJtjfEHUc35HMcFqjuNyNxjoUDSBi1vJGyf-_lnQbwc9EKumUieFOfpGpeSblFyv64au4xFA62DhnS_o3znBPsFqt3l3YZg4k1qJFTAMJ3YhetMnyfyObr1n3WSLwvzjp9D'
    };

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `key=${serverKey}`,
    };
    axios.post(fcmEndpoint, payload, { headers })
      .then(async (response) => {
        let new_notification = await Notification.create({
          company_id: emp_data.companyId,
          employee_id,
          date: date,
          title,
          body,
        })
        console.log('Notification sent successfully:', response.data);
      })
      .catch(error => {
        console.error('Error sending notification:', error);
      });
    }
    return res.json({ status: true, message: "Notification send seccessfully" })

  // let deviceToken = emp_data.devicToken;
  // let fcm_token = ['dqmyxPiJTuamd7CAWIyEIJ:APA91bEzRNJtjfEHUc35HMcFqjuNyNxjoUDSBi1vJGyf-_lnQbwc9EKumUieFOfpGpeSblFyv64au4xFA62DhnS_o3znBPsFqt3l3YZg4k1qJFTAMJ3YhetMnyfyObr1n3WSLwvzjp9D'];
  // let notification_body = {
  //     'notification': {
  //         'title':title,
  //         'text':body
  //     },
  //     'registration': fcm_token
  // }
  // fetch('https://fcm.googleapis.com/fcm/send',{
  //     'method':'POST',
  //     'headers':{
  //         'Authorization':'key='+'AAAAjqlaFzM:APA91bHb6nv87gRpzvSIb0AA-J9jyDLnahcblB-kPciQLBBChtE6AbqwFW3QlwqaFpq156T4vLij3eQ5ryBmexDe5i_K7u728_GWb8JXdgM-oki6OjQaiKRLXysnI8S2f7bjzPZ0jEec',
  //         'Content-Type':'application/json'
  //     },
  //     'body':JSON.stringify(notification_body)
  // }).then(async ()=>{
  //     const new_notification = await Notification.create({
  //         company_id,
  //         employee_id,
  //         date:date,
  //         title,
  //         body,
  //     })
  //     res.json({status:true,message:"Notification send successfully"})
  // }).catch((err)=>{
  //     res.json({status:false,message:"Something went wrong"})
  //     console.log('error--',err)
  // })
})

// deleting notification after 3 Days------------------


const job = new cron.CronJob('0 0 */3 * * *', async function() {
    const today = new Date();
    const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)
    await Notification.deleteMany({time:{$lt:threeDaysAgo}});
    // console.log(`Deleted ${recordsToDelete.length} records.`);
});
  
// Start the cron job

job.start();

// job.on('error', function(error) {
// console.error('Cron job error:', error);
// });
  



module.exports = router;