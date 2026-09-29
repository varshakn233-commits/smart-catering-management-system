// ==========================================
// ANNAPRIYA — SITE SCRIPTS
// ==========================================


// =====================================================
// MOBILE NAV TOGGLE
// =====================================================

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.querySelector(".navbar nav");

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
        navLinks.classList.toggle("nav-open");
    });
}


// =====================================================
// SOLID NAVBAR ON SCROLL
// =====================================================

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


// =====================================================
// LOGIN DROPDOWN
// =====================================================

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

        openForgotPassword("customer");

        return;

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


// =====================================================
// CLOSE AUTH
// =====================================================

function closeAuth() {

    document
        .querySelectorAll(".auth-overlay-wrap")
        .forEach(el => {

            el.classList.remove("open");

        });

    document.body.style.overflow = "";
}


// =====================================================
// CLOSE OVERLAY BY CLICKING OUTSIDE
// =====================================================

document
    .querySelectorAll(".auth-page")
    .forEach(page => {

        page.addEventListener("click", (e) => {

            if (e.target === page) {

                closeAuth();

            }

        });

    });


// =====================================================
// CLOSE AUTH WITH ESCAPE
// =====================================================

document.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {

        closeAuth();

    }

});


// =====================================================
// PASSWORD SHOW / HIDE
// =====================================================

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
// CONNECTED TO NODE.JS + MYSQL
// =====================================================

const contactForm =
    document.getElementById("contactForm");


