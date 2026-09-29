document.addEventListener(
    "DOMContentLoaded",
    () => {


        /* =====================================================
           CATERER DATA
        ====================================================== */

        const token =
            localStorage.getItem(
                "annapriya_caterer_token"
            );


        const storedCaterer =
            JSON.parse(
                localStorage.getItem(
                    "annapriya_caterer"
                ) || "null"
            );


        if (
            !token ||
            !storedCaterer
        ) {

            window.location.href =
                "index.html";

            return;

        }


        const catererId =
            storedCaterer.id ||
            storedCaterer.caterer_id;


        /* =====================================================
           ELEMENTS
        ====================================================== */

        const profileView =
            document.getElementById(
                "profileView"
            );


        const editProfileSection =
            document.getElementById(
                "editProfileSection"
            );


        const editButton =
            document.getElementById(
                "editProfileButton"
            );


        const cancelButton =
            document.getElementById(
                "cancelEditButton"
            );


        const form =
            document.getElementById(
                "catererProfileForm"
            );


        const message =
            document.getElementById(
                "formMessage"
            );


        const saveButton =
            document.getElementById(
                "saveProfileButton"
            );


        /* =====================================================
           HEADER
        ====================================================== */

        const profileButton =
            document.getElementById(
                "profileButton"
            );


        const profileMenu =
            document.getElementById(
                "profileButtonMenu"
            );


        const backButton =
            document.getElementById(
                "backButton"
            );


        const logoutButton =
            document.getElementById(
                "logoutButton"
            );


        /* =====================================================
           LOAD PROFILE
        ====================================================== */

        async function loadProfile() {

            try {

                const response =
                    await fetch(

                        `http://localhost:5000/api/caterer/profile/${catererId}`

                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Could not load profile."
                    );

                }


                const caterer =
                    data.caterer;


                displayProfile(
                    caterer
                );


                fillEditForm(
                    caterer
                );


                /*
                 * Keep localStorage updated.
                 */

                localStorage.setItem(

                    "annapriya_caterer",

                    JSON.stringify({

                        ...storedCaterer,

                        id:
                            caterer.caterer_id,

                        caterer_id:
                            caterer.caterer_id,

                        headName:
                            caterer.head_name,

                        head_name:
                            caterer.head_name,

                        brandName:
                            caterer.brand_name,

                        brand_name:
                            caterer.brand_name,

                        email:
                            caterer.email,

                        phone:
                            caterer.phone,

                        helpers:
                            caterer.helpers,

                        events_served:
                            caterer.events_served,

                        status:
                            caterer.status

                    })

                );


            } catch (error) {

                console.error(
                    "Load caterer profile error:",
                    error
                );


                message.textContent =
                    error.message;

                message.className =
                    "form-message error";

            }

        }


        /* =====================================================
           DISPLAY PROFILE
        ====================================================== */

        function displayProfile(
            caterer
        ) {

            const headName =
                caterer.head_name ||
                "Caterer";


            const brandName =
                caterer.brand_name ||
                "-";


            document.getElementById(
                "headerCatererName"
            ).textContent =
                headName;


            document.getElementById(
                "headerAvatar"
            ).textContent =
                headName
                    .charAt(0)
                    .toUpperCase();


            document.getElementById(
                "largeAvatar"
            ).textContent =
                headName
                    .charAt(0)
                    .toUpperCase();


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
                caterer.email ||
                "-";


            document.getElementById(
                "phone"
            ).textContent =
                caterer.phone ||
                "-";


            document.getElementById(
                "helpers"
            ).textContent =
                caterer.helpers ??
                "-";


            document.getElementById(
                "eventsServed"
            ).textContent =
                caterer.events_served ||
                "-";

        }


        /* =====================================================
           FILL EDIT FORM
        ====================================================== */

        function fillEditForm(
            caterer
        ) {

            document.getElementById(
                "editHeadName"
            ).value =
                caterer.head_name ||
                "";


            document.getElementById(
                "editBrandName"
            ).value =
                caterer.brand_name ||
                "";


            document.getElementById(
                "editPhone"
            ).value =
                caterer.phone ||
                "";


            document.getElementById(
                "editHelpers"
            ).value =
                caterer.helpers ??
                0;


            document.getElementById(
                "editEventsServed"
            ).value =
                caterer.events_served ||
                "0-50";


            document.getElementById(
                "editEmail"
            ).value =
                caterer.email ||
                "";

        }


        /* =====================================================
           OPEN EDIT
        ====================================================== */

        editButton.addEventListener(
            "click",
            () => {

                profileView.style.display =
                    "none";

                editProfileSection.style.display =
                    "block";

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );


        /* =====================================================
           CANCEL EDIT
        ====================================================== */

        cancelButton.addEventListener(
            "click",
            () => {

                editProfileSection.style.display =
                    "none";

                profileView.style.display =
                    "block";

                message.textContent = "";

            }
        );


        /* =====================================================
           SAVE PROFILE
        ====================================================== */

        form.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                message.textContent = "";

                message.className =
                    "form-message";


                const headName =
                    document.getElementById(
                        "editHeadName"
                    ).value.trim();


                const brandName =
                    document.getElementById(
                        "editBrandName"
                    ).value.trim();


                const phone =
                    document.getElementById(
                        "editPhone"
                    ).value.trim();


                const helpers =
                    document.getElementById(
                        "editHelpers"
                    ).value;


                const eventsServed =
                    document.getElementById(
                        "editEventsServed"
                    ).value;


                if (
                    !headName ||
                    !brandName ||
                    !phone ||
                    helpers === "" ||
                    !eventsServed
                ) {

                    message.textContent =
                        "Please fill all required fields.";

                    message.classList.add(
                        "error"
                    );

                    return;

                }


                saveButton.disabled =
                    true;

                saveButton.textContent =
                    "Saving...";


                try {

                    const response =
                        await fetch(

                            `http://localhost:5000/api/caterer/profile/${catererId}`,

                            {

                                method: "PUT",

                                headers: {

                                    "Content-Type":
                                        "application/json"

                                },

                                body:
                                    JSON.stringify({

                                        headName,
                                        brandName,
                                        phone,

                                        helpers:
                                            Number(
                                                helpers
                                            ),

                                        eventsServed

                                    })

                            }

                        );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            data.message ||
                            "Could not update profile."
                        );

                    }


                    message.textContent =
                        "Profile updated successfully!";

                    message.classList.add(
                        "success"
                    );


                    /*
                     * Update localStorage.
                     */

                    const updatedCaterer = {

                        ...storedCaterer,

                        id:
                            data.caterer.caterer_id,

                        caterer_id:
                            data.caterer.caterer_id,

                        headName:
                            data.caterer.head_name,

                        head_name:
                            data.caterer.head_name,

                        brandName:
                            data.caterer.brand_name,

                        brand_name:
                            data.caterer.brand_name,

                        email:
                            data.caterer.email,

                        phone:
                            data.caterer.phone,

                        helpers:
                            data.caterer.helpers,

                        events_served:
                            data.caterer.events_served,

                        status:
                            data.caterer.status

                    };


                    localStorage.setItem(

                        "annapriya_caterer",

                        JSON.stringify(
                            updatedCaterer
                        )

                    );


                    displayProfile(
                        data.caterer
                    );


                    setTimeout(
                        () => {

                            editProfileSection.style.display =
                                "none";

                            profileView.style.display =
                                "block";

                            message.textContent = "";

                        },
                        900
                    );


                } catch (error) {

                    console.error(
                        "Update caterer profile error:",
                        error
                    );


                    message.textContent =
                        error.message ||
                        "Could not update profile.";

                    message.classList.add(
                        "error"
                    );

                } finally {

                    saveButton.disabled =
                        false;

                    saveButton.textContent =
                        "Save Changes";

                }

            }
        );


        /* =====================================================
           MENU
        ====================================================== */

        if (profileButton) {

            profileButton.addEventListener(
                "click",
                (event) => {

                    event.stopPropagation();

                    profileMenu.classList.toggle(
                        "show"
                    );

                }
            );

        }


        document.addEventListener(
            "click",
            (event) => {

                if (
                    profileMenu &&
                    !profileMenu.contains(
                        event.target
                    ) &&
                    !profileButton.contains(
                        event.target
                    )
                ) {

                    profileMenu.classList.remove(
                        "show"
                    );

                }

            }
        );


        /* =====================================================
           BACK
        ====================================================== */

        backButton.addEventListener(
            "click",
            () => {

                window.location.href =
                    "catererdashboard.html";

            }
        );


        /* =====================================================
           LOGOUT
        ====================================================== */

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


        /* =====================================================
           INITIAL LOAD
        ====================================================== */

        loadProfile();

    }
);