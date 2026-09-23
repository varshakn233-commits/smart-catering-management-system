const API_BASE = "http://localhost:5000/api/customer";


// =====================================================
// GET CUSTOMER FROM LOCAL STORAGE
// =====================================================

const customer = JSON.parse(
    localStorage.getItem("annapriya_customer")
);


// =====================================================
// GET CUSTOMER ID
// =====================================================

const customerId =
    customer?.customerId ||
    customer?.customer_id ||
    customer?.id ||
    null;


// =====================================================
// ELEMENTS
// =====================================================

const loadingSection =
    document.getElementById("loadingSection");

const errorSection =
    document.getElementById("errorSection");

const errorMessage =
    document.getElementById("errorMessage");

const profileSection =
    document.getElementById("profileSection");

const retryButton =
    document.getElementById("retryButton");

const editProfileForm =
    document.getElementById("editProfileForm");

const fullNameInput =
    document.getElementById("fullName");

const genderInput =
    document.getElementById("gender");

const addressInput =
    document.getElementById("address");

const phoneInput =
    document.getElementById("phone");

const emailInput =
    document.getElementById("email");

const formCustomerName =
    document.getElementById("formCustomerName");

const largeAvatar =
    document.getElementById("largeAvatar");

const formMessage =
    document.getElementById("formMessage");

const saveButton =
    document.getElementById("saveButton");

const cancelButton =
    document.getElementById("cancelButton");

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


// =====================================================
// SHOW / HIDE STATES
// =====================================================

function showLoading() {

    loadingSection.style.display = "block";
    errorSection.style.display = "none";
    profileSection.style.display = "none";

}


function showError(message) {

    loadingSection.style.display = "none";
    errorSection.style.display = "block";
    profileSection.style.display = "none";

    errorMessage.textContent = message;

}


function showProfile() {

    loadingSection.style.display = "none";
    errorSection.style.display = "none";
    profileSection.style.display = "block";

}


// =====================================================
// UPDATE AVATAR
// =====================================================

function updateAvatar(name) {

    const firstLetter =
        name?.trim()?.charAt(0)?.toUpperCase() || "C";

    headerAvatar.textContent = firstLetter;
    largeAvatar.textContent = firstLetter;

}


// =====================================================
// LOAD CUSTOMER PROFILE
// =====================================================

async function loadProfile() {

    try {

        if (!customerId) {

            showError(
                "Customer information was not found. Please login again."
            );

            return;
        }


        showLoading();


        const response = await fetch(
            `${API_BASE}/${customerId}`
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Could not load your profile."
            );

        }


        const customerData =
            data.customer;


        if (!customerData) {

            throw new Error(
                "Customer profile was not found."
            );

        }


        // Fill form

        fullNameInput.value =
            customerData.full_name ||
            customerData.fullName ||
            "";

        genderInput.value =
            customerData.gender ||
            "";

        addressInput.value =
            customerData.address ||
            "";

        phoneInput.value =
            customerData.phone ||
            "";

        emailInput.value =
            customerData.email ||
            "";


        // Header

        headerCustomerName.textContent =
            customerData.full_name ||
            customerData.fullName ||
            "Customer";


        formCustomerName.textContent =
            customerData.full_name ||
            customerData.fullName ||
            "Customer";


        updateAvatar(
            customerData.full_name ||
            customerData.fullName
        );


        showProfile();


    } catch (error) {

        console.error(
            "Load profile error:",
            error
        );


        showError(
            error.message ||
            "Could not load your profile."
        );

    }

}


// =====================================================
// SAVE PROFILE
// =====================================================

editProfileForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        try {

            formMessage.textContent = "";
            formMessage.className = "form-message";


            if (!customerId) {

                formMessage.textContent =
                    "Customer information was not found.";

                formMessage.classList.add("error");

                return;
            }


            const fullName =
                fullNameInput.value.trim();

            const gender =
                genderInput.value;

            const address =
                addressInput.value.trim();

            const phone =
                phoneInput.value.trim();


            if (
                !fullName ||
                !gender ||
                !address ||
                !phone
            ) {

                formMessage.textContent =
                    "Please fill all required fields.";

                formMessage.classList.add("error");

                return;
            }


            saveButton.disabled = true;

            saveButton.textContent =
                "Saving...";


            const response = await fetch(
                `${API_BASE}/${customerId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        fullName,
                        gender,
                        address,
                        phone

                    })

                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Could not update profile."
                );

            }


            formMessage.textContent =
                "Profile updated successfully!";

            formMessage.classList.add(
                "success"
            );


            // Update local customer data

            const updatedCustomer = {

                ...customer,

                fullName:
                    data.customer?.fullName ||
                    fullName,

                full_name:
                    data.customer?.full_name ||
                    fullName,

                gender:
                    data.customer?.gender ||
                    gender,

                address:
                    data.customer?.address ||
                    address,

                phone:
                    data.customer?.phone ||
                    phone,

                email:
                    data.customer?.email ||
                    emailInput.value

            };


            localStorage.setItem(
                "annapriya_customer",
                JSON.stringify(
                    updatedCustomer
                )
            );


            headerCustomerName.textContent =
                fullName;

            formCustomerName.textContent =
                fullName;

            updateAvatar(fullName);


        } catch (error) {

            console.error(
                "Update profile error:",
                error
            );


            formMessage.textContent =
                error.message ||
                "Could not update profile.";

            formMessage.classList.add(
                "error"
            );

        } finally {

            saveButton.disabled = false;

            saveButton.textContent =
                "Save Changes";

        }

    }
);


// =====================================================
// CANCEL BUTTON
// =====================================================

cancelButton.addEventListener(
    "click",
    function () {

        window.location.href =
            "customerdashboard.html";

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
// RETRY
// =====================================================

retryButton.addEventListener(
    "click",
    loadProfile
);


// =====================================================
// INITIALIZE
// =====================================================

loadProfile();