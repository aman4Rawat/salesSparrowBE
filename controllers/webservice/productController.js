const express = require("express");
const mongoose = require("mongoose");
const Product = mongoose.model("Product");
const Brand = mongoose.model("Brand");
const ProductCatagory = mongoose.model("ProductCatagory");
const ProductGrouping = mongoose.model("ProductGrouping");
// const ProductVarient = mongoose.model("ProductVarient");
const router = express.Router();
const base_url = "https://webservice.salesparrow.in/";
const multer = require("multer");
const jwt = require('jsonwebtoken');
const XLSX = require("xlsx");
const { RateLimitList } = require("twilio/lib/rest/verify/v2/service/rateLimit");

const imageStorage = multer.diskStorage({
  destination: "images/Product_img",
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now());
  },
});

const imageUpload = multer({
  storage: imageStorage,
}).single("product_image");

const imageStorage2 = multer.diskStorage({
  destination: "images/product_excel",
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "_" + Date.now());
  },
});

const imageUpload2 = multer({
  storage: imageStorage2,
}).single("product_excel");

function get_current_date() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var yyyy = today.getFullYear();
    var time =
      today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return (today = yyyy + "-" + mm + "-" + dd + " " + time);
};

router.post('/addProduct',(req,res)=>{
    imageUpload(req, res, async (err) => {
        console.log("file",req.file);
        console.log("body",req.body);
        if (!req.file) return res.status(201).json({ status: true, message: "File not found"});
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        if (!token) return res.json({ status: false, message: "Token is required" });
        let x = token.split(".");
        if (x.length < 3) return res.send({ status: false, message: "Invalid token" });
        var decodedToken = jwt.verify(token, "test");
        var company_id = decodedToken.user_id;
        let mrp = req.body.mrp?req.body.mrp:"";
        let price = req.body.price?req.body.price:"";
        let sku_id = req.body.sku_id?req.body.sku_id:"";
        let packing_details = req.body.packing_details?req.body.packing_details:null;
        let productName = req.body.productName?req.body.productName:"";
        let catagory_id = req.body.catagory_id?req.body.catagory_id:"";
        // let sub_catagory_id = req.body.sub_catagory_id?req.body.sub_catagory_id:"";
        let description = req.body.description?req.body.description:"";
        let hsn_code = req.body.hsn_code?req.body.hsn_code:"";
        let gst = req.body.gst?req.body.gst:"";
        let brand_id = req.body.brand_id?req.body.brand_id:"";
        if(mrp=="") return res.json({status:false,message:"Mrp is required"});
        if(productName=="") return res.json({status:false,message:"Product name is required"})
        if(catagory_id=="") return res.json({status:false,message:"catagory is required"})
        if(brand_id=="") return res.json({status:false,message:"Brand is required"})
        let new_product = new Product({
            catagory_id:catagory_id,
            // sub_catagory_id:sub_catagory_id,
            productName:productName,
            description:description,
            company_id:company_id,
            gst:gst,
            mrp:mrp,
            price:price,
            packing_details:packing_details,
            sku_id:sku_id,
            hsn_code:hsn_code,
            display_image:`${base_url}${req.file.path}`,
            brand_id:brand_id,
            Created_date:get_current_date(),
            Updated_date:get_current_date(),
            status:"Active",
        });
        new_product.save().then(data=>{
            res.json({status:true,message:"Product added successfully",result:data})
        })
    })    
});

