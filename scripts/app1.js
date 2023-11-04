function createListItems(data, listId) {
  let list = document.getElementById(listId);
  list.innerHTML = ""; // Очистка списка перед добавлением новых элементов

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
              data[key] = response.data;
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
  modalBody.innerHTML = ""; // Очистка содержимого модального окна перед добавлением новых данных

  for (let key in data) {
    let value = data[key];
    if (typeof value !== "string") {
      continue;
    }
    let detailItem = document.createElement("p");
    detailItem.textContent = `${key}: ${value}`;
    modalBody.appendChild(detailItem);
  }
  // Открытие модального окна
  let modal = new bootstrap.Modal(document.getElementById("exampleModal"));
  modal.show();
}

function fetchData(url, listId) {
  axios.get(url)
    .then(function (response) {
      let data = response.data.results;
      createListItems(data, listId);
    })
    .catch(function (error) {
      console.log(error);
    });
}

document.getElementById("peopleButton").addEventListener("click", function () {
  fetchData("https://swapi.dev/api/people/", "peopleList");
});

document.getElementById("vehiclesButton").addEventListener("click", function () {
  fetchData("https://swapi.dev/api/vehicles/", "vehiclesList");
});

document.getElementById("planetsButton").addEventListener("click", function () {
  fetchData("https://swapi.dev/api/planets/", "planetsList");
});