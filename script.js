/* =====================================================
   R3 SALON BOOKING SYSTEM
   ===================================================== */


/*
   PUT YOUR GOOGLE APPS SCRIPT WEB APP URL HERE
*/

const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbxN8rh7jUsBUHlg12TvdczXzh5-BOnkfy2-iGblOS-_K9CuANqE8YJdpYQdjEGwquo/exec";


/* =====================================================
   ELEMENTS
   ===================================================== */

const bookingForm =
    document.getElementById("bookingForm");

const dateInput =
    document.getElementById("bookingDate");

const timeSelect =
    document.getElementById("bookingTime");

const timeStatus =
    document.getElementById("timeStatus");


/* =====================================================
   POPUP
   ===================================================== */

function showPopup(title, message, success = true) {

    const popup =
        document.getElementById("popup");

    const popupTitle =
        document.getElementById("popupTitle");

    const popupMessage =
        document.getElementById("popupMessage");

    const popupIcon =
        document.getElementById("popupIcon");


    popupTitle.textContent = title;

    popupMessage.textContent = message;


    if (success) {

        popupIcon.textContent = "✓";

        popupIcon.style.background =
            "#ffd700";

        popupIcon.style.color =
            "#000";

    } else {

        popupIcon.textContent = "×";

        popupIcon.style.background =
            "#ff3333";

        popupIcon.style.color =
            "#fff";

    }


    popup.classList.add("show");
}


function closePopup() {

    document
        .getElementById("popup")
        .classList.remove("show");

}


/* =====================================================
   DATE VALIDATION
   ===================================================== */

function isValidDate(dateString) {

    const regex =
        /^(\d{2})\/(\d{2})\/(\d{4})$/;

    const match =
        dateString.match(regex);

    if (!match) {
        return false;
    }


    const day =
        parseInt(match[1]);

    const month =
        parseInt(match[2]);

    const year =
        parseInt(match[3]);


    const date =
        new Date(year, month - 1, day);


    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
}


/* =====================================================
   DATE INPUT AUTO FORMAT
   ===================================================== */

dateInput.addEventListener(
    "input",
    function () {

        let value =
            this.value.replace(/\D/g, "");

        if (value.length > 8) {
            value = value.substring(0, 8);
        }


        if (value.length >= 5) {

            this.value =
                value.substring(0, 2) +
                "/" +
                value.substring(2, 4) +
                "/" +
                value.substring(4);

        } else if (value.length >= 3) {

            this.value =
                value.substring(0, 2) +
                "/" +
                value.substring(2);

        } else {

            this.value = value;

        }

    }
);


/* =====================================================
   CHECK BOOKED SLOTS
   ===================================================== */

function loadBookedSlots() {

    const date =
        dateInput.value.trim();


    if (!isValidDate(date)) {

        timeStatus.innerHTML = "";

        resetTimeOptions();

        return;
    }


    if (
        !SCRIPT_URL ||
        SCRIPT_URL.includes("PASTE_YOUR")
    ) {

        console.log(
            "Google Apps Script URL not added yet."
        );

        return;
    }


    timeStatus.innerHTML =
        "Checking available times...";


    const callbackName =
        "bookingCallback_" +
        Date.now();


    window[callbackName] =
        function (response) {

            delete window[callbackName];

            const script =
                document.getElementById(
                    callbackName
                );

            if (script) {
                script.remove();
            }


            if (
                response &&
                response.success
            ) {

                updateTimeSlots(
                    response.bookedSlots || []
                );

                timeStatus.innerHTML =
                    "Available times shown below.";

            } else {

                timeStatus.innerHTML =
                    "Unable to check times.";

            }

        };


    const script =
        document.createElement("script");


    script.id =
        callbackName;


    script.src =
        SCRIPT_URL +
        "?action=getBookedSlots" +
        "&date=" +
        encodeURIComponent(date) +
        "&callback=" +
        callbackName;


    script.onerror =
        function () {

            delete window[callbackName];

            script.remove();

            timeStatus.innerHTML =
                "Unable to connect to booking system.";

        };


    document.body.appendChild(script);
}


/* =====================================================
   RESET TIME OPTIONS
   ===================================================== */

function resetTimeOptions() {

    const options =
        timeSelect.querySelectorAll("option");

    options.forEach(
        function (option, index) {

            if (index === 0) {
                return;
            }

            option.disabled = false;

            option.textContent =
                option.value;

            option.classList.remove(
                "booked-option"
            );

            option.classList.add(
                "available-option"
            );

        }
    );

    timeSelect.value = "";
}


/* =====================================================
   UPDATE BOOKED TIME SLOTS
   SAME FORMAT = hh:mm AM/PM
===================================================== */

