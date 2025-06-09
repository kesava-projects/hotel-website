const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync");
const {isLoggedIn} = require("../middleware.js");
const {validateReview, isreviewAuthor} = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");

//Reviews
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

//Delete review route
router.delete("/:reviewId", isLoggedIn, isreviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router;