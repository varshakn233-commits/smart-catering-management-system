const token =
    localStorage.getItem("annapriya_caterer_token");


const caterer =
    JSON.parse(
        localStorage.getItem("annapriya_caterer") || "null"
    );


if (!token || !caterer) {

    window.location.href = "index.html";

}


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
    caterer.email || "-";


const phone =
    caterer.phone || "-";


const helpers =
    caterer.helpers ?? "-";


const eventsServed =
    caterer.events_served ??
    caterer.eventsServed ??
    "-";


document.getElementById(
    "headerCatererName"
).textContent = headName;


document.getElementById(
    "headerAvatar"
).textContent =
    headName.charAt(0).toUpperCase();


document.getElementById(
    "largeAvatar"
).textContent =
    headName.charAt(0).toUpperCase();


document.getElementById(
    "profileName"
).textContent =
    headName;


document.getElementById(
    "profileBrand"
).textContent =
    brandName;


document.getElementById(
    "headName"
).textContent =
    headName;


document.getElementById(
    "brandName"
).textContent =
    brandName;


document.getElementById(
    "email"
).textContent =
    email;


document.getElementById(
    "phone"
).textContent =
    phone;


document.getElementById(
    "helpers"
).textContent =
    helpers;


document.getElementById(
    "eventsServed"
).textContent =
    eventsServed;


/* MENU */

const profileButton =
    document.getElementById("profileButton");


const profileMenu =
    document.getElementById("profileButtonMenu");


profileButton.addEventListener(
    "click",
    function(event) {

        event.stopPropagation();

        profileMenu.classList.toggle("show");

    }
);


document.addEventListener(
    "click",
    function() {

        profileMenu.classList.remove("show");

    }
);


/* BACK */

document.getElementById(
    "backButton"
).addEventListener(
    "click",
    function() {

        window.location.href =
            "catererdashboard.html";

    }
);


/* EDIT PROFILE */

document.getElementById(
    "editProfileButton"
).addEventListener(
    "click",
    function() {

        window.location.href =
            "catererprofile.html";

    }
);


/* LOGOUT */

document.getElementById(
    "logoutButton"
).addEventListener(
    "click",
    function() {

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