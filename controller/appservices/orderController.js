const express = require("express");
const mongoose = require("mongoose");
const Employee = mongoose.model("Employee");
const Product = mongoose.model("Product");
const Order = mongoose.model("Order");
const ProductCatagory = mongoose.model("ProductCatagory");
const PartyGrouping = mongoose.model("PartyGrouping");
const PriceList = mongoose.model("PriceList");
const Mapping = mongoose.model("Mapping");
const Brand = mongoose.model("Brand");
const Party = mongoose.model("Party");
// const ProductVarient = mongoose.model("ProductVarient");
const OrderItem = mongoose.model("OrderItem");
const router = express.Router();
const base_url = "https://webservice.salesparrow.in/";
const jwt = require("jsonwebtoken");

function get_current_date() {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0");
  var yyyy = today.getFullYear();
  var time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  return (today = yyyy + "-" + mm + "-" + dd + " " + time);
}

// router.post("/get_all_product_catagory",async (req, res) => {
//     const authHeader = req.headers["authorization"];
//     const token = authHeader && authHeader.split(" ")[1];
//     if (!token)
//       return res.json({ status: false, message: "Token is required" });
//     let x = token.split(".");
//     if (x.length < 3)
//       return res.send({ status: false, message: "Invalid token" });
//     var decodedToken = jwt.verify(token, "test");
//     var employee_id = decodedToken.user_id;
//     let emp_data = await Employee.findOne({_id:employee_id});
//     console.log(emp_data.companyId);
//     // let p_id = req.body.p_id?req.body.p_id:"";
//     let page = req.body.page?req.body.page:"1";
//     let final_list = [];
//     let limit = 10;
//     let count = await ProductCatagory.find({$and:[{company_id:emp_data.companyId},{is_delete:"0"}]});
//     let catagory_data = await ProductCatagory.find({$and:[{company_id:emp_data.companyId},{is_delete:"0"}]}).limit(limit*1).sort((page-1)*limit);
//     console.log(catagory_data);
//     if(catagory_data.length<1) return res.json({status:true,message:"No data",result:[]})
//     let countInfo = 0;
//     for(let j = 0;j<catagory_data.length;j++){
//         console.log(countInfo);
//         let list = [];
//         arr =[{company_id:emp_data.companyId},{catagory_id:catagory_data[j]._id}]
//         let product_data = await Product.find({$and:arr});
//         if(product_data.length>0){
//             for(let i = 0;i<product_data.length;i++){
//                 await (async function (rowData) {
//                     let catagory_data = await ProductCatagory.findOne({_id:product_data[i].catagory_id});
//                     let brand_data = await Brand.findOne({_id:product_data[i].brand_id});
//                     var u_data1 = {
//                         id: rowData._id,
//                         name:rowData.productName,
//                         brand_name:brand_data.name,
//                         hsn_code:rowData.hsn_code,
//                         catagory_name:catagory_data.name,
//                         description:rowData.description,
//                         gst:rowData.gst,
//                         image:rowData.display_image,
//                         mrp:rowData.mrp,
//                         price:rowData.price,
//                         packing_details:rowData.packing_details[0]?JSON.parse(rowData.packing_details[0]):[],
//                         status:rowData.status,
//                     };
//                     // console.log("hey>>",rowData.packing_details[0]);
//                     // console.log("hey>>",JSON.parse(`${rowData.packing_details[0]}`));
//                     list.push(u_data1);
//                 })(product_data[i]);
//             }
//             var u_data2= {
//                 catagory_id: catagory_data[j]._id,
//                 catagory_name:catagory_data[j].name,
//                 product_details:list
//             };
//             final_list.push(u_data2)
//             console.log("final_list----------",final_list);
//         }else{
//             var u_data2= {
//                 catagory_id: catagory_data[j]._id,
//                 catagory_name:catagory_data[j].name,
//                 product_details:[]
//             };
//             final_list.push(u_data2)
//             console.log("final_list----------",final_list);
//         }
//         countInfo++
//         if(countInfo==catagory_data.length) return res.json({status:true,message:"Catagories found.",result:final_list,pagelength:Math.ceil(count.length/limit)})
        
