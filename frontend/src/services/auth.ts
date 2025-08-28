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

import { auth, db } from "./firebase";

//Import UserCredential interface
import { type UserCredential } from "../models/user";

//Intsance of object to manage credentials
const googleAuthProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleAuthProvider);
    const saveUser = result.user;
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
    return saveUser;
  } catch (error) {
    const result = { success: false, message: "Error signing in with Google" };
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
    return user;
  } catch (error) {
    console.error("Error signing up: ", error);
    return { success: false, message: "Error signing up" };
  }
};

//Login with email
export const signInWithEmail = async (email: string, pass: string) => {
  try {
    await signInWithEmailAndPassword(auth, email, pass);
    return { success: true, message: "Success" };
  } catch (error: unknown) {
    const result = { success: false, message: "Error signing in" };
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
  } catch (error) {
    console.error("Error signing out: ", error);
  }
};
