import { useEffect, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { COLLECTIONS } from '@/config/collections';
import { canPerformAction } from '@/config/permissions';
import {
  buildMerchandisePayload,
  makeVariantId,
  MAX_MERCHANDISE_IMAGES,
  normalizeVariants,
  validateMerchandiseForm,
  validateMerchandiseImageFile,
} from '@/config/merchandiseOptions';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/config/firebase';
import { deleteDocument, getDocument } from '@/hooks/useFirestore';
import {
  assertCanManageMerchandise,
  assertCanViewMerchandise,
  VIEW_DENIED_MESSAGE,
} from '@/services/merchandiseGuards';
import {
  cleanupMerchandiseImageStoragePaths,
  collectMerchandiseImagePaths,
} from '@/services/merchandiseStorageLifecycle';
import {
  deleteMerchandiseImage,
  uploadMerchandiseImage,
} from '@/services/storageService';

async function rollbackUploads(paths = []) {
  for (const path of paths) {
    if (!path) continue;
    try {
      await deleteMerchandiseImage(path);
    } catch {
      // Non-blocking rollback failure.
    }
  }
}

function useMerchandiseCollection(collectionName, orderField = 'createdAt') {
  const { role } = useAuth();
  const canView = canPerformAction(role, 'VIEW_MERCHANDISE');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!canView) {
      setData([]);
      setLoading(false);
      setError(new Error(VIEW_DENIED_MESSAGE));
      return undefined;
    }

    setLoading(true);
    setError(null);

    const q = query(collection(db, collectionName), orderBy(orderField, 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setData(snapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...docSnapshot.data() })));
        setLoading(false);
        setError(null);
      },
      (snapshotError) => {
        console.error(`${collectionName} subscription error:`, snapshotError);
        setError(snapshotError);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [canView, collectionName, orderField]);

  return { data, loading, error, canView };
}

export function useMerchandiseProducts() {
  return useMerchandiseCollection(COLLECTIONS.MERCHANDISE, 'updatedAt');
}

export function useMerchandiseSales() {
  return useMerchandiseCollection(COLLECTIONS.MERCHANDISE_SALES, 'saleDate');
}

export function useMerchandiseStockMovements() {
  return useMerchandiseCollection(COLLECTIONS.MERCHANDISE_STOCK_MOVEMENTS, 'createdAt');
}

export function useMerchandiseRequests() {
  return useMerchandiseCollection(COLLECTIONS.MERCHANDISE_REQUESTS, 'createdAt');
}

async function uploadProductImages(files = [], itemId) {
  const uploaded = [];

  for (const file of files.slice(0, MAX_MERCHANDISE_IMAGES)) {
    const validationMessage = validateMerchandiseImageFile(file);
    if (validationMessage) {
      await rollbackUploads(uploaded.map((image) => image.storagePath));
      throw new Error(validationMessage);
    }

    const result = await uploadMerchandiseImage(file, itemId);
    uploaded.push({ url: result.url, storagePath: result.storagePath });
  }

  return uploaded;
}

