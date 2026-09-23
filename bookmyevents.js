const API_BASE = "http://localhost:5000/api";

const customer = JSON.parse(
    localStorage.getItem("annapriya_customer")
);

const customerId =
    customer?.customerId ||
    customer?.customer_id ||
    customer?.id ||
    null;


// =====================================================
// ELEMENTS
// =====================================================

const backButton =
    document.getElementById("backButton");

const profileButton =
    document.getElementById("profileButton");

const profileButtonMenu =
    document.getElementById("profileButtonMenu");

const headerAvatar =
    document.getElementById("headerAvatar");

const headerCustomerName =
    document.getElementById("headerCustomerName");

const customerName =
    document.getElementById("customerName");

const customerPhone =
    document.getElementById("customerPhone");

const customerEmail =
    document.getElementById("customerEmail");

const eventBookingForm =
    document.getElementById("eventBookingForm");

const catererList =
    document.getElementById("catererList");

const summaryBox =
    document.getElementById("summaryBox");

const formMessage =
    document.getElementById("formMessage");

const submitButton =
    document.getElementById("submitButton");


// =====================================================
// CUSTOMER INFORMATION
// =====================================================

function loadCustomerInformation() {

    if (!customer) {
        return;
    }

    const name =
        customer.fullName ||
        customer.full_name ||
        "";

    const phone =
        customer.phone ||
        "";

    const email =
        customer.email ||
        "";

    customerName.value = name;
    customerPhone.value = phone;
    customerEmail.value = email;

    headerCustomerName.textContent =
        name || "Customer";

    headerAvatar.textContent =
        name
            ? name.trim().charAt(0).toUpperCase()
            : "C";
}


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


profileButtonMenu.addEventListener(
    "click",
    function (event) {

        event.stopPropagation();

    }
);


// =====================================================
// LOAD APPROVED CATERERS
// =====================================================

async function loadCaterers() {

    try {

        catererList.innerHTML = `
            <div class="loading-caterers">
                <div class="small-loader"></div>
                <p>Loading approved caterers...</p>
            </div>
        `;


        const response = await fetch(
            `${API_BASE}/customer/caterers/approved`
        );


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


        if (caterers.length === 0) {

            catererList.innerHTML = `
                <div class="caterer-state">

                    <div class="caterer-state-icon">
                        👨‍🍳
                    </div>

                    <h3>
                        No Approved Caterers
                    </h3>

                    <p>
                        There are currently no approved
                        caterers available.
                    </p>

                </div>
            `;

            return;
        }


        catererList.innerHTML =
            caterers.map(
                function (caterer) {

                    return `
                        <div class="caterer-option">

                            <input
                                type="radio"
                                name="caterer"
                                id="caterer-${caterer.caterer_id}"
                                value="${caterer.caterer_id}"
                                data-email="${escapeHTML(
                                    caterer.email || ""
                                )}"
                                data-name="${escapeHTML(
                                    caterer.brand_name ||
                                    caterer.head_name ||
                                    "Caterer"
                                )}"
                                required
                            >

                            <label
                                class="caterer-label"
                                for="caterer-${caterer.caterer_id}"
                            >

                                <span class="caterer-radio"></span>

                                <div class="caterer-info">

                                    <h3>
                                        ${escapeHTML(
                                            caterer.brand_name ||
                                            caterer.head_name ||
                                            "Caterer"
                                        )}
                                    </h3>

                                    <p>
                                        ${escapeHTML(
                                            caterer.head_name ||
                                            ""
                                        )}

                                        ${
                                            caterer.phone
                                                ? " · " +
                                                  escapeHTML(
                                                      caterer.phone
                                                  )
                                                : ""
                                        }
                                    </p>

                                </div>

                                <span class="caterer-status">
                                    Approved
                                </span>

                            </label>

                        </div>
                    `;
                }
            ).join("");


        const catererInputs =
            document.querySelectorAll(
                'input[name="caterer"]'
            );


        catererInputs.forEach(
            function (input) {

                input.addEventListener(
                    "change",
                    updateSummary
                );

            }
        );


    } catch (error) {

        console.error(
            "Load caterers error:",
            error
        );


        catererList.innerHTML = `
            <div class="caterer-state">

                <div class="caterer-state-icon">
                    ⚠️
                </div>

                <h3>
                    Could Not Load Caterers
                </h3>

                <p>
                    Please refresh the page and try again.
                </p>

            </div>
        `;

    }
}


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
// GET SELECTED CATERER
// =====================================================

function getSelectedCaterer() {

    const selected =
        document.querySelector(
            'input[name="caterer"]:checked'
        );

    if (!selected) {
        return null;
    }

    return {
        id: selected.value,
        email: selected.dataset.email,
        name: selected.dataset.name
    };
}


// =====================================================
// UPDATE SUMMARY
// =====================================================