router.post('/edit_product',async (req,res)=>{
    imageUpload(req, res, async (err) => {
        let id = req.body.id?req.body.id:"";
        if(id=="") return res.json({status:false,message:"Please provide the id."})
        let product_data = await Product.findOne({_id:id});
        if(!product_data) return res.json({status:false,message:"Please check the id"});
        let updated_product = {};
        if(req.body.productName){
            updated_product.productName = req.body.productName;
        }
        if(req.body.hsn_code){
            updated_product.hsn_code = req.body.hsn_code;
        }
        if(req.body.mrp){
            updated_product.mrp = req.body.mrp;
        }
        if(req.body.packing_details){
            updated_product.packing_details = req.body.packing_details;
        }
        if(req.body.price){
            updated_product.price = req.body.price;
        }
        if(req.body.sku_id){
            updated_product.sku_id = req.body.sku_id;
        }
        if(req.body.description){
            updated_product.description = req.body.description;
        }
        if(req.body.brand_id){
            updated_product.brand_id = req.body.brand_id;
        }
        if(req.body.catagory_id){
            updated_product.catagory_id = req.body.catagory_id;
        }
        // if(req.body.sub_catagory_id){
        //     updated_product.sub_catagory_id = req.body.sub_catagory_id;
        // }
        if(req.body.gst){
            updated_product.gst = req.body.gst;
        }
        if(req.body.status){
            updated_product.status = req.body.status;
        }
        if(req.file){
            updated_product.display_image = `${base_url}${req.file.path}` 
        }
        updated_product.Updated_date = get_current_date();
        Product.findByIdAndUpdate({_id:id},updated_product,{new:true},(err,data)=>{
            if(data) return res.json({ status: true, message: "Updated successfully",result:updated_product});
        })
    })
});

router.post('/get_all_products',async (req,res)=>{
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.json({ status: false, message: "Token is required" });
    let x = token.split(".");
    if (x.length < 3) return res.send({ status: false, message: "Invalid token" });
    var decodedToken = jwt.verify(token, "test");
    var company_id = decodedToken.user_id;
    let catagory_id = req.body.catagory_id?req.body.catagory_id:"";
    // let sub_catagory_id = req.body.catagory_id?req.body.sub_catagory_id:"";
    let brand_id = req.body.brand_id?req.body.brand_id:"";
    let search = req.body.search?req.body.search:"";
    let limit = req.body.limit?req.body.limit:10;
    let list = [];
    let page = req.body.page?req.body.page:"1";
    
    arr =[{company_id},{is_delete:"0"}]
    if(brand_id) arr.push({brand_id})
    if(catagory_id) arr.push({catagory_id})
    // if(sub_catagory_id) arr.push({sub_catagory_id})
    if (search != "") {
        var regex = new RegExp(search, 'i');
        arr.push({productName:regex})
      }
    let count = await Product.find({$and:arr});
    let product_data = await Product.find({$and:arr}).limit(limit*1).sort((page-1)*limit);
    if(product_data.length<1) return res.json({status:true,message:"No data",result:[]});
    let counInfo = 0;
    for(let i = 0;i<product_data.length;i++){
        await (async function (rowData) {
            let catagory_data = await ProductCatagory.findOne({_id:product_data[i].catagory_id});
            let brand_data = await Brand.findOne({_id:product_data[i].brand_id});
            var u_data = {
                id: rowData._id,
                name:rowData.productName,
                brand_name:brand_data.name,
                mrp:rowData.mrp,
                packing_details:rowData.packing_details || [],
                // sku_id:rowData.sku_id,
                price:rowData.price,
                hsn_code:rowData.hsn_code,
                catagory_name:catagory_data.name,
                // description:rowData.description,
                gst:rowData.gst,
                image:rowData.display_image,
                status:rowData.status,
            };
            list.push(u_data);
            // if(product_data[i].sub_catagory_id){
            //     let sub_catagory_data = await ProductCatagory.findOne({_id:product_data[i].sub_catagory_id});
            //     if(sub_catagory_data){
            //         var u_data = {
            //             id: rowData._id,
            //             name:rowData.productName,
            //             brand_name:brand_data.name,
            //             hsn_code:rowData.hsn_code,
            //             catagory_name:catagory_data.name,
            //             sub_catagory_name:sub_catagory_data.name,
            //             description:rowData.description,
            //             gst:rowData.gst,
            //             image:rowData.display_image,
            //             status:rowData.status,
            //         };
            //         list.push(u_data);
            //     }else{
            //         var u_data = {
            //             id: rowData._id,
            //             name:rowData.productName,
            //             brand_name:brand_data.name,
            //             hsn_code:rowData.hsn_code,
            //             catagory_name:catagory_data.name,
            //             sub_catagory_name:"",
            //             description:rowData.description,
            //             gst:rowData.gst,
            //             image:rowData.display_image,
            //             status:rowData.status,
            //         };
            //         list.push(u_data);
            //     }
            // }else{
            //     var u_data = {
            //         id: rowData._id,
            //         name:rowData.productName,
            //         brand_name:brand_data.name,
            //         hsn_code:rowData.hsn_code,
            //         catagory_name:catagory_data.name,
            //         sub_catagory_name:"",
            //         description:rowData.description,
            //         gst:rowData.gst,
            //         image:rowData.display_image,
            //         status:rowData.status,
            //     };
            //     list.push(u_data);
            // }
        })(product_data[i]);
        counInfo++;
        if(counInfo==product_data.length) return res.json({status: true,message: "All Products found successfully",result: list,pageLength: Math.ceil(count.length / limit),count:count.length});
    }
})

