const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const base_url = "https://webservice.salesparrow.in/";
const multer = require("multer");
const jwt = require("jsonwebtoken");
const Admin = mongoose.model("AdminInfo");
const Employee = mongoose.model("Employee");
const CatalogueBanner = require("../../models/catalogueBannerModel");
const CatalogueTrendingProduct = require("../../models/catalogueTrendingProductModel");
const CatalogueCategory = require("../../models/catalogueCategoryModel");

const userAuth = async (req, res, next) => {
    try {
        const header = req.header("Authorization");
        if (!header) return res.json({ status: false, message: "No header is present in the request!" });
        const token = header.split(" ")[1];
        if (!token || token == "undefined") return res.json({ status: false, message: "Token is required!" });

        let verifiedUser = jwt.verify(token, "test");
        const user = await Admin.findById(verifiedUser.user_id);
        if (!user) return res.json({ status: false, message: "user not found!" });

        req.user = user
        next()
    } catch (error) {
        next(error)
    }
}

const getCompanyId = async (req, res, next) => {
    try {
        const header = req.header("Authorization");
        if (!header) return res.json({ status: false, message: "No header is present in the request!" });
        const token = header.split(" ")[1];
        if (!token || token == "undefined") return res.json({ status: false, message: "Token is required!" });

        let { user_id } = jwt.verify(token, "test");
        let admin = await Admin.findById(user_id)
        if (admin) {
            req.companyId = admin._id
        } else {
            let emp = await Employee.findById(user_id)
            let admin = await Admin.findById(mongoose.Types.ObjectId(emp.companyId))
            req.companyId = admin._id
        }
        next()
    } catch (error) {
        next(error)
    }
}

// const getCompanyLogo = async (token) => {
//     let { user_id } = jwt.verify(token, "test");
//     let admin = await Admin.findById(user_id)
//     if (admin) {
//         return admin.profileImage
//     } else {
//         let emp = await Employee.findById(user_id)
//         let admin = await Admin.findById(mongoose.Types.ObjectId(emp.companyId))
//         return admin.profileImage
//     }
// }

const imageStorage = multer.diskStorage({
    destination: "images/catalogue_img",
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now());
    },
});

const imageUpload = multer({
    storage: imageStorage,
}).single("image")


// Catalogue Banner 
router.post("/banner", userAuth, async (req, res) => {
    imageUpload(req, res, async (err) => {
        try {
            if (!req.file) return res.status(201).json({ status: false, message: "File not found" });
            let { priority } = req.body;

            let banner = await CatalogueBanner.create({
                company_id: req.user._id,
                image: `${base_url}${req.file.path}`,
                priority,
            });
            return res.json({ status: true, message: "Catalgue banner created successfully", result: banner, });
        } catch (error) {
            console.log(error)
            res.send(error.message)
        }
    });
})

router.get("/banner", getCompanyId, async (req, res) => {
    try {
        let { page, limit } = req.body;
        page = page ? page : 1;
        limit = limit ? limit : 10;

        let findCondition = { status: true, company_id: req.companyId };
        let allBanners = await CatalogueBanner.find(findCondition)
            .skip((page * limit) - limit)
            .limit(limit)
            .sort({ priority: 1 });

        if (allBanners.length === 0) return res.status(200).json({ status: true, message: "no banners found", data: [] });
        res.status(200).json({
            status: true,
            message: "All banners fetched successfully!",
            total_users: allBanners.length,
            total_pages: Math.ceil(allBanners.length / limit),
            data: allBanners,
        })
    } catch (error) {
        next(error)
    }
});

router.patch("/banner", async (req, res) => {
    imageUpload(req, res, async (err) => {
        let id = req.body.id;
        if (id == "") return res.json({ status: false, message: "Please give id" });

        let updatedObj = {};
        if (req.body.priority) { updatedObj.priority = req.body.priority; }
        if (req.file) { updatedObj.image = `${base_url}${req.file.path}`; }
        // if (req.body.status) { updatedObj.status = req.body.status; }

        let updatedData = await CatalogueBanner.findByIdAndUpdate(id, updatedObj, { new: true });
        if (!updatedData) return res.json({ status: true, message: "Please check id" });
        return res.json({ status: true, message: "Updated successfully", result: updatedData, });
    });
});

router.delete("/banner/:id", async (req, res) => {
    try {
        let { id } = req.params;
        if (!id) return res.json({ status: false, message: "Please provide Id" });
        if (!mongoose.isValidObjectId(id)) return res.json({ status: false, message: "not valid Id" });

        const deletedData = await CatalogueBanner.findByIdAndDelete(id);
        if (!deletedData) return res.json({ status: false, message: "no document found with this id" });
        res.status(200).json({ status: true, message: "Banner deleted successfully.", data: deletedData });

    } catch (error) {
        console.log(error)
        res.send(error)
    }
});


// Catalogue Trending Product
router.post("/trending_product", userAuth, async (req, res) => {
    try {
        let { product_id, priority } = req.body;
        if (!product_id) return res.json({ status: false, message: "product_id is required!" })
        let oldData = await CatalogueTrendingProduct.findOne({ product_id })
        if (oldData) return res.json({ status: false, message: "product is already added!" })

        let trendingProduct = await CatalogueTrendingProduct.create({
            company_id: req.user._id,
            product_id,
            priority,
        });
        return res.json({ status: true, message: "Catalgue trending product created successfully", result: trendingProduct, });
    } catch (error) {
        console.log(error)
        res.send(error.message)
    }
})

