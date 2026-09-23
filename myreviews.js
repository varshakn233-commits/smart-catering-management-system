// =====================================================
// MY REVIEWS - ANNAPRIYA
// =====================================================

// API URL
const REVIEWS_API =
    "http://localhost:5000/api/customer/reviews";


// =====================================================
// GET CUSTOMER
// =====================================================

const customer = JSON.parse(
    localStorage.getItem("annapriya_customer") || "null"
);

const customerId =
    customer?.customerId ||
    customer?.customer_id ||
    customer?.id ||
    null;


// =====================================================
// DOM ELEMENTS
// =====================================================

const loadingSection =
    document.getElementById("loadingSection");

const errorSection =
    document.getElementById("errorSection");

const errorMessage =
    document.getElementById("errorMessage");

const retryButton =
    document.getElementById("retryButton");

const emptySection =
    document.getElementById("emptySection");

const reviewsSection =
    document.getElementById("reviewsSection");

const reviewCount =
    document.getElementById("reviewCount");

const reviewsContainer =
    document.getElementById("reviewsContainer");

const refreshButton =
    document.getElementById("refreshButton");


// Header
const headerCustomerName =
    document.getElementById("headerCustomerName");

const headerAvatar =
    document.getElementById("headerAvatar");

const backButton =
    document.getElementById("backButton");

const profileButton =
    document.getElementById("profileButton");

const profileButtonMenu =
    document.getElementById("profileButtonMenu");


// =====================================================
// CUSTOMER HEADER
// =====================================================

function loadCustomerDetails() {

    if (!customer) {

        headerCustomerName.textContent =
            "Customer";

        headerAvatar.textContent =
            "C";

        return;
    }


    const name =
        customer.fullName ||
        customer.full_name ||
        "Customer";


    headerCustomerName.textContent =
        name;


    headerAvatar.textContent =
        name
            .charAt(0)
            .toUpperCase();

}


// =====================================================
// PROFILE MENU
// =====================================================

profileButton.addEventListener(
    "click",
    function (event) {

        event.stopPropagation();

        profileButtonMenu.classList.toggle(
            "show"
        );

    }
);


document.addEventListener(
    "click",
    function () {

        profileButtonMenu.classList.remove(
            "show"
        );

    }
);


// =====================================================
// BACK BUTTON
// =====================================================

backButton.addEventListener(
    "click",
    function () {

        window.location.href =
            "customerdashboard.html";

    }
);


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(dateValue) {

    if (!dateValue) {
        return "-";
    }


    const date =
        new Date(dateValue);


    if (isNaN(date.getTime())) {
        return dateValue;
    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// =====================================================
// CREATE STAR RATING
// =====================================================

function createStars(rating) {

    const value =
        Number(rating) || 0;


    let stars = "";


    for (let i = 1; i <= 5; i++) {

        if (i <= value) {

            stars += "★";

        } else {

            stars +=
                '<span class="empty-star">★</span>';

        }

    }


    return stars;

}


// =====================================================
// SHOW LOADING
// =====================================================

function showLoading() {

    loadingSection.style.display =
        "block";

    errorSection.style.display =
        "none";

    emptySection.style.display =
        "none";

    reviewsSection.style.display =
        "none";

}


// =====================================================
// SHOW ERROR
// =====================================================

function showError(message) {

    loadingSection.style.display =
        "none";

    errorSection.style.display =
        "block";

    emptySection.style.display =
        "none";

    reviewsSection.style.display =
        "none";


    errorMessage.textContent =
        message ||
        "Could not load your reviews.";

}


// =====================================================
// LOAD REVIEWS
// =====================================================

async function loadReviews() {

    if (!customerId) {

        throw new Error(
            "Customer information not found. Please login again."
        );

    }


    const response =
        await fetch(
            `${REVIEWS_API}/${customerId}`
        );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.message ||
            "Could not load reviews."
        );

    }


    const reviews =
        data.reviews || [];


    // Clear old reviews
    reviewsContainer.innerHTML =
        "";


    reviewCount.textContent =
        reviews.length;


    // =============================================
    // NO REVIEWS
    // =============================================

    if (reviews.length === 0) {

        loadingSection.style.display =
            "none";

        errorSection.style.display =
            "none";

        reviewsSection.style.display =
            "none";

        emptySection.style.display =
            "block";

        return;

    }


    // =============================================
    // SHOW REVIEWS
    // =============================================

    loadingSection.style.display =
        "none";

    errorSection.style.display =
        "none";

    emptySection.style.display =
        "none";

    reviewsSection.style.display =
        "block";


    reviews.forEach(function (review) {

        const catererName =
            review.caterer_name ||
            review.brand_name ||
            "Caterer";


        const rating =
            Number(
                review.rating ||
                review.stars ||
                0
            );


        const reviewText =
            review.review_text ||
            review.review ||
            review.comment ||
            "No review text.";


        const reviewDate =
            review.created_at ||
            review.review_date;


        const card =
            document.createElement("div");


        card.className =
            "review-card";


        card.innerHTML = `

            <div class="review-header">

                <div class="caterer-info">

                    <div class="caterer-avatar">

                        ${escapeHTML(
                            catererName
                                .charAt(0)
                                .toUpperCase()
                        )}

                    </div>


                    <div class="caterer-details">

                        <h3>
                            ${escapeHTML(
                                catererName
                            )}
                        </h3>

                        <span>
                            Your review
                        </span>

                    </div>

                </div>


                <div class="review-rating">

                    ${createStars(rating)}

                </div>

            </div>


            <div class="review-text">

                ${escapeHTML(reviewText)}

            </div>


            <div class="review-date">

                Reviewed on
                ${escapeHTML(
                    formatDate(reviewDate)
                )}

            </div>


            <div class="review-actions">

                <button
                    class="edit-review-button"
                    type="button"
                    data-review-id="${escapeHTML(
                        review.review_id ||
                        review.id ||
                        ""
                    )}"
                >
                    ✏️ Edit
                </button>


                <button
                    class="delete-review-button"
                    type="button"
                    data-review-id="${escapeHTML(
                        review.review_id ||
                        review.id ||
                        ""
                    )}"
                >
                    🗑 Delete
                </button>

            </div>

        `;


        reviewsContainer.appendChild(
            card
        );

    });


    // Add button events
    addReviewButtonEvents();

}