//     }

// //     if(p_id!=""){
// //         let count = await ProductCatagory.find({$and:[{company_id:emp_data.companyId},{p_id},{is_delete:"0"}]});
// //         let sub_catagory_data = await ProductCatagory.find({$and:[{company_id:emp_data.companyId},{p_id},{is_delete:"0"}]}).limit(limit*1).sort((page-1)*limit);
// //         if(sub_catagory_data.length<1) return res.json({status:true,message:"No data",result:[]})
// //         let counInfo = 0;
// //         for(let i = 0;i<sub_catagory_data.length;i++){
// //           let catagory_data  = await ProductCatagory.findOne({_id:sub_catagory_data[i].p_id});
// //           await (async function (rowData) {
// //             var u_data = {
// //               id: rowData._id,
// //               name: rowData.name,
// //               gst: rowData.gst,
// //               image: rowData.image,
// //               catagory:catagory_data.name,
// //               status: rowData.status,
// //           };
// //           list.push(u_data);
// //           })(sub_catagory_data[i]);
// //           counInfo++;
// //           if(counInfo==sub_catagory_data.length) return res.json({status: true,message: "All sub catagories found successfully",result: list,pageLength: Math.ceil(count.length / limit),});
// //     }
// //   }else{
// //         let count = await ProductCatagory.find({$and:[{company_id:emp_data.companyId},{p_id:""},{is_delete:"0"}]});
// //         let catagory_data = await ProductCatagory.find({$and:[{company_id:emp_data.companyId},{p_id:""},{is_delete:"0"}]}).limit(limit*1).sort((page-1)*limit);
// //         if(catagory_data.length>0) return res.json({status:true,message:"Catagories found.",result:catagory_data,pagelength:Math.ceil(count.length/limit)})
// //         if(catagory_data.length<1) return res.json({status:true,message:"No data",result:[]})
// //     }
// });

router.post('/get_all_products',async (req,res)=>{
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.json({ status: false, message: "Token is required" });
    let x = token.split(".");
    if (x.length < 3) return res.send({ status: false, message: "Invalid token" });
    var decodedToken = jwt.verify(token, "test");
    var employee_id = decodedToken.user_id;
    let emp_data = await Employee.findOne({_id:employee_id})
    let catagory_id = req.body.catagory_id?req.body.catagory_id:"";
    // let sub_catagory_id = req.body.catagory_id?req.body.sub_catagory_id:"";
    let limit = 10;
    let list = [];
    let page = req.body.page?req.body.page:"1";
    
    arr =[{company_id:emp_data.companyId}]
    if(catagory_id) arr.push({catagory_id})
    // if(sub_catagory_id) arr.push({sub_catagory_id})

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
                hsn_code:rowData.hsn_code,
                catagory_name:catagory_data.name,
                description:rowData.description,
                gst:rowData.gst,
                image:rowData.display_image,
                mrp:rowData.mrp,
                price:rowData.price,
                packing_details:rowData.packing_details,
                status:rowData.status,
            };
            list.push(u_data);
        //     if(product_data[i].sub_catagory_id){
        //         let sub_catagory_data = await ProductCatagory.findOne({_id:product_data[i].sub_catagory_id});
        //         if(sub_catagory_data){
        //             var u_data = {
        //                 id: rowData._id,
        //                 name:rowData.productName,
        //                 brand_name:brand_data.name,
        //                 hsn_code:rowData.hsn_code,
        //                 catagory_name:catagory_data.name,
        //                 sub_catagory_name:sub_catagory_data.name,
        //                 description:rowData.description,
        //                 gst:rowData.gst,
        //                 image:rowData.display_image,
        //                 status:rowData.status,
        //             };
        //             list.push(u_data);
        //         }else{
        //             var u_data = {
        //                 id: rowData._id,
        //                 name:rowData.productName,
        //                 brand_name:brand_data.name,
        //                 hsn_code:rowData.hsn_code,
        //                 catagory_name:catagory_data.name,
        //                 sub_catagory_name:"",
        //                 description:rowData.description,
        //                 gst:rowData.gst,
        //                 image:rowData.display_image,
        //                 status:rowData.status,
        //             };
        //             list.push(u_data);
        //         }
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
            // }
        })(product_data[i]);
        counInfo++;
        if(counInfo==product_data.length) return res.json({status: true,message: "All Products found successfully",result: list,pageLength: Math.ceil(count.length / limit),});
    }
})

