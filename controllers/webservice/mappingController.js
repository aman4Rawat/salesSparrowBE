const express = require("express");
const mongoose = require("mongoose");
const Mapping = mongoose.model("Mapping");
const Employee = mongoose.model("Employee");
const PriceList = mongoose.model("PriceList");
const ProductGroup = mongoose.model("ProductGroup");
const Location = mongoose.model("Location");
const PGroup = mongoose.model("PGroup");
const Party = mongoose.model("Party");
const Group = mongoose.model("Group");
const Beat = mongoose.model("Beat");
const router = express.Router();
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

router.post('/emp_party_mapping',async (req,res)=>{
    let party_id_arr  = req.body.party_id_arr?req.body.party_id_arr:[];
    let emp_id  = req.body.emp_id?req.body.emp_id:"";
    if(emp_id=="") return res.json({status:false,message:"Please give emp_id"})
    if(party_id_arr.length<1) return res.json({status:false,message:"Please give party ids"})
    console.log("party_id_arr--------",party_id_arr)
    console.log("party_id_arr.length--------",party_id_arr.length)
    let mapped_data =await Mapping.find({ primary_id: emp_id, primary_type: "Employee", assigned_to_type: "Party" })
    if(mapped_data.length>0) return res.json({status:false,message:"Already present"})
    for(let i = 0;i<party_id_arr.length;i++){
        console.log("inside for")
        let assigned_data =await Mapping.create({
            primary_id:emp_id,
            primary_type:"Employee",
            assigned_to_id:party_id_arr[i],
            assigned_to_type:"Party",
            status:"Active",
            Created_date:get_current_date(),
            Updated_date:get_current_date(),
        })  
    }
    return res.json({status:true,message:"Parties assigned to employees"})
});

router.post('/get_mapped_emp_party',async (req,res)=>{
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res.json({
        status: false,
        message: "Token must be provided",
        });
    }
    var decodedToken = jwt.verify(token, "test");
    var company_id = decodedToken.user_id;
    let emp_id = req.body.emp_id?req.body.emp_id:"";
    let final_arr = []
    if(emp_id==""){
        let emp_data = await Employee.find({is_delete:"0",companyId:company_id})
        for (let i = 0; i < emp_data.length; i++) {
            let mapped_data =await Mapping.find({ primary_id: emp_data[i]._id, primary_type: "Employee", assigned_to_type: "Party" })
            let list = []
            for (let j = 0; j < mapped_data.length; j++) {
                let party_data = await Party.findOne({ _id: mapped_data[j].assigned_to_id })
                let u_data = {
                    firmName: party_data.firmName,
                    partyType: party_data.partyType,
                    state: party_data.state,
                    city: party_data.city,
                    id: party_data._id
                }
                list.push(u_data)
            }
            let data = {
                emp_name: emp_data[i].employeeName,
                emp_id: emp_data[i]._id,
                parties: list,
            }
            final_arr.push(data)
        }
        return res.json({status:true,message:"Data",result:final_arr,count:final_arr.length})

    }else if(emp_id!=""){
        let mapped_data =await Mapping.find({primary_id:emp_id,primary_type:"Employee",assigned_to_type:"Party"})
        let emp_data = await Employee.findOne({_id:emp_id})
        let list = []
        let state = req.body.state?req.body.state:""
        let city = req.body.city?req.body.city:""
        let partyType = req.body.partyType?req.body.partyType:""
        for(let i = 0;i<mapped_data.length;i++){
            let condition = {_id:mapped_data[i].assigned_to_id}
            if(state!=""){
                condition.state = state;
            }
            if(city!=""){
                condition.city = city;
            }
            if(partyType!=""){
                condition.partyType = partyType;
            }
            let party_data = await Party.findOne(condition)
            let state_data = await Location.findOne({id:party_data.state})
            let city_data = await Location.findOne({id:party_data.city})
            if(party_data){
                let u_data = {
                    firmName:party_data.firmName,
                    id:party_data._id,
                    state: state_data.name,
                    city: city_data.name,
                    id: party_data._id
                }
                list.push(u_data)
            }
            condition = {}
        }
        var data = {
            emp_name:emp_data.employeeName,
            emp_id:emp_data._id,
            parties:list,
            count:list.length,
        }
    }
    return res.json({status:true,message:"Data",result:[data]})
})

router.post('/get_parties_mapped_to_emp',async (req,res)=>{
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res.json({
        status: false,
        message: "Token must be provided",
        });
    }
    var decodedToken = jwt.verify(token, "test");
    var company_id = decodedToken.user_id;
    let emp_id = req.body.emp_id?req.body.emp_id:"";
    let limit = 10;
    let page = req.body.page?req.body.page:"1";
    if(emp_id == "") return res.json({status:false,message:"Please give employee id"})
    let mapped_data =await Mapping.find({primary_id:emp_id,primary_type:"Employee",assigned_to_type:"Party"}).limit(limit*1).skip((page-1)*limit)
    let total_data =await Mapping.find({primary_id:emp_id,primary_type:"Employee",assigned_to_type:"Party"}).limit(limit*1).skip((page-1)*limit)
        let emp_data = await Employee.findOne({_id:emp_id})
        let list = []
        let state = req.body.state?req.body.state:""
        let city = req.body.city?req.body.city:""
        let partyType = req.body.partyType?req.body.partyType:""
        for(let i = 0;i<mapped_data.length;i++){
            let condition = {_id:mapped_data[i].assigned_to_id}
            if(state!=""){
                condition.state = state;
            }
            if(city!=""){
                condition.city = city;
            }
            if(partyType!=""){
                condition.partyType = partyType;
            }
            let party_data = await Party.findOne(condition)
            if(party_data){
                let state_data = await Location.findOne({id:party_data.state})
                let city_data = await Location.findOne({id:party_data.city})
                let u_data = {
                    firmName:party_data.firmName,
                    id:party_data._id,
                    state: state_data.name,
                    city: city_data.name,
                    id: party_data._id
                }
                list.push(u_data)
            }
            condition = {}
        }
        var data = {
            emp_name:emp_data.employeeName,
            emp_id:emp_data._id,
            parties:list,
            count:total_data.length,
        }
    return res.json({status:true,message:"Data",result:[data],page_length:Math.ceil(total_data.length/limit)})
})

