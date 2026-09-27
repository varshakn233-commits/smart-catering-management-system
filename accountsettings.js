// =====================================================
// CUSTOMER DATA
// =====================================================

const customer = JSON.parse(
    localStorage.getItem("annapriya_customer")
);


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

const editProfileButton =
    document.getElementById("editProfileButton");

const changePasswordButton =
    document.getElementById("changePasswordButton");

const changePasswordPanel =
    document.getElementById("changePasswordPanel");

const changePasswordForm =
    document.getElementById("changePasswordForm");

const currentPassword =
    document.getElementById("currentPassword");

const newPassword =
    document.getElementById("newPassword");

const confirmPassword =
    document.getElementById("confirmPassword");

const changePasswordMessage =
    document.getElementById("changePasswordMessage");

const cancelChangePassword =
    document.getElementById("cancelChangePassword");

const eventNotifications =
    document.getElementById("eventNotifications");

const logoutButton =
    document.getElementById("logoutButton");


// =====================================================
// CUSTOMER NAME
// =====================================================

const customerName =
    customer?.fullName ||
    customer?.full_name ||
    "Customer";

headerCustomerName.textContent =
    customerName;


// =====================================================
// CUSTOMER AVATAR
// =====================================================

const firstLetter =
    customerName
        .trim()
        .charAt(0)
        .toUpperCase() || "C";

headerAvatar.textContent =
    firstLetter;


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
// EDIT PROFILE
// =====================================================

editProfileButton.addEventListener(
    "click",
    function () {

        window.location.href =
            "editprofile.html";

    }
);


// =====================================================
// OPEN CHANGE PASSWORD FORM
// =====================================================

changePasswordButton.addEventListener(
    "click",
    function () {

        changePasswordPanel.style.display =
            "block";

        changePasswordMessage.style.display =
            "none";

        changePasswordForm.reset();

        currentPassword.focus();

    }
);


// =====================================================
// CANCEL CHANGE PASSWORD
// =====================================================

cancelChangePassword.addEventListener(
    "click",
    function () {

        changePasswordForm.reset();

        changePasswordMessage.style.display =
            "none";

        changePasswordPanel.style.display =
            "none";

    }
);


// =====================================================
// CHANGE PASSWORD
// =====================================================

changePasswordForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const currentPasswordValue =
            currentPassword.value.trim();

        const newPasswordValue =
            newPassword.value;

        const confirmPasswordValue =
            confirmPassword.value;


        // =============================================
        // REQUIRED FIELDS
        // =============================================

        if (
            !currentPasswordValue ||
            !newPasswordValue ||
            !confirmPasswordValue
        ) {

            showPasswordMessage(
                "Please fill in all password fields.",
                false
            );

            return;
        }


        // =============================================
        // PASSWORD MATCH
        // =============================================

        if (
            newPasswordValue !==
            confirmPasswordValue
        ) {

            showPasswordMessage(
                "New passwords do not match.",
                false
            );

            return;
        }


        // =============================================
        // SAME PASSWORD CHECK
        // =============================================

        if (
            currentPasswordValue ===
            newPasswordValue
        ) {

            showPasswordMessage(
                "New password must be different from your current password.",
                false
            );

            return;
        }


        // =============================================
        // PASSWORD STRENGTH
        // =============================================

        const passwordRegex =
            /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{6,}$/;


        if (
            !passwordRegex.test(
                newPasswordValue
            )
        ) {

            showPasswordMessage(
                "Password must be at least 6 characters and contain a letter, number, and special character.",
                false
            );

            return;
        }


        // =============================================
        // GET CUSTOMER JWT TOKEN
        // =============================================

        const token =
            localStorage.getItem(
                "annapriya_token"
            );


        if (!token) {

            alert(
                "Your session has expired. Please login again."
            );

            window.location.href =
                "index.html";

            return;
        }


        // =============================================
        // SEND CHANGE PASSWORD REQUEST
        // =============================================

        try {

            const response =
                await fetch(
                    "http://localhost:5000/api/customer/change-password",
                    {
                        method: "PUT",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`

                        },

                        body: JSON.stringify({

                            currentPassword:
                                currentPasswordValue,

                            newPassword:
                                newPasswordValue,

                            confirmPassword:
                                confirmPasswordValue

                        })

                    }
                );


            const data =
                await response.json();


            // =========================================
            // SERVER ERROR
            // =========================================

            if (!response.ok) {

                if (
                    response.status === 401
                ) {

                    localStorage.removeItem(
                        "annapriya_token"
                    );

                    localStorage.removeItem(
                        "annapriya_customer"
                    );

                    alert(
                        data.message ||
                        "Your session has expired. Please login again."
                    );

                    window.location.href =
                        "index.html";

                    return;
                }


                showPasswordMessage(
                    data.message ||
                    "Could not change password.",
                    false
                );

                return;
            }


            // =========================================
            // SUCCESS
            // =========================================

            showPasswordMessage(
                "Password changed successfully!",
                true
            );


            changePasswordForm.reset();


            setTimeout(
                function () {

                    changePasswordPanel.style.display =
                        "none";

                    changePasswordMessage.style.display =
                        "none";

                },
                2500
            );


        } catch (error) {

            console.error(
                "Change password error:",
                error
            );


            showPasswordMessage(
                "Could not connect to the server. Please try again.",
                false
            );

        }

    }
);


// =====================================================
// SHOW PASSWORD MESSAGE
// =====================================================

function showPasswordMessage(
    message,
    success
) {

    changePasswordMessage.textContent =
        message;

    changePasswordMessage.style.display =
        "block";


    if (success) {

        changePasswordMessage.style.color =
            "green";

    } else {

        changePasswordMessage.style.color =
            "red";

    }

}


// =====================================================
// NOTIFICATION SETTING
// =====================================================

eventNotifications.addEventListener(
    "change",
    function () {

        localStorage.setItem(
            "annapriya_event_notifications",
            eventNotifications.checked
        );

    }
);


// =====================================================
// LOAD NOTIFICATION SETTING
// =====================================================

const savedNotificationSetting =
    localStorage.getItem(
        "annapriya_event_notifications"
    );


if (
    savedNotificationSetting !== null
) {

    eventNotifications.checked =
        savedNotificationSetting === "true";

}


// =====================================================
// LOGOUT
// =====================================================

logoutButton.addEventListener(
    "click",
    function () {

        const confirmLogout =
            confirm(
                "Are you sure you want to logout?"
            );


        if (!confirmLogout) {
            return;
        }


        localStorage.removeItem(
            "annapriya_customer"
        );

        localStorage.removeItem(
            "annapriya_token"
        );


        window.location.href =
            "index.html";

    }
);