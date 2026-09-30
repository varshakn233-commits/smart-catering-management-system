document.addEventListener("DOMContentLoaded", () => {

    const loadingMessage = document.getElementById("loadingMessage");
    const errorMessage = document.getElementById("errorMessage");
    const errorText = document.getElementById("errorText");
    const emptyMessage = document.getElementById("emptyMessage");
    const requestsSection = document.getElementById("requestsSection");
    const requestsList = document.getElementById("requestsList");
    const requestCount = document.getElementById("requestCount");
    const refreshButton = document.getElementById("refreshButton");
    const retryButton = document.getElementById("retryButton");


    // =========================
    // CUSTOMER DETAILS
    // =========================

    let customer = null;

    try {
        customer = JSON.parse(
            localStorage.getItem("annapriya_customer") || "null"
        );
    } catch (error) {
        console.error("Could not read customer data:", error);
    }

    const customerId =
        customer?.customerId ||
        customer?.customer_id ||
        customer?.id;

    const customerEmail =
        String(customer?.email || "")
            .trim()
            .toLowerCase();


    // =========================
    // SHOW / HIDE SECTIONS
    // =========================

    function showLoading() {

        if (loadingMessage) {
            loadingMessage.style.display = "flex";
        }

        if (errorMessage) {
            errorMessage.style.display = "none";
        }

        if (emptyMessage) {
            emptyMessage.style.display = "none";
        }

        if (requestsSection) {
            requestsSection.style.display = "none";
        }
    }


    function showError(message) {

        if (loadingMessage) {
            loadingMessage.style.display = "none";
        }

        if (errorMessage) {
            errorMessage.style.display = "block";
        }

        if (emptyMessage) {
            emptyMessage.style.display = "none";
        }

        if (requestsSection) {
            requestsSection.style.display = "none";
        }

        if (errorText) {
            errorText.textContent =
                message || "Could not load your requests.";
        }
    }


    function showEmpty() {

        if (loadingMessage) {
            loadingMessage.style.display = "none";
        }

        if (errorMessage) {
            errorMessage.style.display = "none";
        }

        if (emptyMessage) {
            emptyMessage.style.display = "block";
        }

        if (requestsSection) {
            requestsSection.style.display = "none";
        }
    }


    function showRequests() {

        if (loadingMessage) {
            loadingMessage.style.display = "none";
        }

        if (errorMessage) {
            errorMessage.style.display = "none";
        }

        if (emptyMessage) {
            emptyMessage.style.display = "none";
        }

        if (requestsSection) {
            requestsSection.style.display = "block";
        }
    }


    // =========================
    // FORMAT DATE
    // =========================

    function formatDate(dateValue) {

        if (!dateValue) {
            return "Not available";
        }

        const date = new Date(dateValue);

        if (isNaN(date.getTime())) {
            return String(dateValue);
        }

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }


    // =========================
    // FORMAT TIME
    // =========================

    function formatTime(timeValue) {

        if (!timeValue) {
            return "Not available";
        }

        const parts = String(timeValue).split(":");

        if (parts.length < 2) {
            return String(timeValue);
        }

        let hour = parseInt(parts[0], 10);
        const minute = parts[1];

        if (isNaN(hour)) {
            return String(timeValue);
        }

        const period = hour >= 12 ? "PM" : "AM";

        hour = hour % 12 || 12;

        return `${String(hour).padStart(2, "0")}:${minute} ${period}`;
    }


    // =========================
    // STATUS CLASS
    // =========================

    function getStatusClass(status) {

        const cleanStatus =
            String(status || "")
                .toLowerCase();

        const classes = {
            pending: "status-pending",
            accepted: "status-accepted",
            payment_pending: "status-payment",
            confirmed: "status-confirmed",
            preparing: "status-preparing",
            on_the_way: "status-on-the-way",
            event_started: "status-event-started",
            completed: "status-completed",
            rejected: "status-rejected"
        };

        return classes[cleanStatus] || "status-pending";
    }


    // =========================
    // DISPLAY STATUS
    // =========================

    function getDisplayStatus(status) {

        const cleanStatus =
            String(status || "")
                .toLowerCase();

        const statusNames = {

            pending: "Booking Request Sent",

            accepted: "Caterer Accepted",

            payment_pending: "Payment Pending",

            confirmed: "Booking Confirmed",

            preparing: "Preparing",

            on_the_way: "On the Way",

            event_started: "Event Started",

            completed: "Event Completed",

            rejected: "Rejected"

        };

        return statusNames[cleanStatus] ||
            "Booking Request Sent";
    }


    // =========================
    // ENQUIRY STATUS
    // =========================

    function getEnquiryDisplayStatus(status) {

        const cleanStatus =
            String(status || "enquiry_sent")
                .toLowerCase();

        if (cleanStatus === "caterer_responded") {
            return "Caterer Responded";
        }

        if (cleanStatus === "booking_created") {
            return "Booking Request Sent";
        }

        return "Enquiry Sent";
    }


    // =========================
    // COMPACT PROGRESS
    // =========================

    function getProgress(request) {

        const enquiryStatus =
            String(request.enquiry_status || "")
                .toLowerCase();

        const requestStatus =
            String(request.status || "pending")
                .toLowerCase();

        let currentIndex = 0;

        if (requestStatus === "pending") {

            if (enquiryStatus === "caterer_responded") {
                currentIndex = 1;
            } else if (
                enquiryStatus === "booking_created" ||
                request.enquiry_id
            ) {
                currentIndex = 2;
            } else {
                currentIndex = 2;
            }

        } else if (
            requestStatus === "accepted" ||
            requestStatus === "payment_pending"
        ) {

            currentIndex = 4;

        } else if (
            requestStatus === "confirmed" ||
            requestStatus === "preparing" ||
            requestStatus === "on_the_way" ||
            requestStatus === "event_started"
        ) {

            currentIndex = 6;

        } else if (requestStatus === "completed") {

            currentIndex = 7;

        } else if (requestStatus === "rejected") {

            currentIndex = 2;
        }


        const stages = [
            "Enquiry Sent",
            "Caterer Responded",
            "Booking Request Sent",
            "Caterer Accepted",
            "Payment Pending",
            "Payment Completed",
            "Booking Confirmed",
            "Event Completed"
        ];


        return `
            <div class="progress-wrap">

                <div class="progress-label">
                    ${escapeHTML(stages[currentIndex])}
                </div>

                <div class="progress-dots">

                    ${stages.map((stage, index) => {

                        let className = "progress-dot";

                        if (index < currentIndex) {
                            className += " completed";
                        }

                        if (index === currentIndex) {
                            className += " active";
                        }

                        return `
                            <span
                                class="${className}"
                                title="${escapeHTML(stage)}">
                            </span>
                        `;

                    }).join("")}

                </div>

            </div>
        `;
    }


    // =========================
    // PAYMENT BUTTON
    // =========================

    function getPaymentButton(request) {

        const status =
            String(request.status || "")
                .toLowerCase();

        if (status !== "payment_pending") {
            return "";
        }

        return `
            <button
                type="button"
                class="table-action pay-action"
                onclick="openPayment(${Number(request.request_id)})">

                💳 Pay Now

            </button>
        `;
    }


    // =========================
    // TRACKING BUTTON
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
            <button
                type="button"
                class="table-action track-action"
                onclick="openTracking(${Number(request.request_id)})">

                📍 Track

            </button>
        `;
    }


    // =========================
    // OPEN PAYMENT
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
    // OPEN TRACKING
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
    // LOAD CUSTOMER ENQUIRIES
    // =========================

    async function loadCustomerEnquiries() {

        if (!customerId) {
            return [];
        }

        try {

            const response =
                await fetch(
                    `http://localhost:5000/api/enquiries/customer/${encodeURIComponent(customerId)}`
                );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Could not load enquiries."
                );
            }

            return Array.isArray(data.enquiries)
                ? data.enquiries
                : [];

        } catch (error) {

            console.error(
                "Load customer enquiries error:",
                error
            );

            return [];
        }
    }


    // =========================
    // OPEN BOOKING FROM ENQUIRY
    // =========================

    window.openBookingFromEnquiry =
        function(enquiryId) {

            if (!enquiryId) {
                alert("Enquiry ID is missing.");
                return;
            }

            window.location.href =
                `bookmyevents.html?enquiryId=${Number(enquiryId)}`;
        };


    // =========================
    // CREATE ENQUIRY TABLE ROW
    // =========================

    function createEnquiryRow(enquiry) {

        const status =
            String(
                enquiry.status || "enquiry_sent"
            ).toLowerCase();

        let actionHTML = `
            <span class="waiting-text">
                Waiting for reply
            </span>
        `;

        if (status === "caterer_responded") {

            actionHTML = `
                <button
                    type="button"
                    class="table-action book-action"
                    onclick="openBookingFromEnquiry(${Number(
                        enquiry.enquiry_id
                    )})">

                    📅 Book Event

                </button>
            `;
        }


        const replyHTML =
            enquiry.caterer_reply
                ? `
                    <div class="reply-preview">
                        💬 ${escapeHTML(
                            enquiry.caterer_reply
                        )}
                    </div>
                `
                : "";


        return `
            <tr>

                <td>
                    <strong>
                        Enquiry #${escapeHTML(
                            enquiry.enquiry_id
                        )}
                    </strong>

                    ${replyHTML}
                </td>


                <td>
                    ${escapeHTML(
                        enquiry.caterer_name ||
                        "Not available"
                    )}
                </td>


                <td>
                    ${escapeHTML(
                        enquiry.event_type ||
                        "Event"
                    )}
                </td>


                <td>
                    ${escapeHTML(
                        formatDate(
                            enquiry.event_date
                        )
                    )}

                    <small>
                        ${escapeHTML(
                            formatTime(
                                enquiry.event_time
                            )
                        )}
                    </small>
                </td>


                <td>
                    ${escapeHTML(
                        enquiry.guest_count ||
                        "N/A"
                    )}
                </td>


                <td>
                    <span class="status status-enquiry">
                        ${escapeHTML(
                            getEnquiryDisplayStatus(status)
                        )}
                    </span>
                </td>


                <td>
                    ${actionHTML}
                </td>

            </tr>
        `;
    }


    // =========================
    // CREATE EVENT REQUEST ROW
    // =========================

    function createRequestRow(request) {

        const status =
            String(
                request.status || "pending"
            ).toLowerCase();

        const statusClass =
            getStatusClass(status);

        const displayStatus =
            getDisplayStatus(status);


        const paymentButton =
            getPaymentButton(request);

        const trackingButton =
            getTrackingButton(request);


        let actionHTML = "";

        if (paymentButton) {
            actionHTML += paymentButton;
        }

        if (trackingButton) {
            actionHTML += trackingButton;
        }

        if (!actionHTML) {
            actionHTML = `
                <span class="no-action">
                    —
                </span>
            `;
        }


        return `
            <tr>

                <td>

                    <strong>
                        Request #${escapeHTML(
                            request.request_id
                        )}
                    </strong>

                    ${
                        request.enquiry_id
                            ? `
                                <small class="linked-enquiry">
                                    Enquiry #${escapeHTML(
                                        request.enquiry_id
                                    )}
                                </small>
                            `
                            : ""
                    }

                </td>


                <td>
                    ${escapeHTML(
                        request.caterer_name ||
                        request.caterer_email ||
                        "Caterer"
                    )}
                </td>


                <td>

                    <strong>
                        ${escapeHTML(
                            request.event_type ||
                            "Event"
                        )}
                    </strong>

                    <small>
                        ${escapeHTML(
                            request.food_type ||
                            "Food type not specified"
                        )}
                    </small>

                </td>


                <td>

                    ${escapeHTML(
                        formatDate(
                            request.event_date
                        )
                    )}

                    <small>
                        ${escapeHTML(
                            formatTime(
                                request.event_time
                            )
                        )}
                    </small>

                </td>


                <td>
                    ${escapeHTML(
                        request.guest_count ||
                        "N/A"
                    )}
                </td>


                <td>

                    <span
                        class="status ${statusClass}">
                        ${escapeHTML(
                            displayStatus
                        )}
                    </span>

                    ${getProgress(request)}

                </td>


                <td>
                    ${actionHTML}
                </td>

            </tr>
        `;
    }


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

            const [
                requestsResponse,
                enquiries
            ] = await Promise.all([

                fetch(
                    `http://localhost:5000/api/requests/customer/${encodeURIComponent(
                        customerId
                    )}?email=${encodeURIComponent(
                        customerEmail
                    )}`
                ).then(async response => {

                    const data =
                        await response.json();

                    if (!response.ok) {

                        throw new Error(
                            data.message ||
                            "Could not load your requests."
                        );
                    }

                    return data;
                }),

                loadCustomerEnquiries()

            ]);


            const requests =
                Array.isArray(
                    requestsResponse.requests
                )
                    ? requestsResponse.requests
                    : [];


            // =========================
            // FIND UNLINKED ENQUIRIES
            // =========================

            const unlinkedEnquiries =
                enquiries.filter(
                    enquiry => {

                        return !requests.some(
                            request =>
                                Number(
                                    request.enquiry_id
                                ) === Number(
                                    enquiry.enquiry_id
                                )
                        );
                    }
                );


            const totalCount =
                requests.length +
                unlinkedEnquiries.length;


            if (requestCount) {
                requestCount.textContent =
                    totalCount;
            }


            if (totalCount === 0) {

                showEmpty();
                return;
            }


            // =========================
            // BUILD TABLE
            // =========================

            requestsList.innerHTML = `

                <div class="table-scroll">

                    <table class="requests-table">

                        <thead>

                            <tr>

                                <th>Request</th>
                                <th>Caterer</th>
                                <th>Event</th>
                                <th>Date & Time</th>
                                <th>Guests</th>
                                <th>Status</th>
                                <th>Action</th>

                            </tr>

                        </thead>


                        <tbody>

                            ${
                                unlinkedEnquiries
                                    .map(
                                        createEnquiryRow
                                    )
                                    .join("")
                            }


                            ${
                                requests
                                    .map(
                                        createRequestRow
                                    )
                                    .join("")
                            }

                        </tbody>

                    </table>

                </div>
            `;


            // =========================
            // NOTIFICATION
            // =========================

            const hasPendingEnquiries =
                enquiries.some(
                    enquiry =>
                        String(
                            enquiry.status
                        ).toLowerCase() ===
                        "caterer_responded"
                );


            const hasPendingRequests =
                requests.some(
                    request =>
                        String(
                            request.status
                        ).toLowerCase() ===
                        "payment_pending"
                );


            // Notification dot is optional.
            // The HTML may or may not contain it.

            const notificationDot =
                document.getElementById(
                    "notificationDot"
                );


            if (notificationDot) {

                notificationDot.style.display =
                    (
                        hasPendingEnquiries ||
                        hasPendingRequests
                    )
                        ? "block"
                        : "none";
            }


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