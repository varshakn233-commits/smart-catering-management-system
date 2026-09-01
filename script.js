// ==========================================
// ANNAPRIYA — SITE SCRIPTS
// ==========================================

// ---------- Mobile nav toggle ----------
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.querySelector(".navbar nav");

if (menuToggle) {
    menuToggle.addEventListener("click", () => {
        navLinks.classList.toggle("nav-open");
    });
}


// ---------- Solid navbar on scroll ----------
const navbar = document.querySelector(".navbar");

function updateNavbarOnScroll() {
    if (window.scrollY > 80) {
        navbar.style.background = "rgba(28, 20, 17, 0.92)";
    } else {
        navbar.style.background =
            "linear-gradient(to bottom, rgba(28,20,17,0.55), rgba(28,20,17,0))";
    }
}

window.addEventListener("scroll", updateNavbarOnScroll);
updateNavbarOnScroll();


// ---------- Login dropdown ----------
const loginToggle = document.getElementById("loginToggle");
const loginMenu = document.getElementById("loginMenu");

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


// ---------- Auth overlays ----------
function openAuth(type) {

    closeAuth();

    if (type === "customer") {

        document
            .getElementById("authCustomer")
            .classList.add("open");

    } else if (type === "customer-signup") {

        document
            .getElementById("authCustomerSignup")
            .classList.add("open");

    } else if (type === "forgot") {

        document
            .getElementById("authForgot")
            .classList.add("open");

    } else if (type === "caterer") {

        document
            .getElementById("authCaterer")
            .classList.add("open");

    } else if (type === "caterer-signup") {

        document
            .getElementById("authCatererSignup")
            .classList.add("open");

    } else if (type === "admin") {

        document
            .getElementById("authAdmin")
            .classList.add("open");
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
        .forEach(el => el.classList.remove("open"));

    document.body.style.overflow = "";
}


// ---------- Close overlay by clicking outside ----------
document.querySelectorAll(".auth-page").forEach(page => {

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
document.querySelectorAll(".password-toggle").forEach(btn => {

    btn.addEventListener("click", () => {

        const input = btn.previousElementSibling;

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

const searchInput = document.getElementById("siteSearch");
const searchBtn = document.getElementById("searchBtn");

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

    const query = searchInput.value.trim().toLowerCase();

    if (!query) return;

    const match = searchIndex.find(item =>
        item.text.toLowerCase().includes(query)
    );

    if (match) {

        document
            .getElementById(match.target)
            .scrollIntoView({
                behavior: "smooth"
            });

    } else if (
        query.includes("event") ||
        query.includes("wedding") ||
        query.includes("party")
    ) {

        document
            .getElementById("events")
            .scrollIntoView({
                behavior: "smooth"
            });

    } else if (
        query.includes("package") ||
        query.includes("price") ||
        query.includes("gold") ||
        query.includes("silver") ||
        query.includes("bronze")
    ) {

        document
            .getElementById("packages")
            .scrollIntoView({
                behavior: "smooth"
            });

    } else {

        document
            .getElementById("caterers")
            .scrollIntoView({
                behavior: "smooth"
            });
    }
}


if (searchBtn) {
    searchBtn.addEventListener("click", runSiteSearch);
}


if (searchInput) {

    searchInput.addEventListener("keydown", (e) => {

        if (e.key === "Enter") {
            runSiteSearch();
        }

    });

}


// =====================================================
// SCROLL REVEAL
// =====================================================

const revealTargets = document.querySelectorAll(
    ".point-card, .caterer-card, .process-card, .tier-card, .event-row"
);


revealTargets.forEach(el => {

    el.style.opacity = "0";

    el.style.transform = "translateY(24px)";

    el.style.transition =
        "opacity 0.6s ease, transform 0.6s ease";

});


const observer = new IntersectionObserver(

    (entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.style.opacity = "1";

                entry.target.style.transform =
                    "translateY(0)";

                observer.unobserve(entry.target);
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
// FORM SUBMIT HANDLERS
// =====================================================


// ---------- Contact form ----------
const contactForm = document.getElementById("contactForm");

if (contactForm) {

    contactForm.addEventListener("submit", (e) => {

        e.preventDefault();

        alert(
            "Thanks! Your request has been noted. We'll get back to you shortly."
        );

        contactForm.reset();

    });

}


// =====================================================
// CUSTOMER LOGIN
// Connected to Node.js backend
// POST /api/customer/login
// =====================================================

const customerLoginForm =
    document.getElementById("customerLoginForm");

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


            // Basic frontend validation
            if (!email || !password) {

                alert(
                    "Please enter your email and password."
                );

                return;
            }


            try {

                const response = await fetch(
                    "http://localhost:5000/api/customer/login",
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


                // Backend returned an error
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


                // Save customer information
                localStorage.setItem(
                    "annapriya_customer",
                    JSON.stringify(data.customer)
                );


                console.log(
                    "Customer logged in:",
                    data.customer
                );


                // Redirect to the dashboard page instead of an alert
                window.location.href = "dashboard.html";


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
    document.getElementById("customerSignupForm");


if (customerSignupForm) {

    customerSignupForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();


            // Get values from HTML form
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

                const response = await fetch(
                    "http://localhost:5000/api/customer/signup",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({

                            fullName: fullName,

                            gender: gender,

                            address: address,

                            phone: phone,

                            email: email,

                            password: password,

                            confirmPassword: confirmPassword

                        })
                    }
                );


                const data = await response.json();


                // Backend returned an error
                if (!response.ok) {

                    alert(
                        data.message ||
                        "Could not create account."
                    );

                    return;
                }


                // Successful signup
                alert(
                    "Account created successfully! Please log in."
                );


                customerSignupForm.reset();


                // Open customer login
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

const forgotPasswordForm = document.getElementById("forgotPasswordForm");

if (forgotPasswordForm) {

    forgotPasswordForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = document.getElementById("fpEmail").value.trim();

        if (!email) {
            alert("Please enter your email address.");
            return;
        }

        try {

            const response = await fetch(
                "http://localhost:5000/api/forgot-password/customer/forgot",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email
                    })
                }
            );

            const data = await response.json();

            alert(data.message);

            if (response.ok) {
                forgotPasswordForm.reset();
            }

        } catch (error) {

            console.error("Forgot password error:", error);

            alert("Unable to connect to the server.");
        }

    });

}


// =====================================================
// CATERER LOGIN
// Still placeholder for now
// =====================================================

const catererLoginForm =
    document.getElementById("catererLoginForm");

if (catererLoginForm) {

    catererLoginForm.addEventListener(
        "submit",
        (e) => {

            e.preventDefault();

            alert(
                "Caterer login submitted — connect this to your backend."
            );

        }
    );

}


// =====================================================
// CATERER SIGNUP
// Still placeholder for now
// =====================================================

const catererSignupForm =
    document.getElementById("catererSignupForm");

if (catererSignupForm) {

    catererSignupForm.addEventListener(
        "submit",
        (e) => {

            e.preventDefault();


            const pass =
                document
                    .getElementById("csPassword")
                    .value;


            const confirm =
                document
                    .getElementById("csConfirm")
                    .value;


            if (pass !== confirm) {

                alert(
                    "Passwords don't match — please check and try again."
                );

                return;
            }


            alert(
                "Application submitted — connect this to your backend. It should save with status = pending until admin approves."
            );


            catererSignupForm.reset();

        }
    );

}


// =====================================================
// ADMIN LOGIN - BACKEND CONNECTION
// =====================================================

const adminLoginForm =
    document.getElementById("adminLoginForm");

if (adminLoginForm) {

    adminLoginForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();

            const username =
                document.getElementById("aUsername").value.trim();

            const password =
                document.getElementById("aPassword").value;

            // Check empty fields
            if (!username || !password) {
                alert("Please enter username and password.");
                return;
            }

            try {

                const response = await fetch(
                    "http://localhost:5000/api/admin/login",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            username: username,
                            password: password
                        })
                    }
                );

                const data = await response.json();

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
                    JSON.stringify(data.admin)
                );

                alert("Admin login successful!");

                // Close login popup
                if (typeof closeAuth === "function") {
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
                    "Unable to connect to the backend. " +
                    "Make sure your backend server is running."
                );
            }
        }
    );
}