// =====================================================
// REVIEW BUTTON EVENTS
// =====================================================

function addReviewButtonEvents() {

    const editButtons =
        document.querySelectorAll(
            ".edit-review-button"
        );


    const deleteButtons =
        document.querySelectorAll(
            ".delete-review-button"
        );


    editButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const reviewId =
                        button.dataset.reviewId;


                    editReview(
                        reviewId
                    );

                }
            );

        }
    );


    deleteButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const reviewId =
                        button.dataset.reviewId;


                    deleteReview(
                        reviewId,
                        button
                    );

                }
            );

        }
    );

}


// =====================================================
// EDIT REVIEW
// =====================================================

function editReview(reviewId) {

    if (!reviewId) {

        alert(
            "Review ID not available."
        );

        return;

    }


    alert(
        "Edit review feature will be connected next."
    );

}


// =====================================================
// DELETE REVIEW
// =====================================================

async function deleteReview(
    reviewId,
    button
) {

    if (!reviewId) {

        alert(
            "Review ID not available."
        );

        return;

    }


    const confirmed =
        confirm(
            "Are you sure you want to delete this review?"
        );


    if (!confirmed) {
        return;
    }


    try {

        button.disabled =
            true;

        button.textContent =
            "Deleting...";


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


        await loadReviews();


    } catch (error) {

        console.error(
            "Delete review error:",
            error
        );


        alert(
            error.message ||
            "Could not delete review."
        );


        button.disabled =
            false;

        button.textContent =
            "🗑 Delete";

    }

}


// =====================================================
// REFRESH
// =====================================================

refreshButton.addEventListener(
    "click",
    async function () {

        try {

            refreshButton.disabled =
                true;

            refreshButton.textContent =
                "↻ Loading...";


            await loadReviews();


        } catch (error) {

            console.error(
                "Refresh reviews error:",
                error
            );


            showError(
                error.message
            );

        } finally {

            refreshButton.disabled =
                false;

            refreshButton.textContent =
                "↻ Refresh";

        }

    }
);


// =====================================================
// RETRY
// =====================================================

retryButton.addEventListener(
    "click",
    function () {

        initializePage();

    }
);


// =====================================================
// INITIALIZE
// =====================================================

async function initializePage() {

    showLoading();


    try {

        await loadReviews();


    } catch (error) {

        console.error(
            "Load reviews error:",
            error
        );


        showError(
            error.message
        );

    }

}


// =====================================================
// START
// =====================================================

loadCustomerDetails();

initializePage();