router.post('/edit_mapped_emp_party',async (req,res)=>{
    let party_id_arr  = req.body.party_id_arr?req.body.party_id_arr:[];
    let emp_id  = req.body.emp_id?req.body.emp_id:"";
    if(emp_id=="") return res.json({status:false,message:"Please give emp_id"})
    await Mapping.deleteMany({primary_id:emp_id,primary_type:"Employee",assigned_to_type:"Party",})
    if(party_id_arr.length>0){
        for(let i = 0;i<party_id_arr.length;i++){
            let assigned_data =await Mapping.create({
                primary_id:emp_id,
                primary_type:"Employee",
                assigned_to_id:party_id_arr[i],
                assigned_to_type:"Party",
                status:"Active",
                Created_date:get_current_date(),
                Updated_date:get_current_date(),
            })  
        }
    }else if(party_id_arr.length<1){
        return res.json({status:true,message:"Edited successfully"})   
    }
    return res.json({status:true,message:"Edited successfully"})
})

router.delete('/delete_mapped_emp_party',async (req,res)=>{
    let emp_id  = req.body.emp_id?req.body.emp_id:"";
    if(emp_id=="") return res.json({status:false,message:"Please give emp_id"})
    await Mapping.deleteMany({primary_id:emp_id,primary_type:"Employee",assigned_to_type:"Party",})
    return res.json({status:true,message:"Deleted"})
})

// router.post('/emp_beat_mapping',async (req,res)=>{
//     let beat_id_arr  = req.body.beat_id_arr?req.body.beat_id_arr:[];
//     let emp_id  = req.body.emp_id?req.body.emp_id:"";
//     if(emp_id=="") return res.json({status:false,message:"Please give emp_id"})
//     if(party_id_arr=="") return res.json({status:false,message:"Please give party ids"})
//     for(let i = 0;i<beat_id_arr.length;i++){
//         let assigned_data =await Mapping.create({
//             primary_id:emp_id,
//             primary_type:"Employee",
//             assigned_to_id:beat_id_arr[i],
//             assigned_to_type:"Beat",
//             status:"Active",
//             Created_date:get_current_date(),
//             Updated_date:get_current_date(),
//         })  
//     }
//     return res.json({status:true,message:"Beat assigned to employees"})
// });

// router.get('/get_mapped_emp_beat',async (req,res)=>{
//     const authHeader = req.headers["authorization"];
//     const token = authHeader && authHeader.split(" ")[1];
//     if (!token) {
//         return res.json({
//         status: false,
//         message: "Token must be provided",
//         });
//     }
//     var decodedToken = jwt.verify(token, "test");
//     var company_id = decodedToken.user_id;
//     let emp_id = req.body.emp_id?req.body.emp_id:"";
//     let final_arr = []
//     if(emp_id==""){
//         let emp_data = await Employee.find({companyId:company_id})
//         for (let i = 0; i < emp_data.length; i++) {
//             let mapped_data = Mapping.find({ primary_id: emp_data._id, primary_type: "Employee", assigned_to_type: "Beat" })
//             let list = []
//             for (let i = 0; i < mapped_data.length; i++) {
//                 let beat_data = await Beat.findOne({ _id: mapped_data.assigned_to_id })
//                 let u_data = {
//                     beat_name: beat_data.beatName,
//                     beat_id: beat_data._id
//                 }
//                 list.push(u_data)
//             }
//             let data = {
//                 emp_name: emp_data[i].employeeName,
//                 beats: list,
//             }
//             final_arr.push(data)
//         }
//         return res.json({status:true,message:"Data",result:final_arr})

//     }else if(emp_id!=""){
//         let mapped_data = Mapping.find({primary_id:emp_id,primary_type:"Employee",assigned_to_type:"Beat"})
//         let emp_data = await Employee.findOne({_id:emp_id})
//         let list = []
//         for(let i = 0;i<mapped_data.length;i++){
//             let beat_data = await Beat.findOne({_id:mapped_data.assigned_to_id})
//             let u_data = {
//                 beat_name:beat_data.beatName,
//                 beat_id:beat_data._id
//             }
//             list.push(u_data)
//         }
//         var data = {
//             emp_name:emp_data.employeeName,
//             beats:list,
//         }
//     }
//     return res.json({status:true,message:"Data",result:data})
// })

