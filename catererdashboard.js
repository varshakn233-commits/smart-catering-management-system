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
       NOTIFICATION ELEMENTS
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
       NOTIFICATION DELETE MENU
    ====================================================== */

    const notificationContextMenu =
        document.getElementById(
            "notificationContextMenu"
        );

    const deleteNotificationOption =
        document.getElementById(
            "deleteNotificationOption"
        );


    let selectedNotification = null;


    /* =====================================================
       DELETED NOTIFICATION STORAGE
       
       Deleted notifications are stored only for this
       caterer in localStorage.

       This does NOT delete the actual database request.
    ====================================================== */

    const deletedNotificationStorageKey =
        "annapriya_deleted_caterer_notifications_" +
        (
            catererEmail ||
            catererId ||
            "default"
        );


    function getDeletedNotificationIds() {

        try {

            const stored =
                localStorage.getItem(
                    deletedNotificationStorageKey
                );


            if (!stored) {
                return [];
            }


            const parsed =
                JSON.parse(stored);


            return Array.isArray(parsed)
                ? parsed.map(String)
                : [];

        } catch (error) {

            console.error(
                "Could not read deleted notifications:",
                error
            );

            return [];

        }

    }


    function saveDeletedNotificationIds(
        ids
    ) {

        try {

            localStorage.setItem(
                deletedNotificationStorageKey,
                JSON.stringify(ids)
            );

        } catch (error) {

            console.error(
                "Could not save deleted notifications:",
                error
            );

        }

    }


    function isNotificationDeleted(
        requestId
    ) {

        if (
            requestId === null ||
            requestId === undefined
        ) {

            return false;

        }


        const deletedIds =
            getDeletedNotificationIds();


        return deletedIds.includes(
            String(requestId)
        );

    }


    function markNotificationAsDeleted(
        requestId
    ) {

        if (
            requestId === null ||
            requestId === undefined
        ) {

            return;

        }


        const deletedIds =
            getDeletedNotificationIds();


        const id =
            String(requestId);


        if (!deletedIds.includes(id)) {

            deletedIds.push(id);

            saveDeletedNotificationIds(
                deletedIds
            );

        }

    }


    /* =====================================================
       CLOSE NOTIFICATION DELETE MENU
    ====================================================== */

    function closeNotificationContextMenu() {

        if (selectedNotification) {

            selectedNotification.classList.remove(
                "notification-selected"
            );

        }


        selectedNotification =
            null;


        if (notificationContextMenu) {

            notificationContextMenu.classList.remove(
                "show"
            );

            notificationContextMenu.style.display =
                "none";

        }

    }


    /* =====================================================
       CLOSE ALL POPUPS
    ====================================================== */

    function closeAllPopups() {

        if (profileButtonMenu) {

            profileButtonMenu.classList.remove(
                "show"
            );

        }


        if (profileMenu) {

            profileMenu.classList.remove(
                "show"
            );

        }


        if (notificationPanel) {

            notificationPanel.classList.remove(
                "show"
            );

        }


        closeNotificationContextMenu();

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
                    profileButtonMenu.classList.contains(
                        "show"
                    );


                closeAllPopups();


                if (
                    profileButtonMenu &&
                    !currentlyOpen
                ) {

                    profileButtonMenu.classList.add(
                        "show"
                    );

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
                    profileMenu.classList.contains(
                        "show"
                    );


                closeAllPopups();


                if (
                    profileMenu &&
                    !currentlyOpen
                ) {

                    profileMenu.classList.add(
                        "show"
                    );

                }

            }
        );

    }


    /* =====================================================
       NOTIFICATION BUTTON
    ====================================================== */

    if (notificationButton) {

        notificationButton.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();


                const currentlyOpen =
                    notificationPanel &&
                    notificationPanel.classList.contains(
                        "show"
                    );


                closeAllPopups();


                if (
                    notificationPanel &&
                    !currentlyOpen
                ) {

                    notificationPanel.classList.add(
                        "show"
                    );

                }

            }
        );

    }


    /* =====================================================
       CLOSE NOTIFICATION PANEL
    ====================================================== */

    if (closeNotification) {

        closeNotification.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();


                if (notificationPanel) {

                    notificationPanel.classList.remove(
                        "show"
                    );

                }


                closeNotificationContextMenu();

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
                profileButton.contains(
                    event.target
                );


            const insideProfileButtonMenu =
                profileButtonMenu &&
                profileButtonMenu.contains(
                    event.target
                );


            const insideMenuButton =
                menuButton &&
                menuButton.contains(
                    event.target
                );


            const insideMenu =
                profileMenu &&
                profileMenu.contains(
                    event.target
                );


            const insideNotificationButton =
                notificationButton &&
                notificationButton.contains(
                    event.target
                );


            const insideNotificationPanel =
                notificationPanel &&
                notificationPanel.contains(
                    event.target
                );


            const insideNotificationContextMenu =
                notificationContextMenu &&
                notificationContextMenu.contains(
                    event.target
                );


            if (
                !insideProfileButton &&
                !insideProfileButtonMenu &&
                !insideMenuButton &&
                !insideMenu &&
                !insideNotificationButton &&
                !insideNotificationPanel &&
                !insideNotificationContextMenu
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

            renderNotifications([]);

            return;

        }


        try {

            const response =
                await fetch(
                    `http://localhost:5000/api/requests/caterer/${encodeURIComponent(
                        catererEmail
                    )}`
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
                Array.isArray(data.requests)
                    ? data.requests
                    : [];


            renderNotifications(
                requests
            );


        } catch (error) {

            console.error(
                "Notification loading error:",
                error
            );


            /*
             * Do not destroy the existing notification
             * panel if the backend temporarily fails.
             */

        }

    }


    /* =====================================================
       RENDER NOTIFICATIONS
    ====================================================== */

    function renderNotifications(
        requests
    ) {

        if (!notificationList) {
            return;
        }


        /* =================================================
           REMOVE NOTIFICATIONS THAT WERE DELETED
        ================================================== */

        const visibleRequests =
            requests
                .filter(
                    (request) => {

                        return !isNotificationDeleted(
                            request.request_id
                        );

                    }
                )
                .slice(0, 5);


        /* =================================================
           UPDATE BADGE
        ================================================== */

        updateNotificationBadge(
            visibleRequests.length
        );


        /* =================================================
           NO NOTIFICATIONS
        ================================================== */

        if (
            visibleRequests.length === 0
        ) {

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


        /* =================================================
           CREATE NOTIFICATION ITEMS
        ================================================== */

        notificationList.innerHTML =
            visibleRequests
                .map(
                    (request) => {

                        const requestId =
                            escapeHTML(
                                request.request_id
                            );


                        const eventType =
                            escapeHTML(
                                request.event_type ||
                                "Event"
                            );


                        const customerName =
                            escapeHTML(
                                request.customer_name ||
                                "Customer"
                            );


                        const eventDate =
                            formatDate(
                                request.event_date
                            );


                        return `

                            <div
                                class="notification-item unread"
                                data-request-id="${requestId}"
                            >

                                <div class="notification-item-icon">
                                    📋
                                </div>

                                <div>

                                    <strong>
                                        New ${eventType} request
                                    </strong>

                                    <p>
                                        From ${customerName}
                                    </p>

                                    <small>
                                        ${eventDate}
                                    </small>

                                </div>

                            </div>

                        `;

                    }
                )
                .join("");


        attachNotificationEvents();

    }


    /* =====================================================
       ATTACH NOTIFICATION EVENTS
    ====================================================== */

    function attachNotificationEvents() {

        if (!notificationList) {
            return;
        }


        const notificationItems =
            notificationList.querySelectorAll(
                ".notification-item[data-request-id]"
            );


        notificationItems.forEach(
            (item) => {


                /* =============================================
                   NORMAL LEFT CLICK
                ============================================== */

                item.addEventListener(
                    "click",
                    (event) => {

                        /*
                         * Only respond to a real left click.
                         */

                        if (
                            event.button !== 0
                        ) {

                            return;

                        }


                        /*
                         * If the delete menu is open,
                         * do not navigate.
                         */

                        if (
                            notificationContextMenu &&
                            notificationContextMenu.classList.contains(
                                "show"
                            )
                        ) {

                            return;

                        }


                        window.location.href =
                            "catererrequests.html";

                    }
                );


                /* =============================================
                   RIGHT CLICK
                ============================================== */

                item.addEventListener(
                    "contextmenu",
                    (event) => {

                        event.preventDefault();

                        event.stopPropagation();


                        closeNotificationContextMenu();


                        selectedNotification =
                            item;


                        item.classList.add(
                            "notification-selected"
                        );


                        showNotificationContextMenu(
                            event.clientX,
                            event.clientY
                        );

                    }
                );

            }
        );

    }


    /* =====================================================
       UPDATE NOTIFICATION BADGE
    ====================================================== */

    function updateNotificationBadge(
        count
    ) {

        if (!notificationBadge) {
            return;
        }


        const safeCount =
            Math.max(
                0,
                Number(count) || 0
            );


        notificationBadge.textContent =
            safeCount;


        notificationBadge.style.display =
            safeCount > 0
                ? "flex"
                : "none";

    }


    /* =====================================================
       SHOW DELETE CONTEXT MENU
    ====================================================== */

    function showNotificationContextMenu(
        x,
        y
    ) {

        if (!notificationContextMenu) {
            return;
        }


        notificationContextMenu.style.display =
            "block";


        notificationContextMenu.classList.add(
            "show"
        );


        const menuWidth =
            notificationContextMenu.offsetWidth;


        const menuHeight =
            notificationContextMenu.offsetHeight;


        let left =
            Number(x) || 0;


        let top =
            Number(y) || 0;


        /* =================================================
           KEEP MENU INSIDE VIEWPORT
        ================================================== */

        if (
            left + menuWidth >
            window.innerWidth
        ) {

            left =
                window.innerWidth -
                menuWidth -
                10;

        }


        if (
            top + menuHeight >
            window.innerHeight
        ) {

            top =
                window.innerHeight -
                menuHeight -
                10;

        }


        notificationContextMenu.style.left =
            `${Math.max(10, left)}px`;


        notificationContextMenu.style.top =
            `${Math.max(10, top)}px`;

    }


    /* =====================================================
       DELETE NOTIFICATION
    ====================================================== */

    if (deleteNotificationOption) {

        deleteNotificationOption.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                event.stopPropagation();


                if (!selectedNotification) {

                    closeNotificationContextMenu();

                    return;

                }


                /* =================================================
                   GET REQUEST ID
                ================================================== */

                const requestId =
                    selectedNotification.getAttribute(
                        "data-request-id"
                    );


                /* =================================================
                   REMEMBER DELETED NOTIFICATION
                ================================================== */

                markNotificationAsDeleted(
                    requestId
                );


                /* =================================================
                   REMOVE FROM SCREEN
                ================================================== */

                selectedNotification.remove();


                selectedNotification =
                    null;


                /* =================================================
                   COUNT REMAINING REAL NOTIFICATIONS
                ================================================== */

                const remaining =
                    notificationList
                        ? notificationList.querySelectorAll(
                            ".notification-item[data-request-id]"
                        ).length
                        : 0;


                /* =================================================
                   UPDATE BADGE
                ================================================== */

                updateNotificationBadge(
                    remaining
                );


                /* =================================================
                   CLOSE DELETE MENU
                ================================================== */

                closeNotificationContextMenu();


                /* =================================================
                   SHOW EMPTY MESSAGE
                ================================================== */

                if (
                    notificationList &&
                    remaining === 0
                ) {

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

                }

            }
        );

    }


    /* =====================================================
       RIGHT CLICK OUTSIDE
    ====================================================== */

    document.addEventListener(
        "contextmenu",
        (event) => {

            const clickedNotification =
                event.target.closest(
                    ".notification-item[data-request-id]"
                );


            const clickedContextMenu =
                notificationContextMenu &&
                notificationContextMenu.contains(
                    event.target
                );


            if (
                !clickedNotification &&
                !clickedContextMenu
            ) {

                closeNotificationContextMenu();

            }

        }
    );


    /* =====================================================
       ESC KEY
    ====================================================== */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape"
            ) {

                closeNotificationContextMenu();

            }

        }
    );


    /* =====================================================
       WINDOW SCROLL
       CLOSE DELETE MENU
    ====================================================== */

    window.addEventListener(
        "scroll",
        () => {

            closeNotificationContextMenu();

        }
    );


    /* =====================================================
       WINDOW RESIZE
       CLOSE DELETE MENU
    ====================================================== */

    window.addEventListener(
        "resize",
        () => {

            closeNotificationContextMenu();

        }
    );


    /* =====================================================
       HELPERS
    ====================================================== */

    function escapeHTML(
        value
    ) {

        if (
            value === null ||
            value === undefined
        ) {

            return "";

        }


        return String(value)
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }


    function formatDate(
        value
    ) {

        if (!value) {

            return "Date not available";

        }


        const date =
            new Date(value);


        if (
            isNaN(
                date.getTime()
            )
        ) {

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