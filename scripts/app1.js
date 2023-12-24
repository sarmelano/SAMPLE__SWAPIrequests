function createListItems(data, listId) {
  let list = document.getElementById(listId);
  list.innerHTML = ""; // Clearing the list before adding new items

  data.forEach(function (item) {
    let listItem = document.createElement("li");
    listItem.classList.add("item");
    listItem.textContent = item.name;
    listItem.addEventListener("click", function () {
      fetchDetails(item.url);
    });
    list.appendChild(listItem);
  });
}

function fetchDetails(url) {
  axios.get(url)
    .then(function (response) {
      let data = response.data;
      return data;
    })
    .then(function (data) {
      return Promise.all(
        Object.entries(data).map(([key, value]) => {
          if (typeof value === "string" && value.startsWith("http")) {
            return axios.get(value).then(function (response) {
              data[key] = response.data.name || response.data.title;
            });
          }
        })
      ).then(function () {
        displayModal(data);
      });
    })
    .catch(function (error) {
      console.log(error);
    });
}

function displayModal(data) {
  let modalBody = document.getElementById("modalBody");
  modalBody.innerHTML = ""; // Clearing the contents of the modal window before adding new data

  for (let key in data) {
    let value = data[key];
    if (typeof value !== "string") {
      continue;
    }
    let detailItem = document.createElement("p");
    detailItem.textContent = `${key}: ${value}`;
    modalBody.appendChild(detailItem);
  }
  // Open modal
  let modal = new bootstrap.Modal(document.getElementById("exampleModal"));
  modal.show();
}

function fetchData(url, listId, loaderId, page = 1, paginationId) {
  const list = document.getElementById(listId);
  list.innerHTML = ''; // Clean list
  showLoader(loaderId, true); // Show the loading indicator
  const paginatedUrl = `${url}?page=${page}`;
  axios.get(paginatedUrl)
    .then(function (response) {
      showLoader(loaderId, false); // Hiding the loading indicator
      let data = response.data;
      createListItems(data.results, listId);
      updatePagination(data.count, page, url, listId, loaderId, paginationId);
    })
    .catch(function (error) {
      showLoader(loaderId, false); // Hide the boot indicator in case of an error
      console.log(error);
    });
}

function showLoader(loaderId, show) {
  const loader = document.getElementById(loaderId);
  if (loader) {
    loader.style.display = show ? 'block' : 'none';
  }
}

function updatePagination(totalItems, currentPage, url, listId, loaderId, paginationId) {
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const maxPageButtons = 4;
  const paginationContainer = document.getElementById(paginationId);
  paginationContainer.innerHTML = '';

  // Previous btn create
  const prevButton = document.createElement('button');
  prevButton.textContent = '<';
  prevButton.classList.add('page-button');
  if (currentPage === 1) {
    prevButton.classList.add('disabled');
  }
  prevButton.addEventListener('click', function () {
    if (currentPage > 1) {
      fetchData(url, listId, loaderId, currentPage - 1, paginationId);
    }
  });
  paginationContainer.appendChild(prevButton);

  let startPage = Math.max(currentPage - Math.floor(maxPageButtons / 2), 1);
  let endPage = Math.min(startPage + maxPageButtons - 1, totalPages);

  if (endPage - startPage < maxPageButtons - 1) {
    startPage = Math.max(endPage - maxPageButtons + 1, 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i;
    pageButton.classList.add('page-button');
    if (currentPage === i) {
      pageButton.classList.add('active');
    }
    pageButton.addEventListener('click', function () {
      fetchData(url, listId, loaderId, i, paginationId);
    });
    paginationContainer.appendChild(pageButton);
  }

  // Next btn create
  const nextButton = document.createElement('button');
  nextButton.textContent = '>';
  nextButton.classList.add('page-button');
  if (currentPage === totalPages) {
    nextButton.classList.add('disabled');
  }
  nextButton.addEventListener('click', function () {
    if (currentPage < totalPages) {
      fetchData(url, listId, loaderId, currentPage + 1, paginationId);
    }
  });
  paginationContainer.appendChild(nextButton);
}

document.getElementById("peopleButton").addEventListener("click", function () {
  fetchData("https://swapi.dev/api/people/", "peopleList", "peopleLoader", 1, "peoplePagination");
});

document.getElementById("vehiclesButton").addEventListener("click", function () {
  fetchData("https://swapi.dev/api/vehicles/", "vehiclesList", "vehiclesLoader", 1, "vehiclesPagination");
});

document.getElementById("planetsButton").addEventListener("click", function () {
  fetchData("https://swapi.dev/api/planets/", "planetsList", "planetsLoader", 1, "planetsPagination");
});