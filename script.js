const firebaseConfig = {
    apiKey: "AIzaSyCnIdqH2xfnfecwZY_vZI7ay055hMty7rc",
    authDomain: "steelbook-tracker.firebaseapp.com",
    projectId: "steelbook-tracker",
    storageBucket: "steelbook-tracker.firebasestorage.app",
    messagingSenderId: "477552655118",
    appId: "1:477552655118:web:f3587ae38f648a98d0b55f"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

function login() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const errorMessage = document.getElementById("login-error");

    auth.signInWithEmailAndPassword(email, password)
        .catch((error) => {
            errorMessage.textContent = "Connexion impossible. Vérifie tes identifiants.";
            console.error(error);
        });
}

auth.onAuthStateChanged((user) => {
    const loginScreen = document.getElementById("login-screen");
    const appContent = document.getElementById("app-content");

    if (loginScreen) {
        loginScreen.style.display = user ? "none" : "block";
    }

    if (appContent) {
        appContent.style.display = user ? "block" : "none";
    }

    if (user) {
        loadSteelbooks();
    }
});

let editingSteelbookId = null;
let editingWishlistId = null;

function displaySteelbook(steelbookData) {
    const steelbookList =
document.getElementById("steelbook-list");

    const steelbook =
document.createElement("div");
    steelbook.className =
"steelbook-card";

    steelbook.innerHTML =
        "<h3>" + steelbookData.title + "</h3>" +
        "<p>Édition : " + (steelbookData.edition || "Non renseignée") + "</p>" +
        "<p>Prix : " + steelbookData.price + " €</p>" +
        "<p>Date d'achat : " + (steelbookData.purchaseDate ? steelbookData.purchaseDate.split("-").reverse().join("/") : "Non renseignée") + "</p>" +
        "<p>État : " + (steelbookData.condition || "Non renseigné") + "</p>" +
         "<p>Acheté sur : " + steelbookData.store + "</p>";

steelbook.style.marginBottom = "30px";
steelbookList.appendChild(steelbook);

    const editButton = document.createElement("button");
editButton.textContent = "Modifier";
editButton.onclick = function() {
    editSteelbook(steelbookData);
};

    const deleteButton =
document.createElement("button");
    deleteButton.textContent =
"Supprimer";


deleteButton.onclick = async function() {
    const user = auth.currentUser;

    if (!user) {
        alert("Connecte-toi pour supprimer un steelbook.");
        return;
    }

    const steelbooks =
        JSON.parse(localStorage.getItem("steelbooks")) || [];

    const updatedSteelbooks = steelbooks.filter(function(item) {
        return item.id !== steelbookData.id;
    });

    try {
        const reference = db
            .collection("users")
            .doc(user.uid)
            .collection("data")
            .doc("collection");

        await reference.set({
            steelbooks: updatedSteelbooks
        }, { merge: true });

        localStorage.setItem(
            "steelbooks",
            JSON.stringify(updatedSteelbooks)
        );

        steelbook.remove();
        updateStats();
        updateEmptyMessage();

    } catch (error) {
        console.error("Erreur de suppression :", error);
        alert("Impossible de supprimer le steelbook du cloud. Vérifie ta connexion.");
    }
};

steelbook.appendChild(editButton);
steelbook.appendChild(deleteButton);
}

function openAddForm() {
    editingSteelbookId = null;
    document.getElementById("form-title").textContent = "Ajouter un Steelbook";
    document.getElementById("title").value = "";
    document.getElementById("price").value = "";
    document.getElementById("purchase-date").value = "";
    document.getElementById("condition").selectedIndex = 0;
    document.getElementById("store").selectedIndex = 0;

    openForm();
}

function openForm() {
document.getElementById("form-container").style.display = "flex";
}

function closeForm() {
document.getElementById("form-container").style.display = "none";
}


