const { access } = require("fs");
const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAPBOX_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken : mapToken});

module.exports.index = async(req, res) => {
    const allListings = await Listing.find({});
    const name = req.query.title;
    if (name) {
        res.render("listings/search.ejs", { allListings, name });
    } else {
        res.render("listings/index.ejs", { allListings });
    }
};

module.exports.renderNewForm = async(req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async(req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path :"reviews", populate: {path:"author"}}).populate("owner");
    if (!listing) {
        req.flash("error", "page you requested for doesn't exist!");
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs",{ listing});
};

module.exports.createListing = async(req, res) => {
    let response = await geocodingClient.forwardGeocode({
    query: req.body.listing.location,
    limit: 1
    })
    .send()

    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    newListing.geometry = response.body.features[0].geometry;
    let savedListing = await newListing.save();

    console.log(savedListing);
    req.flash("success", "New Listing created!");
    res.redirect("/listings");
};

module.exports.renderEditForm = async(req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "site you requested for doesn't exist");
        res.redirect("/listings");
    };
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/h_300,w_300");
    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async(req, res) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
    if (typeof req.file != "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url , filename };
        listing.save();
    };
    req.flash("success", "updated listing!");
    console.log(req.body.listing.title);
    res.redirect("/listings");
};

module.exports.destroyListing = async (req, res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "Deleted listing!");
    console.log(deletedListing);
    res.redirect("/listings");
};

