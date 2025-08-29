import { atom } from "nanostores";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../services/firebase";


export type UserState={
    isLoading:boolean;
    data:User | null;
}

//Atom to store user state
export const $user=atom<UserState>({isLoading:true,data:null});

onAuthStateChanged(auth, (user)=>{
  $user.set({isLoading:false,data:user});
});