function editSteelbook(steelbookData) {
    editingSteelbookId = steelbookData.id;

    document.getElementById("form-title").textContent = "Modifier le Steelbook";
    document.getElementById("title").value = steelbookData.title;
    document.getElementById("edition").value = steelbookData.edition || "";
    document.getElementById("price").value = steelbookData.price;
    document.getElementById("purchase-date").value = steelbookData.purchaseDate || "";
    document.getElementById("condition").value = steelbookData.condition || "Neuf";
    document.getElementById("store").value = steelbookData.store;

    openForm();
}


async function addSteelbook() {
    const user = auth.currentUser;

    if (!user) {
        alert("Connecte-toi pour enregistrer tes steelbooks.");
        return;
    }

    const title = document.getElementById("title").value;
    const edition = document.getElementById("edition").value;
    const price = document.getElementById("price").value;
    const store = document.getElementById("store").value;
    const purchaseDate = document.getElementById("purchase-date").value;
    const condition = document.getElementById("condition").value;

    let steelbooks =
        JSON.parse(localStorage.getItem("steelbooks")) || [];

    if (editingSteelbookId !== null) {
        const index = steelbooks.findIndex(function(item) {
            return item.id === editingSteelbookId;
        });

        if (index !== -1) {
            steelbooks[index].title = title;
            steelbooks[index].edition = edition;
            steelbooks[index].price = price;
            steelbooks[index].purchaseDate = purchaseDate;
            steelbooks[index].condition = condition;
            steelbooks[index].store = store;
        }
    } else {
        const steelbookData = {
            id: Date.now(),
            title: title,
            edition: edition,
            price: price,
            store: store,
            purchaseDate: purchaseDate,
            condition: condition
        };

        steelbooks.push(steelbookData);
    }

    try {
        const reference = db
            .collection("users")
            .doc(user.uid)
            .collection("data")
            .doc("collection");

        await reference.set({
            steelbooks: steelbooks
        }, { merge: true });

        localStorage.setItem(
            "steelbooks",
            JSON.stringify(steelbooks)
        );

        editingSteelbookId = null;

        document.getElementById("title").value = "";
        document.getElementById("price").value = "";
        document.getElementById("purchase-date").value = "";
        document.getElementById("condition").selectedIndex = 0;
        document.getElementById("store").selectedIndex = 0;

        const steelbookList =
            document.getElementById("steelbook-list");

        if (steelbookList) {
            steelbookList.innerHTML = "";
        }

        steelbooks.forEach(function(steelbookData) {
            displaySteelbook(steelbookData);
        });

        updateStats();
        updateEmptyMessage();
        closeForm();

    } catch (error) {
        console.error("Erreur d'enregistrement :", error);
        alert("Impossible d'enregistrer le steelbook dans le cloud. Vérifie ta connexion.");
    }
}


async function loadSteelbooks() {
    const user = auth.currentUser;

    if (!user) return;

    try {
        const reference = db
            .collection("users")
            .doc(user.uid)
            .collection("data")
            .doc("collection");

        const snapshot = await reference.get();
        const data = snapshot.exists ? snapshot.data() : {};

        const steelbooks = Array.isArray(data.steelbooks)
            ? data.steelbooks
            : [];

        const wishlist = Array.isArray(data.wishlist)
            ? data.wishlist
            : [];

        localStorage.setItem("steelbooks", JSON.stringify(steelbooks));
        localStorage.setItem("wishlist", JSON.stringify(wishlist));

        const steelbookList = document.getElementById("steelbook-list");
        if (steelbookList) {
            steelbookList.innerHTML = "";
        }

        steelbooks.forEach(function(steelbookData) {
            displaySteelbook(steelbookData);
        });

        displayWishlist();
        updateStats();
        updateEmptyMessage();

    } catch (error) {
        console.error("Erreur de chargement Firestore :", error);
        alert("Impossible de charger les données depuis le cloud. Vérifie ta connexion.");
    }
}

