const REVIEWS_API = "http://localhost:5000/api/customer/reviews";
const CATERERS_API = "http://localhost:5000/api/customer/caterers/approved";

const customer = JSON.parse(
    localStorage.getItem("annapriya_customer")
);

const customerId =
    customer?.customerId ||
    customer?.customer_id ||
    customer?.id ||
    null;


// -----------------------------
// DOM ELEMENTS
// -----------------------------

const loadingSection = document.getElementById("loadingSection");
const errorSection = document.getElementById("errorSection");
const errorMessage = document.getElementById("errorMessage");
const emptySection = document.getElementById("emptySection");
const reviewsSection = document.getElementById("reviewsSection");

const reviewsContainer =
    document.getElementById("reviewsContainer");

const reviewCount =
    document.getElementById("reviewCount");

const refreshButton =
    document.getElementById("refreshButton");

const retryButton =
    document.getElementById("retryButton");

const backButton =
    document.getElementById("backButton");

const profileButton =
    document.getElementById("profileButton");

const profileMenu =
    document.getElementById("profileMenu");

const logoutButton =
    document.getElementById("logoutButton");

const customerName =
    document.getElementById("customerName");


// Write review elements
const writeReviewButton =
    document.getElementById("writeReviewButton");

const writeReviewButtonEmpty =
    document.getElementById("writeReviewButtonEmpty");

const writeReviewSection =
    document.getElementById("writeReviewSection");

const closeReviewForm =
    document.getElementById("closeReviewForm");

const cancelReviewButton =
    document.getElementById("cancelReviewButton");

const reviewForm =
    document.getElementById("reviewForm");

const catererSelect =
    document.getElementById("catererSelect");

const ratingValue =
    document.getElementById("ratingValue");

const ratingText =
    document.getElementById("ratingText");

const reviewText =
    document.getElementById("reviewText");

const submitReviewButton =
    document.getElementById("submitReviewButton");

const ratingStars =
    document.querySelectorAll(".rating-star");


// -----------------------------
// CUSTOMER DETAILS
// -----------------------------

function loadCustomerDetails() {

    if (!customer) {
        customerName.textContent = "Customer";
        return;
    }

    customerName.textContent =
        customer.fullName ||
        customer.name ||
        "Customer";
}


// -----------------------------
// PROFILE MENU
// -----------------------------

if (profileButton) {

    profileButton.addEventListener("click", () => {

        profileMenu.classList.toggle("show");

    });
}


document.addEventListener("click", (event) => {

    if (
        profileMenu &&
        profileButton &&
        !profileMenu.contains(event.target) &&
        !profileButton.contains(event.target)
    ) {
        profileMenu.classList.remove("show");
    }

});


// -----------------------------
// BACK BUTTON
// -----------------------------

if (backButton) {

    backButton.addEventListener("click", () => {

        window.location.href =
            "customerdashboard.html";

    });

}


// -----------------------------
// LOGOUT
// -----------------------------

if (logoutButton) {

    logoutButton.addEventListener("click", () => {

        localStorage.removeItem("annapriya_customer");
        localStorage.removeItem("annapriya_token");

        window.location.href = "index.html";

    });

}


// -----------------------------
// ESCAPE HTML
// -----------------------------

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// -----------------------------
// FORMAT DATE
// -----------------------------

function formatDate(dateValue) {

    if (!dateValue) {
        return "";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });

}


// -----------------------------
// CREATE STARS
// -----------------------------

function createStars(rating) {

    const numericRating = Number(rating) || 0;

    let stars = "";

    for (let i = 1; i <= 5; i++) {

        stars += i <= numericRating
            ? "★"
            : "☆";

    }

    return stars;

}


// -----------------------------
// LOAD REVIEWS
// -----------------------------

async function loadReviews() {

    if (!customerId) {

        loadingSection.style.display = "none";
        errorSection.style.display = "block";

        errorMessage.textContent =
            "Customer information not found. Please login again.";

        return;
    }


    loadingSection.style.display = "block";
    errorSection.style.display = "none";
    emptySection.style.display = "none";
    reviewsSection.style.display = "none";


    try {

        const response =
            await fetch(`${REVIEWS_API}/${customerId}`);


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.message || "Could not load reviews."
            );

        }


        const reviews = data.reviews || [];


        loadingSection.style.display = "none";


        if (reviews.length === 0) {

            emptySection.style.display = "block";

            return;
        }


        reviewsSection.style.display = "block";

        reviewCount.textContent = reviews.length;


        reviewsContainer.innerHTML = "";


        reviews.forEach((review) => {

            const card =
                document.createElement("div");

            card.className = "review-card";


            card.innerHTML = `

                <div class="review-card-header">

                    <div>

                        <h3>
                            ${escapeHTML(
                                review.caterer_name ||
                                "Caterer"
                            )}
                        </h3>

                        <div class="review-stars">
                            ${createStars(review.rating)}
                        </div>

                    </div>

                    <span class="review-date">
                        ${formatDate(review.created_at)}
                    </span>

                </div>


                <p class="review-content">
                    ${escapeHTML(
                        review.review_text ||
                        "No written review."
                    )}
                </p>


                <div class="review-actions">

                    <button
                        class="delete-review-btn"
                        data-review-id="${review.review_id}"
                    >
                        Delete
                    </button>

                </div>

            `;


            reviewsContainer.appendChild(card);

        });


        attachDeleteButtons();

    }

    catch (error) {

        console.error(
            "Load reviews error:",
            error
        );


        loadingSection.style.display = "none";
        errorSection.style.display = "block";

        errorMessage.textContent =
            error.message ||
            "Could not load your reviews.";

    }

}


// -----------------------------
// DELETE REVIEW
// -----------------------------