router.get("/trending_product", getCompanyId, async (req, res) => {
    try {
        let { page, limit } = req.body;
        page = page ? page : 1;
        limit = limit ? limit : 10;

        let findCondition = { status: true, company_id: req.companyId };
        let allTrendingProduct = await CatalogueTrendingProduct.find(findCondition)
            .populate("product_id")
            .skip((page * limit) - limit)
            .limit(limit)
            .sort({ priority: 1 });

        if (allTrendingProduct.length === 0) return res.status(200).json({ status: true, message: "no product found", data: [] });
        res.status(200).json({
            status: true,
            message: "All products fetched successfully!",
            total_users: allTrendingProduct.length,
            total_pages: Math.ceil(allTrendingProduct.length / limit),
            data: allTrendingProduct,
        })
    } catch (error) {
        next(error)
    }
});

router.patch("/trending_product", async (req, res) => {
    imageUpload(req, res, async (err) => {
        let id = req.body.id;
        if (id == "") return res.json({ status: false, message: "Please give id" });

        let updatedObj = {};
        if (req.body.product_id) { updatedObj.product_id = req.body.product_id; }
        if (req.body.priority) { updatedObj.priority = req.body.priority; }
        if (req.file) { updatedObj.image = `${base_url}${req.file.path}`; }
        // if (req.body.status) { updatedObj.status = req.body.status; }

        let updatedData = await CatalogueTrendingProduct.findByIdAndUpdate(id, updatedObj, { new: true });
        if (!updatedData) return res.json({ status: true, message: "no document find with this id" });
        return res.json({ status: true, message: "Updated successfully", result: updatedData, });
    });
});

router.delete("/trending_product/:id", async (req, res) => {
    try {
        let { id } = req.params;
        if (!id) return res.json({ status: false, message: "Please provide Id" });
        if (!mongoose.isValidObjectId(id)) return res.json({ status: false, message: "not valid Id" });

        const deletedData = await CatalogueTrendingProduct.findByIdAndDelete(id);
        if (!deletedData) return res.json({ status: false, message: "no document found with this id" });
        res.status(200).json({ status: true, message: "Catalogue trending product deleted successfully.", data: deletedData });

    } catch (error) {
        console.log(error)
        res.send(error)
    }
});


// catalogue category
router.post("/category", userAuth, async (req, res) => {
    imageUpload(req, res, async (err) => {
        try {
            let { category_id, products, priority } = req.body;
            if (!category_id) return res.status(201).json({ status: false, message: "category_id is required!" });
            if (!products) return res.status(201).json({ status: false, message: "products is required!" });
            products = JSON.parse(products)

            let oldData = await CatalogueCategory.findOne({ category_id })
            if (oldData) return res.json({ status: false, message: "category is already added!" })
            // if (!req.file) return res.status(201).json({ status: false, message: "File not found" });

            let category = await CatalogueCategory.create({
                company_id: req.user._id,
                category_id,
                products,
                // banner_img: `${base_url}${req.file.path}`,
                priority,
            });
            return res.json({ status: true, message: "Catalgue category created successfully", result: category, });
        } catch (error) {
            console.log(error)
            res.send(error.message)
        }
    });
})

router.get("/category", getCompanyId, async (req, res) => {
    try {
        let { page, limit } = req.body;
        page = page ? page : 1;
        limit = limit ? limit : 10;

        let findCondition = { status: true, company_id: req.companyId };
        let allData = await CatalogueCategory.find(findCondition)
            .populate("products category_id")
            .skip((page * limit) - limit)
            .limit(limit)
            .sort({ createdAt: -1 });

        if (allData.length === 0) return res.status(200).json({ status: true, message: "no category found", data: [] });
        res.status(200).json({
            status: true,
            message: "All category fetched successfully!",
            total_users: allData.length,
            total_pages: Math.ceil(allData.length / limit),
            data: allData,
        })
    } catch (error) {
        console.log(error)
        // next(error)
    }
});

router.get("/category/:id", getCompanyId, async (req, res) => {
    try {
        let { id } = req.params;
        let allData = await CatalogueCategory.findById(id).populate("products category_id")

        if (!allData) return res.status(200).json({ status: true, message: "no category found" });
        res.status(200).json({
            status: true,
            message: "Category product fetched successfully!",
            data: allData,
        })
    } catch (error) {
        console.log(error)
        // next(error)
    }
});

router.patch("/category", async (req, res) => {
    imageUpload(req, res, async (err) => {
        let { id, category_id, products, priority } = req.body;
        if (id == "") return res.json({ status: false, message: "Please give id" });

        let updatedObj = {};
        if (category_id) { updatedObj.category_id = category_id; }
        if (products) updatedObj.products = JSON.parse(products)
        if (priority) { updatedObj.priority = priority; }
        if (req.file) { updatedObj.banner_img = `${base_url}${req.file.path}`; }
        // if (req.body.status) { updatedObj.status = req.body.status; }

        let updatedData = await CatalogueCategory.findByIdAndUpdate(id, updatedObj, { new: true });
        if (!updatedData) return res.json({ status: true, message: "Please check id" });
        return res.json({ status: true, message: "Updated successfully", result: updatedData, });
    });
});

router.delete("/category/:id", async (req, res) => {
    try {
        let { id } = req.params;
        if (!id) return res.json({ status: false, message: "Please provide Id" });
        if (!mongoose.isValidObjectId(id)) return res.json({ status: false, message: "not valid Id" });

        const deletedData = await CatalogueCategory.findByIdAndDelete(id);
        if (!deletedData) return res.json({ status: false, message: "no document found with this id" });
        res.status(200).json({ status: true, message: "category deleted successfully.", data: deletedData });
    } catch (error) {
        console.log(error)
        res.send(error)
    }
});


module.exports = router;