// ==========================================
// ANNAPRIYA — SITE SCRIPTS
// ==========================================


// ---------- Mobile nav toggle ----------

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.querySelector(".navbar nav");

if (menuToggle && navLinks) {

    menuToggle.addEventListener("click", () => {

        navLinks.classList.toggle("nav-open");

    });

}


// ---------- Solid navbar on scroll ----------

const navbar = document.querySelector(".navbar");

function updateNavbarOnScroll() {

    if (!navbar) return;

    if (window.scrollY > 80) {

        navbar.style.background =
            "rgba(28, 20, 17, 0.92)";

    } else {

        navbar.style.background =
            "linear-gradient(to bottom, rgba(28,20,17,0.55), rgba(28,20,17,0))";

    }

}

window.addEventListener("scroll", updateNavbarOnScroll);

updateNavbarOnScroll();


// ---------- Login dropdown ----------

const loginToggle =
    document.getElementById("loginToggle");

const loginMenu =
    document.getElementById("loginMenu");


if (loginToggle && loginMenu) {

    loginToggle.addEventListener("click", (e) => {

        e.preventDefault();

        loginMenu.classList.toggle("open");

    });


    document.addEventListener("click", (e) => {

        if (
            !loginToggle.contains(e.target) &&
            !loginMenu.contains(e.target)
        ) {

            loginMenu.classList.remove("open");

        }

    });

}


// =====================================================
// AUTH OVERLAYS
// =====================================================

function openAuth(type) {

    closeAuth();


    if (type === "customer") {

        const element =
            document.getElementById("authCustomer");

        if (element) {
            element.classList.add("open");
        }

    }


    else if (type === "customer-signup") {

        const element =
            document.getElementById("authCustomerSignup");

        if (element) {
            element.classList.add("open");
        }

    }


    else if (type === "forgot") {

        const element =
            document.getElementById("authForgot");

        if (element) {
            element.classList.add("open");
        }

    }


    else if (type === "caterer") {

        const element =
            document.getElementById("authCaterer");

        if (element) {
            element.classList.add("open");
        }

    }


    else if (type === "caterer-signup") {

        const element =
            document.getElementById("authCatererSignup");

        if (element) {
            element.classList.add("open");
        }

    }


    else if (type === "admin") {

        const element =
            document.getElementById("authAdmin");

        if (element) {
            element.classList.add("open");
        }

    }


    document.body.style.overflow = "hidden";


    if (loginMenu) {

        loginMenu.classList.remove("open");

    }

}


// ---------- Close auth ----------

function closeAuth() {

    document
        .querySelectorAll(".auth-overlay-wrap")
        .forEach(el => {

            el.classList.remove("open");

        });


    document.body.style.overflow = "";

}


// ---------- Close overlay by clicking outside ----------

document
    .querySelectorAll(".auth-page")
    .forEach(page => {

        page.addEventListener("click", (e) => {

            if (e.target === page) {

                closeAuth();

            }

        });

    });


// ---------- Close auth with Escape ----------

document.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {

        closeAuth();

    }

});


// ---------- Password show/hide ----------

document
    .querySelectorAll(".password-toggle")
    .forEach(btn => {

        btn.addEventListener("click", () => {

            const input =
                btn.previousElementSibling;


            if (!input) return;


            if (input.type === "password") {

                input.type = "text";

                btn.textContent = "🙈";

            } else {

                input.type = "password";

                btn.textContent = "👁️";

            }

        });

    });


// =====================================================
// SITE SEARCH
// =====================================================

const searchInput =
    document.getElementById("siteSearch");

const searchBtn =
    document.getElementById("searchBtn");


const searchIndex = [

    {
        text: "Saraswathi Catering",
        target: "caterers"
    },

    {
        text: "Meenakshi Grand Catering",
        target: "caterers"
    },

    {
        text: "Royal Thanjavur Feast",
        target: "caterers"
    },

    {
        text: "Bronze package",
        target: "packages"
    },

    {
        text: "Silver package",
        target: "packages"
    },

    {
        text: "Gold package",
        target: "packages"
    },

    {
        text: "Wedding",
        target: "events"
    },

    {
        text: "Engagement",
        target: "events"
    },

    {
        text: "Birthday party",
        target: "events"
    },

    {
        text: "Anniversary",
        target: "events"
    },

    {
        text: "Baby shower",
        target: "events"
    },

    {
        text: "House warming",
        target: "events"
    },

    {
        text: "Retirement party",
        target: "events"
    },

    {
        text: "Festival celebration",
        target: "events"
    },

    {
        text: "Puja",
        target: "events"
    },

    {
        text: "Corporate meeting",
        target: "events"
    },

    {
        text: "Product launch",
        target: "events"
    },

    {
        text: "Office party",
        target: "events"
    },

    {
        text: "College fest",
        target: "events"
    },

    {
        text: "School function",
        target: "events"
    },

    {
        text: "Reunion",
        target: "events"
    },

    {
        text: "Charity event",
        target: "events"
    }

];


