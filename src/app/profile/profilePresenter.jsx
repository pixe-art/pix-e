"use client";
import { useState, useEffect } from "react";
import ProfileView from "./profileView.jsx";
import { auth, storage } from "@/firebaseModel";
import { getDatabase, ref, get, update, onValue, off, remove} from "firebase/database";
import { app } from "/src/firebaseModel.js";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  getStorage,
} from "firebase/storage";
import { observer } from "mobx-react-lite";
import { useModel } from "../model-provider.js";
import { TW_center } from "../art-tool/tailwindClasses.js";

export default observer(function Profile() {
  const model = useModel();
  const [pictures, setPictures] = useState([]);
  const [profile, setProfile] = useState({
    username: "Loading...",
    bio: "",
    avatar: "https://firebasestorage.googleapis.com/v0/b/pix-e-b9fab.appspot.com/o/avatars%2Fdefault.png?alt=media&token=39e999d9-aed3-4e95-a9dc-5a96ae3d7e28",
  });

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (uid) {
      fetchProfileData(uid);
      fetchPictures(uid);
    }

    return () => {
      if (uid) {
        const db = getDatabase();
        const profileRef = ref(db, `pixeModel/users/${uid}/profile`);
        off(profileRef);
      }
    };
  }, [auth.currentUser]);

  const saveBioToFirebase = (newBio) => {
    const uid = auth.currentUser?.uid;
    if (uid) {
      const db = getDatabase();
      const bioRef = ref(db, `pixeModel/users/${uid}/profile`);
      update(bioRef, { bio: newBio })
        .then(() => {
          setProfile((prevProfile) => ({ ...prevProfile, bio: newBio }));
        })
        .catch((error) => {
          console.error("Failed to save bio:", error);
        });
    }
  };

  const saveAvatarToFirebase = (avatarFile) => {
    const uid = auth.currentUser?.uid;
    if (uid && avatarFile) {
      const path = storageRef(storage, `avatars/${uid}`);

      uploadBytes(path, avatarFile)
        .then((snapshot) => {
          console.log("Uploaded a blob or file!", snapshot);
          getDownloadURL(path)
            .then((downloadURL) => {
              console.log("File available at", downloadURL);
              const db = getDatabase();
              const profileRef = ref(db, `pixeModel/users/${uid}/profile`);
              update(profileRef, { avatar: downloadURL })
                .then(() => {
                  console.log("Avatar link updated successfully in Realtime Database.");
                  setProfile((prevProfile) => ({
                    ...prevProfile,
                    avatar: downloadURL,
                  }));
                })
                .catch((error) => {
                  console.error("Failed to update avatar link in Realtime Database:", error);
                });
            })
            .catch((error) => {
              console.error("Error getting download URL:", error);
            });
        })
        .catch((error) => {
          console.error("Error uploading file:", error);
        });
    }
  };

  const fetchProfileData = (uid) => {
    const db = getDatabase();
    const profileRef = ref(db, `pixeModel/users/${uid}/profile`);
    onValue(profileRef, (snapshot) => {
      if (snapshot.exists()) {
        const profileData = snapshot.val() || {};
        setProfile({
          username: profileData.username || "",
          bio: profileData.bio || "",
          avatar: profileData.avatar !== undefined
            ? profileData.avatar
            : "https://firebasestorage.googleapis.com/v0/b/pix-e-b9fab.appspot.com/o/avatars%2Fdefault.png?alt=media&token=39e999d9-aed3-4e95-a9dc-5a96ae3d7e28",
        });
      } else {
        setProfile({
          username: "Not found",
          bio: "",
          avatar: "https://firebasestorage.googleapis.com/v0/b/pix-e-b9fab.appspot.com/o/avatars%2Fdefault.png?alt=media&token=39e999d9-aed3-4e95-a9dc-5a96ae3d7e28",
        });
        console.log("No data available for profile.");
      }
    }, (error) => {
      console.error("Error fetching profile data:", error);
    });
  };

  const fetchPictures = (uid) => {
    const db = getDatabase();
    const imagesRef = ref(db, `pixeModel/users/${uid}/images`);
    get(imagesRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          setPictures(Object.values(snapshot.val()));
        } else {
          console.log("No data available for images.");
          setPictures([]);
        }
      })
      .catch((error) => {
        console.error("Failed to load profile:", error);
      });
  };

  function addToFavourites(image) {
    const userId = model.user.uid;
    model.users[userId].favorites = [...model.users[userId].favorites, image];
}

function removeFavourite(id) {
    const favArray = [];
    for (const element of model.users[model.user.uid].favorites) {
        if (id === element.id){
            continue;
        }
        favArray.push(element);
    }
    model.users[model.user.uid].favorites = favArray;

    if (favArray.length === 0) {
        const db = getDatabase(app);
        const favRef = dbRef(db, 'pixeModel/users/' + model.user.uid + '/favorites/' + id); 
        
        remove(favRef)
            .then(() => {
                console.log(`Removed favourite with name: ${id}`);
            })
            .catch((error) => {
                console.error(`Error removing favourite: ${error}`);
        });
    }
}

  if (!model.userReady || !model.ready) {
    return (
      <div>
        <img className={TW_center} src="https://brfenergi.se/iprog/loading.gif" alt="Loading gif" />
      </div>
    );
  }

  return (
    <ProfileView
      model={model}
      pictures={pictures}
      profile={profile}
      saveBioToFirebase={saveBioToFirebase}
      saveAvatarToFirebase={saveAvatarToFirebase}
      isOwnProfile={true}
      removeFavourite={removeFavourite}
      addToFavourites={addToFavourites}
    />
  );
});
