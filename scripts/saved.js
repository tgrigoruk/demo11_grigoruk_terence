firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    getBookmarks(user);
  } else {
    console.log("No user is signed in");
  }
});

function getBookmarks(user) {
  db.collection("users").doc(user.uid).get().then(userDoc => {
      thisUser = userDoc.data();
      var bookmarks = thisUser.bookmarks;
      // console.log("bookmarks: " + bookmarks);
      let cardTemplate = document.getElementById("hikeCardTemplate");
    
    bookmarks.forEach(thisHikeID => {
        db.collection("Hikes").where('id', '==', thisHikeID).get().then(snap => {
            size = snap.size;
            queryData = snap.docs;
            if (size == 1){
                var doc = queryData[0].data();
                var hikeName = doc.name;
                var hikeID = doc.id;
                var hikeLength = doc.length;
                let newCard = cardTemplate.content.cloneNode(true);
                newCard.querySelector('.card-title').innerHTML = hikeName;
                newCard.querySelector('.card-length').innerHTML = hikeLength;
                newCard.querySelector('a').onclick = () => setHikeData(hikeID);
                newCard.querySelector('img').src = `./images/${hikeID}.jpg`;
                hikeCardGroup.appendChild(newCard);

            }else{
                console.log("Query result has multiple entries")
            }
        })
    })
  })
}
