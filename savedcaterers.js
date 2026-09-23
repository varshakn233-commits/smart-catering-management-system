// =====================================================
// SAVED CATERERS PAGE
// =====================================================

// API URLs
const SAVED_CATERERS_API =
    "http://localhost:5000/api/customer/saved-caterers";

const APPROVED_CATERERS_API =
    "http://localhost:5000/api/customer/caterers/approved";


// =====================================================
// GET CUSTOMER FROM LOCAL STORAGE
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

const savedSection =
    document.getElementById("savedSection");

const browseSection =
    document.getElementById("browseSection");

const savedCount =
    document.getElementById("savedCount");

const savedCatererTableBody =
    document.getElementById("savedCatererTableBody");

const browseCatererTableBody =
    document.getElementById("browseCatererTableBody");

const refreshButton =
    document.getElementById("refreshButton");


// Header elements
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
// HEADER CUSTOMER DETAILS
// =====================================================

function loadCustomerDetails() {

    if (!customer) {
        headerCustomerName.textContent = "Customer";
        headerAvatar.textContent = "C";
        return;
    }

    const name =
        customer.fullName ||
        customer.full_name ||
        "Customer";

    headerCustomerName.textContent = name;

    headerAvatar.textContent =
        name.charAt(0).toUpperCase();
}


// =====================================================
// PROFILE MENU
// =====================================================

profileButton.addEventListener("click", function (event) {

    event.stopPropagation();

    profileButtonMenu.classList.toggle("show");

});


document.addEventListener("click", function () {

    profileButtonMenu.classList.remove("show");

});


// =====================================================
// BACK BUTTON
// =====================================================

backButton.addEventListener("click", function () {

    window.location.href = "customerdashboard.html";

});


// =====================================================
// ESCAPE HTML
// =====================================================

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


// =====================================================
// SHOW / HIDE SECTIONS
// =====================================================

function showLoading() {

    loadingSection.style.display = "flex";

    errorSection.style.display = "none";

    emptySection.style.display = "none";

    savedSection.style.display = "none";

    browseSection.style.display = "none";
}


function showError(message) {

    loadingSection.style.display = "none";

    errorSection.style.display = "flex";

    emptySection.style.display = "none";

    savedSection.style.display = "none";

    browseSection.style.display = "none";

    errorMessage.textContent =
        message || "Could not load caterers.";
}


function showContent() {

    loadingSection.style.display = "none";

    errorSection.style.display = "none";

    browseSection.style.display = "block";
}


// =====================================================
// LOAD SAVED CATERERS
// =====================================================

