const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const ProductGrouping = mongoose.model("ProductGrouping");
const ProductGroup = mongoose.model("ProductGroup");
const ProductCatagory = mongoose.model("ProductCatagory");
const Product = mongoose.model("Product");
const jwt = require("jsonwebtoken");

function get_current_date() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var yyyy = today.getFullYear();
    var time =
      today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return (today = yyyy + "-" + mm + "-" + dd + " " + time);
};

router.post('/add_product_grp',async (req,res)=>{
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.json({ status: false, message: "Token is required" });
    let x = token.split(".");
    if (x.length < 3) return res.send({ status: false, message: "Invalid token" });
    var decodedToken = jwt.verify(token, "test");
    var company_id = decodedToken.user_id;
    let grp_name = req.body.grp_name?req.body.grp_name:"";
    let grp_description = req.body.grp_description?req.body.grp_description:"";
    let catagory_id = req.body.catagory_id?req.body.catagory_id:"";
    var productIdStr = req.body.productIdStr?req.body.productIdStr:"";
    var productIdArr = productIdStr.split(",");
    if(grp_name=="") return res.json({status:false,message:"Please give Group name"})
    if(grp_description=="") return res.json({status:false,message:"Please give Group description"})
    if(catagory_id=="") return res.json({status:false,message:"Please give Catagory name"})
    if(productIdStr=="") return res.json({status:false,message:"Atleast select one product"})
    let new_product_grp = new ProductGroup({
        grp_name:grp_name,
        grp_description:grp_description,
        catagory_id:catagory_id,
        company_id:company_id,
        Created_date:get_current_date(),
        Updated_date:get_current_date(),
        status:"Active",
    })
    var save_product_grp = await new_product_grp.save();
    for(let i= 0;i<productIdArr.length;i++){
        let product_data = await Product.findOne({_id:productIdArr[i]});
        let new_product_grouping = new ProductGrouping({
            grp_id:save_product_grp._id,
            product_id:product_data._id,
            company_id:company_id,
            productName:product_data.productName,
            Created_date:get_current_date(),
            Updated_date:get_current_date(),
            status:"Active",
        })
        var save_new_product_grouping = await new_product_grouping.save();
    }
    return res.json({status:true,message:"Product group created successfully",result:[save_product_grp,save_new_product_grouping]});

});

router.post('/get_product_grp_list',async (req,res)=>{
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.json({ status: false, message: "Token is required" });
    let x = token.split(".");
    if (x.length < 3) return res.send({ status: false, message: "Invalid token" });
    var decodedToken = jwt.verify(token, "test");
    var company_id = decodedToken.user_id;
    let catagory_id = req.body.catagory_id?req.body.catagory_id:"";
    let page = req.body.page?req.body.page:"1";
    let limit = 10;
    let list = []
    if(catagory_id!=""){
        let count = await ProductGroup.find({$and:[{company_id},{catagory_id}]})
        let product_grp_data = await ProductGroup.find({$and:[{company_id},{catagory_id}]}).limit(limit*1).sort((page-1)*limit)
        if(product_grp_data.length<1) return res.json({status:true,message:"No data",result:[]});
        let counInfo = 0;
        for(let i = 0;i<product_grp_data.length;i++){
            await (async function(rowData){
                let catagory_data = await ProductCatagory.findOne({_id:catagory_id});
                var u_data = {
                    id:rowData._id,
                    grp_name:rowData.grp_name,
                    grp_description:rowData.grp_description,
                    catagory_id:catagory_data.name,
                    status:rowData.status,
                };
                list.push(u_data);
            })(product_grp_data[i])
            counInfo++;
            if(counInfo==product_grp_data.length) return res.json({status: true,message: "All Product groups found successfully",result: list,pageLength: Math.ceil(count.length / limit),});
        }
    }else{
        let count = await ProductGroup.find({$and:[{company_id}]})
        let product_grp_data = await ProductGroup.find({company_id}).limit(limit*1).sort((page-1)*limit)
        if(product_grp_data.length<1) return res.json({status:true,message:"No data",result:[]});
        let counInfo = 0;
        for(let i = 0;i<product_grp_data.length;i++){
            await (async function(rowData){
                let catagory_data = await ProductCatagory.findOne({_id:rowData.catagory_id});
                var u_data = {
                    id:rowData._id,
                    grp_name:rowData.grp_name,
                    grp_description:rowData.grp_description,
                    catagory_id:catagory_data.name,
                    status:rowData.status,
                };
                list.push(u_data);
            })(product_grp_data[i])
            counInfo++;
            if(counInfo==product_grp_data.length) return res.json({status: true,message: "All Product groups found successfully",result: list,pageLength: Math.ceil(count.length / limit),});
        }
    }
})

