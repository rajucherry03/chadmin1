export function getAuth() { return {}; }
export function onAuthStateChanged(_auth, cb) { if (cb) cb(null); return () => {}; }
export function fetchSignInMethodsForEmail() { return Promise.resolve([]); }
export function sendPasswordResetEmail() { return Promise.resolve(); }
export function signOut() { return Promise.resolve(); }
export function createUserWithEmailAndPassword() { return Promise.resolve({ user: null }); }
export class GoogleAuthProvider {}
export function signInWithPopup() { return Promise.resolve({ user: null }); }