function normalizeTime(time) {

    if (!time) {
        return "";
    }

    time = String(time)
        .trim()
        .toUpperCase();

    const match = time.match(
        /^(\d{1,2}):(\d{2})\s*(AM|PM)$/
    );

    if (!match) {
        return "";
    }

    let hour = parseInt(match[1], 10);
    const minute = match[2];
    const period = match[3];

    if (hour < 1 || hour > 12) {
        return "";
    }

    return (
        (hour < 10 ? "0" : "") +
        hour +
        ":" +
        minute +
        " " +
        period
    );
}


function updateTimeSlots(bookedSlots) {

    /* Convert every returned time to one
       exact format */

    const booked =
        bookedSlots
            .map(function (slot) {
                return normalizeTime(slot);
            })
            .filter(function (slot) {
                return slot !== "";
            });


    const options =
        timeSelect.querySelectorAll("option");


    options.forEach(
        function (option, index) {

            /* Keep "Select a time" unchanged */

            if (index === 0) {
                option.disabled = false;
                option.textContent =
                    option.value || "Select a time";
                return;
            }


            const time =
                normalizeTime(option.value);


            /* =========================
               SAME DATE + SAME TIME
               ========================= */

            if (
                booked.indexOf(time) !== -1
            ) {

                option.disabled = true;

                option.textContent =
                    time +
                    " — Already Booked";

                option.classList.remove(
                    "available-option"
                );

                option.classList.add(
                    "booked-option"
                );

            }

            /* =========================
               AVAILABLE TIME
               ========================= */

            else {

                option.disabled = false;

                option.textContent =
                    time;

                option.classList.remove(
                    "booked-option"
                );

                option.classList.add(
                    "available-option"
                );
            }

        }
    );


    /* Don't keep an unavailable time selected */

    if (
        timeSelect.selectedOptions.length &&
        timeSelect.selectedOptions[0].disabled
    ) {

        timeSelect.value = "";

    }
}

/* =====================================================
   CHECK DATE WHEN USER CHANGES IT
   ===================================================== */

dateInput.addEventListener(
    "change",
    loadBookedSlots
);

dateInput.addEventListener(
    "blur",
    loadBookedSlots
);


/* =====================================================
   R3 SALON - BOOKING FORM
===================================================== */

bookingForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        /* =========================
           GET FORM VALUES
        ========================= */

        const name =
            document
                .getElementById("customerName")
                .value
                .trim();

        const phone =
            document
                .getElementById("phone")
                .value
                .trim();

        const date =
            dateInput.value.trim();

        const time =
            timeSelect.value;


        /* =========================
           NAME
        ========================= */

        if (name.length < 2) {

            showPopup(
                "Booking Failed",
                "Please enter your name.",
                false
            );

            return;
        }


        /* =========================
           PHONE
        ========================= */

        if (!/^[0-9]{10}$/.test(phone)) {

            showPopup(
                "Booking Failed",
                "Please enter a valid 10 digit mobile number.",
                false
            );

            return;
        }


        /* =========================
           SERVICES
        ========================= */

        const selectedServices =
            Array.from(
                document.querySelectorAll(
                    'input[name="service"]:checked'
                )
            ).map(
                function (checkbox) {
                    return checkbox.value;
                }
            );


        if (
            selectedServices.length === 0
        ) {

            showPopup(
                "Booking Failed",
                "Please select at least one service.",
                false
            );

            return;
        }


        const services =
            selectedServices.join(", ");


        /* =========================
           DATE
           DD/MM/YYYY
        ========================= */

        if (!isValidDate(date)) {

            showPopup(
                "Booking Failed",
                "Please enter date in DD/MM/YYYY format.",
                false
            );

            return;
        }


        /* =========================
           TIME
           AM / PM
        ========================= */

        if (!time) {

            showPopup(
                "Booking Failed",
                "Please select an available time.",
                false
            );

            return;
        }


        /* =========================
           GOOGLE SCRIPT CHECK
        ========================= */

        if (
            !SCRIPT_URL ||
            SCRIPT_URL.includes("PASTE_YOUR")
        ) {

            showPopup(
                "Booking Failed",
                "Booking system is not connected yet.",
                false
            );

            return;
        }


        /* =========================
           BOOK BUTTON
        ========================= */

        const submitButton =
            document.querySelector(
                ".book-btn"
            );


        submitButton.disabled = true;

        submitButton.textContent =
            "Checking...";


        /* =================================================
           FINAL AVAILABILITY CHECK
           CHECK DATE + TIME BEFORE BOOKING
        ================================================= */

        const checkCallbackName =
            "checkBooking_" +
            Date.now();


        window[checkCallbackName] =
            function (checkResponse) {

                /* Remove callback */

                delete window[
                    checkCallbackName
                ];


                const checkScript =
                    document.getElementById(
                        checkCallbackName
                    );


                if (checkScript) {

                    checkScript.remove();

                }


                /* =========================
                   CHECK FAILED
                ========================= */

                if (
                    !checkResponse ||
                    !checkResponse.success
                ) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "Book Appointment";


                    showPopup(
                        "Booking Failed",
                        "Unable to check the selected time. Please try again.",
                        false
                    );

                    return;
                }


                /* =========================
                   GET BOOKED SLOTS
                ========================= */

                const latestBooked =
                    (
                        checkResponse.bookedSlots ||
                        []
                    ).map(
                        function (slot) {

                            return normalizeTime(
                                slot
                            );

                        }
                    );


                const selectedTime =
                    normalizeTime(time);


                /* =========================
                   ALREADY BOOKED
                ========================= */

                if (
                    latestBooked.indexOf(
                        selectedTime
                    ) !== -1
                ) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "Book Appointment";


                    showPopup(
                        "Already Booked",
                        "This time slot is already booked. Please choose another time.",
                        false
                    );


                    /* Refresh time dropdown */

                    loadBookedSlots();

                    return;
                }


                /* =========================
                   AVAILABLE
                ========================= */

                submitButton.textContent =
                    "Booking...";


                submitBookingToGoogle(
                    name,
                    phone,
                    services,
                    date,
                    time,
                    submitButton
                );

            };


        /* =========================
           CREATE CHECK SCRIPT
        ========================= */

        const checkScript =
            document.createElement(
                "script"
            );


        checkScript.id =
            checkCallbackName;


        checkScript.src =
            SCRIPT_URL +
            "?action=getBookedSlots" +
            "&date=" +
            encodeURIComponent(date) +
            "&callback=" +
            encodeURIComponent(
                checkCallbackName
            );


        /* =========================
           CHECK CONNECTION ERROR
        ========================= */

        checkScript.onerror =
            function () {

                delete window[
                    checkCallbackName
                ];


                checkScript.remove();


                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "Book Appointment";


                showPopup(
                    "Booking Failed",
                    "Unable to connect to the booking system. Please try again.",
                    false
                );

            };


        document.body.appendChild(
            checkScript
        );

    }
);