router.post('/get_all_product_varients',async (req,res)=>{
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.json({ status: false, message: "Token is required" });
    let x = token.split(".");
    if (x.length < 3) return res.send({ status: false, message: "Invalid token" });
    var decodedToken = jwt.verify(token, "test");
    var employee_id = decodedToken.user_id;
    let emp_data = await Employee.findOne({_id:employee_id});
    let company_id = emp_data.companyId;
    let product_id = req.body.product_id?req.body.product_id:"";
    let arr =[];
    let list = [];
    if(product_id!=""){
        arr.push({company_id},{product_id},{is_delete:"0"})
    }else{
        arr.push({company_id},{is_delete:"0"})
    }
    let product_varient_data = await ProductVarient.find({$and:arr});
    if(product_varient_data.length<1) return res.json({status:true,message:"No data",result:[]});
    let counInfo = 0;
    for(let i = 0;i<product_varient_data.length;i++){
        await (async function (rowData) {
            let product_data = await Product.findOne({_id:product_varient_data[i].product_id});
            var u_data = {
                id: rowData._id,
                varient_name:rowData.varient_name,
                product_name:product_data.productName,
                mrp:rowData.mrp,
                packing_details:rowData.packing_details,
                sku_id:rowData.sku_id,
                price:rowData.price,
                image:rowData.display_image,
                status:rowData.status,
            };
            list.push(u_data);
        })(product_varient_data[i]);
        counInfo++;
        if (counInfo == product_varient_data.length) return res.json({status: true,message: "All Products found successfully",result: list});
    }
})

router.post('/place_order',async (req,res)=>{
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.json({ status: false, message: "Token is required" });
    let x = token.split(".");
    if (x.length < 3) return res.send({ status: false, message: "Invalid token" });
    var decodedToken = jwt.verify(token, "test");
    var employee_id = decodedToken.user_id;
    let emp_data = Employee.findOne({_id:employee_id});
    if(!emp_data) return res.json({status:false,message:"Employee not found"})
    let retailer_id = req.body.retailer_id?req.body.retailer_id:"";
    let beat_id = req.body.beat_id?req.body.beat_id:"";
    let type = req.body.type?req.body.type:"";
    let orderStatus = req.body.orderStatus?req.body.orderStatus:"";
    let line = req.body.line?req.body.line:"";
    if(emp_data.status=="InActive" || emp_data.status=="UnApproved") return res.json({status:false,message:`You are ${emp_data.status} . Please contact company.`})
    if(retailer_id=="") return res.json({status:false,message:"Give party id"});
    if(beat_id=="") return res.json({status:false,message:"Give beat id"});
    if(type=="") return res.json({status:false,message:"Give type"});
    if(orderStatus=="") return res.json({status:false,message:"Give order status"});
    let date = get_current_date().split(" ")[0];
    let total_amount = 0;
    for(let i = 0;i<line.length;i++){
        total_amount += line[i].product_price * line[i].quantity;
    }
    console.log("total_amount-----",total_amount)
    let new_order = new Order({
        emp_id:employee_id,
        company_id:emp_data.companyId,
        retailer_id:retailer_id,
        beat_id:beat_id,
        order_date:date,
        type:type,
        order_status:orderStatus,
        total_amount:total_amount,
        Created_date:get_current_date(),
        Updated_date:get_current_date(),
        status:"Active",
    });
    let new_order_data = await new_order.save();
    let list = [];
    for(let i = 0;i<line.length;i++){
        let new_order_line = new OrderItem({
            emp_id:employee_id,
            order_id:new_order_data._id,
            product_id:line[i].product_id,
            catagory_id:line[i].catagory_id,
            product_price:line[i].product_price,
            quantity:line[i].quantity,
            discount:line[i].discount,
            date:date,
            sub_total_price:line[i].product_price * line[i].quantity,
            order_status:"Pending",
            Created_date:get_current_date(),
            Updated_date:get_current_date(),
            status:"Active",
        })
        list.push(new_order_line);
        await new_order_line.save();
    }
    return res.json({status:true,message:"Order placed successfully",result:new_order_data,list})
});

