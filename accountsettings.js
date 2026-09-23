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
// CHANGE PASSWORD
// =====================================================

changePasswordButton.addEventListener(
    "click",
    function () {

        alert(
            "Change Password feature will be added next."
        );

    }
);


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

if (savedNotificationSetting !== null) {

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


        window.location.href =
            "index.html";

    }
);