// router.post('/edit_mapped_emp_beat',async (req,res)=>{
//     let beat_id_arr  = req.body.beat_id_arr?req.body.beat_id_arr:[];
//     let emp_id  = req.body.emp_id?req.body.emp_id:"";
//     if(emp_id=="") return res.json({status:false,message:"Please give emp_id"})
//     if(beat_id_arr=="") return res.json({status:false,message:"Please give beat ids"})
//     await Mapping.deleteMany({primary_id:emp_id,primary_type:"Employee",assigned_to_type:"Beat",})
//     for(let i = 0;beat_id_arr.length;i++){
//         let assigned_data =await Mapping.create({
//             primary_id:emp_id,
//             primary_type:"Employee",
//             assigned_to_id:beat_id_arr[i],
//             assigned_to_type:"Beat",
//             status:"Active",
//             Created_date:get_current_date(),
//             Updated_date:get_current_date(),
//         })  
//     }
// })

// router.delete('/delete_mapped_emp_beat',async (req,res)=>{
//     let emp_id  = req.body.emp_id?req.body.emp_id:"";
//     if(emp_id=="") return res.json({status:false,message:"Please give emp_id"})
//     await Mapping.deleteOne({primary_id:emp_id,primary_type:"Employee",assigned_to_type:"Beat",})
//     return res.json({status:true,message:"Deleted"})
// })

// router.post('/emp_pricelist_mapping',async (req,res)=>{
//     let pricelist_id  = req.body.pricelist_id?req.body.pricelist_id:"";
//     let state_id  = req.body.state_id?req.body.state_id:"";
//     if(state_id=="") return res.json({status:false,message:"Please give state_id"})
//     if(pricelist_id=="") return res.json({status:false,message:"Please give pricelist id"})
//     let emp_pl_data = await Mapping.findOne({primary_id: state_id, primary_type: "Employee", assigned_to_type: "Pricelist"})
//     if(emp_pl_data) return res.json({status:false,message:"Already present please assign there!"})
//         let assigned_data =await Mapping.create({
//             primary_id:state_id,
//             primary_type:"Employee",
//             assigned_to_id:pricelist_id,
//             assigned_to_type:"Pricelist",
//             status:"Active",
//             Created_date:get_current_date(),
//             Updated_date:get_current_date(),
//         })  
//     return res.json({status:true,message:"Pricelist assigned to employees"})
// });

// router.post('/get_mapped_emp_pricelist',async (req,res)=>{
//     const authHeader = req.headers["authorization"];
//     const token = authHeader && authHeader.split(" ")[1];
//     if (!token) {
//         return res.json({
//         status: false,
//         message: "Token must be provided",
//         });
//     }
//     var decodedToken = jwt.verify(token, "test");
//     var company_id = decodedToken.user_id;
//     let emp_id = req.body.emp_id?req.body.emp_id:"";
//     let page = req.body.page?req.body.page:"1";
//     let limit = 10
//     let final_arr = []
//     if(emp_id==""){
//         let emp_data = await Employee.find({is_delete:"0",companyId:company_id}).limit(limit*1).skip((page-1)*limit);
//         let count = await Employee.find({is_delete:"0",companyId:company_id})
//         for (let i = 0; i < emp_data.length; i++) {
//             let mapped_data =await Mapping.find({ primary_id: emp_data[i]._id, primary_type: "Employee", assigned_to_type: "Pricelist" })
//             var list = []
//             for (let j = 0; j < mapped_data.length; j++) {
//                 let pricelist_data = await PriceList.findOne({ _id: mapped_data[j].assigned_to_id })
//                 let u_data = {
//                     pricelist_name: pricelist_data.price_list_name,
//                     pricelist_id: pricelist_data._id
//                 }
//                 list.push(u_data)
//             }
//             let data = {
//                 emp_name: emp_data[i].employeeName,
//                 emp_id: emp_data[i]._id,
//                 pricelist: list,
//             }
//             final_arr.push(data)
//         }
//         return res.json({status:true,message:"Data",result:final_arr,pageLength:Math.ceil(count.length/limit)})

//     }else if(emp_id!=""){
//         let mapped_data =await Mapping.find({primary_id:emp_id,primary_type:"Employee",assigned_to_type:"Pricelist"})
//         let emp_data = await Employee.findOne({_id:emp_id})
//         let list = []
//         for(let i = 0;i<mapped_data.length;i++){
//             let pricelist_data = await PriceList.findOne({_id:mapped_data[i].assigned_to_id})
//             let u_data = {
//                 pricelist_name: pricelist_data.price_list_name,
//                     pricelist_id: pricelist_data._id
//             }
//             list.push(u_data)
//         }
//         var data = {
//             emp_name:emp_data.employeeName,
//             emp_id:emp_data._id,
//             pricelists:list,
//         }
//     }
//     return res.json({status:true,message:"Data",result:data})
// })

// router.post('/edit_mapped_emp_pricelist',async (req,res)=>{
//     let pricelist_id  = req.body.pricelist_id?req.body.pricelist_id:"";
//     let emp_id  = req.body.emp_id?req.body.emp_id:"";
//     if(emp_id=="") return res.json({status:false,message:"Please give emp_id"})
//     await Mapping.deleteMany({primary_id:emp_id,primary_type:"Employee",assigned_to_type:"Pricelist",})
//     if(pricelist_id!=""){
//         let assigned_data =await Mapping.create({
//             primary_id:emp_id,
//             primary_type:"Employee",
//             assigned_to_id:pricelist_id,
//             assigned_to_type:"Pricelist",
//             status:"Active",
//             Created_date:get_current_date(),
//             Updated_date:get_current_date(),
//         })  
//     }else if(pricelist_id==""){
//         return res.json({status:true,message:"Edited successfully"})
//     }
//     return res.json({status:true,message:"Edited successfully"})
// })