if (contactForm) {

    contactForm.addEventListener("submit", async (e) => {

        e.preventDefault();


        const nameInput =
            contactForm.querySelector(
                'input[placeholder="Your Name"]'
            );

        const phoneInput =
            contactForm.querySelector(
                'input[placeholder="Phone Number"]'
            );

        const emailInput =
            contactForm.querySelector(
                'input[placeholder="Email Address"]'
            );

        const dateInput =
            contactForm.querySelector(
                'input[type="date"]'
            );

        const messageInput =
            contactForm.querySelector("textarea");


        const customer =
            JSON.parse(
                localStorage.getItem(
                    "annapriya_customer"
                ) || "null"
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

            alert(
                "Please fill in all required fields."
            );

            return;

        }


        try {

            const response =
                await fetch(
                    "http://localhost:5000/api/requests",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
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


            const data =
                await response.json();


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

            const emailInput =
                document.getElementById("cEmail");

            const passwordInput =
                document.getElementById("cPassword");

            const email =
                emailInput?.value.trim().toLowerCase();

            const password =
                passwordInput?.value || "";


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
                                email,
                                password
                            })
                        }
                    );


                let data = {};

                try {
                    data = await response.json();
                } catch (jsonError) {
                    data = {};
                }


                if (!response.ok) {

                    console.error(
                        "Customer login failed:",
                        response.status,
                        data
                    );

                    alert(
                        data.message ||
                        "Invalid email or password."
                    );

                    return;
                }


                if (!data.token || !data.customer) {

                    console.error(
                        "Invalid login response:",
                        data
                    );

                    alert(
                        "Login response is incomplete. Please restart the backend and try again."
                    );

                    return;
                }


                // Keep the customer ID in every common property name.
                // My Requests can then identify the logged-in customer.
                const resolvedCustomerId =
                    data.customer.customerId ||
                    data.customer.customer_id ||
                    data.customer.id;

                const customer = {
                    ...data.customer,
                    id: resolvedCustomerId,
                    customerId: resolvedCustomerId,
                    customer_id: resolvedCustomerId
                };


                localStorage.setItem(
                    "annapriya_token",
                    data.token
                );

                localStorage.setItem(
                    "annapriya_customer",
                    JSON.stringify(customer)
                );


                console.log(
                    "Customer logged in:",
                    customer
                );


                window.location.href =
                    "customerdashboard.html";


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


            if (password !== confirmPassword) {

                alert(
                    "Passwords don't match — please check and try again."
                );

                return;

            }


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


// =====================================================
// FORGOT PASSWORD
// CUSTOMER + CATERER + ADMIN
// =====================================================

let forgotAccountType = "customer";


// =====================================================
// RESET ID STORAGE
// =====================================================

let forgotResetId = "";


// =====================================================
// OPEN FORGOT PASSWORD
// =====================================================

function openForgotPassword(type = "customer") {

    const forgotOverlay =
        document.getElementById("authForgot");

    const identityInput =
        document.getElementById("fpEmail");

    const identityLabel =
        document.getElementById("forgotIdentityLabel");

    const adminNote =
        document.getElementById("adminResetNote");

    const forgotForm =
        document.getElementById("forgotPasswordForm");

    const verifyForm =
        document.getElementById("verifyOtpForm");

    const resetForm =
        document.getElementById("resetPasswordForm");

    const message =
        document.getElementById("forgotMessage");

    const resetIdInput =
        document.getElementById("fpResetId");


    forgotAccountType = type;

    forgotResetId = "";


    // Clear old reset data
    sessionStorage.removeItem(
        "annapriya_reset_id"
    );

    sessionStorage.removeItem(
        "annapriya_reset_token"
    );


    if (resetIdInput) {
        resetIdInput.value = "";
    }


    if (identityInput) {

        identityInput.value = "";

    }


    const otpInput =
        document.getElementById("fpOtp");

    if (otpInput) {

        otpInput.value = "";

    }


    const newPassword =
        document.getElementById("fpNewPassword");

    if (newPassword) {

        newPassword.value = "";

    }


    const confirmPassword =
        document.getElementById("fpConfirmPassword");

    if (confirmPassword) {

        confirmPassword.value = "";

    }


    if (forgotForm) {

        forgotForm.style.display = "block";

    }


    if (verifyForm) {

        verifyForm.style.display = "none";

    }


    if (resetForm) {

        resetForm.style.display = "none";

    }


    if (message) {

        message.style.display = "none";

        message.textContent = "";

        message.className = "forgot-message";

    }


    updateForgotAccountUI();


    closeAuth();


    if (forgotOverlay) {

        forgotOverlay.classList.add("open");

    }


    document.body.style.overflow = "hidden";
}


// =====================================================
// UPDATE FORGOT PASSWORD UI
// =====================================================

function updateForgotAccountUI() {

    const identityInput =
        document.getElementById("fpEmail");

    const identityLabel =
        document.getElementById("forgotIdentityLabel");

    const adminNote =
        document.getElementById("adminResetNote");

    const forgotBackLogin =
        document.getElementById("forgotBackLogin");


    if (forgotAccountType === "admin") {

        if (identityLabel) {

            identityLabel.textContent =
                "Admin Username";

        }


        if (identityInput) {

            identityInput.type = "text";

            identityInput.placeholder =
                "Enter admin username";

            identityInput.removeAttribute(
                "autocomplete"
            );

        }


        if (adminNote) {

            adminNote.style.display =
                "block";

        }


        if (forgotBackLogin) {

            forgotBackLogin.onclick = function () {

                openAuth("admin");

                return false;

            };

        }

    }

    else {

        if (identityLabel) {

            identityLabel.textContent =
                "Email Address";

        }


        if (identityInput) {

            identityInput.type = "email";

            identityInput.placeholder =
                "you@gmail.com";

            identityInput.setAttribute(
                "autocomplete",
                "email"
            );

        }


        if (adminNote) {

            adminNote.style.display =
                "none";

        }


        if (forgotBackLogin) {

            forgotBackLogin.onclick = function () {

                if (forgotAccountType === "caterer") {

                    openAuth("caterer");

                } else {

                    openAuth("customer");

                }

                return false;

            };

        }

    }
}


// =====================================================
// FORGOT PASSWORD — SEND OTP
// =====================================================

const forgotPasswordForm =
    document.getElementById(
        "forgotPasswordForm"
    );


if (forgotPasswordForm) {

    forgotPasswordForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const identityInput =
                document.getElementById("fpEmail");


            const identity =
                identityInput
                    ? identityInput.value.trim()
                    : "";


            if (!identity) {

                alert(
                    forgotAccountType === "admin"
                        ? "Please enter the admin username."
                        : "Please enter your email address."
                );

                return;

            }


            try {

                const requestBody = {};


                if (forgotAccountType === "admin") {

                    requestBody.username =
                        identity;

                } else {

                    requestBody.email =
                        identity;

                }


                const response =
                    await fetch(
                        `http://localhost:5000/api/forgot-password/${forgotAccountType}/forgot`,
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    requestBody
                                )

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    alert(
                        data.message ||
                        "Unable to send verification code."
                    );

                    return;

                }


                /*
                =================================================
                IMPORTANT:
                BACKEND RETURNS resetId HERE
                =================================================
                */

                if (!data.resetId) {

                    alert(
                        "OTP was sent, but the reset ID was not received from the server."
                    );

                    console.error(
                        "Backend response missing resetId:",
                        data
                    );

                    return;

                }


                forgotResetId =
                    data.resetId;


                // Store reset ID
                sessionStorage.setItem(
                    "annapriya_reset_id",
                    data.resetId
                );


                // Also store in hidden input
                const resetIdInput =
                    document.getElementById(
                        "fpResetId"
                    );


                if (resetIdInput) {

                    resetIdInput.value =
                        data.resetId;

                }


                alert(
                    data.message ||
                    "Verification code sent successfully."
                );


                forgotPasswordForm.style.display =
                    "none";


                const verifyOtpForm =
                    document.getElementById(
                        "verifyOtpForm"
                    );


                if (verifyOtpForm) {

                    verifyOtpForm.style.display =
                        "block";

                }


                const otpInput =
                    document.getElementById("fpOtp");


                if (otpInput) {

                    otpInput.focus();

                }


            } catch (error) {

                console.error(
                    "Forgot password error:",
                    error
                );


                alert(
                    "Unable to connect to the server. Make sure Node.js is running."
                );

            }

        }
    );

}