function updateStats() {
    const steelbooks =
        JSON.parse(localStorage.getItem("steelbooks")) || [];

    const wishlist =
        JSON.parse(localStorage.getItem("wishlist")) || [];

    document.getElementById("wishlist-count").textContent =
        wishlist.length;

    document.getElementById("steelbook-count").textContent =
        steelbooks.length;

    let totalSpent = 0;

steelbooks.forEach(function(steelbookData) {
    totalSpent +=
    Number(steelbookData.price) || 0;
});

document.getElementById("total-spent").textContent = 
totalSpent.toFixed(2).replace(".",",") + " €";
}

function updateEmptyMessage() {
    const steelbooks =
        JSON.parse(localStorage.getItem("steelbooks")) || [];

    const message =
        document.querySelector(".empty-message");

    if (steelbooks.length > 0) {
        message.style.display = "none";
    } else {
        message.style.display = "block";
    }
}

console.log("Nouveau script chargé");
updateStats();

const lastPage = localStorage.getItem("currentPage") || "home";
showPage(lastPage);

document.getElementById("steelbook-tab").onclick = function() {
    selectCollection("steelbook");
};

document.getElementById("wii-tab").onclick = function() {
    selectCollection("wii");
};

function selectCollection(collection) {
    document.getElementById("steelbook-tab").classList.toggle("active", collection === "steelbook");
    document.getElementById("wii-tab").classList.toggle("active", collection === "wii");

    document.getElementById("steelbook-section").style.display =
        collection === "steelbook" ? "block" : "none";

    document.getElementById("wii-section").style.display =
        collection === "wii" ? "block" : "none";
}

function showPage(page) {
    localStorage.setItem("currentPage", page);
    document.getElementById("home-section").style.display =
        page === "home" ? "block" : "none";

    document.getElementById("steelbook-section").style.display =
        page === "collection" ? "block" : "none";

    document.getElementById("wishlist-section").style.display =
        page === "wishlist" ? "block" : "none";
}

document.getElementById("home-button").onclick = function() {
    showPage("home");
};

document.getElementById("collection-button").onclick = function() {
    showPage("collection");
};

document.getElementById("wishlist-button").onclick = function() {
    showPage("wishlist");
};

function openWishlistForm() {
    document.getElementById("wishlist-form-title").textContent = "Ajouter une édition";
    document.getElementById("wishlist-title").value = "";
    document.getElementById("wishlist-edition").value = "";
    document.getElementById("wishlist-fnac").value = "";
    document.getElementById("wishlist-amazon").value = "";
    document.getElementById("wishlist-other").value = "";

    document.getElementById("wishlist-form-container").style.display = "flex";
}

function closeWishlistForm() {
    document.getElementById("wishlist-form-container").style.display = "none";
}


async function saveWishlistItem() {
    const user = auth.currentUser;

    if (!user) {
        alert("Connecte-toi pour enregistrer ta wishlist.");
        return;
    }

    const item = {
        id: editingWishlistId !== null ? editingWishlistId : Date.now(),
        title: document.getElementById("wishlist-title").value,
        edition: document.getElementById("wishlist-edition").value,
        fnac: document.getElementById("wishlist-fnac").value,
        amazon: document.getElementById("wishlist-amazon").value,
        other: document.getElementById("wishlist-other").value
    };

    if (!item.title.trim() || !item.edition.trim()) {
        alert("Remplis le titre du film et l'édition recherchée.");
        return;
    }

    let wishlist =
        JSON.parse(localStorage.getItem("wishlist")) || [];

    if (editingWishlistId !== null) {
    const index = wishlist.findIndex(function(existingItem) {
        return String(existingItem.id) === String(editingWishlistId);
    });

    if (index !== -1) {
        wishlist[index] = item;
    } else {
        wishlist.push(item);
    }
} else {
    wishlist.push(item);
}

    try {
        const reference = db
            .collection("users")
            .doc(user.uid)
            .collection("data")
            .doc("collection");

        await reference.set({
            wishlist: wishlist
        }, { merge: true });

        localStorage.setItem("wishlist", JSON.stringify(wishlist));

        editingWishlistId = null;

        document.getElementById("wishlist-title").value = "";
        document.getElementById("wishlist-edition").value = "";
        document.getElementById("wishlist-fnac").value = "";
        document.getElementById("wishlist-amazon").value = "";
        document.getElementById("wishlist-other").value = "";

        closeWishlistForm();
        displayWishlist();

    } catch (error) {
        console.error("Erreur d'enregistrement de la wishlist :", error);
        alert("Impossible d'enregistrer la wishlist dans le cloud. Vérifie ta connexion.");
    }
}