// router.delete('/delete_mapped_emp_pricelist',async (req,res)=>{
//     let emp_id  = req.body.emp_id?req.body.emp_id:"";
//     if(emp_id=="") return res.json({status:false,message:"Please give emp_id"})
//     await Mapping.deleteMany({primary_id:emp_id,primary_type:"Employee",assigned_to_type:"Pricelist",})
//     return res.json({status:true,message:"Deleted"})
// })

router.post('/empgrp_productgrp_mapping',async (req,res)=>{
    let productgrp_id = req.body.productgrp_id?req.body.productgrp_id:"";
    let empgrp_id  = req.body.empgrp_id?req.body.empgrp_id:"";
    if(empgrp_id=="") return res.json({status:false,message:"Please give emp_id"})
    if(productgrp_id=="") return res.json({status:false,message:"Please give product group id"})
    let data = await Mapping.findOne({primary_id: empgrp_id, primary_type: "EmployeeGroup", assigned_to_type: "ProductGroup"})
    if(data) return res.json({status:false,message:"Already present"})
        let assigned_data =await Mapping.create({
            primary_id:empgrp_id,
            primary_type:"EmployeeGroup",
            assigned_to_id:productgrp_id,
            assigned_to_type:"ProductGroup",
            status:"Active",
            Created_date:get_current_date(),
            Updated_date:get_current_date(),
        })  
    return res.json({status:true,message:"Product Group assigned to employees"})
});

router.post('/get_mapped_emp_productgrp',async (req,res)=>{
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res.json({
        status: false,
        message: "Token must be provided",
        });
    }
    var decodedToken = jwt.verify(token, "test");
    var company_id = decodedToken.user_id;
    let emp_grp_id = req.body.emp_grp_id?req.body.emp_grp_id:"";
    let page = req.body.page?req.body.page:"1";
    let limit = 10
    let final_arr = []
    if(emp_grp_id==""){
        let emp_grp_name = await Group.find({is_delete:"0",company_id:company_id}).limit(limit*1).skip((page-1)*limit);
        let count = await Group.find({is_delete:"0",company_id:company_id})
        for (let i = 0; i < emp_grp_name.length; i++) {
            let mapped_data =await Mapping.find({ primary_id: emp_grp_name[i]._id, primary_type: "EmployeeGroup", assigned_to_type: "ProductGroup" })
            let list = []
            for (let j = 0; j < mapped_data.length; j++) {
                let productgrp_data = await ProductGroup.findOne({ _id: mapped_data[j].assigned_to_id })
                let u_data = {
                    productgrp_name: productgrp_data.grp_name,
                    productgrp_id: productgrp_data._id
                }
                list.push(u_data)
            }
            let data = {
                emp_grp_name: emp_grp_name[i].grp_name,
                emp_grp_id: emp_grp_name[i]._id,
                products: list,
            }
            final_arr.push(data)
        }
        return res.json({status:true,message:"Data",result:final_arr,pageLength:Math.ceil(count.length/limit)})

    }else if(emp_grp_id!=""){
        let mapped_data =await Mapping.find({primary_id:emp_grp_id,primary_type:"EmployeeGroup",assigned_to_type:"PriceList"})
        let emp_grp_data = await Group.findOne({_id:emp_grp_id})
        let list = []
        for(let i = 0;i<mapped_data.length;i++){
            let productgrp_data = await ProductGroup.findOne({ _id: mapped_data[i].assigned_to_id })
            let u_data = {
                productgrp_name: productgrp_data.grp_name,
                productgrp_id: productgrp_data._id
            }
            list.push(u_data)
        }
        var data = {
            emp_grp_name:emp_grp_data.grp_name,
            emp_grp_id:emp_grp_data._id,
            productgroups:list,
        }
        return res.json({status:true,message:"Data",result:data})
    }
})

router.post('/edit_mapped_emp_productgrp',async (req,res)=>{
    let productgrp_id  = req.body.productgrp_id?req.body.productgrp_id:"";
    let emp_grp_id  = req.body.emp_grp_id?req.body.emp_grp_id:"";
    if(emp_grp_id=="") return res.json({status:false,message:"Please give emp_grp_id"})
    await Mapping.deleteOne({primary_id:emp_grp_id,primary_type:"EmployeeGroup",assigned_to_type:"ProductGroup",})
    if(productgrp_id!=""){
        let assigned_data =await Mapping.create({
            primary_id:emp_grp_id,
            primary_type:"EmployeeGroup",
            assigned_to_id:productgrp_id,
            assigned_to_type:"ProductGroup",
            status:"Active",
            Created_date:get_current_date(),
            Updated_date:get_current_date(),
        })  
    }else if(productgrp_id==""){
        return res.json({status:true,message:"Edited successfully"})
    }
    return res.json({status:true,message:"Edited successfully"})
})

router.delete('/delete_mapped_emp_productgrp',async (req,res)=>{
    let emp_grp_id  = req.body.emp_grp_id?req.body.emp_grp_id:"";
    if(emp_grp_id=="") return res.json({status:false,message:"Please give emp_id"})
    await Mapping.deleteOne({primary_id:emp_grp_id,primary_type:"EmployeeGroup",assigned_to_type:"ProductGroup",})
    return res.json({status:true,message:"Deleted"})
})

