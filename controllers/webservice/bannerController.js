const express = require("express");
const mongoose = require("mongoose");
const Banner = mongoose.model("Banner");
const router = express.Router();
const base_url = "https://webservice.salesparrow.in/";
const multer = require("multer");
const deleteImageHandler = require("../../superadmin/utils/deleteImageHandler");

const imageStorage = multer.diskStorage({
    destination: "images/Banner",
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now());
    },
});

const imageUpload = multer({
    storage: imageStorage,
}).single("banner_image")

function get_current_date() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var yyyy = today.getFullYear();
    var time =
        today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return (today = yyyy + "-" + mm + "-" + dd + " " + time);
};

router.post('/addBanner', (req, res) => {
    imageUpload(req, res, async (err) => {
        if (err) return res.json({ status: false, message: "multwr error" });

        let { banner_name, category_name, logo_position } = req.body
        if (banner_name != "") {
            if (category_name != "") {
                if (logo_position != "") {
                    var new_banner = new Banner({
                        banner_name, category_name, logo_position,
                        banner_image: base_url + req.file.path,
                    });
                    new_banner.save().then(data => {
                        res.status(200).json({ status: true, message: "Banner added successfully", result: data });
                    })
                } else {
                    res.json({ status: false, message: "logo_position is required" });
                }
            } else {
                res.json({ status: false, message: "category_name is required" });
            }
        } else {
            res.json({ status: false, message: "banner_name is required" });
        }
    });
});

router.post('/getBanner', async (req, res) => {
    let { page, limit } = req.body;
    page = page ? Number(page) : 1;
    limit = limit ? Number(limit) : 10;

    let findCondition = { is_deleted: false, status: true };
    let allBanner = await Banner.find(findCondition)
        .skip((page * limit) - limit)
        .limit(limit)
        .sort({ createdAt: -1 });

    if (allBanner.length === 0) return res.status(200).json({ status: true, message: "no banner found", data: [] });
    res.status(200).json({
        status: true,
        message: "All banner fetched successfully!",
        total_users: allBanner.length,
        total_pages: Math.ceil(allBanner.length / limit),
        data: allBanner,
    })
})

router.post('/getBanner_listing', async (req, res) => {
    const banner = await Banner.aggregate([
        {
            $group: {
                _id: '$category_name',
                banners: { $push: '$$ROOT' }
            },
        },
        {
            $project: {
                category_name: '$_id',
                banners: { $slice: ['$banners', 10] },
                _id: 0,
            },
        },
    ])

    banner.map(cat => cat.createdAt = cat.banners[0].createdAt).sort((a, b) => b.createdAt - a.createdAt)
    res.status(200).json({
        status: true,
        message: "All banner fetched successfullyyyy!",
        data: banner,
    })
})

router.post('/get_category_banner', async (req, res) => {
    let { category, page, limit } = req.body;
    page = page ? Number(page) : 1;
    limit = limit ? Number(limit) : 16;

    let categoryArr = await Banner.find({ category_name: category })
        .skip((page * limit) - limit)
        .limit(limit)
        .sort({ createdAt: -1 });

    if (categoryArr.length === 0) return res.status(200).json({ status: true, message: "no banner found", data: [] });
    res.status(200).json({
        status: true,
        message: "All banner fetched successfully!",
        total_users: categoryArr.length,
        total_pages: Math.ceil(categoryArr.length / limit),
        data: categoryArr,
    })
})

router.patch('/updateBanner', async (req, res) => {
    imageUpload(req, res, async (err) => {
        console.log(err)
        if (err) return res.json({ status: false, message: "multwr error" });

        let { id, banner_name, category_name, logo_position } = req.body;

        let oldBanner = await Banner.findById(id);
        let oldImage = oldBanner.banner_image || "";

        let updatedObj = {}
        if (banner_name) updatedObj.banner_name = banner_name;
        if (category_name) updatedObj.category_name = category_name;
        if (logo_position) updatedObj.logo_position = logo_position;

        if (req.file) updatedObj.banner_image = base_url + req.file.path;

        let updatedBanner = await Banner.findByIdAndUpdate(id, updatedObj, { new: true });
        deleteImageHandler(oldImage);
        res.status(200).json({ status: true, message: "Banner details updated successfully!", data: updatedBanner });
    })
})

router.delete("/deleteBanner/:id", async (req, res) => {
    try {
        let { id } = req.params;
        if (!id) throw new ApiError("ID is required!", 400);
        if (!mongoose.isValidObjectId(id)) throw new ApiError("Invalid ID!", 400);

        // const deletedBanner = await Banner.findByIdAndUpdate(id, { is_deleted: true }, { new: true });
        const deletedBanner = await Banner.findByIdAndDelete(id);
        if (!deletedBanner) throw new ApiError("No document found with this ID", 404);
        res.status(200).json({ status: true, message: "Banner deleted successfully.", data: deletedBanner });
    } catch (error) {
        res.json({ status: false, message: error.message })
    }
})

module.exports = router;