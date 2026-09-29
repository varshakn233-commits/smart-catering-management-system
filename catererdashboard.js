document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       CATERER DATA
    ====================================================== */

    const caterer = JSON.parse(
        localStorage.getItem("annapriya_caterer") || "null"
    );

    const token = localStorage.getItem(
        "annapriya_caterer_token"
    );


    if (!token || !caterer) {

        window.location.href = "index.html";

        return;

    }


    const catererId =
        caterer?.id ||
        caterer?.caterer_id ||
        null;


    const catererEmail =
        caterer?.email ||
        "";


    const catererName =
        caterer?.headName ||
        caterer?.head_name ||
        caterer?.fullName ||
        caterer?.full_name ||
        caterer?.name ||
        "Caterer";


    /* =====================================================
       NAME
    ====================================================== */

    const nameElement =
        document.getElementById("catererName");

    const headerName =
        document.getElementById("headerCatererName");

    const menuName =
        document.getElementById("menuCatererName");


    if (nameElement) {
        nameElement.textContent = catererName;
    }

    if (headerName) {
        headerName.textContent = catererName;
    }

    if (menuName) {
        menuName.textContent = catererName;
    }


    /* =====================================================
       AVATARS
    ====================================================== */

    const firstLetter =
        catererName
            .charAt(0)
            .toUpperCase();


    const headerAvatar =
        document.getElementById("headerAvatar");

    const menuAvatar =
        document.getElementById("menuAvatar");


    if (headerAvatar) {
        headerAvatar.textContent = firstLetter;
    }

    if (menuAvatar) {
        menuAvatar.textContent = firstLetter;
    }


    /* =====================================================
       MENU ELEMENTS
    ====================================================== */

    const profileButton =
        document.getElementById("profileButton");

    const profileButtonMenu =
        document.getElementById("profileButtonMenu");

    const menuButton =
        document.getElementById("menuButton");

    const profileMenu =
        document.getElementById("profileMenu");


    /* =====================================================
       NOTIFICATIONS
    ====================================================== */

    const notificationButton =
        document.getElementById("notificationButton");

    const notificationPanel =
        document.getElementById("notificationPanel");

    const closeNotification =
        document.getElementById("closeNotification");

    const notificationList =
        document.getElementById("notificationList");

    const notificationBadge =
        document.getElementById("notificationBadge");


    /* =====================================================
       CLOSE ALL POPUPS
    ====================================================== */

    function closeAllPopups() {

        if (profileButtonMenu) {
            profileButtonMenu.classList.remove("show");
        }

        if (profileMenu) {
            profileMenu.classList.remove("show");
        }

        if (notificationPanel) {
            notificationPanel.classList.remove("show");
        }

    }


    /* =====================================================
       PROFILE BUTTON
    ====================================================== */

    if (profileButton) {

        profileButton.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();

                const currentlyOpen =
                    profileButtonMenu &&
                    profileButtonMenu.classList.contains("show");

                closeAllPopups();

                if (
                    profileButtonMenu &&
                    !currentlyOpen
                ) {

                    profileButtonMenu.classList.add("show");

                }

            }
        );

    }


    /* =====================================================
       HAMBURGER MENU
    ====================================================== */

    if (menuButton) {

        menuButton.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();

                const currentlyOpen =
                    profileMenu &&
                    profileMenu.classList.contains("show");

                closeAllPopups();

                if (
                    profileMenu &&
                    !currentlyOpen
                ) {

                    profileMenu.classList.add("show");

                }

            }
        );

    }


    /* =====================================================
       NOTIFICATION PANEL
    ====================================================== */

    if (notificationButton) {

        notificationButton.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();

                const currentlyOpen =
                    notificationPanel &&
                    notificationPanel.classList.contains("show");

                closeAllPopups();

                if (
                    notificationPanel &&
                    !currentlyOpen
                ) {

                    notificationPanel.classList.add("show");

                }

            }
        );

    }


    if (closeNotification) {

        closeNotification.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();

                notificationPanel.classList.remove(
                    "show"
                );

            }
        );

    }


    /* =====================================================
       CLICK OUTSIDE
    ====================================================== */

    document.addEventListener(
        "click",
        (event) => {

            const insideProfileButton =
                profileButton &&
                profileButton.contains(event.target);

            const insideProfileButtonMenu =
                profileButtonMenu &&
                profileButtonMenu.contains(event.target);

            const insideMenuButton =
                menuButton &&
                menuButton.contains(event.target);

            const insideMenu =
                profileMenu &&
                profileMenu.contains(event.target);

            const insideNotification =
                notificationButton &&
                notificationButton.contains(event.target);

            const insideNotificationPanel =
                notificationPanel &&
                notificationPanel.contains(event.target);


            if (
                !insideProfileButton &&
                !insideProfileButtonMenu &&
                !insideMenuButton &&
                !insideMenu &&
                !insideNotification &&
                !insideNotificationPanel
            ) {

                closeAllPopups();

            }

        }
    );


    /* =====================================================
       LOAD REAL CUSTOMER REQUESTS
    ====================================================== */

    async function loadNotifications() {

        if (!catererEmail) {
            return;
        }


        try {

            const response =
                await fetch(
                    `http://localhost:5000/api/requests/caterer/${encodeURIComponent(catererEmail)}`
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Could not load notifications."
                );

            }


            const requests =
                data.requests || [];


            /* BADGE */

            if (notificationBadge) {

                notificationBadge.textContent =
                    requests.length;

                notificationBadge.style.display =
                    requests.length > 0
                        ? "flex"
                        : "none";

            }


            /* PANEL */

            if (!notificationList) {
                return;
            }


            if (requests.length === 0) {

                notificationList.innerHTML = `

                    <div class="notification-item">

                        <div class="notification-item-icon">
                            ✓
                        </div>

                        <div>

                            <strong>
                                No new event requests
                            </strong>

                            <p>
                                New customer enquiries will appear here.
                            </p>

                            <small>
                                Just now
                            </small>

                        </div>

                    </div>

                `;

                return;

            }


            notificationList.innerHTML =
                requests
                    .slice(0, 5)
                    .map(request => `

                        <div
                            class="notification-item unread"
                            data-request-id="${request.request_id}"
                        >

                            <div class="notification-item-icon">
                                📋
                            </div>

                            <div>

                                <strong>
                                    New ${escapeHTML(
                                        request.event_type || "Event"
                                    )} request
                                </strong>

                                <p>
                                    From ${escapeHTML(
                                        request.customer_name || "Customer"
                                    )}
                                </p>

                                <small>
                                    ${formatDate(
                                        request.event_date
                                    )}
                                </small>

                            </div>

                        </div>

                    `)
                    .join("");


            notificationList
                .querySelectorAll(
                    ".notification-item"
                )
                .forEach(item => {

                    item.addEventListener(
                        "click",
                        () => {

                            window.location.href =
                                "catererrequests.html";

                        }
                    );

                });


        } catch (error) {

            console.error(
                "Notification loading error:",
                error
            );

        }

    }


    /* =====================================================
       HELPERS
    ====================================================== */

    function escapeHTML(value) {

        if (
            value === null ||
            value === undefined
        ) {

            return "";

        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function formatDate(value) {

        if (!value) {
            return "Date not available";
        }

        const date =
            new Date(value);

        if (isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }


    /* =====================================================
       DASHBOARD ACTION
    ====================================================== */

    const dashboardActionButton =
        document.getElementById(
            "dashboardActionButton"
        );


    if (dashboardActionButton) {

        dashboardActionButton.addEventListener(
            "click",
            () => {

                window.location.href =
                    "catererrequests.html";

            }
        );

    }


    /* =====================================================
       LOGOUT
    ====================================================== */

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            () => {

                localStorage.removeItem(
                    "annapriya_caterer_token"
                );

                localStorage.removeItem(
                    "annapriya_caterer"
                );

                window.location.href =
                    "index.html";

            }
        );

    }


    /* =====================================================
       INITIAL LOAD
    ====================================================== */

    loadNotifications();

});