router.post('/partygrp_productgrp_mapping', async (req, res) => {
    let productgrp_id = req.body.productgrp_id ? req.body.productgrp_id : "";
    let partygrp_id = req.body.partygrp_id ? req.body.partygrp_id : "";
    if (partygrp_id == "") return res.json({ status: false, message: "Please give emp_id" })
    if (productgrp_id == "") return res.json({ status: false, message: "Please give product group id" })
    let data = await Mapping.findOne({ primary_id: partygrp_id, primary_type: "PartyGroup", assigned_to_type: "ProductGroup" })
    if (data) return res.json({ status: false, message: "Already present" })
    let assigned_data = await Mapping.create({
        primary_id: partygrp_id,
        primary_type: "PartyGroup",
        assigned_to_id: productgrp_id,
        assigned_to_type: "ProductGroup",
        status: "Active",
        Created_date: get_current_date(),
        Updated_date: get_current_date(),
    })
    return res.json({ status: true, message: "Product Group assigned to Party group" })
});

router.post('/get_mapped_partygrp_productgrp',async (req,res)=>{
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res.json({
        status: false,
        message: "Token must be provided",
        });
    }
    var decodedToken = jwt.verify(token, "test");
    var company_id = decodedToken.user_id;
    let party_grp_id = req.body.party_grp_id?req.body.party_grp_id:"";
    let page = req.body.page?req.body.page:"1";
    let limit = 10
    let final_arr = []
    if(party_grp_id==""){
        let party_grp_data = await PGroup.find({is_delete:"0",company_id:company_id}).limit(limit*1).skip((page-1)*limit);
        let count = await PGroup.find({is_delete:"0",company_id:company_id})
        for (let i = 0; i < party_grp_data.length; i++) {
            let mapped_data =await Mapping.find({ primary_id: party_grp_data[i]._id, primary_type: "PartyGroup", assigned_to_type: "ProductGroup" })
            let list = []
            for (let j = 0; j < mapped_data.length; j++) {
                let productgrp_data = await ProductGroup.findOne({ _id: mapped_data[j].assigned_to_id })
                let u_data = {
                    productgrp_name: productgrp_data.grp_name,
                    productgrp_id: productgrp_data._id
                }
                list.push(u_data)
            }
            let data = {
                party_grp_data: party_grp_data[i].grp_name,
                party_grp_id: party_grp_data[i]._id,
                products: list,
            }
            final_arr.push(data)
        }
        return res.json({status:true,message:"Data",result:final_arr,pageLength:Math.ceil(count.length/limit)})

    }else if(party_grp_id!=""){
        let mapped_data =await Mapping.find({primary_id:party_grp_id,primary_type:"PartyGroup",assigned_to_type:"PriceList"})
        let party_grp_data = await PGroup.findOne({_id:party_grp_id})
        let list = []
        for(let i = 0;i<mapped_data.length;i++){
            let productgrp_data = await ProductGroup.findOne({ _id: mapped_data[i].assigned_to_id })
            let u_data = {
                productgrp_name: productgrp_data.grp_name,
                productgrp_id: productgrp_data._id
            }
            list.push(u_data)
        }
        var data = {
            party_grp_name:party_grp_data.grp_name,
            party_grp_id:party_grp_data._id,
            productgroups:list,
        }
        return res.json({status:true,message:"Data",result:data})
    }
})

router.post('/edit_mapped_partygrp_productgrp',async (req,res)=>{
    let productgrp_id  = req.body.productgrp_id?req.body.productgrp_id:"";
    let partygrp_id  = req.body.partygrp_id?req.body.partygrp_id:"";
    if(partygrp_id=="") return res.json({status:false,message:"Please give partygrp_id"})
    await Mapping.deleteOne({primary_id:partygrp_id,primary_type:"PartyGroup",assigned_to_type:"ProductGroup",})
    if(productgrp_id!=""){
        let assigned_data =await Mapping.create({
            primary_id:partygrp_id,
            primary_type:"PartyGroup",
            assigned_to_id:productgrp_id,
            assigned_to_type:"ProductGroup",
            status:"Active",
            Created_date:get_current_date(),
            Updated_date:get_current_date(),
        })  
    }else if(productgrp_id==""){
        return res.json({status:true,message:"Edited successfully"})
    }
    return res.json({status:true,message:"Edited successfully"})
})

router.delete('/delete_mapped_partygrp_productgrp',async (req,res)=>{
    let partygrp_id  = req.body.partygrp_id?req.body.partygrp_id:"";
    if(partygrp_id=="") return res.json({status:false,message:"Please give emp_id"})
    await Mapping.deleteOne({primary_id:partygrp_id,primary_type:"PartyGroup",assigned_to_type:"ProductGroup",})
    return res.json({status:true,message:"Deleted"})
})

router.post('/ss_distributor_mapping',async (req,res)=>{
    let distributor_id_arr  = req.body.distributor_id_arr?req.body.distributor_id_arr:[];
    let ss_id  = req.body.ss_id?req.body.ss_id:"";
    if(ss_id=="") return res.json({status:false,message:"Please give ss_id"})
    if(distributor_id_arr.length<1) return res.json({status:false,message:"Please give party ids"})
    console.log("distributor_id_arr--------",distributor_id_arr)
    console.log("distributor_id_arr.length--------",distributor_id_arr.length)
    let mapped_data =await Mapping.find({ primary_id: ss_id, primary_type: "SS", assigned_to_type: "Distributor" })
    if(mapped_data.length>0) return res.json({status:false,message:"Already present"})
    for(let i = 0;i<distributor_id_arr.length;i++){
        console.log("inside for")
        await Party.findByIdAndUpdate({_id:distributor_id_arr[i]},{$set:{is_mapped:true}})
        let assigned_data =await Mapping.create({
            primary_id:ss_id,
            primary_type:"SS",
            assigned_to_id:distributor_id_arr[i],
            assigned_to_type:"Distributor",
            status:"Active",
            Created_date:get_current_date(),
            Updated_date:get_current_date(),
        })  
    }
    return res.json({status:true,message:"Distributors assigned to SS"})
});

