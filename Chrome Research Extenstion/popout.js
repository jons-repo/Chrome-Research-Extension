// create the context menu
chrome.contextMenus.remove("add-to-research");
chrome.contextMenus.create({
  id: "add-to-research",
  title: "Add to Research",
  contexts: ["selection"]
});

// listen for when the context menu is clicked
chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (!localStorage.getItem('search-items')) {
    localStorage.setItem('search-items', JSON.stringify([]));
  }

  if (info.menuItemId === "add-to-research") {
    // get the selected text from the page
    var selectedText = info.selectionText;
    // store the selected text
    var itemsStorage = localStorage.getItem('search-items');
    var itemsArr = JSON.parse(itemsStorage);

    // check if the items array is null before trying to push to it
    if (!itemsArr) {
      itemsArr = []
    }

    itemsArr.push({ "item": selectedText });
    localStorage.setItem('search-items', JSON.stringify(itemsArr));
    saveItems(itemsArr);
    fetchItems();
  }
});

// button listeners
document.querySelector('.create-search').addEventListener('click', function () {
  document.querySelector('.new-item').style.display = 'block';
});

document.querySelector('.new-item button').addEventListener('click', function () {
  var itemName = document.querySelector('.new-item input').value;
  if (itemName != '') {

    var itemsStorage = localStorage.getItem('search-items');
    var itemsArr = JSON.parse(itemsStorage);
    itemsArr.push({ "item": itemName });
    saveItems(itemsArr);
    fetchItems();
    document.querySelector('.new-item input').value = '';
    document.querySelector('.new-item').style.display = 'none';
  }
});

// take items from local storage and display them in the extension's UI
function fetchItems() {
  if (!localStorage.getItem('search-items')) {
    localStorage.setItem('search-items', JSON.stringify([]));
  }
  const itemsList = document.querySelector('ul.search-items');
  itemsList.innerHTML = '';
  var newItemHTML = '';

  var itemsStorage = localStorage.getItem('search-items');
  var itemsArr = JSON.parse(itemsStorage);

  for (var i = 0; i < itemsArr.length; i++) {
    newItemHTML += `<li data-itemindex="${i}">
      ${itemsArr[i].item}
      <div><span class="itemSearch">🔍</span><span class="itemDelete">🗑️</span></div>
      </li>`;
  }

  itemsList.innerHTML = newItemHTML;

  var itemsListUL = document.querySelectorAll('ul li');
  for (var i = 0; i < itemsListUL.length; i++) {
    itemsListUL[i].querySelector('.itemSearch').addEventListener('click', function () {
      // index of item that was clicked
      var index = this.parentNode.parentNode.dataset.itemindex;
      itemSearch(index);
    });
    itemsListUL[i].querySelector('.itemDelete').addEventListener('click', function () {
      var index = this.parentNode.parentNode.dataset.itemindex;
      itemDelete(index);
    });
  }
}

// search the item item in Google
function searchWithGoogle(searchString) {
  const encodedSearchString = encodeURIComponent(searchString);
  const googleSearchUrl = `https://www.google.com/search?q=${encodedSearchString}`;
  chrome.tabs.create({ url: googleSearchUrl });
}

function itemSearch(index) {

  var itemsStorage = localStorage.getItem('search-items');
  var itemsArr = JSON.parse(itemsStorage);

  // Google's function
  searchWithGoogle(itemsArr[index].item);

  itemDelete(index);
}

// delete item by its index
function itemDelete(index) {

  var itemsStorage = localStorage.getItem('search-items');
  var itemsArr = JSON.parse(itemsStorage);

  // remove from items array
  itemsArr.splice(index, 1);

  // save updated to local storage
  saveItems(itemsArr);

  // remove item from extension UI
  document.querySelector('ul.search-items li[data-itemindex="' + index + '"]').remove();
}

// save to local storage
function saveItems(itemsArr) {
  localStorage.setItem('search-items', JSON.stringify(itemsArr));
}

fetchItems();