function attachDeleteButtons() {

    const deleteButtons =
        document.querySelectorAll(
            ".delete-review-btn"
        );


    deleteButtons.forEach((button) => {

        button.addEventListener("click", async () => {

            const reviewId =
                button.dataset.reviewId;


            const confirmed =
                confirm(
                    "Are you sure you want to delete this review?"
                );


            if (!confirmed) {
                return;
            }


            try {

                const response =
                    await fetch(
                        `${REVIEWS_API}/${reviewId}`,
                        {
                            method: "DELETE"
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Could not delete review."
                    );

                }


                alert(
                    "Review deleted successfully."
                );


                loadReviews();

            }

            catch (error) {

                console.error(
                    "Delete review error:",
                    error
                );


                alert(
                    error.message ||
                    "Could not delete review."
                );

            }

        });

    });

}


// -----------------------------
// LOAD CATERERS
// -----------------------------

async function loadCaterers() {

    catererSelect.innerHTML = `
        <option value="">
            Loading caterers...
        </option>
    `;


    try {

        const response =
            await fetch(CATERERS_API);


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Could not load caterers."
            );

        }


        const caterers =
            data.caterers || [];


        catererSelect.innerHTML = `
            <option value="">
                Select a caterer
            </option>
        `;


        if (caterers.length === 0) {

            catererSelect.innerHTML = `
                <option value="">
                    No caterers available
                </option>
            `;

            return;
        }


        caterers.forEach((caterer) => {

            const option =
                document.createElement("option");


            option.value =
                caterer.caterer_id;


            option.textContent =
                caterer.brand_name ||
                caterer.head_name ||
                `Caterer ${caterer.caterer_id}`;


            catererSelect.appendChild(option);

        });

    }

    catch (error) {

        console.error(
            "Load caterers error:",
            error
        );


        catererSelect.innerHTML = `
            <option value="">
                Could not load caterers
            </option>
        `;


        alert(
            "Could not load caterers. Please make sure the backend server is running."
        );

    }

}


// -----------------------------
// OPEN REVIEW FORM
// -----------------------------

async function openWriteReview() {

    writeReviewSection.style.display =
        "block";


    emptySection.style.display =
        "none";


    reviewsSection.style.display =
        "none";


    await loadCaterers();

}


// -----------------------------
// CLOSE REVIEW FORM
// -----------------------------

function closeWriteReview() {

    writeReviewSection.style.display =
        "none";


    reviewForm.reset();


    ratingValue.value = "";

    ratingText.textContent =
        "Select a rating";


    ratingStars.forEach((star) => {

        star.classList.remove("selected");

    });


    loadReviews();

}


// -----------------------------
// RATING SELECTION
// -----------------------------

ratingStars.forEach((star) => {

    star.addEventListener("click", () => {

        const selectedRating =
            Number(star.dataset.rating);


        ratingValue.value =
            selectedRating;


        ratingText.textContent =
            `${selectedRating} out of 5`;


        ratingStars.forEach((item) => {

            const itemRating =
                Number(item.dataset.rating);


            if (itemRating <= selectedRating) {

                item.classList.add("selected");

            } else {

                item.classList.remove("selected");

            }

        });

    });

});


// -----------------------------
// SUBMIT REVIEW
// -----------------------------

reviewForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        if (!customerId) {

            alert(
                "Customer information not found. Please login again."
            );

            return;
        }


        const selectedCaterer =
            catererSelect.value;


        const selectedRating =
            Number(ratingValue.value);


        const text =
            reviewText.value.trim();


        if (!selectedCaterer) {

            alert(
                "Please select a caterer."
            );

            return;
        }


        if (
            !selectedRating ||
            selectedRating < 1 ||
            selectedRating > 5
        ) {

            alert(
                "Please select a rating from 1 to 5 stars."
            );

            return;
        }


        if (!text) {

            alert(
                "Please write your review."
            );

            return;
        }


        submitReviewButton.disabled =
            true;


        submitReviewButton.textContent =
            "Submitting...";


        try {

            const response =
                await fetch(
                    REVIEWS_API,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            customerId:
                                customerId,

                            catererId:
                                Number(selectedCaterer),

                            rating:
                                selectedRating,

                            reviewText:
                                text

                        })

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Could not submit review."
                );

            }


            alert(
                "Review submitted successfully! ⭐"
            );


            reviewForm.reset();


            ratingValue.value = "";

            ratingText.textContent =
                "Select a rating";


            ratingStars.forEach((star) => {

                star.classList.remove(
                    "selected"
                );

            });


            writeReviewSection.style.display =
                "none";


            loadReviews();

        }

        catch (error) {

            console.error(
                "Submit review error:",
                error
            );


            alert(
                error.message ||
                "Could not submit review."
            );

        }

        finally {

            submitReviewButton.disabled =
                false;


            submitReviewButton.textContent =
                "Submit Review";

        }

    }
);


// -----------------------------
// BUTTON EVENTS
// -----------------------------

if (writeReviewButton) {

    writeReviewButton.addEventListener(
        "click",
        openWriteReview
    );

}


if (writeReviewButtonEmpty) {

    writeReviewButtonEmpty.addEventListener(
        "click",
        openWriteReview
    );

}


if (closeReviewForm) {

    closeReviewForm.addEventListener(
        "click",
        closeWriteReview
    );

}


if (cancelReviewButton) {

    cancelReviewButton.addEventListener(
        "click",
        closeWriteReview
    );

}


if (refreshButton) {

    refreshButton.addEventListener(
        "click",
        loadReviews
    );

}


if (retryButton) {

    retryButton.addEventListener(
        "click",
        loadReviews
    );

}


// -----------------------------
// INITIALIZE
// -----------------------------

loadCustomerDetails();
loadReviews();