router.post('/get_mapped_ss_distributor',async (req,res)=>{
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res.json({
        status: false,
        message: "Token must be provided",
        });
    }
    var decodedToken = jwt.verify(token, "test");
    var company_id = decodedToken.user_id;
    let ss_id = req.body.ss_id?req.body.ss_id:"";
    let page = req.body.page?req.body.page:"1";
    let limit = 10
    let final_arr = []
    if(ss_id==""){
        let ss_data = await Party.find({is_delete:"0",company_id:company_id,partyType:"63766b79043f582fcc7a80e1"}).limit(limit*1).skip((page-1)*limit)
        let total_ss_data = await Party.find({is_delete:"0",company_id:company_id,partyType:"63766b79043f582fcc7a80e1"})
        for (let i = 0; i < ss_data.length; i++) {
            let mapped_data =await Mapping.find({ primary_id: ss_data[i]._id, primary_type: "SS", assigned_to_type: "Distributor" })
            let list = []
            for (let j = 0; j < mapped_data.length; j++) {
                let party_data = await Party.findOne({ _id: mapped_data[j].assigned_to_id })
                let u_data = {
                    firmName: party_data.firmName,
                    id: party_data._id
                }
                list.push(u_data)
            }
            let data = {
                ss_name: ss_data[i].firmName,
                ss_id: ss_data[i]._id,
                parties: list,
            }
            final_arr.push(data)
        }
        return res.json({status:true,message:"Data",result:final_arr,page_length:Math.ceil(total_ss_data.length/limit),count:total_ss_data.length})

    }else if(ss_id!=""){
        let mapped_data =await Mapping.find({primary_id:ss_id,primary_type:"SS",assigned_to_type:"Distributor"})
        let ss_data = await Party.findOne({_id:ss_id})
        let list = []
        let state = req.body.state?req.body.state:""
        let city = req.body.city?req.body.city:""
        for(let i = 0;i<mapped_data.length;i++){
            let condition = {_id:mapped_data[i].assigned_to_id}
            if(state!=""){
                condition.state = state;
            }
            if(city!=""){
                condition.city = city;
            }
            let party_data = await Party.findOne(condition)
            if(party_data){
                let u_data = {
                    firmName:party_data.firmName,
                    id:party_data._id,
                    state: party_data.state,
                    city: party_data.city,
                    id: party_data._id
                }
                list.push(u_data)
            }
            condition = {}
        }
        var data = {
            ss_name:ss_data.firmName,
            ss_id:ss_data._id,
            parties:list,
        }
    }
    return res.json({status:true,message:"Data",result:data})
})

router.post('/distributor_acc_to_ss',async (req,res)=>{
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res.json({
        status: false,
        message: "Token must be provided",
        });
    }
    var decodedToken = jwt.verify(token, "test");
    var company_id = decodedToken.user_id;
    let ss_id = req.body.ss_id?req.body.ss_id:"";
    let page = req.body.page?req.body.page:"1";
    let limit = 10
    if(ss_id=="") return res.json({status:false,message:"Please give ss id"})
    let mapped_data =await Mapping.find({primary_id:ss_id,primary_type:"SS",assigned_to_type:"Distributor"}).limit(limit*1).skip((page-1)*limit)
    let total_mapped_data =await Mapping.find({primary_id:ss_id,primary_type:"SS",assigned_to_type:"Distributor"})
        let ss_data = await Party.findOne({_id:ss_id})
        let list = []
        let state = req.body.state?req.body.state:""
        let city = req.body.city?req.body.city:""
        for(let i = 0;i<mapped_data.length;i++){
            let condition = {_id:mapped_data[i].assigned_to_id}
            if(state!=""){
                condition.state = state;
            }
            if(city!=""){
                condition.city = city;
            }
            let party_data = await Party.findOne(condition)
            if(party_data){
                let state_data = await Location.findOne({id:party_data.state})
                let city_data = await Location.findOne({id:party_data.city})
                let u_data = {
                    firmName:party_data.firmName,
                    id:party_data._id,
                    state: state_data.name,
                    city: city_data.name,
                    id: party_data._id
                }
                list.push(u_data)
            }
            condition = {}
        }
        var data = {
            ss_name:ss_data.firmName,
            ss_id:ss_data._id,
            parties:list,
        }
    return res.json({status:true,message:"Data",result:data,page_length:Math.ceil(total_mapped_data.length/limit),count:total_mapped_data.length})

})

router.post('/edit_mapped_ss_distributor',async (req,res)=>{
    let distributor_id_arr  = req.body.distributor_id_arr?req.body.distributor_id_arr:[];
    let ss_id  = req.body.ss_id?req.body.ss_id:"";
    if(ss_id=="") return res.json({status:false,message:"Please give ss_id"})
    let data = await Mapping.find({primary_id:ss_id,primary_type:"SS",assigned_to_type:"Distributor",})
    for(let i = 0;i<data.length;i++){
        await Party.findByIdAndUpdate({_id:data[i].assigned_to_id},{$set:{is_mapped:false}})
    }
    await Mapping.deleteMany({primary_id:ss_id,primary_type:"SS",assigned_to_type:"Distributor",})
    if(distributor_id_arr.length>0){
        for(let i = 0;i<distributor_id_arr.length;i++){
            let assigned_data =await Mapping.create({
                primary_id:ss_id,
                primary_type:"SS",
                assigned_to_id:distributor_id_arr[i],
                assigned_to_type:"Distributor",
                status:"Active",
                Created_date:get_current_date(),
                Updated_date:get_current_date(),
            })  
        }
    }else if(distributor_id_arr.length<1){
        return res.json({status:true,message:"Edited successfully"})   
    }
    return res.json({status:true,message:"Edited successfully"})
})

