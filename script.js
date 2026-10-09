let editingSteelbookId = null;

function displaySteelbook(steelbookData) {
    const steelbookList =
document.getElementById("steelbook-list");

    const steelbook =
document.createElement("div");
    steelbook.className =
"steelbook-card";

    steelbook.innerHTML =
        "<h3>" + steelbookData.title + "</h3>" +
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

    deleteButton.onclick = function() 
{
        steelbook.remove();

        let steelbooks =
    JSON.parse(localStorage.getItem("steelbooks")) || [];

    steelbooks =
steelbooks.filter(function(item) {
    return item.id !==
steelbookData.id;
    });

localStorage.setItem("steelbooks",
JSON.stringify(steelbooks));
updateStats();
updateEmptyMessage();
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
    document.getElementById("price").value = steelbookData.price;
    document.getElementById("purchase-date").value = steelbookData.purchaseDate || "";
    document.getElementById("condition").value = steelbookData.condition || "Neuf";
    document.getElementById("store").value = steelbookData.store;

    openForm();
}

function addSteelbook() {
    if (editingSteelbookId !== null) {
    let steelbooks = JSON.parse(localStorage.getItem("steelbooks")) || [];

    const index = steelbooks.findIndex(function(item) {
        return item.id === editingSteelbookId;
    });

    if (index !== -1) {
        steelbooks[index].title = document.getElementById("title").value;
        steelbooks[index].price = document.getElementById("price").value;
        steelbooks[index].purchaseDate = document.getElementById("purchase-date").value;
        steelbooks[index].condition = document.getElementById("condition").value;
        steelbooks[index].store = document.getElementById("store").value;
    }

    localStorage.setItem("steelbooks", JSON.stringify(steelbooks));
    localStorage.setItem("steelbooks", JSON.stringify(steelbooks));

editingSteelbookId = null;

document.getElementById("title").value = "";
document.getElementById("price").value = "";
document.getElementById("purchase-date").value = "";
document.getElementById("condition").selectedIndex = 0;
document.getElementById("store").selectedIndex = 0;
document.getElementById("purchase-date").value = "";
document.getElementById("condition").selectedIndex = 0;

closeForm();
location.reload();
return;
}
    const title = document.getElementById("title").value;
    const price = document.getElementById("price").value;
    const store = document.getElementById("store").value;
    const purchaseDate = document.getElementById("purchase-date").value;
    const condition = document.getElementById("condition").value;
    const steelbookData = {
    id: Date.now(),
    title: title,
    price: price,
    store: store,
    purchaseDate: purchaseDate,
    condition: condition,
};

let steelbooks =
JSON.parse(localStorage.getItem("steelbooks")) || [];

steelbooks.push(steelbookData);

localStorage.setItem("steelbooks",
JSON.stringify(steelbooks));

displaySteelbook(steelbookData);

updateStats();
updateEmptyMessage();

document.getElementById("title").value = "";
document.getElementById("price").value = "";
document.getElementById("store").selectedIndex = 0;

closeForm();
}

function loadSteelbooks() {
    const savedSteelbooks =
localStorage.getItem("steelbooks");

console.log(savedSteelbooks);

    if (savedSteelbooks) {
        const steelbooks =
    JSON.parse(savedSteelbooks);

     console.log(steelbooks);

steelbooks.forEach(function(steelbookData, index) {
    if (!steelbookData.id){
        steelbookData.id = Date.now() + index;
}

    displaySteelbook(steelbookData);
        });
    if (steelbooks.length > 0) {
        document.querySelector(".empty-message").style.display = "none";
    }

localStorage.setItem("steelbooks",
JSON.stringify(steelbooks));
updateStats();
updateEmptyMessage();
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
loadSteelbooks();
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

function saveWishlistItem() {
    const item = {
        id: Date.now(),
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

   let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

if (editingWishlistId !== null) {
    wishlist = wishlist.map(function(existingItem) {
        return existingItem.id === editingWishlistId
            ? { ...item, id: editingWishlistId }
            : existingItem;
    });

    editingWishlistId = null;
} else {
    wishlist.push(item);
}

localStorage.setItem("wishlist", JSON.stringify(wishlist));

    closeWishlistForm();
    displayWishlist();
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

deleteButton.onclick = function() {
    let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

    wishlist = wishlist.filter(function(wishlistItem) {
        return wishlistItem.id !== item.id;
    });

    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    displayWishlist();
};

card.appendChild(deleteButton);
    });
}

displayWishlist();

let editingWishlistId = null;

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