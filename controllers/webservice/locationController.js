const express = require("express");
const mongoose = require("mongoose");
const Location = mongoose.model("Location");
const Country = mongoose.model("Country");
const router = express.Router();
// const data = require("./countries+states+cities.json");

function get_current_date() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var yyyy = today.getFullYear();
    var time =
        today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return (today = yyyy + "-" + mm + "-" + dd + " " + time);
};

router.post('/addLocation', (req, res) => {
    var name = req.body.name ? req.body.name : "";
    var country_id = req.body.country_id ? req.body.country_id : "";
    // var superp_id = req.body.superp_id?req.body.superp_id:"";
    var subp_id = req.body.subp_id ? req.body.subp_id : "";
    var p_id = req.body.p_id ? req.body.p_id : "";
    if (name != "") {
        Location.find({ $and: [{ name: name }, { country_id: country_id }] }).exec().then(location_data => {
            if (location_data.length < 1) {
                var new_location = new Location({
                    name: name,
                    country_id: country_id,
                    subP_id: subp_id,
                    P_id: p_id,
                    // superp_id:superp_id,
                    status: "Active",
                    Created_date: get_current_date(),
                    Updated_date: get_current_date()
                });
                new_location.save().then(data => {
                    res.status(200).json({
                        status: true,
                        message: "Location added successfully",
                        details: data
                    })
                })
            } else {
                res.json({
                    status: false,
                    message: "location already exists"
                })
            }
        })
    } else {
        res.status(401).json({
            status: false,
            message: "Name must be filled"
        })
    }

});

// router.get('/getLocation',(req,res)=>{
//     console.log(req.query);
//     var p_id = req.query.p_id?req.query.p_id:"";
//     var subp_id = req.query.subp_id?req.query.subp_id:"";

//     if(p_id==""){
//         Location.find({P_id:""}).exec().then(state_data=>{
//             res.json({
//                 status:true,
//                 message:"States get successfully",
//                 result:state_data
//             });
//         });
//     }else if(p_id!=""){
//         Location.find({P_id:p_id,subP_id:""}).exec().then(city_data=>{
//             res.json({
//                 status:true,
//                 message:"City data fetch successfully",
//                 result:city_data
//             });
//         });
//     }
// });

router.get('/getLocation', async (req, res) => {
    console.log(req.query);
    var country_id = req.query.country_id ? req.query.country_id : "";
    if (country_id == "") return res.json({ status: false, message: "Please give country id" })
    var subp_id = req.query.subp_id ? req.query.subp_id : "";
    var P_id = req.query.P_id ? req.query.P_id : "";
    // var superp_id = req.query.superp_id?req.query.superp_id:"";
    let arr = {}
    if (country_id != "") arr.country_id = country_id
    if (P_id != "") arr.P_id = P_id
    if (P_id == "") arr.P_id = ""
    if (subp_id == "") arr.subP_id = ""
    console.log(arr);
    // if(superp_id) arr.push({superp_id:superp_id})
    let location_data = await Location.find(arr).sort({ name: 1 });
    if (location_data.length < 1) return res.json({ status: true, message: "No data", result: [] })
    if (location_data.length > 0) return res.json({ status: true, message: "Location get successfully", result: location_data })
});

// router.post('/edit',async (req,res)=>{
//     let location_data = await Location.updateMany({$set:{country_id:"63cf68dc21e4ea1a2cac4211"}})
//     return res.json({status:true})
// })

router.post('/addCountry', (req, res) => {
    var name = req.body.name ? req.body.name : "";
    if (name != "") {
        Country.find({ name }).exec().then(country_data => {
            if (country_data.length < 1) {
                var new_country = new Country({
                    name: name,
                    status: "Active",
                    Created_date: get_current_date(),
                    Updated_date: get_current_date()
                });
                new_country.save().then(data => {
                    res.status(200).json({
                        status: true,
                        message: "Country added successfully",
                        details: data
                    })
                })
            } else {
                res.json({
                    status: false,
                    message: "Country already exists"
                })
            }
        })
    } else {
        res.status(401).json({
            status: false,
            message: "Name must be filled"
        })
    }

});

router.get('/get_country', async (req, res) => {
    let country_data = await Country.find().sort({ name: 1 })
    return res.json({ status: true, message: "Countries", result: country_data })
})

// router.post('/location_via_pincode',(req,res)=>{
//     let state = req.body.state?req.body.state:"";
//     let country = req.body.country?req.body.country:"";
//     let country_data = 
// })

// router.post('/add_all_locations',async(req,res)=>{
//     for(let i = 0;i<data.length;i++){
//         let id = data[i].id;
//         let name = data[i].name;
//         let states = data[i].states;
//         let location_data = await Location.findOne({name})
//         // if(location_data) return res.json({status:false,message:"Already preasent"})
//         let new_location =await Location.create({
//             id:id,
//             name:name,
//             states:states,
//             status:"Active",
//         })
//         console.log(`Done for ${data[i].name}`);
//     }
//     return res.json({status:true,message:"Location added successfully"})
// })