router.delete('/delete_product',async (req,res)=>{
    let id = req.body.id ? req.body.id : "";
    if (id == "") return res.json({ status: false, message: "Please provide Id" });
    let product_grp_data = await ProductGrouping.find({product_id:id});
    for(let i = 0;i<product_grp_data.length;i++){
      await ProductGrouping.findOneAndUpdate({product_id:id},{$set:{is_delete:"1"}})
    }
    Product.deleteOne({ _id: id }).exec().then(() => {
      return res.json({ status: true, message: "Deleted successfully" });
    });
})

router.post("/bulk_import_products",(req, res) => {
    imageUpload2(req, res, async (err) => {
        console.log("file",req.file);
        console.log("body",req.body);
        if (!req.file) return res.status(201).json({ status: true, message: "File not found"});
        const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];
      if (!token) return res.json({status: false,message: "Token must be provided",});
      var decodedToken = jwt.verify(token, "test");
      var company_id = decodedToken.user_id;
      var workbook = XLSX.readFile(req.files.product_excel[0].path);
      var sheet_namelist = workbook.SheetNames;
      var x = 0;
      var list = [];
      let countInfo = 0;
      sheet_namelist.forEach(async (element) => {
        var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_namelist[x]]);
        for (let i = 0; i < xlData.length; i++) {
          console.log(xlData[i]);
          var new_product = new Product({
            productName:xlData[i].Product_Name,
            description:xlData[i].Description,
            hsn_code:xlData[i].hsn_code,
            mrp:xlData[i].mrp,
            sku_id:xlData[i].sku_id,
            price:xlData[i].price,
            company_id:company_id,
            gst:xlData[i].GST,
            display_image:xlData[i].Image,
            Created_date: get_current_date(),
            Updated_date: get_current_date(),
            status: "Active",
          });
          new_product.save();
          list.push(new_product);
          countInfo++;
          if(countInfo == xlData.length) return res.status(200).json({status: true,message: "Data imported successfully",result: list,});
        }
        x++;
    });
    })
});