function displayWishlist() {
    const wishlistList = document.getElementById("wishlist-list");
    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

    wishlistList.innerHTML = "";

    wishlist.forEach(function(item) {
  const card = document.createElement("div");
card.className = "steelbook-card";

card.innerHTML =
    "<h3>" + item.title + "</h3>" +
    "<p>Édition : " + item.edition + "</p>";

const editButton = document.createElement("button");
editButton.textContent = "Modifier";

editButton.onclick = function() {
    editWishlistItem(item);
};

card.appendChild(editButton);

const collectionButton = document.createElement("button");
collectionButton.textContent = "Ajouter à ma collection";

collectionButton.onclick = function() {
    document.getElementById("title").value = item.title || "";
    document.getElementById("edition").value = item.edition || "";

    openForm();
};

card.appendChild(collectionButton);

        if (item.fnac) {
            card.innerHTML += '<p><a href="' + item.fnac + '" target="_blank">Voir sur Fnac</a></p>';
        }

        if (item.amazon) {
            card.innerHTML += '<p><a href="' + item.amazon + '" target="_blank">Voir sur Amazon</a></p>';
        }

        if (item.other) {
            card.innerHTML += '<p><a href="' + item.other + '" target="_blank">Autre boutique</a></p>';
        }

        wishlistList.appendChild(card);
        const deleteButton = document.createElement("button");
deleteButton.textContent = "Supprimer";


deleteButton.onclick = async function() {
    const user = auth.currentUser;

    if (!user) {
        alert("Connecte-toi pour supprimer un élément de la wishlist.");
        return;
    }

    const wishlist =
        JSON.parse(localStorage.getItem("wishlist")) || [];

    const updatedWishlist = wishlist.filter(function(wishlistItem) {
        return wishlistItem.id !== item.id;
    });

    try {
        const reference = db
            .collection("users")
            .doc(user.uid)
            .collection("data")
            .doc("collection");

        await reference.set({
            wishlist: updatedWishlist
        }, { merge: true });

        localStorage.setItem(
            "wishlist",
            JSON.stringify(updatedWishlist)
        );

        displayWishlist();

    } catch (error) {
        console.error("Erreur de suppression de la wishlist :", error);
        alert("Impossible de supprimer cet élément du cloud. Vérifie ta connexion.");
    }
};

card.appendChild(deleteButton);

function editWishlistItem(item) {
    editingWishlistId = item.id;

    document.getElementById("wishlist-form-title").textContent = "Modifier une édition";
    document.getElementById("wishlist-title").value = item.title;
    document.getElementById("wishlist-edition").value = item.edition;
    document.getElementById("wishlist-fnac").value = item.fnac;
    document.getElementById("wishlist-amazon").value = item.amazon;
    document.getElementById("wishlist-other").value = item.other;

    document.getElementById("wishlist-form-container").style.display = "flex";
}


document.getElementById("toggle-password").addEventListener("click", function () {
    const password = document.getElementById("login-password");
    const visible = password.type === "password";

    password.type = visible ? "text" : "password";
    this.textContent = visible ? "🙈" : "👁";
    this.setAttribute(
        "aria-label",
        visible ? "Masquer le mot de passe" : "Afficher le mot de passe"
    );
});
    })
}