function runSiteSearch() {

    if (!searchInput) return;


    const query =
        searchInput.value
            .trim()
            .toLowerCase();


    if (!query) return;


    const match =
        searchIndex.find(item =>
            item.text
                .toLowerCase()
                .includes(query)
        );


    if (match) {

        const target =
            document.getElementById(match.target);


        if (target) {

            target.scrollIntoView({
                behavior: "smooth"
            });

        }

    }


    else if (
        query.includes("event") ||
        query.includes("wedding") ||
        query.includes("party")
    ) {

        const target =
            document.getElementById("events");


        if (target) {

            target.scrollIntoView({
                behavior: "smooth"
            });

        }

    }


    else if (
        query.includes("package") ||
        query.includes("price") ||
        query.includes("gold") ||
        query.includes("silver") ||
        query.includes("bronze")
    ) {

        const target =
            document.getElementById("packages");


        if (target) {

            target.scrollIntoView({
                behavior: "smooth"
            });

        }

    }


    else {

        const target =
            document.getElementById("caterers");


        if (target) {

            target.scrollIntoView({
                behavior: "smooth"
            });

        }

    }

}


if (searchBtn) {

    searchBtn.addEventListener(
        "click",
        runSiteSearch
    );

}


if (searchInput) {

    searchInput.addEventListener(
        "keydown",
        (e) => {

            if (e.key === "Enter") {

                runSiteSearch();

            }

        }
    );

}


// =====================================================
// SCROLL REVEAL
// =====================================================

const revealTargets =
    document.querySelectorAll(
        ".point-card, .caterer-card, .process-card, .tier-card, .event-row"
    );


revealTargets.forEach(el => {

    el.style.opacity = "0";

    el.style.transform =
        "translateY(24px)";

    el.style.transition =
        "opacity 0.6s ease, transform 0.6s ease";

});


const observer =
    new IntersectionObserver(

        (entries) => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.style.opacity = "1";

                    entry.target.style.transform =
                        "translateY(0)";

                    observer.unobserve(
                        entry.target
                    );

                }

            });

        },

        {
            threshold: 0.12
        }

    );


revealTargets.forEach(el => {

    observer.observe(el);

});


// =====================================================
// CONTACT FORM
// Connected to Node.js + MySQL
// =====================================================

const contactForm =
    document.getElementById("contactForm");

if (contactForm) {

    contactForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const nameInput =
            contactForm.querySelector('input[placeholder="Your Name"]');

        const phoneInput =
            contactForm.querySelector('input[placeholder="Phone Number"]');

        const emailInput =
            contactForm.querySelector('input[placeholder="Email Address"]');

        const dateInput =
            contactForm.querySelector('input[type="date"]');

        const messageInput =
            contactForm.querySelector("textarea");


        const customer =
            JSON.parse(
                localStorage.getItem("annapriya_customer") || "null"
            );


        const customerId =
            customer ? customer.id : null;


        const customerName =
            nameInput.value.trim();

        const phone =
            phoneInput.value.trim();

        const email =
            emailInput.value.trim();

        const eventDate =
            dateInput.value;

        const message =
            messageInput.value.trim();


        if (!customerName || !phone || !email) {
            alert("Please fill in all required fields.");
            return;
        }


        try {

            const response = await fetch(
                "http://localhost:5000/api/requests",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        customerId,
                        customerName,
                        phone,
                        email,
                        eventDate,
                        message
                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {
                alert(
                    data.message ||
                    "Could not send request."
                );
                return;
            }


            alert(
                "Event request sent successfully!"
            );


            contactForm.reset();


        } catch (error) {

            console.error(
                "Contact form error:",
                error
            );

            alert(
                "Unable to connect to the backend. Make sure Node.js is running."
            );
        }

    });

}

// =====================================================
// CUSTOMER LOGIN
// Connected to Node.js backend
// POST /api/customer/login
// =====================================================

const customerLoginForm =
    document.getElementById(
        "customerLoginForm"
    );