router.post("/product_search", async (req, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.json({ status: false, message: "Token is required" });
    let x = token.split(".");
    if (x.length < 3) return res.send({ status: false, message: "Invalid token" });
    var decodedToken = jwt.verify(token, "test");
    var company_id = decodedToken.user_id;
    var limit = 10;
    let list = [];
    let page = req.body.page?req.body.page:"1";
    var count = await Product.find({$and: [{productName: { $regex: new RegExp(req.body.search,"i") }},{company_id}]});
    try {
        console.log(Math.ceil(count.length));
        let product_data = await Product.find({$and: [{productName: { $regex: new RegExp(req.body.search,"i") }},{company_id}]}).limit(limit*1).skip((page-1)*RateLimitList);
        if(product_data.length<1) return res.json({status:true,message:"No data",result:[]});
        let counInfo = 0;
        for(let i = 0;i<product_data.length;i++){
            await (async function (rowData) {
                let catagory_data = await ProductCatagory.findOne({_id:product_data[i].catagory_id});
                let brand_data = await Brand.findOne({_id:product_data[i].brand_id});
                var u_data = {
                    id: rowData._id,
                    name:rowData.productName,
                    brand_name:brand_data.name,
                    hsn_code:rowData.hsn_code,
                    mrp:rowData.mrp,
                    packing_details:rowData.packing_details,
                    sku_id:rowData.sku_id,
                    price:rowData.price,
                    catagory_name:catagory_data.name,
                    description:rowData.description,
                    gst:rowData.gst,
                    image:rowData.display_image,
                    status:rowData.status,
                };
                list.push(u_data);
            //     if(product_data[i].sub_catagory_id){
            //         let sub_catagory_data = await ProductCatagory.findOne({_id:product_data[i].sub_catagory_id});
            //         if(sub_catagory_data){
            //         var u_data = {
            //             id: rowData._id,
            //             name:rowData.productName,
            //             brand_name:brand_data.name,
            //             hsn_code:rowData.hsn_code,
            //             catagory_name:catagory_data.name,
            //             sub_catagory_name:sub_catagory_data.name,
            //             description:rowData.description,
            //             gst:rowData.gst,
            //             image:rowData.display_image,
            //             status:rowData.status,
            //         };
            //         list.push(u_data);
            //     }else{
            //         var u_data = {
            //             id: rowData._id,
            //             name:rowData.productName,
            //             brand_name:brand_data.name,
            //             hsn_code:rowData.hsn_code,
            //             catagory_name:catagory_data.name,
            //             sub_catagory_name:"",
            //             description:rowData.description,
            //             gst:rowData.gst,
            //             image:rowData.display_image,
            //             status:rowData.status,
            //         };
            //         list.push(u_data);
            //     }
            // }else{
            //     var u_data = {
            //         id: rowData._id,
            //         name:rowData.productName,
            //         brand_name:brand_data.name,
            //         hsn_code:rowData.hsn_code,
            //         catagory_name:catagory_data.name,
            //         sub_catagory_name:"",
            //         description:rowData.description,
            //         gst:rowData.gst,
            //         image:rowData.display_image,
            //         status:rowData.status,
            //     };
            //     list.push(u_data);
            // }
        })(product_data[i]);
        counInfo++;
        if(counInfo==product_data.length) return res.json({status: true,message: "All Products found successfully",result: list,pageLength: Math.ceil(count.length / limit),});
    }
    } catch (error) {
      console.log(error);
      res.status(400).json({ status: false, response: error });
    }
});

// router.post('/products_and_varients',async (req,res)=>{
//     const authHeader = req.headers["authorization"];
//     const token = authHeader && authHeader.split(" ")[1];
//     if (!token) return res.json({ status: false, message: "Token is required" });
//     let x = token.split(".");
//     if (x.length < 3) return res.send({ status: false, message: "Invalid token" });
//     var decodedToken = jwt.verify(token, "test");
//     var company_id = decodedToken.user_id;
//     let catagory_id = req.body.catagory_id?req.body.catagory_id:"";
//     // let sub_catagory_id = req.body.sub_catagory_id?req.body.sub_catagory_id:"";
//     let brand_id = req.body.brand_id?req.body.brand_id:"";
//     let list = [];
//     let biglist = [];
    
//     arr =[{company_id}]
//     if(brand_id) arr.push({brand_id})
//     if(catagory_id) arr.push({catagory_id})
//     // if(sub_catagory_id) arr.push({sub_catagory_id})

//     let product_data = await Product.find({$and:arr});
//     if(product_data.length<1) return res.json({status:true,message:"No data",result:[]});
//     let counInfo = 0;
//     for(let i = 0;i<product_data.length;i++){
//         let product_varient_data = await ProductVarient.find({product_id:product_data[i]._id});
//         console.log("product_varient_data----",product_varient_data)
//         if(product_varient_data.length<1){
//             biglist = [];
//         }else{
//             biglist = [];
//             for(let j = 0 ; j<product_varient_data.length;j++){
//                 await (async function (rowData) {
//                     var u_data1 = {
//                         id: rowData._id,
//                         product_name:product_data[i].productName,
//                         varient_name:rowData.varient_name,
//                         mrp:rowData.mrp,
//                         price:rowData.price,
//                         packing_details:rowData.packing_details,
//                     };
//                     biglist.push(u_data1);
//                 })(product_varient_data[j]);
//             }
//             console.log("biglist--------------",biglist)
//         }
//         await (async function (rowData) {
//             var u_data = {
//                 id: rowData._id,
//                 name:rowData.productName,
//             };
//             list.push({product_details:u_data,varient_details:biglist});
//             console.log("list----------------",list)
//         })(product_data[i]);
//         counInfo++;
//         if(counInfo==product_data.length) return res.json({status: true,message: "All Products found successfully",result: list});
//     }
// })

module.exports = router;