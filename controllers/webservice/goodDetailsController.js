const express = require("express");
const mongoose = require("mongoose");
const GoodDetails = mongoose.model("GoodDetails");
const router = express.Router();
const base_url = "https://webservice.salesparrow.in/";
const multer = require("multer");

const imageStorage = multer.diskStorage({
  destination: "images/Goods_image",
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now());
  },
});

const imageUpload = multer({
  storage: imageStorage,
});

function get_current_date() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var yyyy = today.getFullYear();
    var time =
      today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return (today = yyyy + "-" + mm + "-" + dd + " " + time);
};

router.post('/addGoodDetails',imageUpload.fields([{name:"goods_image"}]),(req,res)=>{
    var catagory_id = req.body.catagory_id?req.body.catagory_id:"";
    var product = req.body.product?req.body.product:"";
    var distributor_id = req.body.distributor_id?req.body.distributor_id:"";
    var return_quantity = req.body.return_quantity?req.body.return_quantity:"";
    var amount = req.body.amount?req.body.amount:"";
    var order_invoice = req.body.order_invoice?req.body.order_invoice:"";
    var return_date = req.body.return_date?req.body.return_date:"";
    var return_reason = req.body.return_reason?req.body.return_reason:"";
    var saleman_id = req.body.saleman_id?req.body.saleman_id:"";
    var depriciation = req.body.depriciation?req.body.depriciation:"";
    var description = req.body.description?req.body.description:"";
    if(catagory_id!=""){
        if(product!=""){
            if(distributor_id!=""){
                if(return_quantity!=""){
                    if(amount!=""){
                        if(order_invoice!=""){
                            if(return_date!=""){
                                if(saleman_id!=""){
                                    if(depriciation!=""){
                                        var new_good_details = new GoodDetails({
                                            catagory_id:catagory_id,
                                            product:product,
                                            distributor_id:distributor_id,
                                            return_quantity:return_quantity,
                                            amount:amount,
                                            order_invoice:order_invoice,
                                            return_date:return_date,
                                            return_reason:return_reason,
                                            saleman_id:saleman_id,
                                            depriciation:depriciation,
                                            description:description,
                                            image:base_url + req.files.goods_image[0].path,
                                            Created_date:get_current_date(),
                                            Updated_date:get_current_date(),
                                            status:"Active"
                                        });
                                        new_good_details.save().then(data=>{
                                            res.status(200).json({
                                                status:true,
                                                message:"Good Details are created successfully",
                                                result:data,
                                            });
                                        })
                                    }else{
                                        res.json({
                                            status:false,
                                            message:"Depriciation must be specified"
                                        })
                                    }
                                }else{
                                    res.json({
                                        status:false,
                                        message:"saleman must be specified"
                                    })
                                }
                            }else{
                                res.json({
                                    status:false,
                                    message:"return date must be specified"
                                })
                            }
                        }else{
                            res.json({
                                status:false,
                                message:"order invoice must be specified"
                            })
                        }
                    }else{
                        res.json({
                            status:false,
                            message:"amount must be specified"
                        })
                    }
                }else{
                    res.json({
                        status:false,
                        message:"return quantity must be specified"
                    })
                }
            }else{
                res.json({
                    status:false,
                    message:"distributor id must be specified"
                })
            }
        }else{
            res.json({
                status:false,
                message:"product must be specified"
            })
        }
    }else{
        res.json({
            status:false,
            message:"catagory id must be specified"
        })
    }

});

router.patch('/editGoodDetails',(req,res)=>{
    var id = req.body.id?req.body.id:"";
    GoodDetails.find({_id:id}).exec().then(goods_data=>{
        var updated_goods = {};
        if(req.body.catagory_id){
            updated_goods.catgory_id = req.body.catagory_id;
        }
        if(req.body.product){
            updated_goods.product = req.body.product;
        }
        if(req.body.distributor_id){
            updated_goods.distributor_id = req.body.distributor_id;
        }
        if(req.body.amount){
            updated_goods.amount = req.body.amount;
        }
        if(req.body.return_quantity){
            updated_goods.return_quantity = req.body.return_quantity;
        }
        if(req.body.return_date){
            updated_goods.return_date = req.body.return_date;
        }
        if(req.body.return_reason){
            updated_goods.return_reason = req.body.return_reason;
        }
        if(req.body.order_invoice){
            updated_goods.order_invoice = req.body.order_invoice;
        }
        if(req.body.saleman_id){
            updated_goods.saleman_id = req.body.saleman_id;
        }
        if(req.body.depriciation){
            updated_goods.depriciation = req.body.depriciation;
        }
        if(req.body.description){
            updated_goods.description = req.body.description;
        }
        updated_goods.Updated_date = get_current_date();
        GoodDetails.findOneAndUpdate({_id:id},updated_goods,{new:true},(err,doc)=>{
            if(doc){
                res.json({
                    status:true,
                    message:"Goods Details updated successfully",
                    details:updated_goods
                })
            }else{
                res.json({
                    status:false,
                    message:"Error occured during updation"
                })
            }
        })
    })
});

router.get('/getAllGoodDetails',(req,res)=>{
    GoodDetails.find().exec().then(goods_data=>{
        res.json({
            status:true,
            message:"Get successfully",
            result:goods_data
        })
    })
});

router.get('/getGoodDetails',(req,res)=>{
    var id = req.body.id?req.body.id:"";
    GoodDetails.find({_id:id}).exec().then(data=>{
        res.json({
            status:true,
            message:"Get successfully",
            result:data
        })
    })
})

module.exports = router;