import { useEffect, useState } from "react";

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { auth, db } from "../lib/firebase";
import "../styles/fonts.css";
import "../styles/wishlist.css";


type WishlistItem = {
  id: string;
  text: string;
  createdAt?: unknown;
};



export default function WishlistApp() {

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);


  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");



  const [items, setItems] = useState<WishlistItem[]>([]);

  const [newItem, setNewItem] = useState("");



  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");





  // Sprawdzanie sesji Firebase

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {

        setUser(currentUser);
        setLoading(false);

      }
    );


    return () => unsubscribe();

  }, []);







  // Pobieranie wishlisty realtime

  useEffect(() => {

    if (!user) {
      return;
    }


    const unsubscribe = onSnapshot(
      collection(db, "wishlist"),
      (snapshot) => {


        const data = snapshot.docs.map((document) => ({

          id: document.id,
          ...document.data(),

        })) as WishlistItem[];



        setItems(data);

      }
    );



    return () => unsubscribe();


  }, [user]);








  // LOGIN

  async function handleLogin() {

    setError("");



    if (login !== "Martynka") {

      setError(
        "Niepoprawny login lub hasło"
      );

      return;

    }



    try {


      await signInWithEmailAndPassword(

        auth,

        "martynka@wishlist.pl",

        password

      );



    } catch {


      setError(
        "Niepoprawny login lub hasło"
      );


    }

  }








  // CREATE

  async function addItem() {


    if (!newItem.trim()) {

      return;

    }



    await addDoc(

      collection(
        db,
        "wishlist"
      ),

      {

        text: newItem.trim(),

        createdAt: serverTimestamp(),

      }

    );



    setNewItem("");

  }








  // DELETE

  async function removeItem(
    id: string
  ) {


    await deleteDoc(

      doc(
        db,
        "wishlist",
        id
      )

    );


  }








  // UPDATE

  async function updateItem(
    id: string
  ) {


    if (!editingText.trim()) {

      return;

    }



    await updateDoc(

      doc(
        db,
        "wishlist",
        id
      ),

      {

        text:
          editingText.trim(),

      }

    );



    setEditingId(null);

    setEditingText("");

  }









  if (loading) {

    return (

      <div className="wishlist-page">

        <h2>
          Ładowanie...
        </h2>

      </div>

    );

  }









  return (

    <main className="wishlist-page">


      <div className="container">


        {
          !user ? (


            <section className="login-box">


              <h1>
                ❤️ Wishlist
              </h1>



              <input

                value={login}

                onChange={(event) =>
                  setLogin(
                    event.target.value
                  )
                }

                placeholder="Login"

              />



              <input

                type="password"

                value={password}

                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }

                placeholder="Hasło"

              />



              <button
                onClick={handleLogin}
              >

                Zaloguj

              </button>




              {
                error && (

                  <p className="error">

                    {error}

                  </p>

                )
              }


            </section>



          ) : (



            <section className="wishlist-box">



              <header className="wishlist-header">


                <h1>
                  ❤️ Lista życzeń
                </h1>



                <button

                  onClick={() =>
                    signOut(auth)
                  }

                >

                  Wyloguj

                </button>


              </header>








              <div className="add-section">


                <input

                  value={newItem}

                  onChange={(event) =>
                    setNewItem(
                      event.target.value
                    )
                  }

                  placeholder="Dodaj pomysł na prezent..."

                  onKeyDown={(event) => {

                    if (
                      event.key === "Enter"
                    ) {

                      addItem();

                    }

                  }}

                />



                <button

                  onClick={addItem}

                >

                  ▶

                </button>



              </div>









              <div className="wishlist-list">


                {
                  items.map((item) => (


                    <div

                      key={item.id}

                      className="wishlist-card"

                    >



                      {

                        editingId === item.id ? (


                          <>


                            <input

                              value={editingText}

                              onChange={(event) =>
                                setEditingText(
                                  event.target.value
                                )
                              }

                            />



                            <button

                              onClick={() =>
                                updateItem(
                                  item.id
                                )
                              }

                            >

                              ✔️

                            </button>


                          </>



                        ) : (


                          <>


                            <span>

                              {item.text}

                            </span>



                            <div>


                              <button

                                onClick={() => {

                                  setEditingId(
                                    item.id
                                  );

                                  setEditingText(
                                    item.text
                                  );

                                }}

                              >

                                ✏️

                              </button>





                              <button

                                onClick={() =>
                                  removeItem(
                                    item.id
                                  )
                                }

                              >

                                🗑️

                              </button>


                            </div>



                          </>

                        )

                      }



                    </div>


                  ))

                }


              </div>



            </section>


          )

        }



      </div>


    </main>

  );

}