function updateSummary() {

    const eventType =
        document.getElementById("eventType").value;

    const eventDate =
        document.getElementById("eventDate").value;

    const eventTime =
        document.getElementById("eventTime").value;

    const venue =
        document.getElementById("venueLocation").value;

    const guestCount =
        document.getElementById("guestCount").value;

    const foodType =
        document.getElementById("foodType").value;

    const packageName =
        document.getElementById("packageName").value;

    const budget =
        document.getElementById("budget").value;

    const cateringService =
        document.getElementById("cateringService").value;

    const selectedCaterer =
        getSelectedCaterer();


    if (
        !eventType &&
        !eventDate &&
        !eventTime &&
        !venue &&
        !guestCount &&
        !foodType &&
        !packageName &&
        !budget &&
        !cateringService &&
        !selectedCaterer
    ) {

        summaryBox.innerHTML = `
            <p class="summary-placeholder">
                Your booking summary will appear here
                after you fill in the event details.
            </p>
        `;

        return;
    }


    summaryBox.innerHTML = `

        <div class="summary-grid">

            <div class="summary-item">
                <span class="summary-label">
                    Event Type
                </span>

                <span class="summary-value">
                    ${escapeHTML(eventType || "-")}
                </span>
            </div>


            <div class="summary-item">
                <span class="summary-label">
                    Date
                </span>

                <span class="summary-value">
                    ${escapeHTML(eventDate || "-")}
                </span>
            </div>


            <div class="summary-item">
                <span class="summary-label">
                    Time
                </span>

                <span class="summary-value">
                    ${escapeHTML(eventTime || "-")}
                </span>
            </div>


            <div class="summary-item">
                <span class="summary-label">
                    Guests
                </span>

                <span class="summary-value">
                    ${escapeHTML(guestCount || "-")}
                </span>
            </div>


            <div class="summary-item">
                <span class="summary-label">
                    Food Type
                </span>

                <span class="summary-value">
                    ${escapeHTML(foodType || "-")}
                </span>
            </div>


            <div class="summary-item">
                <span class="summary-label">
                    Package
                </span>

                <span class="summary-value">
                    ${escapeHTML(packageName || "-")}
                </span>
            </div>


            <div class="summary-item">
                <span class="summary-label">
                    Budget
                </span>

                <span class="summary-value">
                    ${
                        budget
                            ? "₹" + escapeHTML(budget)
                            : "-"
                    }
                </span>
            </div>


            <div class="summary-item">
                <span class="summary-label">
                    Catering Service
                </span>

                <span class="summary-value">
                    ${escapeHTML(
                        cateringService || "-"
                    )}
                </span>
            </div>


            <div class="summary-item">

                <span class="summary-label">
                    Caterer
                </span>

                <span class="summary-value">
                    ${escapeHTML(
                        selectedCaterer?.name ||
                        "-"
                    )}
                </span>

            </div>


            <div class="summary-item full-width">

                <span class="summary-label">
                    Venue
                </span>

                <span class="summary-value">
                    ${escapeHTML(
                        venue || "-"
                    )}
                </span>

            </div>

        </div>
    `;
}


// =====================================================
// UPDATE SUMMARY WHEN FORM CHANGES
// =====================================================

const formInputs =
    eventBookingForm.querySelectorAll(
        "input, select, textarea"
    );


formInputs.forEach(
    function (input) {

        input.addEventListener(
            "input",
            updateSummary
        );

        input.addEventListener(
            "change",
            updateSummary
        );

    }
);


// =====================================================
// SUBMIT EVENT REQUEST
// =====================================================

eventBookingForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        formMessage.textContent = "";
        formMessage.className =
            "form-message";


        if (!customerId) {

            formMessage.textContent =
                "Customer information was not found. Please login again.";

            formMessage.classList.add(
                "error"
            );

            return;
        }


        const selectedCaterer =
            getSelectedCaterer();


        if (!selectedCaterer) {

            formMessage.textContent =
                "Please select a caterer.";

            formMessage.classList.add(
                "error"
            );

            return;
        }


        const requestData = {

            customerId,

            customerName:
                customerName.value.trim(),

            phone:
                customerPhone.value.trim(),

            email:
                customerEmail.value.trim(),

            eventType:
                document.getElementById(
                    "eventType"
                ).value,

            eventDate:
                document.getElementById(
                    "eventDate"
                ).value,

            eventTime:
                document.getElementById(
                    "eventTime"
                ).value,

            venueLocation:
                document.getElementById(
                    "venueLocation"
                ).value.trim(),

            guestCount:
                document.getElementById(
                    "guestCount"
                ).value,

            foodType:
                document.getElementById(
                    "foodType"
                ).value,

            packageName:
                document.getElementById(
                    "packageName"
                ).value,

            budget:
                document.getElementById(
                    "budget"
                ).value,

            cateringService:
                document.getElementById(
                    "cateringService"
                ).value,

            specialRequirements:
                document.getElementById(
                    "specialRequirements"
                ).value.trim(),

            message:
                document.getElementById(
                    "message"
                ).value.trim(),

            catererEmail:
                selectedCaterer.email

        };


        try {

            submitButton.disabled = true;

            submitButton.textContent =
                "Submitting...";


            const response = await fetch(
                `${API_BASE}/requests`,
                {
                    method: "POST",

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


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Could not submit event request."
                );

            }


            formMessage.textContent =
                `Event request submitted successfully! Request #${data.requestId}`;

            formMessage.classList.add(
                "success"
            );


            submitButton.textContent =
                "✓ Request Submitted";


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });


        } catch (error) {

            console.error(
                "Submit event request error:",
                error
            );


            formMessage.textContent =
                error.message ||
                "Could not submit event request.";

            formMessage.classList.add(
                "error"
            );


            submitButton.disabled = false;

            submitButton.textContent =
                "📅 Submit Event Request";

        }

    }
);


// =====================================================
// INITIALIZE
// =====================================================

loadCustomerInformation();

loadCaterers();