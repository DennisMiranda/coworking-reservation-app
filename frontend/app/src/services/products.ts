//Conect to Firestore
import { db } from "/src/services/firebase/firebase.client";
import { getDocs, collection, getDoc, doc } from "firebase/firestore";

//Get all products
export const getAllProducts = async () => {
  const products = await getDocs(collection(db, "products"));
  return products.docs.map((doc) => doc.data());
};

//Get product by id
export const getProductById = async (id: string) => {
  const product = await getDoc(doc(db, "products", id));
  return product.data();
};
