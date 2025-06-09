const Review = require("../models/review");
const Listing = require("../models/listing");

module.exports.createReview = async(req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    await listing.save();
    await newReview.save();
    req.flash("success", "added review!");
    console.log("new review saved");
    res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview = async (req, res) => {
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: { reviews: reviewId}});
    await Review.findById(reviewId);
    req.flash("success", "deleted review!");
    res.redirect(`/listings/${id}`);
};