async function loadSavedCaterers() {

    if (!customerId) {

        console.error(
            "Customer ID not found:",
            customer
        );

        throw new Error(
            "Customer information not found. Please login again."
        );
    }


    const response = await fetch(
        `${SAVED_CATERERS_API}/${customerId}`
    );


    if (!response.ok) {

        throw new Error(
            "Could not load your saved caterers."
        );
    }


    const data = await response.json();

    const caterers =
        data.caterers || [];


    // Clear old rows
    savedCatererTableBody.innerHTML = "";


    savedCount.textContent =
        caterers.length;


    // No saved caterers
    if (caterers.length === 0) {

        savedSection.style.display = "none";

        emptySection.style.display = "flex";

        return;
    }


    // Saved caterers exist
    emptySection.style.display = "none";

    savedSection.style.display = "block";


    caterers.forEach(function (caterer) {

        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>

                <div class="caterer-name">

                    <span class="caterer-avatar">
                        ${escapeHTML(
                            (caterer.brand_name || "C")
                                .charAt(0)
                                .toUpperCase()
                        )}
                    </span>

                    <span class="caterer-name-text">
                        ${escapeHTML(
                            caterer.brand_name ||
                            caterer.head_name ||
                            "Caterer"
                        )}
                    </span>

                </div>

            </td>


            <td>
                ${escapeHTML(
                    caterer.phone || "-"
                )}
            </td>


            <td>
                ${escapeHTML(
                    caterer.email || "-"
                )}
            </td>


            <td>
                ${escapeHTML(
                    caterer.helpers ?? "-"
                )}
            </td>


            <td>
                ${escapeHTML(
                    caterer.events_served ?? "-"
                )}
            </td>


            <td>

                <span class="status-badge">
                    ${escapeHTML(
                        caterer.status || "approved"
                    )}
                </span>

            </td>


            <td>

                <div class="action-buttons">

                    <button
                        class="remove-button"
                        type="button"
                        data-caterer-id="${caterer.caterer_id}"
                    >
                        🗑 Remove
                    </button>

                </div>

            </td>

        `;


        savedCatererTableBody.appendChild(row);

    });


    // Add remove button events
    const removeButtons =
        savedCatererTableBody.querySelectorAll(
            ".remove-button"
        );


    removeButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const catererId =
                    button.dataset.catererId;

                removeSavedCaterer(
                    catererId,
                    button
                );

            }
        );

    });

}


// =====================================================
// REMOVE SAVED CATERER
// =====================================================

async function removeSavedCaterer(
    catererId,
    button
) {

    if (!customerId) {

        alert(
            "Customer information not found. Please login again."
        );

        return;
    }


    const confirmed =
        confirm(
            "Remove this caterer from your saved list?"
        );


    if (!confirmed) {
        return;
    }


    try {

        button.disabled = true;

        button.textContent =
            "Removing...";


        const response =
            await fetch(
                `${SAVED_CATERERS_API}/remove`,
                {
                    method: "DELETE",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        customerId:
                            Number(customerId),

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
                "Could not remove caterer."
            );

        }


        // Reload both sections
        await loadSavedCaterers();

        await loadBrowseCaterers();


    } catch (error) {

        console.error(
            "Remove caterer error:",
            error
        );


        alert(
            error.message ||
            "Could not remove caterer."
        );


        button.disabled = false;

        button.textContent =
            "🗑 Remove";
    }

}


// =====================================================
// LOAD BROWSE CATERERS
// =====================================================

async function loadBrowseCaterers() {

    const response =
        await fetch(
            APPROVED_CATERERS_API
        );


    if (!response.ok) {

        throw new Error(
            "Could not load approved caterers."
        );

    }


    const data =
        await response.json();


    const caterers =
        data.caterers || [];


    // Clear old rows
    browseCatererTableBody.innerHTML = "";


    // If no approved caterers
    if (caterers.length === 0) {

        browseCatererTableBody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    style="text-align:center;"
                >
                    No approved caterers available.
                </td>

            </tr>

        `;

        return;
    }


    // Get currently saved caterers
    let savedIds = [];


    if (customerId) {

        try {

            const savedResponse =
                await fetch(
                    `${SAVED_CATERERS_API}/${customerId}`
                );


            if (savedResponse.ok) {

                const savedData =
                    await savedResponse.json();


                savedIds =
                    (savedData.caterers || [])
                        .map(function (caterer) {

                            return Number(
                                caterer.caterer_id
                            );

                        });

            }

        } catch (error) {

            console.error(
                "Could not check saved caterers:",
                error
            );

        }

    }


    // Create rows
    caterers.forEach(function (caterer) {

        const catererId =
            Number(caterer.caterer_id);


        const isSaved =
            savedIds.includes(catererId);


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>

                <div class="caterer-name">

                    <span class="caterer-avatar">
                        ${escapeHTML(
                            (caterer.brand_name || "C")
                                .charAt(0)
                                .toUpperCase()
                        )}
                    </span>

                    <span class="caterer-name-text">
                        ${escapeHTML(
                            caterer.brand_name ||
                            caterer.head_name ||
                            "Caterer"
                        )}
                    </span>

                </div>

            </td>


            <td>
                -
            </td>


            <td>
                ${escapeHTML(
                    caterer.phone || "-"
                )}
            </td>


            <td>
                ${escapeHTML(
                    caterer.email || "-"
                )}
            </td>


            <td>
                ${escapeHTML(
                    caterer.helpers ?? "-"
                )}
            </td>


            <td>
                ${escapeHTML(
                    caterer.events_served ?? "-"
                )}
            </td>


            <td>

                <span class="status-badge">
                    ${escapeHTML(
                        caterer.status || "approved"
                    )}
                </span>

            </td>


            <td>

                <div class="action-buttons">

                    <button
                        class="save-button ${isSaved ? "saved" : ""}"
                        type="button"
                        data-caterer-id="${catererId}"
                        ${isSaved ? "disabled" : ""}
                    >
                        ${isSaved
                            ? "❤️ Saved"
                            : "❤️ Save"
                        }
                    </button>

                </div>

            </td>

        `;


        browseCatererTableBody.appendChild(row);

    });


    // Add Save button events
    const saveButtons =
        browseCatererTableBody.querySelectorAll(
            ".save-button"
        );


    saveButtons.forEach(function (button) {

        if (
            button.classList.contains("saved")
        ) {
            return;
        }


        button.addEventListener(
            "click",
            function () {

                const catererId =
                    button.dataset.catererId;


                saveCaterer(
                    catererId,
                    button
                );

            }
        );

    });

}


// =====================================================
// SAVE CATERER
// =====================================================

async function saveCaterer(
    catererId,
    button
) {

    if (!customerId) {

        alert(
            "Customer information not found. Please login again."
        );

        return;
    }


    try {

        button.disabled = true;

        button.textContent =
            "Saving...";


        const response =
            await fetch(
                `${SAVED_CATERERS_API}/save`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        customerId:
                            Number(customerId),

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


        // Change button immediately
        button.textContent =
            "❤️ Saved";

        button.classList.add("saved");

        button.disabled = true;


        // Reload saved section
        await loadSavedCaterers();


    } catch (error) {

        console.error(
            "Save caterer error:",
            error
        );


        alert(
            error.message ||
            "Could not save caterer."
        );


        button.disabled = false;

        button.textContent =
            "❤️ Save";

    }

}


// =====================================================
// REFRESH BUTTON
// =====================================================

refreshButton.addEventListener(
    "click",
    async function () {

        try {

            refreshButton.disabled = true;

            refreshButton.textContent =
                "↻ Loading...";


            await loadSavedCaterers();

            await loadBrowseCaterers();


        } catch (error) {

            console.error(
                "Refresh error:",
                error
            );


            showError(
                error.message
            );

        } finally {

            refreshButton.disabled = false;

            refreshButton.textContent =
                "↻ Refresh";

        }

    }
);


// =====================================================
// RETRY BUTTON
// =====================================================

retryButton.addEventListener(
    "click",
    function () {

        initializePage();

    }
);


// =====================================================
// INITIALIZE PAGE
// =====================================================

async function initializePage() {

    showLoading();


    try {

        // Load saved caterers
        await loadSavedCaterers();


        // Show browse section
        browseSection.style.display =
            "block";


        // Load all approved caterers
        await loadBrowseCaterers();


        // Hide loading
        loadingSection.style.display =
            "none";


    } catch (error) {

        console.error(
            "Page loading error:",
            error
        );


        showError(
            error.message ||
            "Could not load caterers."
        );

    }

}


// =====================================================
// START PAGE
// =====================================================

loadCustomerDetails();

initializePage();