// router.post('/add_all_countries',async(req,res)=>{
//     for(let i = 0;i<data.length;i++){
//         let new_country =await Country.create({
//             name:data[i].name,
//             id:data[i].id,
//             status:"Active",
//             Created_date:get_current_date(),
//             Updated_date:get_current_date(),
//         })
//         console.log(`Done for ${data[i].name}`);
//     }
//     return res.json({status:true,message:"Countries added successfully"})
// })

// router.delete('/delete_countries',async (req,res)=>{
//     let country_data = await Country.find()
//     for(let i = 0;i<country_data.length;i++){
//         if(country_data[i].is_delete =="0"){
//             await Country.deleteOne({_id:country_data[i]._id})
//         }
//     }
//     res.json({status:true})
// })
// router.delete('/delete_location_data',async (req,res)=>{
//     let location_data = await Location.find()
//     for(let i = 0;i<location_data.length;i++){
//         if(location_data[i].is_delete =="0"){
//             await Location.deleteOne({_id:location_data[i]._id})
//         }
//     }
//     res.json({status:true})
// })

// router.post('/add_all_states',async(req,res)=>{
//     for(let i = 0;i<data.length;i++){
//         for(let j = 0;j<data[i].states.length;j++){
//             let new_state =await Location.create({
//                 name:data[i].states[j].name,
//                 id:data[i].states[j].id,
//                 country_id:data[i].id,
//                 subP_id:"",
//                 P_id:"",
//                 status:"Active",
//                 Created_date:get_current_date(),
//                 Updated_date:get_current_date(),
//             })
//             console.log(`Done for ${data[i].states[j].name}`);
//         }
//         console.log(`Done for ${data[i].name}`);
//     }
//     return res.json({status:true,message:"States added successfully"})
// })

// router.post('/add_all_cities',async(req,res)=>{
//     for(let i = 0;i<data.length;i++){
//         for(let j = 0;j<data[i].states.length;j++){
//             for(let k = 0;k<data[i].states[j].cities.length;k++){
//                 let new_cities =await Location.create({
//                     name:data[i].states[j].cities[k].name,
//                     id:data[i].states[j].cities[k].id,
//                     country_id:data[i].id,
//                     subP_id:"",
//                     P_id:data[i].states[j].id,
//                     status:"Active",
//                     Created_date:get_current_date(),
//                     Updated_date:get_current_date(),
//                 })
//                 console.log(`Done for ${data[i].states[j].cities[k].name}`);
//             }
//             console.log(`Done for ---------------- ${data[i].states[j].name}`);
//         }
//         console.log(`Done for ${data[i].name}`);
//     }
//     return res.json({status:true,message:"States added successfully"})
// })

// router.post('/add_states_to_country',async (req,res)=>{
//     let states = req.body.states?req.body.states:{};
//     let id = req.body.id?req.body.id:"";
//     if(states=={}) return res.json({status:false,message:"please give states"})
//     let location_data = await Location.findOne({id})
//     var states_list = [];
//     for(let i = 0;i<location_data.states.length;i++){
//         states_list.push(location_data.states[i])
//     }
//     states_list.push(states)
//     await Location.findOneAndUpdate({id},{$set:{states:states_list}})
//     return res.json({status:true,message:"state added successfully"})
// })

// router.post('/get_country',async (req,res)=>{
//     let country_data = await Location.find();
//     let list = []
//     for(let i = 0 ; i<country_data.length;i++){
//         let u_data = {
//             id:country_data[i].id,
//             name:country_data[i].name
//         }
//         list.push(u_data)
//     }
//     return res.json({status:true,message:"Countries",result:list})
// })

// router.post('/get_states',async (req,res)=>{
//     let country_id = req.body.country_id?req.body.country_id:"";
//     if(country_id=="") return res.json({status:false,message:"Please give country id"})
//     let country_data = await Location.findOne({id:country_id});
//     let state_data = country_data.states;
//     let list = []
//     for(let i = 0 ; i<state_data.length;i++){
//         let u_data = {
//             id:state_data[i].id,
//             name:state_data[i].name
//         }
//         list.push(u_data)
//     }
//     return res.json({status:true,message:"States",result:list})
// })

// router.post('/get_cities',async (req,res)=>{
//     let country_id = req.body.country_id?req.body.country_id:"";
//     let state_id = req.body.state_id?req.body.state_id:"";
//     if(country_id=="") return res.json({status:false,message:"Please give country id"})
//     if(state_id=="") return res.json({status:false,message:"Please give state id"})
//     let country_data = await Location.findOne({id:country_id});
//     let state_data = country_data.states;
//     let list = []
//     for(let i = 0 ; i<state_data.length;i++){
//         if(state_data[i].id==state_id){
//             let city_data = state_data[i].cities;
//             for(let j = 0;j<city_data.length;j++){
//                 let u_data = {
//                     id:city_data[j].id,
//                     name:city_data[j].name
//                 }
//                 list.push(u_data)
//             }
//             return res.json({status:true,message:"Cities",result:list})
//         }
//     }
// })


module.exports = router;