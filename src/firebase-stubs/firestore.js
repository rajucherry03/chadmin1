// Minimal no-op Firestore stub to keep app buildable after Firebase removal
export function getFirestore() { return {}; }
export function collection() { return {}; }
export function collectionGroup() { return {}; }
export function addDoc() { return Promise.resolve(); }
export function setDoc() { return Promise.resolve(); }
export function updateDoc() { return Promise.resolve(); }
export function deleteDoc() { return Promise.resolve(); }
export function getDoc() { return Promise.resolve({ exists: () => false, data: () => ({}) }); }
export function getDocs() { return Promise.resolve({ docs: [] }); }
export function doc() { return {}; }
export function query() { return {}; }
export function where() { return {}; }
export function orderBy() { return {}; }
export function limit() { return {}; }
export function serverTimestamp() { return null; }
export function onSnapshot(_q, cb) { const unsub = () => {}; if (cb) cb({ docs: [] }); return unsub; }
export function writeBatch() { return { set(){}, update(){}, delete(){}, commit(){ return Promise.resolve(); } } }
export class GeoPoint { constructor(lat, lng){ this.latitude = lat; this.longitude = lng; } }
export function arrayUnion() { return []; }
export function arrayRemove() { return []; }
export function startAfter() { return {}; }
export function increment() { return 0; }
export class Timestamp {
  static now() { return new Timestamp(); }
  constructor() { this.toDate = () => new Date(); }
}