/* =====================================================
   SEND BOOKING TO GOOGLE APPS SCRIPT
===================================================== */

function submitBookingToGoogle(
    name,
    phone,
    services,
    date,
    time,
    submitButton
) {

    /* =========================
       CALLBACK NAME
    ========================= */

    const callbackName =
        "submitBooking_" +
        Date.now();


    /* =========================
       GOOGLE RESPONSE
    ========================= */

    window[callbackName] =
        function (response) {

            delete window[
                callbackName
            ];


            const script =
                document.getElementById(
                    callbackName
                );


            if (script) {

                script.remove();

            }


            submitButton.disabled =
                false;

            submitButton.textContent =
                "Book Appointment";


        

/* =========================
   BOOKING SUCCESSFUL
========================= */

if (
    response &&
    response.success
) {

    /* Keep the booked date */
    const bookedDate = date;


    /* Clear customer details */
    document.getElementById("customerName").value = "";

    document.getElementById("phone").value = "";


    /* Uncheck all services */
    document
        .querySelectorAll(
            'input[name="service"]:checked'
        )
        .forEach(function (checkbox) {

            checkbox.checked = false;

        });


    /* Keep the same date */
    dateInput.value = bookedDate;


    /* Reset selected time */
    timeSelect.value = "";


    /* Clear status */
    timeStatus.innerHTML = "";


    /* IMPORTANT:
       Get latest booked slots again */

    loadBookedSlots();


    /* Success message */

    showPopup(
        "Booking Confirmed!",
        "Your appointment has been successfully booked. A confirmation email has been sent.",
        true
    );


    return;
}


            /* =========================
               ALREADY BOOKED
            ========================= */

            if (
                response &&
                response.alreadyBooked
            ) {

                showPopup(
                    "Already Booked",
                    "This time slot is already booked. Please choose another time.",
                    false
                );


                loadBookedSlots();


                return;
            }


            /* =========================
               ERROR
            ========================= */

            showPopup(
                "Booking Failed",
                response &&
                response.message
                    ? response.message
                    : "Something went wrong. Please try again.",
                false
            );

        };


    /* =========================
       CREATE BOOKING SCRIPT
    ========================= */

    const script =
        document.createElement(
            "script"
        );


    script.id =
        callbackName;


    script.src =
        SCRIPT_URL +
        "?action=book" +
        "&callback=" +
        encodeURIComponent(
            callbackName
        ) +
        "&name=" +
        encodeURIComponent(name) +
        "&phone=" +
        encodeURIComponent(phone) +
        "&service=" +
        encodeURIComponent(services) +
        "&date=" +
        encodeURIComponent(date) +
        "&time=" +
        encodeURIComponent(time);


    /* =========================
       CONNECTION ERROR
    ========================= */

    script.onerror =
        function () {

            delete window[
                callbackName
            ];


            script.remove();


            submitButton.disabled =
                false;


            submitButton.textContent =
                "Book Appointment";


            showPopup(
                "Booking Failed",
                "Unable to connect to the booking system. Please try again.",
                false
            );

        };


    document.body.appendChild(
        script
    );

}
/* =====================================================
   CLOSE POPUP WHEN CLICKING OUTSIDE
   ===================================================== */

