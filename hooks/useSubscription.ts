"use client";

import { setDefaultMembership } from "@/actions/setDefaultMembership";
import { db } from "@/firebase";
import { useUser } from "@clerk/nextjs";
import { collection, doc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useCollection, useDocument } from "react-firebase-hooks/firestore";

const PRO_DOCUMENT_LIMIT = 20;
const STARTER_DOCUMENT_LIMIT = 3;

function useSubscription() {
  const { user } = useUser();
  const [membershipLevel, setMembershipLevel] = useState(null);
  const [isOverDocumentLimit, setIsOverDocumentLimit] = useState(false);

  // listen to the user document snapshot
  const [userSnapshot, userLoading, userError] = useDocument(
    user && doc(db, "users", user.id),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    }
  );

  const handleSetDefaultMembership = async () => {
    const { success } = await setDefaultMembership();
    return success;
  };

  // this useEffect sets the user's membership level
  useEffect(() => {
    if (!userSnapshot) return;

    const data = userSnapshot.data();
    // if data is undefined or empty obj, that means the user collection has no user document, though it may have files, etc
    // set the user document to the default plan = starter
    if (!data || Object.keys(data).length === 0) {
      handleSetDefaultMembership();
      return;
    }
    // if we have data, look up the membership level and set it here
    setMembershipLevel(data?.membershipLevel);
  }, [userSnapshot]);

  // listen to the user's files collection
  const [filesSnapshot, filesLoading, filesError] = useCollection(
    user && collection(db, "users", user.id, "files")
  );

  // this useEffect checks to see if the user is over the documents limit
  useEffect(() => {
    if (!filesSnapshot || membershipLevel === null) return;

    const numFiles = filesSnapshot.docs.length;
    const usersLimit = membershipLevel
      ? PRO_DOCUMENT_LIMIT
      : STARTER_DOCUMENT_LIMIT;

    setIsOverDocumentLimit(numFiles >= usersLimit);
  }, [
    filesSnapshot,
    membershipLevel,
    PRO_DOCUMENT_LIMIT,
    STARTER_DOCUMENT_LIMIT,
  ]);

  return {
    membershipLevel,
    isOverDocumentLimit,
    userSnapshot,
    userLoading,
    filesSnapshot,
    filesLoading,
    userError,
    filesError,
  };
}
export default useSubscription;
