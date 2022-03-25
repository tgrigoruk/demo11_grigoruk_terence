var currentUser;
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    currentUser = db.collection("users").doc(user.uid); //global

    // the following functions are always called when someone is logged in
    read_display_Quote();
    insertName();
    populateCardsDynamically();
  } else {
    // No user is signed in.
    console.log("No user is signed in");
    window.location.href = "login.html";
  }
});

function read_display_Quote() {
  const weekday = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const d = new Date();
  let day = weekday[d.getDay()];
  db.collection("quotes")
    .doc(day)
    .onSnapshot(function (dayDoc) {
      //console.log(tuesdayDoc.data());
      document.getElementById("quote-goes-here").innerHTML =
        dayDoc.data().quote;
    });
}
// read_display_Quote()

// Insert name function using the global variable "currentUser"
function insertName() {
  currentUser.get().then((userDoc) => {
    //get the user name
    var user_Name = userDoc.data().name;
    console.log("User name: " + user_Name);
    $("#name-goes-here").text(user_Name); //jquery
    // document.getElementByID("name-goes-here").innetText=user_Name;
  });
}
// insertName()

function populateCardsDynamically() {
  let hikeCardTemplate = document.getElementById("hikeCardTemplate"); //card template
  let hikeCardGroup = document.getElementById("hikeCardGroup"); //where to append card
  var userBookmarks;
  currentUser.get().then((userDoc) => {
    userBookmarks = userDoc.data().bookmarks;
  });

  db.collection("Hikes")
    .orderBy("length") //NEW LINE;  what do you want to sort by?
    .limit(3) //NEW LINE:  how many do you want to get?
    .get()
    .then((allHikes) => {
      allHikes.forEach((doc) => {
        {
          var hikeName = doc.data().name; //gets the name field
        var hikeID = doc.data().id; //gets the unique ID field
        var hikeLength = doc.data().length; //gets the length field
        let testHikeCard = hikeCardTemplate.content.cloneNode(true);
        testHikeCard.querySelector(".card-title").innerHTML = hikeName;
        testHikeCard.querySelector(".card-length").innerHTML = hikeLength;
        "Length: " +
          doc.data().length +
          " km <br>" +
          "Duration: " +
          doc.data().duration +
          "min <br>" +
          "Last updated: " +
          doc.data().last_updated.toDate();

        testHikeCard.querySelector("a").onclick = () => setHikeData(hikeID);

        //set the id attribute for the <i> tag in the format of "save-hikeID"
        //so later we know which hike to bookmark based on which hike was clicked
        testHikeCard.querySelector("i").id = "save-" + hikeID;
        // this line will call a function to save the hikes to the user's document
        testHikeCard.querySelector("i").onclick = () => saveBookmark(hikeID);
        }
        if (userBookmarks.includes(hikeID)) {
          testHikeCard.querySelector("i").innerHTML = "bookmark";
        }

        // "Read more" button redirects to page with info on the hike clicked
        testHikeCard.querySelector(".read-more").href =
          "eachHike.html?hikeName=" + hikeName + "&id=" + hikeID;

        testHikeCard.querySelector("img").src = `./images/${hikeID}.jpg`;
        hikeCardGroup.appendChild(testHikeCard);
      });
    });
}
// populateCardsDynamically()

//-----------------------------------------------------------------------------
// This function is called whenever the user clicks on the "bookmark" icon.
// It adds the hike to the "bookmarks" array
// Then it will change the bookmark icon from the hollow to the solid version.
//-----------------------------------------------------------------------------
function saveBookmark(hikeID) {
  currentUser.get().then((userDoc) => {
    if (userDoc.data().bookmarks.includes(hikeID)) {
      currentUser
        .set(
          {
            bookmarks: firebase.firestore.FieldValue.arrayRemove(hikeID),
          }
        )
        .then(function () {
          console.log("bookmark has been removed for: " + currentUser);
          var iconID = "save-" + hikeID;
          //console.log(iconID);
          document.getElementById(iconID).innerText = "bookmark_border";
        });
    } else {
      currentUser
        .set(
          {
            bookmarks: firebase.firestore.FieldValue.arrayUnion(hikeID),
          },
          {
            merge: true,
          }
        )
        .then(function () {
          console.log("bookmark has been saved for: " + currentUser);
          var iconID = "save-" + hikeID;
          //console.log(iconID);
          document.getElementById(iconID).innerText = "bookmark";
        });
    }
  });
}

function setHikeData(id) {
  console.log("hikeID: " + hikeID);
  localStorage.setItem("hikeID", id);
}

// function writeHikes() {
//   //define a variable for the collection you want to create in Firestore to populate data
//   var hikesRef = db.collection("Hikes");

//   hikesRef.add({
//     id: "BBY01",
//     name: "Burnaby Lake Park Trail", //replace with your own city?
//     city: "Burnaby",
//     province: "BC",
//     level: "easy",
//     length: 10, //number value
//     length_time: 60, //number value
//     last_updated: firebase.firestore.FieldValue.serverTimestamp(), //current system time
//   });
//   hikesRef.add({
//     id: "AM01",
//     name: "Buntzen Lake Trail", //replace with your own city?
//     city: "Anmore",
//     province: "BC",
//     level: "moderate",
//     length: 10.5, //number value
//     length_time: 80, //number value
//     last_updated: firebase.firestore.Timestamp.fromDate(
//       new Date("March 10, 2022")
//     ),
//   });
//   hikesRef.add({
//     id: "NV01",
//     name: "Mount Seymour Trail", //replace with your own city?
//     city: "North Vancouver",
//     province: "BC",
//     level: "hard",
//     length: 8.2, //number value
//     length_time: 120, //number value
//     last_updated: firebase.firestore.Timestamp.fromDate(
//       new Date("January 1, 2022")
//     ),
//   });
// }