export async function createMerchandiseProduct(
  formData,
  { role, createdBy = '', imageFiles = [] } = {},
) {
  assertCanManageMerchandise(role);

  if (!imageFiles.length) {
    throw new Error('At least one product image is required.');
  }

  const docRef = doc(collection(db, COLLECTIONS.MERCHANDISE));
  const itemId = docRef.id;
  const uploadedImages = await uploadProductImages(imageFiles, itemId);

  const payload = buildMerchandisePayload(
    {
      ...formData,
      images: uploadedImages,
    },
    { createdBy },
  );

  const validationMessage = validateMerchandiseForm(payload, { requireImage: true });
  if (validationMessage) {
    await rollbackUploads(uploadedImages.map((image) => image.storagePath));
    throw new Error(validationMessage);
  }

  try {
    await setDoc(docRef, {
      ...payload,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { product: { id: itemId, ...payload }, storageWarnings: [] };
  } catch (error) {
    await rollbackUploads(uploadedImages.map((image) => image.storagePath));
    throw error;
  }
}

export async function updateMerchandiseProduct(
  productId,
  formData,
  { role, createdBy = '', initialData = null, imageFiles = [], removedImagePaths = [] } = {},
) {
  assertCanManageMerchandise(role);

  if (!productId) throw new Error('Product ID is required.');

  const existing = initialData || (await getDocument(COLLECTIONS.MERCHANDISE, productId));
  if (!existing) throw new Error('Product not found.');

  const retainedImages = (Array.isArray(formData.images) ? formData.images : []).filter(
    (image) => !removedImagePaths.includes(String(image.storagePath || '').trim()),
  );

  let uploadedImages = [];
  if (imageFiles.length) {
    const remainingSlots = Math.max(0, MAX_MERCHANDISE_IMAGES - retainedImages.length);
    uploadedImages = await uploadProductImages(imageFiles.slice(0, remainingSlots), productId);
  }

  const nextImages = [...retainedImages, ...uploadedImages].slice(0, MAX_MERCHANDISE_IMAGES);

  const payload = buildMerchandisePayload(
    {
      ...formData,
      images: nextImages,
      createdBy: existing.createdBy || createdBy,
    },
    { createdBy: existing.createdBy || createdBy },
  );

  const validationMessage = validateMerchandiseForm(payload, { requireImage: true });
  if (validationMessage) {
    await rollbackUploads(uploadedImages.map((image) => image.storagePath));
    throw new Error(validationMessage);
  }

  try {
    await updateDoc(doc(db, COLLECTIONS.MERCHANDISE, productId), {
      ...payload,
      updatedAt: serverTimestamp(),
    });

    const storageWarnings = await cleanupMerchandiseImageStoragePaths(
      removedImagePaths,
      deleteMerchandiseImage,
    );

    return { product: { id: productId, ...payload }, storageWarnings };
  } catch (error) {
    await rollbackUploads(uploadedImages.map((image) => image.storagePath));
    throw error;
  }
}

export async function setMerchandiseProductStatus(productId, status, { role } = {}) {
  assertCanManageMerchandise(role);

  if (!['active', 'archived'].includes(status)) {
    throw new Error('Invalid product status.');
  }

  await updateDoc(doc(db, COLLECTIONS.MERCHANDISE, productId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteMerchandiseProduct(productId, { role, initialData = null } = {}) {
  assertCanManageMerchandise(role);

  if (!productId) throw new Error('Product ID is required.');

  const existing = initialData || (await getDocument(COLLECTIONS.MERCHANDISE, productId));
  if (!existing) throw new Error('Product not found.');

  const imagePaths = collectMerchandiseImagePaths(existing);

  await deleteDocument(COLLECTIONS.MERCHANDISE, productId);

  const storageWarnings = await cleanupMerchandiseImageStoragePaths(
    imagePaths,
    deleteMerchandiseImage,
  );

  return { storageWarnings };
}

function findVariantIndex(variants, colour, size) {
  const targetId = makeVariantId(colour, size);
  return variants.findIndex(
    (variant) =>
      variant.id === targetId
      || (variant.colour === colour && variant.size === size),
  );
}

async function writeStockMovement(payload) {
  const movementRef = doc(collection(db, COLLECTIONS.MERCHANDISE_STOCK_MOVEMENTS));
  await setDoc(movementRef, {
    ...payload,
    createdAt: serverTimestamp(),
  });
  return movementRef.id;
}

export async function adjustMerchandiseStock(
  productId,
  { colour, size, quantityChange, type, reason = '', createdBy = '' },
  { role } = {},
) {
  assertCanManageMerchandise(role);

  const change = Number.parseInt(quantityChange, 10);
  if (!colour || !size) throw new Error('Colour and size are required.');
  if (!change || Number.isNaN(change)) throw new Error('Enter a valid quantity.');

  const productRef = doc(db, COLLECTIONS.MERCHANDISE, productId);

  const result = await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(productRef);
    if (!snapshot.exists()) throw new Error('Product not found.');

    const product = snapshot.data();
    const variants = normalizeVariants(product.variants);
    let index = findVariantIndex(variants, colour, size);

    if (index < 0) {
      if (type === 'add' || type === 'adjust') {
        variants.push({
          id: makeVariantId(colour, size),
          colour,
          size,
          quantity: 0,
        });
        index = variants.length - 1;
      } else {
        throw new Error('Variant not found for this product.');
      }
    }

    const previousQuantity = variants[index].quantity;
    let nextQuantity = previousQuantity;

    if (type === 'adjust') {
      nextQuantity = Math.max(0, change);
    } else if (type === 'add') {
      nextQuantity = previousQuantity + Math.abs(change);
    } else if (type === 'remove' || type === 'sale') {
      nextQuantity = previousQuantity - Math.abs(change);
      if (nextQuantity < 0) {
        throw new Error('Insufficient stock for this variant.');
      }
    } else {
      throw new Error('Invalid stock adjustment type.');
    }

    variants[index] = {
      ...variants[index],
      quantity: nextQuantity,
    };

    transaction.update(productRef, {
      variants,
      updatedAt: serverTimestamp(),
    });

    return {
      productName: product.name || '',
      previousQuantity,
      nextQuantity,
      quantityChange: nextQuantity - previousQuantity,
    };
  });

  await writeStockMovement({
    productId,
    productName: result.productName,
    colour,
    size,
    type,
    reason: reason || type,
    quantityChange: result.quantityChange,
    previousQuantity: result.previousQuantity,
    newQuantity: result.nextQuantity,
    createdBy,
  });

  return result;
}

export async function recordMerchandiseSale(saleData, { role, soldBy = '' } = {}) {
  assertCanManageMerchandise(role);

  const {
    productId,
    colour,
    size,
    quantity,
    buyerName = '',
    phoneNumber = '',
    paymentStatus = 'paid',
  } = saleData;

  const qty = Number.parseInt(quantity, 10);
  if (!productId) throw new Error('Product is required.');
  if (!colour || !size) throw new Error('Colour and size are required.');
  if (!qty || qty < 1) throw new Error('Enter a valid sale quantity.');
  if (!['paid', 'outstanding'].includes(paymentStatus)) {
    throw new Error('Select a valid payment status.');
  }

  const stockResult = await adjustMerchandiseStock(
    productId,
    {
      colour,
      size,
      quantityChange: qty,
      type: 'sale',
      reason: 'Sold',
      createdBy: soldBy,
    },
    { role },
  );

  const product = await getDocument(COLLECTIONS.MERCHANDISE, productId);
  const saleRef = doc(collection(db, COLLECTIONS.MERCHANDISE_SALES));

  await setDoc(saleRef, {
    productId,
    productName: product?.name || stockResult.productName || '',
    colour,
    size,
    quantity: qty,
    buyerName: String(buyerName || '').trim(),
    phoneNumber: String(phoneNumber || '').trim(),
    paymentStatus,
    soldBy,
    saleDate: serverTimestamp(),
    createdAt: serverTimestamp(),
  });

  return { saleId: saleRef.id, stockResult };
}

export async function createMerchandiseRequest(requestData, { role, createdBy = '' } = {}) {
  assertCanManageMerchandise(role);

  const requesterName = String(requestData.requesterName || '').trim();
  const contactNumber = String(requestData.contactNumber || '').trim();
  const productId = String(requestData.productId || '').trim();
  const colour = String(requestData.colour || '').trim();
  const size = String(requestData.size || '').trim();
  const quantity = Number.parseInt(requestData.quantity, 10);

  if (!requesterName) throw new Error('Requester name is required.');
  if (!productId) throw new Error('Product is required.');
  if (!colour || !size) throw new Error('Colour and size are required.');
  if (!quantity || quantity < 1) throw new Error('Enter a valid request quantity.');

  const product = await getDocument(COLLECTIONS.MERCHANDISE, productId);
  if (!product) throw new Error('Product not found.');

  const requestRef = doc(collection(db, COLLECTIONS.MERCHANDISE_REQUESTS));
  const payload = {
    requesterName,
    contactNumber,
    productId,
    productName: product.name || '',
    colour,
    size,
    quantity,
    notes: String(requestData.notes || '').trim(),
    status: requestData.status || 'waiting',
    createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(requestRef, payload);
  return { id: requestRef.id, ...payload };
}

const REQUEST_STATUSES = new Set(['waiting', 'contacted', 'fulfilled', 'cancelled']);

export async function updateMerchandiseRequestStatus(requestId, status, { role } = {}) {
  assertCanManageMerchandise(role);

  if (!REQUEST_STATUSES.has(status)) {
    throw new Error('Invalid request status.');
  }

  await updateDoc(doc(db, COLLECTIONS.MERCHANDISE_REQUESTS, requestId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteMerchandiseRequest(requestId, { role } = {}) {
  assertCanManageMerchandise(role);
  await deleteDocument(COLLECTIONS.MERCHANDISE_REQUESTS, requestId);
}
