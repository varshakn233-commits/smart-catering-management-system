// =====================================================
// CATERER DATA
// =====================================================

let caterer = null;

try {

    caterer = JSON.parse(
        localStorage.getItem("annapriya_caterer")
    );

} catch (error) {

    console.error(
        "Could not read caterer data:",
        error
    );

}


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
// CATERER NAME
// =====================================================

const catererName =
    caterer?.brandName ||
    caterer?.brand_name ||
    caterer?.headName ||
    caterer?.head_name ||
    "Caterer";

headerCustomerName.textContent =
    catererName;


// =====================================================
// CATERER AVATAR
// =====================================================

const firstLetter =
    catererName
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
            "catererdashboard.html";

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
            "catererprofile.html";

    }
);


// =====================================================
// OPEN CHANGE PASSWORD
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
        // SAME PASSWORD
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
        // CATERER ID
        // =============================================

        const catererId =
            caterer?.id ||
            caterer?.catererId ||
            caterer?.caterer_id;


        if (!catererId) {

            showPasswordMessage(
                "Caterer information not found. Please login again.",
                false
            );

            return;
        }


        // =============================================
        // CATERER TOKEN
        // =============================================

        const token =
            localStorage.getItem(
                "annapriya_caterer_token"
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
        // SEND REQUEST
        // =============================================

        try {

            const response =
                await fetch(
                    `http://localhost:5000/api/caterer/change-password/${catererId}`,
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
            // ERROR
            // =========================================

            if (!response.ok) {

                if (
                    response.status === 401
                ) {

                    localStorage.removeItem(
                        "annapriya_caterer_token"
                    );

                    localStorage.removeItem(
                        "annapriya_caterer"
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
// PASSWORD MESSAGE
// =====================================================

function showPasswordMessage(
    message,
    success
) {

    changePasswordMessage.textContent =
        message;

    changePasswordMessage.style.display =
        "block";


    changePasswordMessage.style.color =
        success
            ? "green"
            : "red";

}


// =====================================================
// NOTIFICATIONS
// =====================================================

eventNotifications.addEventListener(
    "change",
    function () {

        localStorage.setItem(
            "annapriya_caterer_event_notifications",
            eventNotifications.checked
        );

    }
);


// =====================================================
// LOAD NOTIFICATIONS
// =====================================================

const savedNotificationSetting =
    localStorage.getItem(
        "annapriya_caterer_event_notifications"
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
            "annapriya_caterer"
        );

        localStorage.removeItem(
            "annapriya_caterer_token"
        );


        window.location.href =
            "index.html";

    }
);