document
    .getElementById("popup")
    .addEventListener(
        "click",
        function (event) {

            if (
                event.target === this
            ) {

                closePopup();

            }

        }
);
/* =====================================================
   R3 SALON - REAL SCISSOR HAIR CUT EFFECT
===================================================== */

const scissorContainer =
    document.getElementById("scissorEffects");


/* =====================================================
   CREATE SCISSOR
===================================================== */

function createScissor(x, y) {

    const scissor =
        document.createElement("div");

    scissor.className =
        "scissor-effect";


    /* Position */

    scissor.style.left =
        x + "px";

    scissor.style.top =
        y + "px";


    /* =========================
       TOP BLADE
    ========================= */

    const bladeTop =
        document.createElement("div");

    bladeTop.className =
        "blade blade-top";


    /* =========================
       BOTTOM BLADE
    ========================= */

    const bladeBottom =
        document.createElement("div");

    bladeBottom.className =
        "blade blade-bottom";


    /* =========================
       CENTER PIVOT
    ========================= */

    const center =
        document.createElement("div");

    center.className =
        "scissor-center";


    /* =========================
       TOP RING
    ========================= */

    const ringTop =
        document.createElement("div");

    ringTop.className =
        "scissor-ring ring-top";


    /* =========================
       BOTTOM RING
    ========================= */

    const ringBottom =
        document.createElement("div");

    ringBottom.className =
        "scissor-ring ring-bottom";


    /* Add everything */

    scissor.appendChild(bladeTop);

    scissor.appendChild(bladeBottom);

    scissor.appendChild(center);

    scissor.appendChild(ringTop);

    scissor.appendChild(ringBottom);


    /* Add to page */

    scissorContainer.appendChild(
        scissor
    );


    /* Remove after animation */

    setTimeout(function () {

        scissor.remove();

    }, 1000);
}


/* =====================================================
   CREATE FALLING HAIR
===================================================== */

function createHair(x, y) {

    for (
        let i = 0;
        i < 8;
        i++
    ) {

        const hair =
            document.createElement("div");

        hair.className =
            "hair-piece";


        hair.style.left =
            (
                x +
                randomNumber(-10, 10)
            ) + "px";


        hair.style.top =
            (
                y +
                randomNumber(-5, 5)
            ) + "px";


        hair.style.setProperty(
            "--hair-x",
            randomNumber(-40, 40) + "px"
        );


        hair.style.setProperty(
            "--hair-y",
            randomNumber(25, 65) + "px"
        );


        hair.style.setProperty(
            "--hair-rotate",
            randomNumber(-180, 180) + "deg"
        );


        scissorContainer.appendChild(
            hair
        );


        setTimeout(function () {

            hair.remove();

        }, 1000);
    }
}


/* =====================================================
   RANDOM NUMBER
===================================================== */

function randomNumber(min, max) {

    return Math.random() *
        (max - min) + min;
}


/* =====================================================
   MOUSE CLICK
===================================================== */

document.addEventListener(
    "click",
    function (event) {

        if (!scissorContainer) {
            return;
        }


        createScissor(
            event.clientX,
            event.clientY
        );


        createHair(
            event.clientX,
            event.clientY
        );

    }
);


/* =====================================================
   MOBILE TOUCH
===================================================== */

document.addEventListener(
    "touchstart",
    function (event) {

        if (
            !event.touches ||
            !event.touches.length ||
            !scissorContainer
        ) {
            return;
        }


        const touch =
            event.touches[0];


        createScissor(
            touch.clientX,
            touch.clientY
        );


        createHair(
            touch.clientX,
            touch.clientY
        );

    },
    {
        passive: true
    }
);
// ================= BACK TO TOP =================

const backToTop = document.getElementById("backToTop");

// Show button after scrolling down
window.addEventListener("scroll", function () {

    if (window.scrollY > 300) {
        backToTop.style.display = "block";
    } else {
        backToTop.style.display = "none";
    }

});

// Scroll to top when clicked
backToTop.addEventListener("click", function () {

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});