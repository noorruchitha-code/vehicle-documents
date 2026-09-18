// ==========================================
// VEHICLE DOCUMENT EXPIRY TRACKER
// ==========================================


// ==========================================
// GET ELEMENTS
// ==========================================

const documentForm = document.getElementById("documentForm");
const documentList = document.getElementById("documentList");

const totalCount = document.getElementById("totalCount");
const safeCount = document.getElementById("safeCount");
const warningCount = document.getElementById("warningCount");
const dangerCount = document.getElementById("dangerCount");

const enableReminderButton =
    document.getElementById("enableReminderButton");

const reminderStatus =
    document.getElementById("reminderStatus");

const renewalHistory =
    document.getElementById("renewalHistory");

const searchBox =
    document.getElementById("searchBox");

const statusFilter =
    document.getElementById("statusFilter");

const sortOption =
    document.getElementById("sortOption");

const resultCount =
    document.getElementById("resultCount");

const demoButton =
    document.getElementById("demoButton");


// ==========================================
// DATA
// ==========================================

let documents = [];
let renewals = [];


// ==========================================
// LOAD DATA
// ==========================================

function loadData() {

    const savedDocuments =
        localStorage.getItem("vehicleDocuments");

    const savedRenewals =
        localStorage.getItem("vehicleRenewals");


    if (savedDocuments) {

        try {
            documents = JSON.parse(savedDocuments);
        }

        catch (error) {
            documents = [];
        }

    }


    if (savedRenewals) {

        try {
            renewals = JSON.parse(savedRenewals);
        }

        catch (error) {
            renewals = [];
        }

    }


    displayDocuments();
    displayRenewalHistory();

}


// ==========================================
// SAVE DOCUMENTS
// ==========================================

function saveDocuments() {

    localStorage.setItem(
        "vehicleDocuments",
        JSON.stringify(documents)
    );

}


// ==========================================
// SAVE RENEWALS
// ==========================================

function saveRenewals() {

    localStorage.setItem(
        "vehicleRenewals",
        JSON.stringify(renewals)
    );

}


// ==========================================
// CREATE UNIQUE ID
// ==========================================

function createUniqueId() {

    return (
        Date.now().toString()
        +
        "_"
        +
        Math.random()
            .toString(36)
            .substring(2, 9)
    );

}


// ==========================================
// ADD DOCUMENT
// ==========================================

documentForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const vehicleNumber =
            document
                .getElementById("vehicleNumber")
                .value
                .trim()
                .toUpperCase();


        const ownerName =
            document
                .getElementById("ownerName")
                .value
                .trim();


        const documentType =
            document
                .getElementById("documentType")
                .value;


        const expiryDate =
            document
                .getElementById("expiryDate")
                .value;


        // Create a completely NEW record
        // for every document entered.

        const newDocument = {

            id: createUniqueId(),

            vehicleNumber: vehicleNumber,

            ownerName: ownerName,

            documentType: documentType,

            expiryDate: expiryDate

        };


        // Add ONLY this new document
        // to the documents array.

        documents.push(newDocument);


        // Save all documents.

        saveDocuments();


        // Display all documents separately.

        displayDocuments();


        // Clear the form.

        documentForm.reset();


        alert(
            "Document added successfully!"
        );

    }
);


// ==========================================
// CALCULATE DAYS REMAINING
// ==========================================

function getDaysRemaining(expiryDate) {

    const today = new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    const expiry = new Date(expiryDate);

    expiry.setHours(
        0,
        0,
        0,
        0
    );


    const difference =
        expiry.getTime()
        -
        today.getTime();


    return Math.ceil(
        difference /
        (
            1000 *
            60 *
            60 *
            24
        )
    );

}


// ==========================================
// GET STATUS
// ==========================================

