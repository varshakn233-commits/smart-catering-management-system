const token =
    localStorage.getItem("annapriya_caterer_token");


const caterer =
    JSON.parse(
        localStorage.getItem("annapriya_caterer") || "null"
    );


/* =========================
   LOGIN CHECK
========================= */

if (!token || !caterer) {

    window.location.href = "index.html";

}


/* =========================
   GET CATERER DETAILS
========================= */

const headName =
    caterer.head_name ||
    caterer.headName ||
    caterer.name ||
    "Caterer";


const brandName =
    caterer.brand_name ||
    caterer.brandName ||
    "-";


const email =
    caterer.email ||
    "-";


const phone =
    caterer.phone ||
    "-";


const helpers =
    caterer.helpers ??
    "-";


const eventsServed =
    caterer.events_served ??
    caterer.eventsServed ??
    "-";


const status =
    caterer.status ||
    "Pending";


/* =========================
   HEADER
========================= */

document.getElementById(
    "headerCatererName"
).textContent = headName;


document.getElementById(
    "headerAvatar"
).textContent =
    headName.charAt(0).toUpperCase();


/* =========================
   DASHBOARD
========================= */

document.getElementById(
    "catererName"
).textContent = headName;


document.getElementById(
    "infoHeadName"
).textContent = headName;


document.getElementById(
    "infoBrandName"
).textContent = brandName;


document.getElementById(
    "infoEmail"
).textContent = email;


document.getElementById(
    "infoPhone"
).textContent = phone;


document.getElementById(
    "infoHelpers"
).textContent = helpers;


document.getElementById(
    "infoEvents"
).textContent = eventsServed;


document.getElementById(
    "infoStatus"
).textContent = status;


/* =========================
   THREE-DOT PROFILE MENU
========================= */

const profileButton =
    document.getElementById(
        "profileButton"
    );


const profileMenu =
    document.getElementById(
        "profileButtonMenu"
    );


profileButton.addEventListener(
    "click",
    function (event) {

        event.stopPropagation();

        profileMenu.classList.toggle("show");

    }
);


document.addEventListener(
    "click",
    function () {

        profileMenu.classList.remove("show");

    }
);


/* =========================
   BACK BUTTON
========================= */

document.getElementById(
    "backButton"
).addEventListener(
    "click",
    function () {

        window.location.href =
            "index.html";

    }
);


/* =========================
   LOGOUT
========================= */

document.getElementById(
    "logoutButton"
).addEventListener(
    "click",
    function () {

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