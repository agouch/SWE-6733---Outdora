const fixExistingMatchData = async (userId) => {
    const userRef = doc(firestore, 'users', userId);
    const userDoc = await getDoc(userRef);
  
    if (userDoc.exists()) {
      const userData = userDoc.data();
      if (userData.matches && Array.isArray(userData.matches)) {
        const updatedMatches = userData.matches.map(match => {
          if (!match.users || !Array.isArray(match.users)) {
            return {
              ...match,
              users: [userId, match.id]
            };
          }
          return match;
        });
  
        await updateDoc(userRef, { matches: updatedMatches });
        console.log('Matches updated successfully for user:', userId);
      }
    }
  };
  
  // Call this function for each user ID that needs updating
  fixExistingMatchData('currentUserId');
  