router.post('/get_grp_data',async (req,res)=>{
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.json({ status: false, message: "Token is required" });
    let x = token.split(".");
    if (x.length < 3) return res.send({ status: false, message: "Invalid token" });
    var decodedToken = jwt.verify(token, "test");
    var company_id = decodedToken.user_id;
    let id = req.body.id?req.body.id:"";
    if(id=="") return res.json({status:false,message:"Please give id"})
    let list = []
    let product_grp_data = await ProductGroup.findOne({_id:id});
    let product_grouping_data = await ProductGrouping.find({grp_id:id,is_delete:"0"});
    if(product_grouping_data.length>0){
        let catagory_data = await ProductCatagory.findOne({_id:product_grp_data.catagory_id});
        for(let i = 0;i<product_grouping_data.length;i++){
            let obj = {id:product_grouping_data[i].product_id,name:product_grouping_data[i].productName}
            list.push(obj);
        }
        let u_data = {
            id:product_grp_data._id,
            grp_name:product_grp_data.grp_name,
            grp_description:product_grp_data.grp_description,
            catagory:{id:catagory_data._id,name:catagory_data.name},
            products:list
        }
        return res.json({status:true,message:"Data found",result:u_data})
    }else{
        let catagory_data = await ProductCatagory.findOne({_id:product_grp_data.catagory_id});
        let u_data = {
            grp_name:product_grp_data.grp_name,
            grp_description:product_grp_data.grp_description,
            catagory:{id:catagory_data._id,name:catagory_data.name},
            products:[]
        }
        return res.json({status:true,message:"Data found",result:u_data})
    }
});

router.post('/edit_product_group',async (req,res)=>{
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.json({ status: false, message: "Token is required" });
    let x = token.split(".");
    if (x.length < 3) return res.send({ status: false, message: "Invalid token" });
    var decodedToken = jwt.verify(token, "test");
    var company_id = decodedToken.user_id;
    let id = req.body.id?req.body.id:"";
    let data = await ProductGroup.findOne({_id:id});
    let updated_grp = {};
    if(req.body.grp_name){
        updated_grp.grp_name = req.body.grp_name;
    }
    if(req.body.grp_description){
        updated_grp.grp_description = req.body.grp_description;
    }
    updated_grp.Updated_date = get_current_date();
    await ProductGroup.findByIdAndUpdate({_id:id},updated_grp,{new:true});
    if(req.body.productIdStr!=""){
        await ProductGrouping.deleteMany({grp_id:id});
    var productIdStr = req.body.productIdStr?req.body.productIdStr:"";
    var productIdArr = productIdStr.split(",");
    console.log(productIdArr.length);
    var list = []
    if(productIdArr.length<1){
        console.log("inside if");
        return res.json({status:true,message:"Updated successfully",result:updated_grp})
    }else{
        console.log(productIdArr);
        console.log("inside else");
        for(let i= 0;i<productIdArr.length;i++){
            let product_data = await Product.findOne({_id:productIdArr[i]});
            let new_product_grouping = new ProductGrouping({
                grp_id:data._id,
                product_id:product_data._id,
                company_id:company_id,
                productName:product_data.productName,
                Created_date:get_current_date(),
                Updated_date:get_current_date(),
                status:"Active",
            })
            var save_new_product_grouping = await new_product_grouping.save();
            list.push(new_product_grouping)
        }
        console.log(list);
        return res.json({status:true,message:"Updated successfully",result:[updated_grp,list]})
    }
    }else{
        await ProductGrouping.deleteMany({grp_id:id});
        return res.json({status:true,message:"Updated successfully",result:updated_grp})
    }
});

router.delete('/delete_product_grp',async (req,res)=>{
    let id = req.body.id?req.body.id:"";
    if(id=="") return res.json({status:false,message:"Please give the id"})
    await ProductGrouping.deleteMany({grp_id:id});
    await ProductGroup.deleteOne({_id:id});
    return res.json({status:true,message:"Deleted successfully"})
})

module.exports = router;