// =====================================================
// VERIFY OTP
// =====================================================

const verifyOtpForm =
    document.getElementById(
        "verifyOtpForm"
    );


if (verifyOtpForm) {

    verifyOtpForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const otp =
                document
                    .getElementById("fpOtp")
                    .value
                    .trim();


            /*
            =================================================
            GET RESET ID
            =================================================
            */

            const hiddenResetId =
                document.getElementById(
                    "fpResetId"
                );


            let resetId =
                hiddenResetId
                    ? hiddenResetId.value.trim()
                    : "";


            // If hidden field is empty, get from sessionStorage
            if (!resetId) {

                resetId =
                    sessionStorage.getItem(
                        "annapriya_reset_id"
                    ) || "";

            }


            // If still empty, use memory variable
            if (!resetId) {

                resetId =
                    forgotResetId;

            }


            if (!otp) {

                alert(
                    "Please enter the verification code."
                );

                return;

            }


            if (!/^\d{6}$/.test(otp)) {

                alert(
                    "Please enter a valid 6-digit verification code."
                );

                return;

            }


            /*
            =================================================
            VERY IMPORTANT:
            BACKEND EXPECTS:

            {
                resetId,
                otp
            }
            =================================================
            */

            if (!resetId) {

                alert(
                    "Password reset session is missing. Please request a new verification code."
                );

                return;

            }


            try {

                const response =
                    await fetch(
                        `http://localhost:5000/api/forgot-password/${forgotAccountType}/verify`,
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                resetId:
                                    resetId,

                                otp:
                                    otp

                            })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    alert(
                        data.message ||
                        "Invalid or expired verification code."
                    );

                    return;

                }


                /*
                =================================================
                OTP VERIFIED SUCCESSFULLY
                =================================================
                */

                alert(
                    data.message ||
                    "Verification successful."
                );


                /*
                =================================================
                SAVE RESET TOKEN
                =================================================
                */

                if (data.resetToken) {

                    sessionStorage.setItem(
                        "annapriya_reset_token",
                        data.resetToken
                    );

                }


                // Keep reset ID as well
                sessionStorage.setItem(
                    "annapriya_reset_id",
                    resetId
                );


                verifyOtpForm.style.display =
                    "none";


                const resetPasswordForm =
                    document.getElementById(
                        "resetPasswordForm"
                    );


                if (resetPasswordForm) {

                    resetPasswordForm.style.display =
                        "block";

                }


                const newPassword =
                    document.getElementById(
                        "fpNewPassword"
                    );


                if (newPassword) {

                    newPassword.focus();

                }


            } catch (error) {

                console.error(
                    "OTP verification error:",
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
// RESET PASSWORD
// =====================================================

const resetPasswordForm =
    document.getElementById(
        "resetPasswordForm"
    );


if (resetPasswordForm) {

    resetPasswordForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const newPassword =
                document
                    .getElementById("fpNewPassword")
                    .value;


            const confirmPassword =
                document
                    .getElementById("fpConfirmPassword")
                    .value;


            if (!newPassword || !confirmPassword) {

                alert(
                    "Please enter your new password."
                );

                return;

            }


            if (newPassword !== confirmPassword) {

                alert(
                    "Passwords don't match."
                );

                return;

            }


            if (newPassword.length < 6) {

                alert(
                    "Password must be at least 6 characters."
                );

                return;

            }


            const resetToken =
                sessionStorage.getItem(
                    "annapriya_reset_token"
                );


            if (!resetToken) {

                alert(
                    "Your password reset session is missing. Please request a new OTP."
                );

                return;

            }


            try {

                const response =
                    await fetch(
                        `http://localhost:5000/api/forgot-password/${forgotAccountType}/reset`,
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                newPassword:
                                    newPassword,

                                confirmPassword:
                                    confirmPassword,

                                resetToken:
                                    resetToken

                            })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    alert(
                        data.message ||
                        "Could not reset password."
                    );

                    return;

                }


                alert(
                    data.message ||
                    "Password changed successfully!"
                );


                /*
                =================================================
                CLEAR RESET DATA
                =================================================
                */

                sessionStorage.removeItem(
                    "annapriya_reset_token"
                );

                sessionStorage.removeItem(
                    "annapriya_reset_id"
                );


                forgotResetId = "";


                resetPasswordForm.reset();


                /*
                =================================================
                RETURN TO CORRECT LOGIN
                =================================================
                */

                if (forgotAccountType === "customer") {

                    openAuth("customer");

                }

                else if (forgotAccountType === "caterer") {

                    openAuth("caterer");

                }

                else if (forgotAccountType === "admin") {

                    openAuth("admin");

                }


            } catch (error) {

                console.error(
                    "Reset password error:",
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
// POST /api/caterer/login
// =====================================================

const catererLoginForm =
    document.getElementById(
        "catererLoginForm"
    );


if (catererLoginForm) {

    catererLoginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const emailInput =
                catererLoginForm.querySelector(
                    'input[type="email"]'
                );


            const passwordInput =
                catererLoginForm.querySelector(
                    'input[type="password"]'
                );


            const email =
                emailInput.value
                    .trim()
                    .toLowerCase();


            const password =
                passwordInput.value;


            if (!email || !password) {

                alert(
                    "Email and password are required."
                );

                return;

            }


            const gmailRegex =
                /^[^\s@]+@gmail\.com$/i;


            if (!gmailRegex.test(email)) {

                alert(
                    "Please use a valid Gmail address ending with @gmail.com."
                );

                return;

            }


            try {

                const response =
                    await fetch(
                        "http://localhost:5000/api/caterer/login",
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


                localStorage.setItem(
                    "annapriya_caterer_token",
                    data.token
                );


                localStorage.setItem(
                    "annapriya_caterer",
                    JSON.stringify(
                        data.caterer
                    )
                );


                console.log(
                    "Caterer login successful:",
                    data
                );


                alert(
                    "Caterer login successful!"
                );


                window.location.href =
                    "catererdashboard.html";


            } catch (error) {

                console.error(
                    "Caterer login error:",
                    error
                );


                alert(
                    "Unable to connect to the backend. Make sure the Node.js server is running."
                );

            }

        }
    );

}


// =====================================================
// CATERER SIGNUP
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


            if (password !== confirmPassword) {

                alert(
                    "Passwords don't match — please check and try again."
                );

                return;

            }


            try {

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


                if (!response.ok) {

                    alert(
                        data.message ||
                        "Could not submit caterer application."
                    );

                    return;

                }


                alert(
                    data.message ||
                    "Application submitted successfully!"
                );


                catererSignupForm.reset();


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


                if (!response.ok) {

                    alert(
                        data.message ||
                        "Invalid username or password."
                    );

                    return;

                }


                console.log(
                    "Admin login successful:",
                    data
                );


                localStorage.setItem(
                    "adminToken",
                    data.token
                );


                localStorage.setItem(
                    "admin",
                    JSON.stringify(
                        data.admin
                    )
                );


                alert(
                    "Admin login successful!"
                );


                if (
                    typeof closeAuth ===
                    "function"
                ) {

                    closeAuth();

                }


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