router.post('/previous_retailer_orders',async (req,res)=>{
    let id = req.body.id?req.body.id:"";
    if(id=="") return res.json({status:false,message:"Please give id ."});
    let arr = [];
    let limit = 5;
    let order_data = await Order.find({retailer_id:id}).sort({Created_date:-1}).limit(limit*1);
    if(order_data.length<1) return res.json({status:true,message:"No data",result:[]});
    for(let i = 0;i<order_data.length;i++){
        let sub_arr = [];
        let order_item_data = await OrderItem.find({order_id:order_data[i]._id});
        for(let j = 0;j<order_item_data.length;j++){
            var product_data = await Product.findOne({_id:order_item_data[j].product_id});
            console.log(product_data);
            if(product_data){
                await (async function(rowData){
                    let u_data = {
                    product_name:product_data.productName,
                    quantity:rowData.quantity
                    }
                    sub_arr.push(u_data)
                })(order_item_data[j])
            }else{
                await (async function(rowData){
                    let u_data = {
                    product_name:"",
                    quantity:""
                    }
                    sub_arr.push(u_data)
                })(order_item_data[j])
            }
        }
        arr.push({order_data:order_data[i],line_data:sub_arr})
    }
    return res.json({status:true,message:"Found successfully",result:arr}); 
});

router.post('/view_retailer_todays_order',async (req,res)=>{
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.json({ status: false, message: "Token is required" });
    let x = token.split(".");
    if (x.length < 3) return res.send({ status: false, message: "Invalid token" });
    var decodedToken = jwt.verify(token, "test");
    var employee_id = decodedToken.user_id;
    let id = req.body.id?req.body.id:"";
    if(id == "") return res.json({status:false,message:"Please provide the retailer id"});
    let date = get_current_date().split(" ")[0];
    let retailer_todays_order_data = await Order.findOne({$and:[{emp_id:employee_id},{retailer_id:id},{order_date:date}]});
    if(!retailer_todays_order_data) return res.json({status:false,message:"First place order",result:[]})
    let order_item_data = await OrderItem.find({order_id:retailer_todays_order_data._id})
    let list = []
    for(let i = 0;i<order_item_data.length;i++){
        let product_data = await Product.findOne({_id:order_item_data[i].product_id})
        let u_data = {
            product_id:order_item_data[i].product_id,
            product_name:product_data.productName,
            product_price:order_item_data[i].product_price,
            quantity:order_item_data[i].quantity,
            sub_total_price:order_item_data[i].sub_total_price,
        }
        list.push(u_data)
    }
    return res.json({status:true,message:"Order data",result:retailer_todays_order_data,list})
})

