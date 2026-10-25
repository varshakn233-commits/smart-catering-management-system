
"use strict";

// =====================================================
// CATERER DATA
// =====================================================

let caterer = null;

try {
    caterer = JSON.parse(
        localStorage.getItem("annapriya_caterer") || "null"
    );
} catch (error) {
    console.error("Could not read caterer data:", error);
}

// =====================================================
// ELEMENTS
// =====================================================

const backButton = document.getElementById("backButton");
const profileButton = document.getElementById("profileButton");
const profileButtonMenu = document.getElementById("profileButtonMenu");
const headerAvatar = document.getElementById("headerAvatar");
const headerCustomerName = document.getElementById("headerCustomerName");
const editProfileButton = document.getElementById("editProfileButton");
const changePasswordButton = document.getElementById("changePasswordButton");
const changePasswordPanel = document.getElementById("changePasswordPanel");
const changePasswordForm = document.getElementById("changePasswordForm");
const currentPassword = document.getElementById("currentPassword");
const newPassword = document.getElementById("newPassword");
const confirmPassword = document.getElementById("confirmPassword");
const changePasswordMessage = document.getElementById("changePasswordMessage");
const cancelChangePassword = document.getElementById("cancelChangePassword");
const eventNotifications = document.getElementById("eventNotifications");
const logoutButton = document.getElementById("logoutButton");

// =====================================================
// CATERER NAME
// Personal name first; business name is only a fallback.
// =====================================================


const displayedCatererName =
    caterer?.head_name ||
    caterer?.headName ||
    caterer?.owner_name ||
    caterer?.ownerName ||
    caterer?.full_name ||
    caterer?.fullName ||
    caterer?.name ||
    caterer?.brand_name ||
    caterer?.brandName ||
    "Caterer";

if (headerCustomerName) {
    headerCustomerName.textContent = displayedCatererName;
}

if (headerAvatar) {
    headerAvatar.textContent =
        displayedCatererName.trim().charAt(0).toUpperCase() || "C";
}


// =====================================================
// BACK BUTTON
// =====================================================

backButton?.addEventListener("click", function () {
    window.location.href = "catererdashboard.html";
});

// =====================================================
// PROFILE MENU
// =====================================================

profileButton?.addEventListener("click", function (event) {
    event.stopPropagation();
    profileButtonMenu?.classList.toggle("show");
});

document.addEventListener("click", function () {
    profileButtonMenu?.classList.remove("show");
});

profileButtonMenu?.addEventListener("click", function (event) {
    event.stopPropagation();
});

// =====================================================
// EDIT PROFILE
// =====================================================

editProfileButton?.addEventListener("click", function () {
    window.location.href = "catererprofile.html";
});

// =====================================================
// OPEN CHANGE PASSWORD
// =====================================================

changePasswordButton?.addEventListener("click", function () {
    if (!changePasswordPanel || !changePasswordForm) return;

    changePasswordPanel.style.display = "block";

    if (changePasswordMessage) {
        changePasswordMessage.style.display = "none";
    }

    changePasswordForm.reset();
    currentPassword?.focus();
});

// =====================================================
// CANCEL CHANGE PASSWORD
// =====================================================

cancelChangePassword?.addEventListener("click", function () {
    changePasswordForm?.reset();

    if (changePasswordMessage) {
        changePasswordMessage.style.display = "none";
    }

    if (changePasswordPanel) {
        changePasswordPanel.style.display = "none";
    }
});

// =====================================================
// CHANGE PASSWORD
// =====================================================

changePasswordForm?.addEventListener("submit", async function (event) {
    event.preventDefault();

    const currentPasswordValue = currentPassword.value.trim();
    const newPasswordValue = newPassword.value;
    const confirmPasswordValue = confirmPassword.value;

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

    if (newPasswordValue !== confirmPasswordValue) {
        showPasswordMessage(
            "New passwords do not match.",
            false
        );
        return;
    }

    if (currentPasswordValue === newPasswordValue) {
        showPasswordMessage(
            "New password must be different from your current password.",
            false
        );
        return;
    }

    const passwordRegex =
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{6,}$/;

    if (!passwordRegex.test(newPasswordValue)) {
        showPasswordMessage(
            "Password must be at least 6 characters and contain a letter, number, and special character.",
            false
        );
        return;
    }

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

const token = localStorage.getItem("annapriya_caterer_token");

    if (!token) {
        alert("Your session has expired. Please login again.");
        window.location.href = "index.html";
        return;
    }

    try {
        const response = await fetch(
            `http://localhost:5000/api/caterer/change-password/${catererId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: currentPasswordValue,
                    newPassword: newPasswordValue,
                    confirmPassword: confirmPasswordValue
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem("annapriya_caterer_token");
                localStorage.removeItem("annapriya_caterer");

                alert(
                    data.message ||
                    "Your session has expired. Please login again."
                );

                window.location.href = "index.html";
                return;
            }

            showPasswordMessage(
                data.message || "Could not change password.",
                false
            );
            return;
        }

        showPasswordMessage(
            "Password changed successfully!",
            true
        );

        changePasswordForm.reset();

        setTimeout(function () {
            if (changePasswordPanel) {
                changePasswordPanel.style.display = "none";
            }

            if (changePasswordMessage) {
                changePasswordMessage.style.display = "none";
            }
        }, 2500);

    } catch (error) {
        console.error("Change password error:", error);

        showPasswordMessage(
            "Could not connect to the server. Please try again.",
            false
        );
    }
});

// =====================================================
// PASSWORD MESSAGE
// =====================================================

function showPasswordMessage(message, success) {
    if (!changePasswordMessage) return;

    changePasswordMessage.textContent = message;
    changePasswordMessage.style.display = "block";
    changePasswordMessage.style.color = success ? "green" : "red";
}

// =====================================================
// NOTIFICATIONS
// =====================================================

eventNotifications?.addEventListener("change", function () {
    localStorage.setItem(
        "annapriya_caterer_event_notifications",
        eventNotifications.checked
    );
});

// =====================================================
// LOAD NOTIFICATION SETTING
// =====================================================

const savedNotificationSetting = localStorage.getItem(
    "annapriya_caterer_event_notifications"
);

if (savedNotificationSetting !== null && eventNotifications) {
    eventNotifications.checked = savedNotificationSetting === "true";
}

// =====================================================
// LOGOUT
// =====================================================

logoutButton?.addEventListener("click", function () {
    const confirmLogout = confirm(
        "Are you sure you want to logout?"
    );

    if (!confirmLogout) return;

    localStorage.removeItem("annapriya_caterer");
    localStorage.removeItem("annapriya_caterer_token");

    window.location.href = "index.html";
});
