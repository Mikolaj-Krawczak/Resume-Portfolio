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

// SVG Icons
const EditIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const DeleteIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

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

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });





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

  // Countdown timer do 4 września
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      let targetDate = new Date(currentYear, 8, 4); // Wrzesień to miesiąc 8 (0-indexed)
      
      // Jeśli data już minęła w tym roku, ustawić na przyszły rok
      if (now > targetDate) {
        targetDate = new Date(currentYear + 1, 8, 4);
      }

      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);








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
                ❤️ Wishlist ❤️
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

                placeholder="Password"

              />



              <button
                onClick={handleLogin}
              >

                Sign in

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
                  ❤️ Wishlist ❤️
                </h1>

                <div className="wishlist-header-right">

                  <div className="countdown-timer">
                    <span className="countdown-value">{timeLeft.days.toString().padStart(2, '0')}</span>
                    <span className="countdown-label">dni</span>
                    <span className="countdown-separator">:</span>
                    <span className="countdown-value">{timeLeft.hours.toString().padStart(2, '0')}</span>
                    <span className="countdown-label">godz</span>
                    <span className="countdown-separator">:</span>
                    <span className="countdown-value">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                    <span className="countdown-label">min</span>
                    <span className="countdown-separator">:</span>
                    <span className="countdown-value">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                    <span className="countdown-label">sek</span>
                  </div>

                  <button

                    onClick={() =>
                      signOut(auth)
                    }

                  >

                  Logout

                </button>

                </div>

              </header>








              <div className="add-section">


                <input

                  value={newItem}

                  onChange={(event) =>
                    setNewItem(
                      event.target.value
                    )
                  }

                  placeholder="Enter your ideas here..."

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









              <div className="wishlist-grid">


                {
                  items.map((item) => (


                    <div

                      key={item.id}

                      className="wishlist-card"

                    >



                      {

                        editingId === item.id ? (


                          <div className="wishlist-card-edit">


                            <input

                              className="wishlist-card-input"

                              value={editingText}

                              onChange={(event) =>
                                setEditingText(
                                  event.target.value
                                )
                              }

                            />



                            <button

                              className="wishlist-card-confirm"

                              onClick={() =>
                                updateItem(
                                  item.id
                                )
                              }

                            >

                              <CheckIcon />

                            </button>


                          </div>



                        ) : (


                          <div className="wishlist-card-content">


                            <span className="wishlist-card-text">

                              {item.text}

                            </span>



                            <div className="wishlist-card-actions">


                              <button

                                className="wishlist-card-btn wishlist-card-edit-btn"

                                onClick={() => {

                                  setEditingId(
                                    item.id
                                  );

                                  setEditingText(
                                    item.text
                                  );

                                }}

                              >

                                <EditIcon />

                              </button>





                              <button

                                className="wishlist-card-btn wishlist-card-delete-btn"

                                onClick={() =>
                                  removeItem(
                                    item.id
                                  )
                                }

                              >

                                <DeleteIcon />

                              </button>


                            </div>



                          </div>

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