if (customerLoginForm) {

    customerLoginForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();


            const email =
                document
                    .getElementById("cEmail")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("cPassword")
                    .value;


            // Basic validation

            if (!email || !password) {

                alert(
                    "Please enter your email and password."
                );

                return;

            }


            try {

                const response =
                    await fetch(
                        "http://localhost:5000/api/customer/login",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                email: email,

                                password: password

                            })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    alert(
                        data.message ||
                        "Login failed."
                    );

                    return;

                }


                // Save JWT token

                localStorage.setItem(
                    "annapriya_token",
                    data.token
                );


                // Save customer details

                localStorage.setItem(
                    "annapriya_customer",
                    JSON.stringify(
                        data.customer
                    )
                );


                console.log(
                    "Customer logged in:",
                    data.customer
                );


                // Redirect to customer dashboard

                window.location.href =
                    "dashboard.html";


            } catch (error) {

                console.error(
                    "Customer login error:",
                    error
                );


                alert(
                    "Could not connect to the server. Please make sure the backend is running on port 5000."
                );

            }

        }
    );

}


// =====================================================
// CUSTOMER SIGNUP
// Connected to Node.js + MySQL backend
// POST /api/customer/signup
// =====================================================

const customerSignupForm =
    document.getElementById(
        "customerSignupForm"
    );


if (customerSignupForm) {

    customerSignupForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();


            const fullName =
                document
                    .getElementById("suName")
                    .value
                    .trim();


            const gender =
                document
                    .getElementById("suGender")
                    .value;


            const address =
                document
                    .getElementById("suAddress")
                    .value
                    .trim();


            const phone =
                document
                    .getElementById("suPhone")
                    .value
                    .trim();


            const email =
                document
                    .getElementById("suEmail")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("suPassword")
                    .value;


            const confirmPassword =
                document
                    .getElementById("suConfirm")
                    .value;


            // Check passwords

            if (password !== confirmPassword) {

                alert(
                    "Passwords don't match — please check and try again."
                );

                return;

            }


            // Check password length

            if (password.length < 6) {

                alert(
                    "Password must be at least 6 characters."
                );

                return;

            }


            try {

                const response =
                    await fetch(
                        "http://localhost:5000/api/customer/signup",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                fullName: fullName,

                                gender: gender,

                                address: address,

                                phone: phone,

                                email: email,

                                password: password,

                                confirmPassword:
                                    confirmPassword

                            })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    alert(
                        data.message ||
                        "Could not create account."
                    );

                    return;

                }


                alert(
                    "Account created successfully! Please log in."
                );


                customerSignupForm.reset();


                openAuth("customer");


            } catch (error) {

                console.error(
                    "Customer signup error:",
                    error
                );


                alert(
                    "Could not connect to the server. Please make sure the backend is running on port 5000."
                );

            }

        }
    );

}


// ==========================================
// FORGOT PASSWORD - CUSTOMER
// ==========================================

const forgotPasswordForm =
    document.getElementById(
        "forgotPasswordForm"
    );


if (forgotPasswordForm) {

    forgotPasswordForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                document
                    .getElementById("fpEmail")
                    .value
                    .trim();


            if (!email) {

                alert(
                    "Please enter your email address."
                );

                return;

            }


            try {

                const response =
                    await fetch(
                        "http://localhost:5000/api/forgot-password/customer/forgot",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                email: email

                            })

                        }
                    );


                const data =
                    await response.json();


                alert(data.message);


                if (response.ok) {

                    forgotPasswordForm.reset();

                }


            } catch (error) {

                console.error(
                    "Forgot password error:",
                    error
                );


                alert(
                    "Unable to connect to the server."
                );

            }

        }
    );

}


// =====================================================
// CATERER LOGIN
// Still placeholder for now
// =====================================================

const catererLoginForm =
    document.getElementById(
        "catererLoginForm"
    );


