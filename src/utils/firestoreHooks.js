import { useEffect, useMemo, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  writeBatch,
} from "firebase/firestore";

export const useCollection = (collectionName, options = {}) => {
  const { orderByField, orderDirection = "asc" } = options;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let q = collection(db, collectionName);
    if (orderByField) {
      q = query(q, orderBy(orderByField, orderDirection));
    }
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setData(items);
      setLoading(false);
    }, (err) => {
      setError(err);
      setLoading(false);
    });
    return () => unsub();
  }, [collectionName, orderByField, orderDirection]);

  return { data, loading, error };
};

export const addItem = async (collectionName, payload) => {
  const ref = collection(db, collectionName);
  const res = await addDoc(ref, { ...payload, createdAt: serverTimestamp() });
  return res.id;
};

export const setItem = async (collectionName, id, payload, merge = true) => {
  const ref = doc(db, collectionName, id);
  await setDoc(ref, { ...payload, updatedAt: serverTimestamp() }, { merge });
  return id;
};

export const updateItem = async (collectionName, id, payload) => {
  const ref = doc(db, collectionName, id);
  await updateDoc(ref, { ...payload, updatedAt: serverTimestamp() });
  return id;
};

export const deleteItem = async (collectionName, id) => {
  const ref = doc(db, collectionName, id);
  await deleteDoc(ref);
  return id;
};

// Run multiple writes atomically
// ops: [{ type: 'set'|'update'|'delete'|'add', collection: string, id?: string, data?: any, merge?: boolean }]
export const runBatch = async (ops = []) => {
  const batch = writeBatch(db);
  const generatedIds = [];
  for (const op of ops) {
    if (op.type === 'add') {
      const newId = doc(collection(db, op.collection)).id;
      const ref = doc(db, op.collection, newId);
      batch.set(ref, { ...op.data, createdAt: serverTimestamp() });
      generatedIds.push({ collection: op.collection, id: newId });
    } else if (op.type === 'set') {
      const ref = doc(db, op.collection, op.id);
      batch.set(ref, { ...op.data, updatedAt: serverTimestamp() }, { merge: !!op.merge });
    } else if (op.type === 'update') {
      const ref = doc(db, op.collection, op.id);
      batch.update(ref, { ...op.data, updatedAt: serverTimestamp() });
    } else if (op.type === 'delete') {
      const ref = doc(db, op.collection, op.id);
      batch.delete(ref);
    }
  }
  await batch.commit();
  return generatedIds;
};

export const useSingletonDoc = (collectionName, id) => {
  const [docData, setDocData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ref = doc(db, collectionName, id);
    const unsub = onSnapshot(ref, (snap) => {
      setDocData(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      setLoading(false);
    }, (err) => { setError(err); setLoading(false); });
    return () => unsub();
  }, [collectionName, id]);

  return { data: docData, loading, error };
};


