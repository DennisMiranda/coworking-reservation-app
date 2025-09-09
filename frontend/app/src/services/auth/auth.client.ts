// Register with firebase
import {
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";

import { doc, setDoc } from "firebase/firestore";

import { auth, db } from "/src/services/firebase/firebase.client";

//Import UserCredential interface
import { type UserCredential } from "/src/models/user";

//Intsance of object to manage credentials
const googleAuthProvider = new GoogleAuthProvider();

export const getSessionCookies = async (idToken: string) => {
  return fetch("/api/auth/signin", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });
};

export const signInWithGoogle = async () => {
  try {
    const userCredential = await signInWithPopup(auth, googleAuthProvider);
    const saveUser = userCredential.user;
    const token = await saveUser.getIdToken();
    await setDoc(
      doc(db, "users", saveUser.uid),
      {
        name: saveUser.displayName?.split(" ")[0] || "",
        lastName: saveUser.displayName?.split(" ").slice(1).join(" ") || "",
        email: saveUser.email,
        displayName: saveUser.displayName || saveUser.email?.split("@")[0],
        provider: "google",
        createAt: new Date(),
        lastLogin: new Date(),
        role: "user",
      },
      { merge: true }
    );
    return {
      success: true,
      message: "Success",
      data: { user: saveUser, token },
    };
  } catch (error) {
    const result = {
      success: false,
      message: "Error signing in with Google",
      data: null,
    };
    console.error("Error signing in with Google", error);
    if (error instanceof Error) {
      const errorMessage = error.toString();
      if (errorMessage.includes("auth/popup-blocked")) {
        result.message = "Please enable popups in your browser";
      } else if (errorMessage.includes("auth/popup-closed-by-user")) {
        result.message = "";
      }
    }
    return result;
  }
};

//Register with email and password in Firestore
export const signUpWithEmail = async (
  newUserCredential: UserCredential,
  role: "user" | "admin" = "user"
) => {
  try {
    const { name, lastName, email, pass } = newUserCredential;
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      pass
    );
    const user = userCredential.user;
    const token = await user.getIdToken();

    await setDoc(doc(db, "users", user.uid), {
      name,
      lastName,
      email,
      displayName: user.email?.split("@")[0],
      createAt: new Date(),
      lastLogin: new Date(),
      role,
      provider: "email",
    });
    return { success: true, message: "Success", data: { user, token } };
  } catch (error) {
    console.error("Error signing up: ", error);
    return { success: false, message: "Error signing up", data: null };
  }
};

//Login with email
export const signInWithEmail = async (email: string, pass: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;
    const token = await user.getIdToken();
    return { success: true, message: "Success", data: { user, token } };
  } catch (error: unknown) {
    const result = { success: false, message: "Error signing in", data: null };
    console.error("Error signing in: ", error);
    if (
      error instanceof Error &&
      error.toString().includes("auth/invalid-credential")
    ) {
      result.message = "Invalid credentials";
    }
    return result;
  }
};

//Logout function
export const logOut = async () => {
  try {
    await signOut(auth);
    return { success: true, message: "Success" };
  } catch (error) {
    console.error("Error signing out: ", error);
    return { success: false, message: "Error signing out" };
  }
};
