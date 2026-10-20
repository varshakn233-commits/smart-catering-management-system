document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    // CUSTOMER DATA
    // =====================================================

    let customer = null;

    try {
        customer = JSON.parse(
            localStorage.getItem("annapriya_customer")
        );
    } catch (error) {
        console.error(
            "Could not read customer data:",
            error
        );
    }

    const customerId =
        customer?.customerId ||
        customer?.customer_id ||
        customer?.id ||
        null;

    const customerEmail = customer?.email || "";


    // =====================================================
    // ELEMENTS
    // =====================================================

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


    // =====================================================
    // ESCAPE HTML
    // =====================================================

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    // =====================================================
    // ID HELPERS
    // =====================================================

    /*
     * Get the database enquiry ID.
     *
     * Prefer enquiry_id because it is the actual
     * database column used to connect an enquiry
     * to its booking in event_request.
     */

    function getEnquiryId(enquiry) {
        const id =
            enquiry?.enquiry_id ??
            enquiry?.enquiryId ??
            enquiry?.source_enquiry_id ??
            enquiry?.enquiry_request_id ??
            enquiry?.enquiry?.enquiry_id ??
            enquiry?.id ??
            null;

        if (
            id === null ||
            id === undefined ||
            String(id).trim() === ""
        ) {
            return null;
        }

        return String(id).trim();
    }


    /*
     * Get the enquiry ID saved on a booking.
     * Do not use request_id as an enquiry ID.
     */

    function getLinkedEnquiryId(request) {
        const id =
            request?.enquiry_id ??
            request?.enquiryId ??
            request?.enquiry_request_id ??
            request?.source_enquiry_id ??
            request?.enquiry?.enquiry_id ??
            null;

        if (
            id === null ||
            id === undefined ||
            String(id).trim() === ""
        ) {
            return null;
        }

        return String(id).trim();
    }


    function hasValidEnquiryId(enquiryId) {
        return (
            enquiryId !== null &&
            enquiryId !== undefined &&
            String(enquiryId).trim() !== ""
        );
    }


    // =====================================================
    // LOADING
    // =====================================================

    function showLoading() {
        if (loadingMessage) {
            loadingMessage.style.display = "block";
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


    // =====================================================
    // ERROR
    // =====================================================

    function showError(message) {
        if (loadingMessage) {
            loadingMessage.style.display = "none";
        }

        if (requestsSection) {
            requestsSection.style.display = "none";
        }

        if (emptyMessage) {
            emptyMessage.style.display = "none";
        }

        if (errorMessage) {
            errorMessage.style.display = "block";
        }

        if (errorText) {
            errorText.textContent =
                message || "Something went wrong.";
        }
    }


    // =====================================================
    // EMPTY
    // =====================================================

    function showEmpty() {
        if (loadingMessage) {
            loadingMessage.style.display = "none";
        }

        if (errorMessage) {
            errorMessage.style.display = "none";
        }

        if (requestsSection) {
            requestsSection.style.display = "none";
        }

        if (emptyMessage) {
            emptyMessage.style.display = "block";
        }
    }


    // =====================================================
    // SHOW REQUESTS
    // =====================================================

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


    // =====================================================
    // FORMAT DATE
    // =====================================================

    function formatDate(value) {
        if (!value) {
            return "—";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return escapeHTML(value);
        }

        return date.toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    }


    // =====================================================
    // FORMAT TIME
    // =====================================================

    function formatTime(value) {
        if (!value) {
            return "";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return date.toLocaleTimeString(
            "en-US",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );
    }


    // =====================================================
    // NORMALIZE STATUS
    // =====================================================

    function normalizeStatus(value) {
        return String(value || "")
            .trim()
            .toLowerCase()
            .replace(/_/g, " ")
            .replace(/-/g, " ");
    }


    // =====================================================
    // STATUS CLASS
    // =====================================================

    function getStatusClass(status) {
        const normalized = normalizeStatus(status);

        if (normalized.includes("confirmed")) {
            return "status-confirmed";
        }

        if (normalized.includes("completed")) {
            return "status-completed";
        }

        if (normalized.includes("accepted")) {
            return "status-accepted";
        }

        if (normalized.includes("payment")) {
            return "status-payment";
        }

        if (
            normalized.includes("rejected") ||
            normalized.includes("cancelled") ||
            normalized.includes("canceled")
        ) {
            return "status-rejected";
        }

        if (normalized.includes("preparing")) {
            return "status-preparing";
        }

        if (normalized.includes("on the way")) {
            return "status-on-the-way";
        }

        if (normalized.includes("event started")) {
            return "status-event-started";
        }

        if (
            normalized.includes("enquiry") ||
            normalized.includes("inquiry")
        ) {
            return "status-enquiry";
        }

        return "status-pending";
    }


    // =====================================================
    // DISPLAY STATUS
    // =====================================================

    function getDisplayStatus(request) {
        const status =
            request?.status ||
            request?.request_status ||
            request?.booking_status ||
            "Pending";

        const normalized = normalizeStatus(status);

        if (
            normalized === "pending" ||
            normalized === "requested" ||
            normalized === "booking requested" ||
            normalized === "booking request sent"
        ) {
            return "Booking Request Sent";
        }

        if (normalized === "accepted") {
            return "Booking Accepted";
        }

        if (normalized === "confirmed") {
            return "Booking Confirmed";
        }

        if (normalized === "completed") {
            return "Booking Completed";
        }

        return String(status)
            .replace(/_/g, " ")
            .replace(/\b\w/g, letter =>
                letter.toUpperCase()
            );
    }


    // =====================================================
    // ENQUIRY STATUS
    // =====================================================

    function getEnquiryDisplayStatus(enquiry) {
        const status =
            enquiry?.status ||
            enquiry?.enquiry_status ||
            "open";

        const normalized = normalizeStatus(status);

        if (
            normalized.includes("resolved") ||
            normalized.includes("closed")
        ) {
            return "Resolved";
        }

        if (
            normalized.includes("accepted") ||
            normalized.includes("confirmed") ||
            normalized.includes("booking created")
        ) {
            return "Booking Confirmed";
        }

        if (
            normalized.includes("responded") ||
            normalized.includes("replied") ||
            normalized.includes("reply")
        ) {
            return "Caterer Responded";
        }

        return "Enquiry Sent";
    }


    // =====================================================
    // PROGRESS STAGE
    // =====================================================

    function getProgressStage(request) {
        const rawStatus =
            request?.status ||
            request?.request_status ||
            request?.booking_status ||
            "";

        const status = normalizeStatus(rawStatus);

        if (
            status.includes("enquiry sent") ||
            status.includes("inquiry sent")
        ) {
            return 0;
        }

        if (
            status.includes("caterer responded") ||
            status.includes("responded") ||
            status.includes("replied")
        ) {
            return 1;
        }

        if (
            status.includes("booking request sent") ||
            status.includes("booking requested")
        ) {
            return 2;
        }

        if (status.includes("accepted")) {
            return 3;
        }

        if (status.includes("payment pending")) {
            return 4;
        }

        if (
            status.includes("payment completed") ||
            status.includes("payment successful") ||
            status === "paid"
        ) {
            return 5;
        }

        if (status.includes("confirmed")) {
            return 6;
        }

        if (
            status.includes("event completed") ||
            status === "completed"
        ) {
            return 7;
        }

        return 0;
    }


    // =====================================================
    // CONNECTED DOT PROGRESS
    // =====================================================

    function getProgress(request) {
        const currentStage = getProgressStage(request);

        const stages = [
            "Enquiry Sent",
            "Caterer Responded",
            "Booking Request Sent",
            "Booking Accepted",
            "Payment Pending",
            "Payment Completed",
            "Booking Confirmed",
            "Booking Completed"
        ];

        let html = `
            <div class="progress-wrap">
                <div class="progress-dots">
        `;

        for (
            let index = 0;
            index < stages.length;
            index++
        ) {
            let dotClass = "progress-dot";

            if (index < currentStage) {
                dotClass += " completed";
            }

            if (index === currentStage) {
                dotClass += " active";
            }

            html += `
                <div class="progress-step"
                     title="${escapeHTML(stages[index])}"
                     aria-label="${escapeHTML(stages[index])}">
                    <span class="${dotClass}"
                          title="${escapeHTML(stages[index])}">
                    </span>
            `;

            if (index < stages.length - 1) {
                const lineClass =
                    index < currentStage
                        ? "progress-line completed"
                        : "progress-line";

                html += `<span class="${lineClass}"></span>`;
            }

            html += `</div>`;
        }

        html += `
                </div>
            </div>
        `;

        return html;
    }


    // =====================================================
    // PAYMENT BUTTON
    // =====================================================

    function getPaymentButton(request) {
        const status = normalizeStatus(
            request?.status ||
            request?.request_status ||
            request?.booking_status
        );

        if (status.includes("payment pending")) {
            const requestId =
                request?.request_id ||
                request?.id ||
                request?.event_request_id ||
                "";

            if (!requestId) {
                return "";
            }

            return `
                <button
                    type="button"
                    class="table-action pay-action"
                    onclick="openPayment('${escapeHTML(requestId)}')"
                >
                    Pay Now
                </button>
            `;
        }

        return "";
    }


    // =====================================================
    // TRACK BUTTON
    // =====================================================

    function getTrackingButton(request) {
        const status = normalizeStatus(
            request?.status ||
            request?.request_status ||
            request?.booking_status
        );

        if (
            status.includes("confirmed") ||
            status.includes("completed") ||
            status.includes("preparing") ||
            status.includes("on the way") ||
            status.includes("event started")
        ) {
            const requestId =
                request?.request_id ||
                request?.id ||
                request?.event_request_id ||
                "";

            if (!requestId) {
                return "";
            }

            return `
                <button
                    type="button"
                    class="table-action track-action"
                    onclick="openTracking('${escapeHTML(requestId)}')"
                >
                    📍 Track
                </button>
            `;
        }

        return "";
    }


    // =====================================================
    // ACTION FOR REQUEST
    // =====================================================

    function getRequestAction(request) {
        const status = normalizeStatus(
            request?.status ||
            request?.request_status ||
            request?.booking_status
        );

        if (
            status.includes("confirmed") ||
            status.includes("completed") ||
            status.includes("preparing") ||
            status.includes("on the way") ||
            status.includes("event started")
        ) {
            return getTrackingButton(request);
        }

        if (status.includes("payment pending")) {
            return getPaymentButton(request);
        }

        return `
            <span class="waiting-text">
                Waiting for reply
            </span>
        `;
    }


    // =====================================================
    // CUSTOMER ENQUIRIES
    // =====================================================

    async function loadCustomerEnquiries() {
        if (!customerId) {
            return [];
        }

        const response = await fetch(
            `http://localhost:5000/api/enquiries/customer/${encodeURIComponent(customerId)}`
        );

        if (!response.ok) {
            throw new Error(
                `Failed to load enquiries. Server returned ${response.status}.`
            );
        }

        const data = await response.json();

        if (Array.isArray(data)) {
            return data;
        }

        return (
            data.enquiries ||
            data.requests ||
            data.data ||
            []
        );
    }


    // =====================================================
    // OPEN BOOKING FROM ENQUIRY
    // =====================================================

    window.openBookingFromEnquiry = function(enquiryId) {
        if (!hasValidEnquiryId(enquiryId)) {
            alert(
                "The enquiry ID is missing. Please refresh My Requests and try again."
            );
            return;
        }

        const url =
            `bookmyevents.html?enquiryId=${encodeURIComponent(
                String(enquiryId).trim()
            )}`;

        window.location.href = url;
    };


    // =====================================================
    // CREATE ENQUIRY ROW
    // =====================================================

    function createEnquiryRow(enquiry) {
        /*
         * IMPORTANT:
         * Use the actual enquiry ID, not a booking ID.
         */

        const enquiryId = getEnquiryId(enquiry);

        const catererName =
            enquiry?.caterer_name ||
            enquiry?.catererName ||
            enquiry?.brand_name ||
            enquiry?.business_name ||
            "Caterer";

        const eventType =
            enquiry?.event_type ||
            enquiry?.eventType ||
            enquiry?.event_name ||
            "Event";

        const eventDate =
            enquiry?.event_date ||
            enquiry?.eventDate ||
            enquiry?.date ||
            null;

        const guestCount =
            enquiry?.guest_count ??
            enquiry?.guestCount ??
            enquiry?.guests ??
            "—";

        const displayStatus =
            getEnquiryDisplayStatus(enquiry);

        const statusClass =
            getStatusClass(displayStatus);

        const catererReply =
            enquiry?.caterer_reply ||
            enquiry?.catererReply ||
            enquiry?.reply ||
            "";

        let actionHTML;

        if (
            catererReply &&
            hasValidEnquiryId(enquiryId)
        ) {
            actionHTML = `
                <button
                    type="button"
                    class="table-action book-action"
                    onclick="openBookingFromEnquiry('${escapeHTML(enquiryId)}')"
                >
                    Book Event
                </button>
            `;
        } else if (catererReply) {
            actionHTML = `
                <span class="waiting-text">
                    Enquiry ID unavailable
                </span>
            `;
        } else {
            actionHTML = `
                <span class="waiting-text">
                    Waiting for reply
                </span>
            `;
        }

        const requestObject = {
            ...enquiry,
            status: catererReply
                ? "caterer responded"
                : "enquiry sent"
        };

        return `
            <tr>
                <td>
                    <strong class="linked-enquiry">
                        Enquiry ${escapeHTML(enquiryId ?? "—")}
                    </strong>

                    <small>
                        ${escapeHTML(eventType)}
                    </small>
                </td>

                <td>
                    <strong>
                        ${escapeHTML(catererName)}
                    </strong>
                </td>

                <td>
                    ${escapeHTML(eventType)}
                </td>

                <td>
                    <strong>
                        ${formatDate(eventDate)}
                    </strong>

                    ${
                        formatTime(eventDate)
                            ? `
                                <small>
                                    ${formatTime(eventDate)}
                                </small>
                            `
                            : ""
                    }
                </td>

                <td>
                    ${escapeHTML(guestCount)}
                </td>

                <td>
                    <span class="status ${statusClass}">
                        ${escapeHTML(displayStatus)}
                    </span>
                </td>

                <td>
                    ${getProgress(requestObject)}
                </td>

                <td>
                    ${actionHTML}
                </td>
            </tr>
        `;
    }


    // =====================================================
    // CREATE REQUEST ROW
    // =====================================================

    function createRequestRow(request) {
        const requestId =
            request?.request_id ||
            request?.event_request_id ||
            request?.id ||
            "";

        const catererName =
            request?.caterer_name ||
            request?.catererName ||
            request?.brand_name ||
            request?.business_name ||
            "Caterer";

        const eventType =
            request?.event_type ||
            request?.eventType ||
            request?.event_name ||
            "Event";

        const eventDate =
            request?.event_date ||
            request?.eventDate ||
            request?.booking_date ||
            request?.date ||
            null;

        const guestCount =
            request?.guest_count ??
            request?.guestCount ??
            request?.number_of_guests ??
            request?.guests ??
            "—";

        const displayStatus =
            getDisplayStatus(request);

        const statusClass =
            getStatusClass(displayStatus);

        const actionHTML =
            getRequestAction(request);

        return `
            <tr>
                <td>
                    <strong>
                        Request ${escapeHTML(requestId)}
                    </strong>

                    <small>
                        ${escapeHTML(eventType)}
                    </small>
                </td>

                <td>
                    <strong>
                        ${escapeHTML(catererName)}
                    </strong>
                </td>

                <td>
                    ${escapeHTML(eventType)}
                </td>

                <td>
                    <strong>
                        ${formatDate(eventDate)}
                    </strong>

                    ${
                        formatTime(eventDate)
                            ? `
                                <small>
                                    ${formatTime(eventDate)}
                                </small>
                            `
                            : ""
                    }
                </td>

                <td>
                    ${escapeHTML(guestCount)}
                </td>

                <td>
                    <span class="status ${statusClass}">
                        ${escapeHTML(displayStatus)}
                    </span>
                </td>

                <td>
                    ${getProgress(request)}
                </td>

                <td>
                    ${actionHTML}
                </td>
            </tr>
        `;
    }


    // =====================================================
    // OPEN PAYMENT
    // =====================================================

    window.openPayment = function(requestId) {
        if (!requestId) {
            return;
        }

        window.location.href =
            `payment.html?requestId=${encodeURIComponent(requestId)}`;
    };


    // =====================================================
    // OPEN TRACKING
    // =====================================================

    window.openTracking = function(requestId) {
        if (!requestId) {
            return;
        }

        window.location.href =
            `tracking.html?requestId=${encodeURIComponent(requestId)}`;
    };


    // =====================================================
    // LOAD REQUESTS
    // =====================================================

    async function loadRequests() {
        try {
            showLoading();

            if (!customerId) {
                throw new Error(
                    "Customer ID is required."
                );
            }

            /*
             * Load both event bookings and enquiries.
             */

            const [
                requestsResponse,
                enquiries
            ] = await Promise.all([
                fetch(
                    `http://localhost:5000/api/requests/customer/${encodeURIComponent(customerId)}`
                ),
                loadCustomerEnquiries()
            ]);

            if (!requestsResponse.ok) {
                throw new Error(
                    `Failed to load requests. Server returned ${requestsResponse.status}.`
                );
            }

            const requestsData =
                await requestsResponse.json();

            let requests =
                requestsData.requests ||
                requestsData.data ||
                requestsData ||
                [];

            if (!Array.isArray(requests)) {
                requests = [];
            }

            let enquiryList =
                Array.isArray(enquiries)
                    ? enquiries
                    : [];


            // =================================================
            // REMOVE ENQUIRIES ALREADY LINKED TO BOOKINGS
            // =================================================

            /*
             * The booking's enquiry_id must match the
             * original enquiry's enquiry_id.
             *
             * Example:
             * Booking Request 61 -> enquiry_id = 8
             * Enquiry 8          -> hidden from enquiry rows
             *
             * The booking itself remains visible.
             */

            const linkedEnquiryIds = new Set();

            requests.forEach(request => {
                const enquiryId =
                    getLinkedEnquiryId(request);

                if (enquiryId !== null) {
                    linkedEnquiryIds.add(enquiryId);
                }
            });

            enquiryList = enquiryList.filter(enquiry => {
                const enquiryId =
                    getEnquiryId(enquiry);

                /*
                 * If the enquiry has no usable ID, do not
                 * accidentally hide it by matching a blank ID.
                 */

                if (enquiryId === null) {
                    return true;
                }

                return !linkedEnquiryIds.has(enquiryId);
            });


            // =================================================
            // EMPTY STATE
            // =================================================

            const totalItems =
                requests.length +
                enquiryList.length;

            if (totalItems === 0) {
                showEmpty();

                if (requestCount) {
                    requestCount.textContent = "0";
                }

                return;
            }


            // =================================================
            // TABLE
            // =================================================

            let tableHTML = `
                <div class="table-scroll">
                    <table class="requests-table">
                        <thead>
                            <tr>
                                <th>Request</th>
                                <th>Caterer</th>
                                <th>Event</th>
                                <th>Date &amp; Time</th>
                                <th>Guests</th>
                                <th>Status</th>
                                <th>Progress</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
            `;


            // =================================================
            // ENQUIRIES FIRST
            // =================================================

            enquiryList.forEach(enquiry => {
                tableHTML += createEnquiryRow(enquiry);
            });


            // =================================================
            // BOOKINGS
            // =================================================

            requests.forEach(request => {
                tableHTML += createRequestRow(request);
            });


            tableHTML += `
                        </tbody>
                    </table>
                </div>
            `;

            if (requestsList) {
                requestsList.innerHTML = tableHTML;
            }

            if (requestCount) {
                requestCount.textContent =
                    String(totalItems);
            }

            showRequests();

        } catch (error) {
            console.error(
                "Load requests error:",
                error
            );

            showError(
                error?.message ||
                "Unable to load your requests."
            );
        }
    }


    // =====================================================
    // GLOBAL LOAD FUNCTION
    // =====================================================

    window.loadRequests = loadRequests;


    // =====================================================
    // START
    // =====================================================

    loadRequests();

});