function getStatus(days) {

    if (days > 30) {

        return {
            className: "safe",
            text: "🟢 SAFE"
        };

    }


    if (days > 7) {

        return {
            className: "warning",
            text: "🟡 EXPIRING SOON"
        };

    }


    return {
        className: "danger",
        text: "🔴 URGENT / EXPIRED"
    };

}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(dateString) {

    const date = new Date(dateString);


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHtml(text) {

    return String(text)
        .replace(
            /[&<>"']/g,
            function(character) {

                const replacements = {

                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#039;"

                };


                return replacements[character];

            }
        );

}


// ==========================================
// DISPLAY DOCUMENTS
// ==========================================

function displayDocuments() {

    const searchText =
        searchBox.value
            .trim()
            .toLowerCase();


    const selectedStatus =
        statusFilter.value;


    const selectedSort =
        sortOption.value;


    // Create a NEW array.
    // This prevents the original data
    // from being accidentally changed.

    let filteredDocuments =
        documents.filter(
            function(doc) {

                const searchableText =
                    doc.vehicleNumber
                    +
                    " "
                    +
                    doc.ownerName
                    +
                    " "
                    +
                    doc.documentType;


                const matchesSearch =
                    searchableText
                        .toLowerCase()
                        .includes(searchText);


                const days =
                    getDaysRemaining(
                        doc.expiryDate
                    );


                const status =
                    getStatus(days);


                const matchesStatus =
                    selectedStatus === "all"
                    ||
                    status.className ===
                    selectedStatus;


                return (
                    matchesSearch
                    &&
                    matchesStatus
                );

            }
        );


    // ==========================================
    // SORT
    // ==========================================

    if (selectedSort === "nearest") {

        filteredDocuments.sort(
            function(a, b) {

                return (
                    getDaysRemaining(
                        a.expiryDate
                    )
                    -
                    getDaysRemaining(
                        b.expiryDate
                    )
                );

            }
        );

    }


    else if (selectedSort === "farthest") {

        filteredDocuments.sort(
            function(a, b) {

                return (
                    getDaysRemaining(
                        b.expiryDate
                    )
                    -
                    getDaysRemaining(
                        a.expiryDate
                    )
                );

            }
        );

    }


    else if (selectedSort === "vehicle") {

        filteredDocuments.sort(
            function(a, b) {

                return a.vehicleNumber
                    .localeCompare(
                        b.vehicleNumber
                    );

            }
        );

    }


    // ==========================================
    // CLEAR OLD DISPLAY
    // ==========================================

    documentList.innerHTML = "";


    // ==========================================
    // RESULT COUNT
    // ==========================================

    resultCount.textContent =
        filteredDocuments.length
        +
        " document(s) found";


    // ==========================================
    // NO RESULTS
    // ==========================================

    if (filteredDocuments.length === 0) {

        documentList.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    🔍
                </div>

                <h3>
                    No matching documents
                </h3>

                <p>
                    Try changing your search or filter.
                </p>

            </div>

        `;


        updateDashboard();

        return;

    }


    // ==========================================
    // CREATE SEPARATE CARD FOR EVERY DOCUMENT
    // ==========================================

    filteredDocuments.forEach(
        function(doc) {

            const days =
                getDaysRemaining(
                    doc.expiryDate
                );


            const status =
                getStatus(days);


            let remainingText;


            if (days > 0) {

                remainingText =
                    days +
                    " day(s) remaining";

            }


            else if (days === 0) {

                remainingText =
                    "Expires today";

            }


            else {

                remainingText =
                    Math.abs(days)
                    +
                    " day(s) overdue";

            }


            // Create a completely separate DIV
            // for this document.

            const documentDiv =
                document.createElement("div");


            documentDiv.className =
                "document " +
                status.className;


            documentDiv.innerHTML = `

                <h3>
                    📄
                    ${escapeHtml(
                        doc.documentType
                    )}
                </h3>


                <p>
                    <strong>
                        Vehicle:
                    </strong>

                    ${escapeHtml(
                        doc.vehicleNumber
                    )}
                </p>


                <p>
                    <strong>
                        Owner:
                    </strong>

                    ${escapeHtml(
                        doc.ownerName
                    )}
                </p>


                <p>
                    <strong>
                        Expiry Date:
                    </strong>

                    ${formatDate(
                        doc.expiryDate
                    )}
                </p>


                <p>
                    <strong>
                        Days:
                    </strong>

                    ${remainingText}
                </p>


                <span
                    class="status ${status.className}"
                >
                    ${status.text}
                </span>


                <div class="document-actions">

                    <button
                        class="remind-button"
                        onclick="sendReminder('${doc.id}')"
                    >
                        🔔 Remind
                    </button>


                    <button
                        class="renew-button"
                        onclick="renewDocument('${doc.id}')"
                    >
                        🔄 Renew
                    </button>


                    <button
                        class="delete-button"
                        onclick="deleteDocument('${doc.id}')"
                    >
                        🗑 Delete
                    </button>

                </div>

            `;


            // Add this card to the list.

            documentList.appendChild(
                documentDiv
            );

        }
    );


    updateDashboard();

}


// ==========================================
// DASHBOARD
// ==========================================

function updateDashboard() {

    let safe = 0;
    let warning = 0;
    let danger = 0;


    documents.forEach(
        function(doc) {

            const days =
                getDaysRemaining(
                    doc.expiryDate
                );


            const status =
                getStatus(days);


            if (status.className === "safe") {

                safe++;

            }


            else if (
                status.className === "warning"
            ) {

                warning++;

            }


            else {

                danger++;

            }

        }
    );


    totalCount.textContent =
        documents.length;


    safeCount.textContent =
        safe;


    warningCount.textContent =
        warning;


    dangerCount.textContent =
        danger;

}


// ==========================================
// DELETE DOCUMENT
// ==========================================

function deleteDocument(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this document?"
        );


    if (!confirmDelete) {

        return;

    }


    documents =
        documents.filter(
            function(doc) {

                return String(doc.id) !== String(id);

            }
        );


    saveDocuments();

    displayDocuments();


    alert(
        "Document deleted successfully."
    );

}


// ==========================================
// RENEW DOCUMENT
// ==========================================

function renewDocument(id) {

    const documentToRenew =
        documents.find(
            function(doc) {

                return String(doc.id) === String(id);

            }
        );


    if (!documentToRenew) {

        alert(
            "Document not found."
        );

        return;

    }


    const newExpiryDate =
        prompt(
            "Enter the new expiry date in YYYY-MM-DD format:",
            documentToRenew.expiryDate
        );


    if (!newExpiryDate) {

        return;

    }


    const datePattern =
        /^\d{4}-\d{2}-\d{2}$/;


    if (!datePattern.test(newExpiryDate)) {

        alert(
            "Invalid date format. Please use YYYY-MM-DD."
        );

        return;

    }


    const selectedDate =
        new Date(newExpiryDate);


    if (
        Number.isNaN(
            selectedDate.getTime()
        )
    ) {

        alert(
            "Please enter a valid date."
        );

        return;

    }


    const today = new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    selectedDate.setHours(
        0,
        0,
        0,
        0
    );


    if (selectedDate <= today) {

        alert(
            "New expiry date must be in the future."
        );

        return;

    }


    const renewalRecord = {

        id: createUniqueId(),

        vehicleNumber:
            documentToRenew.vehicleNumber,

        ownerName:
            documentToRenew.ownerName,

        documentType:
            documentToRenew.documentType,

        oldExpiryDate:
            documentToRenew.expiryDate,

        newExpiryDate:
            newExpiryDate,

        renewalDate:
            new Date()
                .toISOString()
                .split("T")[0]

    };


    renewals.unshift(
        renewalRecord
    );


    documentToRenew.expiryDate =
        newExpiryDate;


    saveDocuments();

    saveRenewals();


    displayDocuments();

    displayRenewalHistory();


    alert(
        "Document renewed successfully!"
    );

}


// ==========================================
// RENEWAL HISTORY
// ==========================================

function displayRenewalHistory() {

    renewalHistory.innerHTML = "";

    if (renewals.length === 0) {

        renewalHistory.innerHTML = `

            <div class="empty-state small">

                <p>
                    No renewals recorded yet.
                </p>

            </div>

        `;

        return;

    }

    renewals.forEach(
        function(record) {

            const historyDiv =
                document.createElement("div");


            historyDiv.className =
                "history-item";


            historyDiv.innerHTML = `

                <h3>
                    🔄
                    ${escapeHtml(
                        record.documentType
                    )}
                </h3>


                <p>
                    <strong>
                        Vehicle:
                    </strong>

                    ${escapeHtml(
                        record.vehicleNumber
                    )}
                </p>


                <p>
                    <strong>
                        Owner:
                    </strong>

                    ${escapeHtml(
                        record.ownerName
                    )}
                </p>


                <p>
                    <strong>
                        Previous Expiry:
                    </strong>

                    ${formatDate(
                        record.oldExpiryDate
                    )}
                </p>


                <p>
                    <strong>
                        New Expiry:
                    </strong>

                    ${formatDate(
                        record.newExpiryDate
                    )}
                </p>


                <p>
                    <strong>
                        Renewed On:
                    </strong>

                    ${formatDate(
                        record.renewalDate
                    )}
                </p>


                <button
                    class="delete-button"
                    onclick="deleteRenewal('${record.id}')"
                >
                    🗑 Delete
                </button>

            `;


            renewalHistory.appendChild(
                historyDiv
            );

        }
    );

}


// ==========================================
// DELETE RENEWAL HISTORY
// ==========================================

function deleteRenewal(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this renewal history?"
        );


    if (!confirmDelete) {

        return;

    }


    renewals =
        renewals.filter(
            function(record) {

                return String(record.id) !== String(id);

            }
        );


    saveRenewals();


    displayRenewalHistory();


    alert(
        "Renewal history deleted successfully."
    );

}


// ==========================================
// SEND MANUAL REMINDER
// ==========================================

function sendReminder(id) {

    const doc =
        documents.find(
            function(item) {

                return String(item.id) === String(id);

            }
        );


    if (!doc) {

        return;

    }


    const days =
        getDaysRemaining(
            doc.expiryDate
        );


    let message;


    if (days < 0) {

        message =
            doc.documentType
            +
            " for "
            +
            doc.vehicleNumber
            +
            " is already expired.";

    }


    else if (days === 0) {

        message =
            doc.documentType
            +
            " for "
            +
            doc.vehicleNumber
            +
            " expires TODAY.";

    }


    else {

        message =
            doc.documentType
            +
            " for "
            +
            doc.vehicleNumber
            +
            " expires in "
            +
            days
            +
            " day(s).";

    }


    if (
        "Notification" in window
        &&
        Notification.permission === "granted"
    ) {

        new Notification(
            "🔔 Vehicle Document Reminder",
            {
                body: message
            }
        );

    }


    else {

        alert(message);

    }

}


// ==========================================
// ENABLE REMINDERS
// ==========================================

enableReminderButton.addEventListener(
    "click",
    async function() {

        if (!("Notification" in window)) {

            reminderStatus.textContent =
                "❌ Browser notifications are not supported.";

            return;

        }


        const permission =
            await Notification.requestPermission();


        if (permission === "granted") {

            reminderStatus.textContent =
                "✅ Reminders are enabled.";


            alert(
                "Reminders enabled successfully!"
            );


            checkExpiryReminders();

        }


        else if (permission === "denied") {

            reminderStatus.textContent =
                "❌ Notification permission was denied.";

        }


        else {

            reminderStatus.textContent =
                "⚠️ Notification permission was not granted.";

        }

    }
);


// ==========================================
// AUTOMATIC REMINDERS
// ==========================================

function checkExpiryReminders() {

    if (!("Notification" in window)) {

        return;

    }


    if (
        Notification.permission !== "granted"
    ) {

        return;

    }


    documents.forEach(
        function(doc) {

            const days =
                getDaysRemaining(
                    doc.expiryDate
                );


            if (days >= 0 && days <= 7) {

                let message;


                if (days === 0) {

                    message =
                        doc.documentType
                        +
                        " for "
                        +
                        doc.vehicleNumber
                        +
                        " expires TODAY.";

                }


                else {

                    message =
                        doc.documentType
                        +
                        " for "
                        +
                        doc.vehicleNumber
                        +
                        " expires in "
                        +
                        days
                        +
                        " day(s).";

                }


                new Notification(
                    "🔔 Vehicle Document Reminder",
                    {
                        body: message
                    }
                );

            }

        }
    );

}


// ==========================================
// SEARCH
// ==========================================

searchBox.addEventListener(
    "input",
    function() {

        displayDocuments();

    }
);


// ==========================================
// FILTER
// ==========================================

statusFilter.addEventListener(
    "change",
    function() {

        displayDocuments();

    }
);


// ==========================================
// SORT
// ==========================================

sortOption.addEventListener(
    "change",
    function() {

        displayDocuments();

    }
);


// ==========================================
// DEMO DATA
// ==========================================

demoButton.addEventListener(
    "click",
    function() {

        const today =
            new Date();


        // SAFE = 90 DAYS

        const safeDate =
            new Date(today);


        safeDate.setDate(
            today.getDate() + 90
        );


        // WARNING = 20 DAYS

        const warningDate =
            new Date(today);


        warningDate.setDate(
            today.getDate() + 20
        );


        // DANGER = 5 DAYS

        const dangerDate =
            new Date(today);


        dangerDate.setDate(
            today.getDate() + 5
        );


        // EXPIRED = 5 DAYS AGO

        const expiredDate =
            new Date(today);


        expiredDate.setDate(
            today.getDate() - 5
        );


        // Add each demo vehicle
        // as a completely separate record.

        documents.push(

            {
                id: createUniqueId(),

                vehicleNumber: "TS09AB1234",

                ownerName: "Ruchitha",

                documentType: "Insurance",

                expiryDate:
                    formatDateForInput(
                        safeDate
                    )
            },


            {
                id: createUniqueId(),

                vehicleNumber: "TS10CD5678",

                ownerName: "Rahul",

                documentType: "PUC",

                expiryDate:
                    formatDateForInput(
                        warningDate
                    )
            },


            {
                id: createUniqueId(),

                vehicleNumber: "TS11EF9012",

                ownerName: "Priya",

                documentType: "RC",

                expiryDate:
                    formatDateForInput(
                        dangerDate
                    )
            },


            {
                id: createUniqueId(),

                vehicleNumber: "TS12GH3456",

                ownerName: "Arjun",

                documentType: "Driving Licence",

                expiryDate:
                    formatDateForInput(
                        expiredDate
                    )
            }

        );


        saveDocuments();

        displayDocuments();


        alert(
            "Demo data added successfully!"
        );

    }
);


// ==========================================
// DATE FOR INPUT
// ==========================================

function formatDateForInput(date) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return (
        year
        +
        "-"
        +
        month
        +
        "-"
        +
        day
    );

}


// ==========================================
// START APPLICATION
// ==========================================

loadData();