router.post("/get_all_product_catagory",async (req, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token)
      return res.json({ status: false, message: "Token is required" });
    let x = token.split(".");
    if (x.length < 3)
      return res.send({ status: false, message: "Invalid token" });
    var decodedToken = jwt.verify(token, "test");
    var employee_id = decodedToken.user_id;
    let emp_data = await Employee.findOne({_id:employee_id});
    console.log(emp_data.companyId);
    let page = req.body.page?req.body.page:"1";
    let route_id = req.body.route_id?req.body.route_id:"";
    let party_data;
    let mapped_party_data = await Mapping.find({primary_type:"Employee",assigned_to_type:"Party",primary_id:employee_id})
    let b = mapped_party_data.length
    for(let a = 0;a<b;a++){
        let party = await Party.findOne({_id:mapped_party_data[a].assigned_to_id})
        var arr = party.route[0]?party.route[0].split(","):"";
        if(arr != ""){
            for(let i = 0;i<arr.length;i++){
                if(arr[i] == route_id){
                    party_data = party;
                    break;
                }
            }
        }
        if(party_data != {}){
            break;
        }
    }
    if(party_data){
        var grp_data = await PartyGrouping.findOne({party_id:party_data._id})
    }
    let price ;
    let pricelist_data;
    if(grp_data){
      let mapped_pricelist_data = await Mapping.findOne({primary_type:"PriceList",assigned_to_id:grp_data.grp_id,assigned_to_type:"PartyGroup"});
      if(mapped_pricelist_data){
        pricelist_data = await PriceList.findOne({_id:mapped_pricelist_data.primary_id});
      }else{
        //state ke according price lana hoga
        let mapped_state_data = await Mapping.findOne({company_id:emp_data.companyId,primary_type:"PriceList",assigned_to_id:emp_data.state,assigned_to_type:"State"});
        pricelist_data = await PriceList.findOne({_id:mapped_state_data.primary_id});
      }
    }else{
      //state ke according price lana hoga
      console.log(emp_data.state)
      let mapped_state_data = await Mapping.findOne({company_id:emp_data.companyId,primary_type:"PriceList",assigned_to_id:emp_data.state,assigned_to_type:"State"});
      if(mapped_state_data){
        pricelist_data = await PriceList.findOne({_id:mapped_state_data.primary_id});
      }
    }
    let final_list = [];
    let limit = 10;
    let count = await ProductCatagory.find({$and:[{company_id:emp_data.companyId},{is_delete:"0"}]});
    let catagory_data = await ProductCatagory.find({$and:[{company_id:emp_data.companyId},{is_delete:"0"}]}).limit(limit*1).sort((page-1)*limit);
    console.log(catagory_data);
    if(catagory_data.length<1) return res.json({status:true,message:"No data",result:[]})
    let countInfo = 0;
    for(let j = 0;j<catagory_data.length;j++){
        console.log(countInfo);
        let list = [];
        arr =[{company_id:emp_data.companyId},{catagory_id:catagory_data[j]._id}]
        let product_data = await Product.find({$and:arr});
        if(product_data.length>0){
            for(let i = 0;i<product_data.length;i++){
                    let catagory_data = await ProductCatagory.findOne({_id:product_data[i].catagory_id});
                    let brand_data = await Brand.findOne({_id:product_data[i].brand_id});
                    if(pricelist_data){
                        if(party_data){
                            for(let a = 0;a<pricelist_data.pricelist_details.length;a++){
                              if(product_data[i]._id == pricelist_data.pricelist_details[a].id ){
                                if(party_data.partyType == pricelist_data.pricelist_details[a].partyType1.id){
                                  price = Number(pricelist_data.pricelist_details[a].partyType1.value)
                                }else if(party_data.partyType == pricelist_data.pricelist_details[a].partyType2.id){
                                  price = Number(pricelist_data.pricelist_details[a].partyType2.value)
                                }else{
                                  price = Number(product_data[i].price)
                                }
                              }
                            }
                        }else{
                            price = Number(product_data[i].price)
                        }
                    }else{
                      price = Number(product_data[i].price)
                    }
                    var u_data1 = {
                        id: product_data[i]._id,
                        name:product_data[i].productName,
                        brand_name:brand_data.name,
                        hsn_code:product_data[i].hsn_code,
                        catagory_name:catagory_data.name,
                        description:product_data[i].description,
                        gst:product_data[i].gst,
                        image:product_data[i].display_image,
                        mrp:product_data[i].mrp,
                        price:price,
                        packing_details:product_data[i].packing_details[0]?JSON.parse(product_data[i].packing_details[0]):[],
                        status:product_data[i].status,
                    };
                    list.push(u_data1);
            }
            var u_data2= {
                catagory_id: catagory_data[j]._id,
                catagory_name:catagory_data[j].name,
                product_details:list
            };
            final_list.push(u_data2)
            console.log("final_list----------",final_list);
        }else{
            var u_data2= {
                catagory_id: catagory_data[j]._id,
                catagory_name:catagory_data[j].name,
                product_details:[]
            };
            final_list.push(u_data2)
            console.log("final_list----------",final_list);
        }
        countInfo++
        if(countInfo==catagory_data.length) return res.json({status:true,message:"Catagories found.",result:final_list,pagelength:Math.ceil(count.length/limit)})
        
    }
});

module.exports = router;