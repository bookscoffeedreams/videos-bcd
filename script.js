const firebaseConfig = {
  apiKey: "AIzaSyDEUzsBjnonBtWswPkQp_tnicPl5XO6MoY",
  authDomain: "bcd-content-videos.firebaseapp.com",
  projectId: "bcd-content-videos",
  storageBucket: "bcd-content-videos.firebasestorage.app",
  messagingSenderId: "355915350320",
  appId: "1:355915350320:web:0b1e1883ae84395e0788f5",
  measurementId: "G-HBG894RRM0"
};
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();

    const loginBtn = document.getElementById("login-btn");
    const userNameSpan = document.getElementById("user-name");
    let currentUser = null;

    loginBtn.addEventListener("click", () => {
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider)
        .then((result) => {
          currentUser = result.user;
          userNameSpan.textContent = currentUser.displayName;
          loginBtn.style.display = 'none';
        })
        .catch((error) => {
          console.error("Google Sign-In Error:", error);
          alert("Sign-in failed. Check console for details.");
        });
    });

    const toggleBtn = document.getElementById("toggle-theme");
    toggleBtn.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
    });

    gsap.from(".sidebar", { duration: 1, x: -200, opacity: 0 });
    gsap.from(".video-card", { duration: 1, y: 100, opacity: 0, stagger: 0.2 });

    const videoCard = document.querySelector('.video-card');
    const likeBtn = videoCard.querySelector('.like-btn');
    const likeCountSpan = likeBtn.querySelector('.like-count');
    const commentInput = videoCard.querySelector('.comment-input');
    const commentList = videoCard.querySelector('#comment-list');
    const videoId = videoCard.dataset.id;

    likeBtn.addEventListener('click', () => {
      if (!currentUser) return alert("Please login to like videos.");
      const likeRef = db.collection('videos').doc(videoId);
      likeRef.get().then(doc => {
        const data = doc.exists ? doc.data() : { likes: 0 };
        likeRef.set({ likes: (data.likes || 0) + 1 }, { merge: true });
      });
    });

    commentInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && currentUser) {
        const comment = e.target.value.trim();
        if (!comment) return;
        db.collection('videos').doc(videoId).collection('comments').add({
          user: currentUser.displayName,
          avatar: currentUser.photoURL,
          text: comment,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        e.target.value = '';
      }
    });

    function renderComment(doc) {
      const data = doc.data();
      const div = document.createElement('div');
      div.classList.add('comment');
      const time = data.timestamp?.toDate().toLocaleString() || "";
      div.innerHTML = `
        <img class="comment-avatar" src="${data.avatar || 'https://via.placeholder.com/30'}" alt="avatar" />
        <div class="comment-content">
          <strong>${data.user}</strong><br/>
          ${data.text}
          <div class="comment-meta">${time}</div>
        </div>
      `;
      commentList.appendChild(div);
    }

    db.collection('videos').doc(videoId).onSnapshot(doc => {
      if (doc.exists) {
        likeCountSpan.textContent = doc.data().likes || 0;
      }
    });

    db.collection('videos').doc(videoId).collection('comments').orderBy('timestamp')
      .onSnapshot(snapshot => {
        commentList.innerHTML = '';
        snapshot.forEach(renderComment);
      });
