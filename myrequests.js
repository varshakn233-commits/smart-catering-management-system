document.addEventListener("DOMContentLoaded", () => {

    const loadingMessage =
        document.getElementById("loadingMessage");

    const errorMessage =
        document.getElementById("errorMessage");

    const errorText =
        document.getElementById("errorText");

    const emptyMessage =
        document.getElementById("emptyMessage");

    const requestsSection =
        document.getElementById("requestsSection");

    const requestsList =
        document.getElementById("requestsList");

    const requestCount =
        document.getElementById("requestCount");

    const refreshButton =
        document.getElementById("refreshButton");

    const retryButton =
        document.getElementById("retryButton");


    // =========================
    // CUSTOMER DETAILS
    // =========================

    const customer = JSON.parse(
        localStorage.getItem("annapriya_customer") || "null"
    );

    const customerId =
        customer?.customerId ||
        customer?.customer_id ||
        customer?.id;


    // =========================
    // SHOW / HIDE SECTIONS
    // =========================

    function showLoading() {

        loadingMessage.style.display = "flex";

        errorMessage.style.display = "none";

        emptyMessage.style.display = "none";

        requestsSection.style.display = "none";
    }


    function showError(message) {

        loadingMessage.style.display = "none";

        errorMessage.style.display = "block";

        emptyMessage.style.display = "none";

        requestsSection.style.display = "none";

        errorText.textContent =
            message || "Could not load your requests.";
    }


    function showEmpty() {

        loadingMessage.style.display = "none";

        errorMessage.style.display = "none";

        emptyMessage.style.display = "block";

        requestsSection.style.display = "none";
    }


    function showRequests() {

        loadingMessage.style.display = "none";

        errorMessage.style.display = "none";

        emptyMessage.style.display = "none";

        requestsSection.style.display = "block";
    }


    // =========================
    // FORMAT DATE
    // =========================

    function formatDate(dateValue) {

        if (!dateValue) {
            return "Not available";
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


    // =========================
    // FORMAT TIME
    // =========================

    function formatTime(timeValue) {

        if (!timeValue) {
            return "Not available";
        }

        const parts =
            timeValue.split(":");

        if (parts.length < 2) {
            return timeValue;
        }

        let hour =
            parseInt(parts[0], 10);

        const minute =
            parts[1];

        const period =
            hour >= 12 ? "PM" : "AM";

        hour =
            hour % 12 || 12;

        return `${String(hour).padStart(2, "0")}:${minute} ${period}`;
    }


    // =========================
    // STATUS CLASS
    // =========================

    function getStatusClass(status) {

        const cleanStatus =
            String(status || "")
                .toLowerCase();

        if (cleanStatus === "accepted") {
            return "status-accepted";
        }

        if (cleanStatus === "payment_pending") {
            return "status-payment";
        }

        if (cleanStatus === "confirmed") {
            return "status-confirmed";
        }

        if (cleanStatus === "preparing") {
            return "status-preparing";
        }

        if (cleanStatus === "on_the_way") {
            return "status-on-the-way";
        }

        if (cleanStatus === "event_started") {
            return "status-event-started";
        }

        if (cleanStatus === "completed") {
            return "status-completed";
        }

        if (cleanStatus === "rejected") {
            return "status-rejected";
        }

        return "status-pending";
    }


    // =========================
    // DISPLAY STATUS
    // =========================

    function getDisplayStatus(status) {

        const cleanStatus =
            String(status || "")
                .toLowerCase();

        const statusNames = {
            pending: "Pending",
            accepted: "Accepted",
            payment_pending: "Payment Pending",
            confirmed: "Confirmed",
            preparing: "Preparing",
            on_the_way: "On the Way",
            event_started: "Event Started",
            completed: "Completed",
            rejected: "Rejected"
        };

        return statusNames[cleanStatus] ||
            status ||
            "Pending";
    }


    // =========================
    // ESCAPE HTML
    // =========================

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


    // =========================
    // PAY NOW BUTTON
    // =========================

    function getPaymentButton(request) {

        const status =
            String(request.status || "")
                .toLowerCase();

        if (status !== "payment_pending") {
            return "";
        }

        return `
            <div class="payment-action">

                <button
                    type="button"
                    class="pay-now-button"
                    onclick="openPayment(${Number(request.request_id)})">

                    💳 Pay Now

                </button>

            </div>
        `;
    }


    // =========================
    // OPEN PAYMENT PAGE
    // =========================

    window.openPayment = function(requestId) {

        if (!requestId) {
            alert("Request ID is missing.");
            return;
        }

        window.location.href =
            `payment.html?requestId=${requestId}`;
    };


    // =========================
    // TRACK EVENT BUTTON
    // =========================

    function getTrackingButton(request) {

        const status =
            String(request.status || "")
                .toLowerCase();

        const trackableStatuses = [
            "confirmed",
            "preparing",
            "on_the_way",
            "event_started",
            "completed"
        ];

        if (!trackableStatuses.includes(status)) {
            return "";
        }

        return `
            <div class="tracking-action">

                <button
                    type="button"
                    class="track-event-button"
                    onclick="openTracking(${Number(request.request_id)})">

                    📍 Track Event

                </button>

            </div>
        `;
    }


    // =========================
    // OPEN TRACKING PAGE
    // =========================

    window.openTracking = function(requestId) {

        if (!requestId) {
            alert("Request ID is missing.");
            return;
        }

        window.location.href =
            `tracking.html?requestId=${requestId}`;
    };


    // =========================
    // LOAD REQUESTS
    // =========================

    async function loadRequests() {

        showLoading();

        if (!customerId) {

            showError(
                "Customer details are missing. Please login again."
            );

            return;
        }


        try {

            const response =
                await fetch(
                    `http://localhost:5000/api/requests/customer/${customerId}`
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Could not load your requests."
                );
            }


            const requests =
                data.requests || [];


            // =========================
            // NO REQUESTS
            // =========================

            if (requests.length === 0) {

                requestCount.textContent = "0";

                showEmpty();

                return;
            }


            // =========================
            // REQUEST COUNT
            // =========================

            requestCount.textContent =
                requests.length;


            // =========================
            // CLEAR OLD CARDS
            // =========================

            requestsList.innerHTML = "";


            // =========================
            // CREATE REQUEST CARDS
            // =========================

            requests.forEach((request) => {

                const card =
                    document.createElement("div");

                card.className =
                    "request-card";


                const status =
                    request.status || "pending";


                const statusClass =
                    getStatusClass(status);


                const displayStatus =
                    getDisplayStatus(status);


                const paymentButton =
                    getPaymentButton(request);


                const trackingButton =
                    getTrackingButton(request);


                card.innerHTML = `

                    <div class="request-card-top">

                        <div>

                            <div class="event-title">
                                ${escapeHTML(
                                    request.event_type ||
                                    "Event Request"
                                )}
                            </div>

                            <div class="request-id">
                                Request #${escapeHTML(
                                    request.request_id
                                )}
                            </div>

                        </div>


                        <span class="status ${statusClass}">
                            ${escapeHTML(displayStatus)}
                        </span>

                    </div>


                    <div class="request-details">

                        <div class="detail-item">

                            <span class="detail-label">
                                📅 Event Date
                            </span>

                            <span class="detail-value">
                                ${escapeHTML(
                                    formatDate(
                                        request.event_date
                                    )
                                )}
                            </span>

                        </div>


                        <div class="detail-item">

                            <span class="detail-label">
                                🕐 Event Time
                            </span>

                            <span class="detail-value">
                                ${escapeHTML(
                                    formatTime(
                                        request.event_time
                                    )
                                )}
                            </span>

                        </div>


                        <div class="detail-item">

                            <span class="detail-label">
                                🍽️ Food Type
                            </span>

                            <span class="detail-value">
                                ${escapeHTML(
                                    request.food_type ||
                                    "Not specified"
                                )}
                            </span>

                        </div>

                    </div>


                    ${paymentButton}

                    ${trackingButton}

                `;


                requestsList.appendChild(card);

            });


            showRequests();


        } catch (error) {

            console.error(
                "Load requests error:",
                error
            );


            showError(
                error.message ||
                "Could not connect to the server."
            );
        }
    }


    // =========================
    // REFRESH
    // =========================

    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            loadRequests
        );
    }


    // =========================
    // RETRY
    // =========================

    if (retryButton) {

        retryButton.addEventListener(
            "click",
            loadRequests
        );
    }


    // =========================
    // START
    // =========================

    loadRequests();

});