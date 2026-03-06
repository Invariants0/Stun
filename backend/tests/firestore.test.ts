import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { getFirestore, firestoreCollections } from "../src/config/firebase";

// Skip Firestore tests if the emulator is not configured
const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
const shouldSkip = !emulatorHost;

if (shouldSkip) {
  console.warn("[tests] FIRESTORE_EMULATOR_HOST not set; skipping Firestore Operations suite");
}

describe.skipIf(shouldSkip)("Firestore Operations", () => {
  const testCollection = firestoreCollections.boards;
  let testDocId: string;

  beforeEach(async () => {
    // Clean up test data before each test
    const db = getFirestore();
    const snapshot = await db.collection(testCollection).get();
    
    const deletePromises = snapshot.docs.map((doc) => doc.ref.delete());
    await Promise.all(deletePromises);
  });

  afterEach(async () => {
    // Clean up test data after each test
    const db = getFirestore();
    const snapshot = await db.collection(testCollection).get();
    
    const deletePromises = snapshot.docs.map((doc) => doc.ref.delete());
    await Promise.all(deletePromises);
  });

  it("should create a document", async () => {
    const db = getFirestore();
    const testData = {
      ownerId: "test-user-123",
      nodes: [],
      edges: [],
      elements: [],
      visibility: "private",
      collaborators: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection(testCollection).add(testData);
    testDocId = docRef.id;

    expect(testDocId).toBeDefined();
    expect(typeof testDocId).toBe("string");

    // Verify document exists
    const doc = await docRef.get();
    expect(doc.exists).toBe(true);
    expect(doc.data()?.ownerId).toBe("test-user-123");
  });

  it("should read a document", async () => {
    const db = getFirestore();
    const testData = {
      ownerId: "test-user-456",
      nodes: [{ id: "node-1", x: 100, y: 200 }],
      edges: [],
      elements: [],
      visibility: "private",
      collaborators: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection(testCollection).add(testData);
    testDocId = docRef.id;

    // Read the document
    const doc = await db.collection(testCollection).doc(testDocId).get();

    expect(doc.exists).toBe(true);
    const data = doc.data();
    expect(data?.ownerId).toBe("test-user-456");
    expect(data?.nodes).toHaveLength(1);
    expect(data?.nodes[0].id).toBe("node-1");
  });

  it("should update a document", async () => {
    const db = getFirestore();
    const testData = {
      ownerId: "test-user-789",
      nodes: [],
      edges: [],
      elements: [],
      visibility: "private",
      collaborators: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection(testCollection).add(testData);
    testDocId = docRef.id;

    // Update the document
    const newNodes = [
      { id: "node-1", x: 50, y: 50 },
      { id: "node-2", x: 150, y: 150 },
    ];
    await docRef.update({
      nodes: newNodes,
      updatedAt: new Date().toISOString(),
    });

    // Verify update
    const doc = await docRef.get();
    const data = doc.data();
    expect(data?.nodes).toHaveLength(2);
    expect(data?.nodes[0].id).toBe("node-1");
    expect(data?.nodes[1].id).toBe("node-2");
  });

  it("should delete a document", async () => {
    const db = getFirestore();
    const testData = {
      ownerId: "test-user-delete",
      nodes: [],
      edges: [],
      elements: [],
      visibility: "private",
      collaborators: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection(testCollection).add(testData);
    testDocId = docRef.id;

    // Verify document exists
    let doc = await docRef.get();
    expect(doc.exists).toBe(true);

    // Delete the document
    await docRef.delete();

    // Verify document no longer exists
    doc = await docRef.get();
    expect(doc.exists).toBe(false);
  });

  it("should query documents by ownerId", async () => {
    const db = getFirestore();
    const ownerId = "test-user-query";

    // Create multiple documents
    await Promise.all([
      db.collection(testCollection).add({
        ownerId,
        nodes: [],
        edges: [],
        elements: [],
        visibility: "private",
        collaborators: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
      db.collection(testCollection).add({
        ownerId,
        nodes: [],
        edges: [],
        elements: [],
        visibility: "private",
        collaborators: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
      db.collection(testCollection).add({
        ownerId: "different-user",
        nodes: [],
        edges: [],
        elements: [],
        visibility: "private",
        collaborators: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    ]);

    // Query by ownerId
    const snapshot = await db
      .collection(testCollection)
      .where("ownerId", "==", ownerId)
      .get();

    expect(snapshot.docs).toHaveLength(2);
    snapshot.docs.forEach((doc) => {
      expect(doc.data().ownerId).toBe(ownerId);
    });
  });

  it("should handle array-contains queries for collaborators", async () => {
    const db = getFirestore();
    const collaboratorId = "collab-user-123";

    // Create documents with different collaborators
    await Promise.all([
      db.collection(testCollection).add({
        ownerId: "owner-1",
        nodes: [],
        edges: [],
        elements: [],
        visibility: "private",
        collaborators: [collaboratorId, "other-user"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
      db.collection(testCollection).add({
        ownerId: "owner-2",
        nodes: [],
        edges: [],
        elements: [],
        visibility: "private",
        collaborators: ["different-user"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    ]);

    // Query by collaborator
    const snapshot = await db
      .collection(testCollection)
      .where("collaborators", "array-contains", collaboratorId)
      .get();

    expect(snapshot.docs).toHaveLength(1);
    expect(snapshot.docs[0].data().collaborators).toContain(collaboratorId);
  });
});