router.delete('/delete_mapped_ss_distributor',async (req,res)=>{
    let ss_id  = req.body.ss_id?req.body.ss_id:"";
    if(ss_id=="") return res.json({status:false,message:"Please give ss_id"})
    let data = await Mapping.find({primary_id:ss_id,primary_type:"SS",assigned_to_type:"Distributor",})
    for(let i = 0;i<data.length;i++){
        await Party.findByIdAndUpdate({_id:data[i].assigned_to_id},{$set:{is_mapped:false}})
    }
    await Mapping.deleteMany({primary_id:ss_id,primary_type:"SS",assigned_to_type:"Distributor",})
    return res.json({status:true,message:"Deleted"})
})

router.post('/state_pricelist_mapping',async (req,res)=>{
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token)
      return res.json({ status: false, message: "Token is required" });
    let x = token.split(".");
    if (x.length < 3)
      return res.send({ status: false, message: "Invalid token" });
    var decodedToken = jwt.verify(token, "test");
    var company_id = decodedToken.user_id;
    let state_id_arr  = req.body.state_id_arr?req.body.state_id_arr:[];
    let pricelist_id  = req.body.pricelist_id?req.body.pricelist_id:"";
    if(pricelist_id=="") return res.json({status:false,message:"Please give pricelist_id"})
    if(state_id_arr.length<1) return res.json({status:false,message:"Please give state ids"})
    let mapped_data =await Mapping.find({ primary_id: pricelist_id, primary_type: "PriceList", assigned_to_type: "State" })
    if(mapped_data.length>0) return res.json({status:false,message:"Already present"})
    for(let i = 0;i<state_id_arr.length;i++){
        console.log("inside for")
        let assigned_data =await Mapping.create({
            company_id,
            primary_id:pricelist_id,
            primary_type:"PriceList",
            assigned_to_id:state_id_arr[i],
            assigned_to_type:"State",
            status:"Active",
            Created_date:get_current_date(),
            Updated_date:get_current_date(),
        })  
    }
    return res.json({status:true,message:"Pricelist assigned to States"})
});

router.post('/get_mapped_state_pricelist',async (req,res)=>{
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res.json({
        status: false,
        message: "Token must be provided",
        });
    }
    var decodedToken = jwt.verify(token, "test");
    var company_id = decodedToken.user_id;
    let pricelist_id = req.body.pricelist_id?req.body.pricelist_id:"";
    let page = req.body.page?req.body.page:"1";
    let limit = 10
    let final_arr = []
    if(pricelist_id==""){
        let pricelist_data = await PriceList.find({is_delete:"0",company_id:company_id}).limit(limit*1).skip((page-1)*limit)
        let total_pricelist_data = await PriceList.find({is_delete:"0",company_id:company_id})
        for (let i = 0; i < pricelist_data.length; i++) {
            let mapped_data =await Mapping.find({ primary_id: pricelist_data[i]._id, primary_type: "PriceList", assigned_to_type: "State" })
            let list = []
            for (let j = 0; j < mapped_data.length; j++) {
                let state_data = await Location.findOne({ id: mapped_data[j].assigned_to_id })
                let u_data = {
                    state_name: state_data.name,
                    id: state_data.id
                }
                list.push(u_data)
            }
            let data = {
                pricelist_name: pricelist_data[i].price_list_name,
                pricelist_id: pricelist_data[i]._id,
                parties: list,
            }
            final_arr.push(data)
        }
        return res.json({status:true,message:"Data",result:final_arr,page_length:Math.ceil(total_pricelist_data.length/limit),count:total_pricelist_data.length})

    }else if(pricelist_id!=""){
        let mapped_data =await Mapping.find({primary_id:pricelist_id,primary_type:"PriceList",assigned_to_type:"State"})
        let pricelist_data = await PriceList.findOne({_id:pricelist_id})
        let list = []
        for(let i = 0;i<mapped_data.length;i++){
            let state_data = await Location.findOne({_id:mapped_data[i].assigned_to_id})
            let u_data = {
                state_name:state_data.name,
                id:state_data.id
            }
            list.push(u_data)
        }
        var data = {
            pricelist_name:pricelist_data.price_list_name,
            pricelist_id:pricelist_data._id,
            parties:list,
        }
    }
    return res.json({status:true,message:"Data",result:data})
})

router.post('/edit_mapped_state_pricelist',async (req,res)=>{
    let state_id_arr  = req.body.state_id_arr?req.body.state_id_arr:[];
    let pricelist_id  = req.body.pricelist_id?req.body.pricelist_id:"";
    if(pricelist_id=="") return res.json({status:false,message:"Please give pricelist_id"})
    await Mapping.deleteMany({primary_id:pricelist_id,primary_type:"PriceList",assigned_to_type:"State",})
    if(state_id_arr.length>0){
        for(let i = 0;i<state_id_arr.length;i++){
            let assigned_data =await Mapping.create({
                primary_id:pricelist_id,
                primary_type:"PriceList",
                assigned_to_id:state_id_arr[i],
                assigned_to_type:"State",
                status:"Active",
                Created_date:get_current_date(),
                Updated_date:get_current_date(),
            })  
        }
    }else if(state_id_arr.length<1){
        return res.json({status:true,message:"Edited successfully"})   
    }
    return res.json({status:true,message:"Edited successfully"})
})

