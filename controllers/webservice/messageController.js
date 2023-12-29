const express = require("express");
const router = express.Router();
const sid = "ACc3f03d291aaa9b78b8088eb0b77bf616";
const auth_token = "b3fe57ba87c47dc3a3c5b041c6a35191";
const twilio = require("twilio")(sid,auth_token);
// const wbm = require("wbm")

router.post('/sendText',(req,res)=>{
    var message = req.body.message?req.body.message:"";
    var to_phone_number = req.body.to_phone_number?req.body.to_phone_number:"";
    if(message!=""){
        if(to_phone_number!=""){
            twilio.messages.create({
                from:"+18505186447",
                to:to_phone_number,
                body:message,
            }).then(()=>{
                res.json({
                    status:true,
                    message:"Message has been sent",
                })
            }).catch((err)=>{
                console.log(err);
                res.json({
                    status:false,
                    message:"There is some error."
                })
            })
        }else{
            res.json({
                status:false,
                message:"Phone number is required"
            })
        }
    }else{
        res.json({
            status:false,
            message:"Message is required"
        })
    }
});

router.post('/sendWhatsappMessage',(req,res)=>{
    var phone_numbers = req.body.number?req.body.number:"";
    var mes = req.body.message?req.body.message:"";
    if(phone_numbers!=""){
        if(mes!=""){
            /*wbm.start().then(async () => {
                const phones = ['8787058645','9568789476'];
                const message = 'hello there';
                await wbm.send(phones, message);
                await wbm.end();
            })*/
            twilio.messages.create({
                from:"whatsapp:+14155238886",
                to:'whatsapp:+918787058645',
                body:mes,
            }).then(()=>{
                res.json({
                    status:true,
                    message:"Message has been sent",
                })
            }).catch((err)=>{
                console.log(err);
                res.json({
                    status:false,
                    message:"There is some error."
                })
            })
        }else{
            res.json({
                status:false,
                message:"Message is required"
            })
        }
    }else{
        res.json({
            status:false,
            message:"Phone Number is required"
        })
    }
})

module.exports = router;