if (catererLoginForm) {
    catererLoginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        alert("caterer login button clicked");

        const emailInput = catererLoginForm.querySelector('input[type="email"]');
const passwordInput = catererLoginForm.querySelector('input[type="password"]');

const email = emailInput.value.trim().toLowerCase();
const password = passwordInput.value;

        if (!email || !password) {
            alert("Email and password are required.");
            return;
        }

        const gmailRegex = /^[^\s@]+@gmail\.com$/i;

        if (!gmailRegex.test(email)) {
            alert("Please use a valid Gmail address ending with @gmail.com.");
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:5000/api/caterer/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Login failed.");
                return;
            }

            localStorage.setItem("annapriya_caterer_token", data.token);
            localStorage.setItem(
                "annapriya_caterer",
                JSON.stringify(data.caterer)
            );

            alert("Caterer login successful!");

            window.location.href = "catererdashboard.html";
        } catch (error) {
            console.error("Caterer login error:", error);

            alert(
                "Unable to connect to the backend. Make sure the Node.js server is running."
            );
        }
    });
}
// =====================================================
// CATERER SIGNUP
// Connected to Node.js + MySQL backend
// POST /api/caterer/signup
// =====================================================

const catererSignupForm =
    document.getElementById(
        "catererSignupForm"
    );


if (catererSignupForm) {

    catererSignupForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();


            // Get values from caterer signup form

            const headName =
                document
                    .getElementById("csHead")
                    .value
                    .trim();


            const brandName =
                document
                    .getElementById("csBrand")
                    .value
                    .trim();


            const phone =
                document
                    .getElementById("csPhone")
                    .value
                    .trim();


            const email =
                document
                    .getElementById("csEmail")
                    .value
                    .trim();


            const helpers =
                document
                    .getElementById("csHelpers")
                    .value;


            const eventsServed =
                document
                    .getElementById("csEvents")
                    .value;


            const password =
                document
                    .getElementById("csPassword")
                    .value;


            const confirmPassword =
                document
                    .getElementById("csConfirm")
                    .value;


            // Check required fields

            if (
                !headName ||
                !brandName ||
                !phone ||
                !email ||
                !helpers ||
                !eventsServed ||
                !password ||
                !confirmPassword
            ) {

                alert(
                    "Please fill in all fields."
                );

                return;

            }


            // Check password confirmation

            if (password !== confirmPassword) {

                alert(
                    "Passwords don't match — please check and try again."
                );

                return;

            }


            try {

                // Send caterer details to backend

                const response =
                    await fetch(
                        "http://localhost:5000/api/caterer/signup",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                headName:
                                    headName,

                                brandName:
                                    brandName,

                                phone:
                                    phone,

                                email:
                                    email,

                                helpers:
                                    helpers,

                                eventsServed:
                                    eventsServed,

                                password:
                                    password,

                                confirmPassword:
                                    confirmPassword

                            })

                        }
                    );


                const data =
                    await response.json();


                // Backend returned an error

                if (!response.ok) {

                    alert(
                        data.message ||
                        "Could not submit caterer application."
                    );

                    return;

                }


                // Successful application

                alert(
                    data.message ||
                    "Application submitted successfully!"
                );


                // Clear form

                catererSignupForm.reset();


                // Open caterer login

                openAuth("caterer");


            } catch (error) {

                console.error(
                    "Caterer signup error:",
                    error
                );


                alert(
                    "Could not connect to the server. Please make sure the backend is running on port 5000."
                );

            }

        }
    );

}


// =====================================================
// ADMIN LOGIN
// Connected to Node.js + MySQL backend
// POST /api/admin/login
// =====================================================

const adminLoginForm =
    document.getElementById(
        "adminLoginForm"
    );


if (adminLoginForm) {

    adminLoginForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();


            const username =
                document
                    .getElementById("aUsername")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("aPassword")
                    .value;


            // Check empty fields

            if (!username || !password) {

                alert(
                    "Please enter username and password."
                );

                return;

            }


            try {

                const response =
                    await fetch(
                        "http://localhost:5000/api/admin/login",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                username:
                                    username,

                                password:
                                    password

                            })

                        }
                    );


                const data =
                    await response.json();


                // Login failed

                if (!response.ok) {

                    alert(
                        data.message ||
                        "Invalid username or password."
                    );

                    return;

                }


                // Login successful

                console.log(
                    "Admin login successful:",
                    data
                );


                // Save JWT token

                localStorage.setItem(
                    "adminToken",
                    data.token
                );


                // Save admin details

                localStorage.setItem(
                    "admin",
                    JSON.stringify(
                        data.admin
                    )
                );


                alert(
                    "Admin login successful!"
                );


                // Close login popup

                if (
                    typeof closeAuth ===
                    "function"
                ) {

                    closeAuth();

                }


                // Open admin dashboard

                window.location.href =
                    "admindashboard.html";


            } catch (error) {

                console.error(
                    "Admin login error:",
                    error
                );


                alert(
                    "Unable to connect to the backend. Make sure your backend server is running."
                );

            }

        }
    );

}