router.delete('/delete_mapped_state_pricelist',async (req,res)=>{
    let pricelist_id  = req.body.pricelist_id?req.body.pricelist_id:"";
    if(pricelist_id=="") return res.json({status:false,message:"Please give pricelist_id"})
    await Mapping.deleteMany({primary_id:pricelist_id,primary_type:"PriceList",assigned_to_type:"State",})
    return res.json({status:true,message:"Deleted"})
})

router.post('/partygrp_pricelist_mapping',async (req,res)=>{
    let partygrp_id_arr  = req.body.partygrp_id_arr?req.body.partygrp_id_arr:[];
    let pricelist_id  = req.body.pricelist_id?req.body.pricelist_id:"";
    if(pricelist_id=="") return res.json({status:false,message:"Please give pricelist_id"})
    if(partygrp_id_arr.length<1) return res.json({status:false,message:"Please give partygrp ids"})
    let mapped_data =await Mapping.find({ primary_id: pricelist_id, primary_type: "PriceList", assigned_to_type: "PartyGroup" })
    if(mapped_data.length>0) return res.json({status:false,message:"Already present"})
    for(let i = 0;i<partygrp_id_arr.length;i++){
        console.log("inside for")
        let assigned_data =await Mapping.create({
            primary_id:pricelist_id,
            primary_type:"PriceList",
            assigned_to_id:partygrp_id_arr[i],
            assigned_to_type:"PartyGroup",
            status:"Active",
            Created_date:get_current_date(),
            Updated_date:get_current_date(),
        })  
    }
    return res.json({status:true,message:"Pricelist assigned to partygrps"})
});

router.post('/get_mapped_partygrp_pricelist',async (req,res)=>{
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res.json({
        status: false,
        message: "Token must be provided",
        });
    }
    var decodedToken = jwt.verify(token, "test");
    var company_id = decodedToken.user_id;
    let pricelist_id = req.body.pricelist_id?req.body.pricelist_id:"";
    let final_arr = []
    if(pricelist_id==""){
        let pricelist_data = await PriceList.find({is_delete:"0",company_id:company_id})
        for (let i = 0; i < pricelist_data.length; i++) {
            let mapped_data =await Mapping.find({ primary_id: pricelist_data[i]._id, primary_type: "PriceList", assigned_to_type: "PartyGroup" })
            let list = []
            for (let j = 0; j < mapped_data.length; j++) {
                let partygrp_data = await PGroup.findOne({ _id: mapped_data[j].assigned_to_id })
                let u_data = {
                    partygrp_name: partygrp_data.grp_name,
                    id: partygrp_data._id
                }
                list.push(u_data)
            }
            let data = {
                pricelist_name: pricelist_data[i].price_list_name,
                pricelist_id: pricelist_data[i]._id,
                partygrps: list,
            }
            final_arr.push(data)
        }
        return res.json({status:true,message:"Data",result:final_arr})

    }else if(pricelist_id!=""){
        let mapped_data =await Mapping.find({primary_id:pricelist_id,primary_type:"PriceList",assigned_to_type:"PartyGroup"})
        let pricelist_data = await PriceList.findOne({_id:pricelist_id})
        let list = []
        for(let i = 0;i<mapped_data.length;i++){
            let partygrp_data = await PGroup.findOne({_id:mapped_data[i].assigned_to_id})
            let u_data = {
                partygrp_name:partygrp_data.grp_name,
                id:partygrp_data._id
            }
            list.push(u_data)
        }
        var data = {
            pricelist_name:pricelist_data.price_list_name,
            pricelist_id:pricelist_data._id,
            partygrps:list,
        }
    }
    return res.json({status:true,message:"Data",result:data})
})

router.post('/edit_mapped_partygrp_pricelist',async (req,res)=>{
    let partygrp_id_arr  = req.body.partygrp_id_arr?req.body.partygrp_id_arr:[];
    let pricelist_id  = req.body.pricelist_id?req.body.pricelist_id:"";
    if(pricelist_id=="") return res.json({status:false,message:"Please give pricelist_id"})
    await Mapping.deleteMany({primary_id:pricelist_id,primary_type:"PriceList",assigned_to_type:"PartyGroup",})
    if(partygrp_id_arr.length>0){
        for(let i = 0;i<partygrp_id_arr.length;i++){
            let assigned_data =await Mapping.create({
                primary_id:pricelist_id,
                primary_type:"PriceList",
                assigned_to_id:partygrp_id_arr[i],
                assigned_to_type:"PartyGroup",
                status:"Active",
                Created_date:get_current_date(),
                Updated_date:get_current_date(),
            })  
        }
    }else if(partygrp_id_arr.length<1){
        return res.json({status:true,message:"Edited successfully"})   
    }
    return res.json({status:true,message:"Edited successfully"})
})

router.delete('/delete_mapped_partygrp_pricelist',async (req,res)=>{
    let pricelist_id  = req.body.pricelist_id?req.body.pricelist_id:"";
    if(pricelist_id=="") return res.json({status:false,message:"Please give pricelist_id"})
    await Mapping.deleteMany({primary_id:pricelist_id,primary_type:"PriceList",assigned_to_type:"PartyGroup",})
    return res.json({status:true,message:"Deleted"})
})

module.exports = router;