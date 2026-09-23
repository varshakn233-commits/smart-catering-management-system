/* =====================================================
   ANNAPRIYA CUSTOMER CATERERS
   CUSTOMER SIDE JAVASCRIPT
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* =================================================
       CUSTOMER DETAILS
    ================================================= */

    const customer = JSON.parse(
        localStorage.getItem("annapriya_customer") || "null"
    );

    const customerName =
        customer?.fullName ||
        customer?.name ||
        "Customer";


    const customerId =
        customer?.customerId ||
        customer?.customer_id ||
        customer?.id ||
        null;


    const customerPhone =
        customer?.phone ||
        customer?.phoneNumber ||
        "";


    const customerEmail =
        customer?.email ||
        "";


    /* =================================================
       DISPLAY CUSTOMER NAME
    ================================================= */

    const headerCustomerName =
        document.getElementById("headerCustomerName");

    if (headerCustomerName) {
        headerCustomerName.textContent = customerName;
    }


    /* =================================================
       CUSTOMER AVATAR
    ================================================= */

    const headerAvatar =
        document.getElementById("headerAvatar");

    const firstLetter =
        customerName.charAt(0).toUpperCase();

    if (headerAvatar) {
        headerAvatar.textContent = firstLetter;
    }


    /* =================================================
       PROFILE MENU
    ================================================= */

    const profileButton =
        document.getElementById("profileButton");

    const profileButtonMenu =
        document.getElementById("profileButtonMenu");


    if (profileButton) {

        profileButton.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();

                if (profileButtonMenu) {

                    profileButtonMenu.classList.toggle(
                        "show"
                    );

                }

            }
        );

    }


    /* =================================================
       CLOSE PROFILE MENU
    ================================================= */

    document.addEventListener(
        "click",
        (event) => {

            if (
                profileButtonMenu &&
                !profileButtonMenu.contains(event.target) &&
                profileButton &&
                !profileButton.contains(event.target)
            ) {

                profileButtonMenu.classList.remove(
                    "show"
                );

            }

        }
    );


    /* =================================================
       BACK TO DASHBOARD
    ================================================= */

    const backButton =
        document.getElementById("backButton");

    if (backButton) {

        backButton.addEventListener(
            "click",
            () => {

                window.location.href =
                    "customerdashboard.html";

            }
        );

    }


    /* =================================================
       DOM ELEMENTS
    ================================================= */

    const loadingSection =
        document.getElementById("loadingSection");

    const errorSection =
        document.getElementById("errorSection");

    const emptySection =
        document.getElementById("emptySection");

    const tableSection =
        document.getElementById("tableSection");

    const tableBody =
        document.getElementById("catererTableBody");

    const catererCount =
        document.getElementById("catererCount");

    const errorMessage =
        document.getElementById("errorMessage");

    const refreshButton =
        document.getElementById("refreshButton");

    const retryButton =
        document.getElementById("retryButton");


    /* =================================================
       LOAD SAVED CATERER IDs
    ================================================= */

    async function loadSavedCatererIds() {

        if (!customerId) {
            return [];
        }

        try {

            const response = await fetch(
                `http://localhost:5000/api/customer/saved-caterers/${customerId}`
            );


            if (!response.ok) {

                throw new Error(
                    "Could not fetch saved caterers."
                );

            }


            const data =
                await response.json();


            const savedCaterers =
                data.caterers || [];


            return savedCaterers.map(
                (caterer) =>
                    String(caterer.caterer_id)
            );


        } catch (error) {

            console.error(
                "Load saved caterers error:",
                error
            );

            return [];

        }

    }


    /* =================================================
       SAVE CATERER
    ================================================= */

    async function saveCaterer(
        catererId,
        button
    ) {

        if (!customerId) {

            alert(
                "Customer details are missing. Please login again."
            );

            return;

        }


        if (!catererId) {

            alert(
                "Caterer information is missing."
            );

            return;

        }


        button.disabled = true;

        const originalText =
            button.textContent;


        button.textContent =
            "Saving...";


        try {

            const response =
                await fetch(
                    "http://localhost:5000/api/customer/saved-caterers/save",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                customerId:
                                    customerId,

                                catererId:
                                    Number(catererId)
                            })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Could not save caterer."
                );

            }


            button.textContent =
                "❤️ Saved";


            button.classList.add(
                "saved"
            );


            button.disabled =
                true;


        } catch (error) {

            console.error(
                "Save caterer error:",
                error
            );


            alert(
                error.message ||
                "Could not save caterer. Please try again."
            );


            button.textContent =
                originalText;


            button.disabled =
                false;

        }

    }


    /* =================================================
       LOAD APPROVED CATERERS
    ================================================= */

    async function loadApprovedCaterers() {

        loadingSection.style.display = "flex";

        errorSection.style.display = "none";

        emptySection.style.display = "none";

        tableSection.style.display = "none";


        try {

            /* -----------------------------------------
               LOAD APPROVED CATERERS
            ----------------------------------------- */

            const response = await fetch(
                "http://localhost:5000/api/customer/caterers/approved"
            );


            if (!response.ok) {

                throw new Error(
                    "Could not fetch approved caterers."
                );

            }


            const data =
                await response.json();


            const caterers =
                data.caterers || [];


            /* -----------------------------------------
               LOAD SAVED CATERERS
            ----------------------------------------- */

            const savedCatererIds =
                await loadSavedCatererIds();


            loadingSection.style.display =
                "none";


            catererCount.textContent =
                caterers.length;


            if (caterers.length === 0) {

                emptySection.style.display =
                    "flex";

                return;

            }


            tableSection.style.display =
                "block";


            tableBody.innerHTML =
                "";


            /* =================================================
               CREATE CATERER ROWS
            ================================================= */

            caterers.forEach(
                (caterer) => {

                    const row =
                        document.createElement("tr");


                    const brandName =
                        caterer.brand_name ||
                        "Unnamed Caterer";


                    const headName =
                        caterer.head_name ||
                        "Caterer";


                    const firstLetter =
                        brandName
                            .charAt(0)
                            .toUpperCase();


                    const ratingHTML = `
                        <span class="rating-not-available">
                            Not rated yet
                        </span>
                    `;


                    const phone =
                        caterer.phone ||
                        "Not available";


                    const email =
                        caterer.email ||
                        "Not available";


                    const helpers =
                        caterer.helpers ??
                        "—";


                    const eventsServed =
                        caterer.events_served ||
                        "—";


                    const status =
                        caterer.status ||
                        "approved";


                    const isSaved =
                        savedCatererIds.includes(
                            String(caterer.caterer_id)
                        );


                    const saveButtonHTML =
                        isSaved
                            ? `
                                <button
                                    class="save-caterer-button saved"
                                    type="button"
                                    data-id="${escapeAttribute(caterer.caterer_id)}"
                                    disabled
                                >
                                    ❤️ Saved
                                </button>
                              `
                            : `
                                <button
                                    class="save-caterer-button"
                                    type="button"
                                    data-id="${escapeAttribute(caterer.caterer_id)}"
                                >
                                    ❤️ Save
                                </button>
                              `;


                    row.innerHTML = `

                        <td>

                            <div class="caterer-name">

                                <div class="caterer-avatar">
                                    ${escapeHTML(firstLetter)}
                                </div>

                                <div class="caterer-name-text">

                                    <strong>
                                        ${escapeHTML(brandName)}
                                    </strong>

                                    <span>
                                        ${escapeHTML(headName)}
                                    </span>

                                </div>

                            </div>

                        </td>


                        <td class="rating-cell">

                            ${ratingHTML}

                        </td>


                        <td class="phone-cell">

                            ${escapeHTML(phone)}

                        </td>


                        <td class="email-cell">

                            ${escapeHTML(email)}

                        </td>


                        <td>

                            ${escapeHTML(String(helpers))}

                        </td>


                        <td>

                            ${escapeHTML(String(eventsServed))}

                        </td>


                        <td>

                            <span class="status-badge">

                                ${escapeHTML(status)}

                            </span>

                        </td>


                        <td>

                            <div class="action-buttons">

                                ${saveButtonHTML}


                                <button
                                    class="enquiry-button"
                                    type="button"
                                    data-id="${escapeAttribute(caterer.caterer_id)}"
                                    data-name="${escapeAttribute(brandName)}"
                                    data-email="${escapeAttribute(email)}"
                                >
                                    Send Enquiry
                                </button>

                            </div>

                        </td>

                    `;


                    tableBody.appendChild(row);

                }
            );


            /* =================================================
               SAVE BUTTON EVENTS
            ================================================= */

            const saveButtons =
                document.querySelectorAll(
                    ".save-caterer-button"
                );


            saveButtons.forEach(
                (button) => {

                    button.addEventListener(
                        "click",
                        () => {

                            const catererId =
                                button.dataset.id;


                            saveCaterer(
                                catererId,
                                button
                            );

                        }
                    );

                }
            );


            /* =================================================
               ENQUIRY BUTTON EVENTS
            ================================================= */

            const enquiryButtons =
                document.querySelectorAll(
                    ".enquiry-button"
                );


            enquiryButtons.forEach(
                (button) => {

                    button.addEventListener(
                        "click",
                        () => {

                            const catererId =
                                button.dataset.id;


                            const catererName =
                                button.dataset.name;


                            const catererEmail =
                                button.dataset.email;


                            openEnquiryModal(
                                catererId,
                                catererName,
                                catererEmail
                            );

                        }
                    );

                }
            );


        } catch (error) {

            console.error(
                "Load caterers error:",
                error
            );


            loadingSection.style.display =
                "none";


            tableSection.style.display =
                "none";


            emptySection.style.display =
                "none";


            errorSection.style.display =
                "flex";


            errorMessage.textContent =
                "Please make sure the Annapriya backend server is running.";

        }

    }


    /* =================================================
       ENQUIRY MODAL
    ================================================= */

    const enquiryModal =
        document.getElementById("enquiryModal");


    const closeModal =
        document.getElementById("closeModal");


    const enquiryForm =
        document.getElementById("enquiryForm");


    const selectedCatererId =
        document.getElementById(
            "selectedCatererId"
        );


    const selectedCatererEmail =
        document.getElementById(
            "selectedCatererEmail"
        );


    const selectedCatererName =
        document.getElementById(
            "selectedCatererName"
        );


    /* =================================================
       OPEN ENQUIRY MODAL
    ================================================= */

    function openEnquiryModal(
        catererId,
        catererName,
        catererEmail
    ) {

        if (selectedCatererId) {

            selectedCatererId.value =
                catererId;

        }


        if (selectedCatererName) {

            selectedCatererName.textContent =
                catererName;

        }


        if (selectedCatererEmail) {

            selectedCatererEmail.value =
                catererEmail;

        }


        if (enquiryModal) {

            enquiryModal.classList.add(
                "show"
            );

        }

    }


    /* =================================================
       CLOSE ENQUIRY MODAL
    ================================================= */

    function closeEnquiryModal() {

        if (enquiryModal) {

            enquiryModal.classList.remove(
                "show"
            );

        }

    }


    if (closeModal) {

        closeModal.addEventListener(
            "click",
            closeEnquiryModal
        );

    }


    /* Close when clicking outside */

    if (enquiryModal) {

        enquiryModal.addEventListener(
            "click",
            (event) => {

                if (
                    event.target ===
                    enquiryModal
                ) {

                    closeEnquiryModal();

                }

            }
        );

    }


    /* =================================================
       ENQUIRY FORM SUBMIT
    ================================================= */

    if (enquiryForm) {

        enquiryForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                /* -----------------------------------------
                   GET FORM VALUES
                ----------------------------------------- */

                const catererId =
                    selectedCatererId.value;


                const catererEmail =
                    selectedCatererEmail.value;


                const eventType =
                    document.getElementById(
                        "eventType"
                    ).value;


                const eventDate =
                    document.getElementById(
                        "eventDate"
                    ).value;


                const eventTime =
                    document.getElementById(
                        "eventTime"
                    ).value;


                const venueLocation =
                    document.getElementById(
                        "venueLocation"
                    ).value.trim();


                const guestCount =
                    document.getElementById(
                        "guestCount"
                    ).value;


                const foodType =
                    document.getElementById(
                        "foodType"
                    ).value;


                const packageName =
                    document.getElementById(
                        "packageName"
                    ).value.trim();


                const budget =
                    document.getElementById(
                        "budget"
                    ).value;


                const cateringService =
                    document.getElementById(
                        "cateringService"
                    ).value;


                const specialRequirements =
                    document.getElementById(
                        "specialRequirements"
                    ).value.trim();


                const message =
                    document.getElementById(
                        "eventMessage"
                    ).value.trim();


                /* -----------------------------------------
                   BASIC CUSTOMER CHECK
                ----------------------------------------- */

                if (
                    !customerName ||
                    !customerPhone ||
                    !customerEmail
                ) {

                    alert(
                        "Customer details are missing. Please login again."
                    );

                    return;

                }


                /* -----------------------------------------
                   REQUEST DATA
                ----------------------------------------- */

                const requestData = {

                    customerId:
                        customerId,

                    customerName:
                        customerName,

                    phone:
                        customerPhone,

                    email:
                        customerEmail,

                    eventType:
                        eventType,

                    eventDate:
                        eventDate,

                    eventTime:
                        eventTime,

                    venueLocation:
                        venueLocation,

                    guestCount:
                        Number(guestCount),

                    foodType:
                        foodType,

                    packageName:
                        packageName || null,

                    budget:
                        budget
                            ? Number(budget)
                            : null,

                    cateringService:
                        cateringService || null,

                    specialRequirements:
                        specialRequirements ||
                        null,

                    message:
                        message ||
                        null,

                    catererEmail:
                        catererEmail

                };


                console.log(
                    "Sending enquiry:",
                    requestData
                );


                /* -----------------------------------------
                   DISABLE BUTTON
                ----------------------------------------- */

                const sendButton =
                    document.getElementById(
                        "sendEnquiryButton"
                    );


                if (sendButton) {

                    sendButton.disabled =
                        true;


                    sendButton.textContent =
                        "Sending...";

                }


                try {

                    /* -------------------------------------
                       SEND TO BACKEND
                    ------------------------------------- */

                    const response =
                        await fetch(
                            "http://localhost:5000/api/requests",
                            {
                                method:
                                    "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(
                                        requestData
                                    )
                            }
                        );


                    const data =
                        await response.json();


                    /* -------------------------------------
                       CHECK RESPONSE
                    ------------------------------------- */

                    if (!response.ok) {

                        throw new Error(
                            data.message ||
                            "Could not send enquiry."
                        );

                    }


                    /* -------------------------------------
                       SUCCESS
                    ------------------------------------- */

                    alert(
                        "Enquiry sent successfully! The caterer can now review your request."
                    );


                    enquiryForm.reset();

                    closeEnquiryModal();


                } catch (error) {

                    console.error(
                        "Send enquiry error:",
                        error
                    );


                    alert(
                        error.message ||
                        "Could not send enquiry. Please try again."
                    );


                } finally {

                    /* -------------------------------------
                       ENABLE BUTTON AGAIN
                    ------------------------------------- */

                    if (sendButton) {

                        sendButton.disabled =
                            false;


                        sendButton.textContent =
                            "Send Enquiry";

                    }

                }

            }
        );

    }


    /* =================================================
       REFRESH
    ================================================= */

    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            loadApprovedCaterers
        );

    }


    if (retryButton) {

        retryButton.addEventListener(
            "click",
            loadApprovedCaterers
        );

    }


    /* =================================================
       ESCAPE HTML
    ================================================= */

    function escapeHTML(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function escapeAttribute(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

    }


    /* =================================================
       INITIAL LOAD
    ================================================= */

    loadApprovedCaterers();

});