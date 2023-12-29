const express = require("express");
const mongoose = require("mongoose");
const Card = mongoose.model("Card")
const router = express.Router();

function get_current_date() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var yyyy = today.getFullYear();
    var time =
      today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return (today = yyyy + "-" + mm + "-" + dd + " " + time);
};

router.post('/addCard',(req,res)=>{
 var card_holder_name = req.body.card_holder_name?req.body.card_holder_name:"";
 var card_number = req.body.card_number?req.body.card_number:"";
 var expiry_date = req.body.expiry_date?req.body.expiry_date:"";
 if(card_holder_name!=""){
    if(card_number!=""){
        if(expiry_date!=""){
            Card.find({card_number}).exec().then(card_data=>{
                if(card_data.length<1){
                    var new_card = new Card({
                        card_holder_name:card_holder_name,
                        card_number:card_number,
                        expiry_date:expiry_date,
                        status:"Active",
                        Created_date:get_current_date(),
                        Updated_date:get_current_date()
                    });
                    new_card.save().then(data=>{
                        res.status(200).json({
                            status:true,
                            message:"Card added successfully",
                            details:data
                        })
                    })
                }else{
                    res.json({
                        status:false,
                        message:"Card already existed"
                    })
                }
            })
        }else{
            res.json({
                status:false,
                message:"Expiry Date must be entered"
            })
        }
    }else{
        res.json({
            status:false,
            message:"Card Number must be entered"
        })
    }
 }else{
    res.json({
        status:false,
        message:"Card Holders Name must be entered"
    })
 }
});

router.get('/getAllCards',(req,res)=>{
    Card.find().exec().then(card_data=>{
        res.json({
            status:true,
            message:"Cards found successfully",
            result:card_data
        })
    })
})

router.get('/getCard',(req,res)=>{
    var id = req.body.id?req.body.id:"";
    Card.find({_id:id}).exec().then(card_data=>{
        res.json({
            status:true,
            message:"Cards found successfully",
            result:card_data
        })
    })
})

module.exports = router;