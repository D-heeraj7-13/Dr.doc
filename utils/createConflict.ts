// utils/createConflict.ts

import { localDB, remoteDB } from "@/src/lib/db";
    
 
export async function createTestConflict() {
  const docId = "test-conflict-doc";

  // 1. Create the original document on local
  await localDB.put({
    _id: docId,
    title: "Original Weather Note",
    note: "Sunny day",
    version: "local-v1",
  });

  console.log("✅ Original doc created on local");

  // 2. Simulate remote change (like another device edited it)
  await remoteDB.put({
    _id: docId,
    title: "Original Weather Note",
    note: "Heavy Rain - Updated on Server",
    version: "remote-v1",
  });

  console.log("✅ Conflicting change made directly on remote");

  // 3. Now trigger sync → conflict should appear
  await localDB.sync(remoteDB, { retry: true });

  console.log("🔄 Sync triggered - check console for conflict");
}