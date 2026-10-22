document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       CUSTOMER DATA
    ====================================================== */

    const customer = JSON.parse(
        localStorage.getItem("annapriya_customer") || "null"
    );

    const token = localStorage.getItem("annapriya_token");

    const customerName =
        customer?.fullName ||
        customer?.name ||
        "Customer";


    /* =====================================================
       CUSTOMER NAME
    ====================================================== */

    const customerNameElement =
        document.getElementById("customerName");

    const headerCustomerName =
        document.getElementById("headerCustomerName");

    const menuCustomerName =
        document.getElementById("menuCustomerName");


    if (customerNameElement) {
        customerNameElement.textContent = customerName;
    }

    if (headerCustomerName) {
        headerCustomerName.textContent = customerName;
    }

    if (menuCustomerName) {
        menuCustomerName.textContent = customerName;
    }



    /* =====================================================
       CUSTOMER AVATAR
    ====================================================== */

    const firstLetter =
        customerName.charAt(0).toUpperCase();


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
       
       PROFILE CLICK
       ↓
       ONLY MY PROFILE
    ====================================================== */

    if (profileButton) {

        profileButton.addEventListener("click", (event) => {

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

        });

    }



    /* =====================================================
       HAMBURGER MENU
       
       ☰ CLICK
       ↓
       ALL 9 OPTIONS
    ====================================================== */

    if (menuButton) {

        menuButton.addEventListener("click", (event) => {

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

        });

    }



    /* =====================================================
       NOTIFICATION BUTTON
    ====================================================== */

    if (
        notificationButton &&
        notificationPanel
    ) {

        notificationButton.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();

                const currentlyOpen =
                    notificationPanel.classList.contains("show");

                closeAllPopups();

                if (!currentlyOpen) {

                    notificationPanel.classList.add("show");

                }

            }
        );

    }



    /* =====================================================
       CLOSE NOTIFICATIONS
    ====================================================== */

    if (closeNotification) {

        closeNotification.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();

                if (notificationPanel) {
                    notificationPanel.classList.remove("show");
                }

            }
        );

    }



    /* =====================================================
       CLICK OUTSIDE
    ====================================================== */

    document.addEventListener("click", (event) => {

        const clickedProfileButton =
            profileButton &&
            profileButton.contains(event.target);

        const clickedProfileMenu =
            profileButtonMenu &&
            profileButtonMenu.contains(event.target);

        const clickedMenuButton =
            menuButton &&
            menuButton.contains(event.target);

        const clickedMenu =
            profileMenu &&
            profileMenu.contains(event.target);

        const clickedNotification =
            notificationButton &&
            notificationButton.contains(event.target);

        const clickedNotificationPanel =
            notificationPanel &&
            notificationPanel.contains(event.target);


        if (
            !clickedProfileButton &&
            !clickedProfileMenu &&
            !clickedMenuButton &&
            !clickedMenu &&
            !clickedNotification &&
            !clickedNotificationPanel
        ) {

            closeAllPopups();

        }

    });



    /* =====================================================
       BROWSE CATERERS
    ====================================================== */

    const browseButton =
        document.getElementById("browseCaterersButton");

    const mobileBrowseButton =
        document.getElementById("mobileBrowseButton");


    if (browseButton) {

        browseButton.addEventListener(
            "click",
            () => {

                window.location.href =
                    "customercaterers.html";

            }
        );

    }


    if (mobileBrowseButton) {

        mobileBrowseButton.addEventListener(
            "click",
            () => {

                window.location.href =
                    "customercaterers.html";

            }
        );

    }



    /* =====================================================
       SEARCH
    ====================================================== */

    const searchButton =
        document.getElementById("searchButton");


    if (searchButton) {

        searchButton.addEventListener(
            "click",
            () => {

                alert(
                    "Search feature will be connected to Caterers, Packages and Events."
                );

            }
        );

    }



    /* =====================================================
       LOGOUT
    ====================================================== */

    const logoutButton =
        document.getElementById("logoutButton");


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            () => {

                localStorage.removeItem(
                    "annapriya_token"
                );

                localStorage.removeItem(
                    "annapriya_customer"
                );

                window.location.href =
                    "index.html";

            }
        );

    }



    /* =====================================================
       MOBILE PROFILE
       
       Mobile Profile → My Profile menu
    ====================================================== */

    const mobileProfileButton =
        document.getElementById("mobileProfileButton");


    if (mobileProfileButton) {

        mobileProfileButton.addEventListener(
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
       NOTIFICATION BADGE
    ====================================================== */

    const notificationBadge =
        document.getElementById("notificationBadge");


    if (notificationBadge) {
        notificationBadge.textContent = "3";
    }

     
    /* =====================================================
       ML-BASED CATERER RECOMMENDATIONS
    ====================================================== */

    async function loadRecommendedCaterers() {

        const messageElement =
            document.getElementById("recommendationsMessage");

        const recommendationsList =
            document.getElementById("recommendationsList");

        if (!messageElement || !recommendationsList) {
            return;
        }

        // Recommendations require the logged-in customer's token.
        if (!token) {
            messageElement.textContent =
                "Please log in to view your personalized recommendations.";
            return;
        }

        messageElement.textContent =
            "Finding the best caterers for you...";

        recommendationsList.replaceChildren();

        try {

        const response = await fetch(
            "http://localhost:5000/api/recommendations",
            {
                method: "GET",
                headers: {
                "Authorization": `Bearer ${token}`
        }
    }
);



            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    data.message ||
                    "Unable to load recommendations."
                );
            }

            const recommendations = data.recommendations || [];

            if (recommendations.length === 0) {
                messageElement.textContent =
                    "No recommendations are available right now. Please try again later.";
                return;
            }

            recommendationsList.replaceChildren();

            recommendations.forEach((caterer, index) => {

                const card = document.createElement("article");
                card.className = "recommendation-card";

                const rank = document.createElement("span");
                rank.className = "recommendation-number";
                rank.textContent = `Recommended ${index + 1}`;

                const heading = document.createElement("h3");
                heading.textContent =
                    caterer.brand_name || "Approved Caterer";

                const description = document.createElement("p");
                description.className = "recommendation-description";
                description.textContent =
                    "Discover this catering service for your next special event.";

                const button = document.createElement("button");
                button.type = "button";
                button.className = "recommendation-button";
                button.textContent = "Explore Caterers →";

                button.addEventListener("click", () => {
                    window.location.href = "customercaterers.html";
                });

                card.append(rank, heading, description, button);
                recommendationsList.appendChild(card);

            });

            
        } catch (error) {

            console.error(
                "Error loading caterer recommendations:",
                error
            );

            messageElement.textContent =
                "We couldn't load recommendations right now. Please check that the backend is running and try refreshing.";

        }
    }

    // Load recommendations automatically when the dashboard opens.
    loadRecommendedCaterers();


    /* =====================================================
       LOGIN CHECK
    ====================================================== */

    if (!token || !customer) {

        /*
         * Keeping dashboard accessible for testing.
         * Redirect can be enabled later.
         */

    }

});