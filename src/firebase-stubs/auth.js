const notAvailable = (name) => () => {
  throw new Error(`Firebase Auth is disabled. Attempted to call: ${name}`);
};

export const getAuth = notAvailable('getAuth');
export const signInWithEmailAndPassword = notAvailable('signInWithEmailAndPassword');
export const signOut = notAvailable('signOut');
export const onAuthStateChanged = notAvailable('onAuthStateChanged');
export const createUserWithEmailAndPassword = notAvailable('createUserWithEmailAndPassword');
export const updateProfile = notAvailable('updateProfile');
export default {};


